/*
 *  TREATS ALL ROOT DIRECTORIES AND WEB LINKS
 */

/* ====== DEPENDANCIES ====== */
const m = {
    express     : require('express'),
    constants   : require('./../constants'),
    body_parser : require('body-parser'),
    articles    : require('./articles'),
    db          : require('./db'),
    users       : require('./users'),
    gen_xml     : require('./generate_xml'),
    config      : require('./../datas/config.json'),
    multer      : require('multer')
};



const router = m.express.Router();
const storage = m.multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './tmp/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = m.multer({ storage });




/* ====== APP ====== */
router
    // root folder
    .get('/', async (req, res) => {
        let article = await m.articles.getArticles(req.body.q, req.query.s);

        res.render('pages/index', {
            main          : getMainInfos(req),
            articles      : article,
            query_message : m.articles.getLabel     (req.body.q, req.query.s, article.length)
        });
    })
    .post('/', async (req, res) => {
        let article = await m.articles.getArticles(req.body.q, req.query.s);

        res.render('pages/index', {
            main          : getMainInfos(req),
            articles      : article,
            query_message : m.articles.getLabel     (req.body.q, req.query.s, article.length)
        });
    })


    // rss
    .get('/feed/', (req, res) => {
        res.redirect('/feed/actualites.xml');
    })
    .get('/feed/actualites.xml', async (req, res) => {
        let rss = await m.gen_xml.generateRSS((m.config.is_https ? "https://" : "http://") + m.config.site, m.config.main_image_link);

        res.setHeader('Content-Type', 'application/rss+xml');
        res.end(rss);
    })



    // à propos du site
    .get('/about',   (req, res) => res.render('pages/description/about',   { main : getMainInfos(req, 'A propos du site') }))
    .get('/contact', (req, res) => res.render('pages/description/contact', { main : getMainInfos(req, 'Contact') }))
    .get('/legal',   (req, res) => res.render('pages/description/legal',   { main : getMainInfos(req, 'Mentions légales') }))

    .get(/articleview/g, async (req, res) => {
        let url = req.originalUrl.split('&'); // format article/ARTICLE_TITLE&articleview&ID
        if(url.length != 3 || url[1] != 'articleview' || url[0] == undefined || url[0].split('/').length != 3) {
            res.render('pages/articles/article_not_found', { main : getMainInfos(req) });
            return;
        }
        url[0] = decodeURI(url[0].split('/')[2]);

        let isConnected = m.users.isConnected(req.cookies);
        let articleExists = await m.articles.articleExistsAndVisible(url[2], url[0], isConnected);
        if(url[2] == undefined || !url[0] || !articleExists)
            res.render('pages/articles/article_not_found', { main : getMainInfos(req) });
        else {
            let datas = m.articles.getArticleDatas(articleExists);
            let article = await m.articles.getArticlesForSuggestions(datas.category_id, 3, datas.uuid);
            datas.formatted_date = datas.formatted_date.replace(/\/.*\//, '/' + (
                (parseInt(datas.formatted_date.split('/')[1]) + 1) > 9 ?
                (parseInt(datas.formatted_date.split('/')[1]) + 1) + "" :
                "0" + (parseInt(datas.formatted_date.split('/')[1]) + 1)) + '/'
            );

            await m.articles.addViewForArticle(
                datas,
                req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                isConnected || req.get('host').split(':')[0] == 'localhost'
            );

            let c = req.query.code;
            if(c == undefined || c.length == 0) c = '-1';
            res.render('pages/articles/article', {
                main          : getMainInfos(req, datas.title),
                datas         : datas,
                articles      : article,
                fb_image_link : m.config.main_image_link,
                code          : c,
                comments      : m.articles.formatComment(datas.comments)
            });
        }
    })

    .post("/articleview/add_comment", async (req, res) => {
        let id    = req.body['c-a-id']    || -1;
        let title = req.body['c-a-title'] || '';
        let code  = await m.articles.postComment(req.body, req.headers['x-forwarded-for'] || req.connection.remoteAddress);

        res.redirect(`/article/${title}&articleview&${id}?code=${code}#comments`);
    })


    .get('/simulations/list/', async (req, res) => {
        let isConnected = m.users.isConnected(req.cookies);
        let simulations = await m.articles.getSimulations(isConnected);

        res.render('pages/simulations/simulation_list', {
            main        : getMainInfos(req, 'Simulations'),
            simulations : simulations
        });
    })

    .get(/simulation_view/g, async (req, res) => {
        let isConnected = m.users.isConnected(req.cookies);
        let url = req.originalUrl.split('&'); // format article/ARTICLE_TITLE&simulationview&type&ID
        if(url.length != 4 || url[1] != 'simulationview' || url[0] == undefined || url[0].split('/').length != 3) {
            res.render('pages/simulations/simulation_not_found', { main : getMainInfos(req, 'Erreur 404') });
            return;
        }
        url[0] = decodeURI(url[0].split('/')[2]);

        let simulationExists = await m.articles.simulationExistsAndVisible(parseInt(url[3]), url[2], url[0], isConnected);
        if(url[3] == undefined || !url[2] || !url[0] || !simulationExists)
             res.render('pages/simulations/simulation_not_found', { main : getMainInfos(req, 'Erreur 404') });
        else {
            let datas = await m.articles.getSimulationDatas(simulationExists);
            res.render('pages/simulations/simulation', {
                main          : getMainInfos(req, datas.title),
                datas         : datas,
                isConnected   : isConnected
            });
        }
    })


    .get('/monthly_projects', async (req, res) => {
        let year = parseInt(req.query.year);
        let currentYear = new Date().getFullYear();
        if(req.query.year == undefined || year < 2020 || year > currentYear) {
            res.redirect(`/monthly_projects?year=${currentYear}`);
            return;
        }

        let datas = await m.articles.getMonthlyProjectsForYear(year);
        res.render('pages/articles/monthly_projects', {
            main  : getMainInfos(req, 'Projets du mois'),
            year  : year,
            datas : JSON.stringify(datas)
        });
    })



    // partie admin
    .get('/admin', async (req, res) => {
        if(!m.users.isConnected(req.cookies)) {
            res.render('pages/admin/connection', {
                main : getMainInfos(req, 'Connection admin'),
                code : (req.query.code  ? req.query.code  : false)
            });
            return;
        }


        let article = await m.articles.getArticles(undefined, undefined, parseInt(req.query.l), true, true);
        let comm = await m.articles.getEveryComments();

        res.render('pages/admin/articles_interface', {
            main        : getMainInfos(req, 'Interface admin'),
            articles    : article,
            post_count  : (req.query.l     ? req.query.l     : 20),
            code        : (req.query.code  ? req.query.code  : false),
            new_title   : (req.query.title ? req.query.title : null),
            new_uuid    : (req.query.uuid  ? req.query.uuid  : null),
            comments    : m.articles.formatComment(comm, true)
        });
    })

    .get('/admin/create_article', async (req, res) => {
        if(!m.users.isConnected(req.cookies) || m.users.getPermission(req.cookies) != 100) {
            res.redirect('/admin');
            return;
        }


        let new_article = await m.articles.createNewArticle();
        res.redirect('/admin?code=1&title=' + new_article.title + '&uuid=' + new_article.uuid);
    })



    // edition de posts
    .get('/admin/edit', async (req, res) => {
        if(!m.users.isConnected(req.cookies)) {
            res.redirect('/admin');
            return;
        }


        let articleExists = await m.articles.articleExistsAndVisible(req.query.uuid, req.query.title, true);

        if(!req.query.uuid || !req.query.title || !articleExists)
            res.render('pages/articles/article_not_found', { main : getMainInfos(req) });
        else {
            let envV = null;
            try {
                envV = require('./../datas/env-vars.json');
            }
            catch (e) {
                envV        = process.env;
                isRequireOk = false;
            }

            res.render('pages/admin/edit_article', {
                main            : getMainInfos(req, 'Edition de l\'article'),
                datas           : m.articles.getArticleDatas(articleExists),
                action_function : req.query.action_function,
                image_error     : req.query.image_error,
                fb_image_link   : m.config.main_image_link
            });
        }
    })

    .post("/admin/update", async (req, res) => {
        if(!m.users.isConnected(req.cookies) || m.users.getPermission(req.cookies) != 100) {
            res.redirect('/admin');
            return;
        }


        res.setHeader('Content-Type', 'application/json');

        let success = await m.articles.editArticle(
            req.body.category_id,
            req.body.content,
            req.body.date,
            req.body.description,
            req.body.image_credits,
            req.body.image_name,
            req.body.pref_size,
            req.body.short_title,
            req.body.title,
            req.body.uuid,
            req.body.visible,
            req.body.image_exists,
            req.body.author
        );


        if(success && (req.body.image_exists == 'true' ? true : false) && req.body.lastImageName != req.body.image_name)
            success = await m.db.editMainImageName(req.body.uuid, req.body.lastImageName, req.body.image_name);


        if(success) {
            res.end( JSON.stringify({ error: 0 }));
        }
        else res.end(JSON.stringify({ error: 1 }));
    })


    .get('/admin/delete', async (req, res) => {
        if(!m.users.isConnected(req.cookies) || m.users.getPermission(req.cookies) != 100) {
            res.redirect('/admin');
            return;
        }


        let articleExists = await m.articles.articleExistsAndVisible(req.query.uuid, req.query.title, true);

        let deleteArticle;
        if(articleExists) deleteArticle = await m.articles.deleteArticle(req.query.uuid);

        if(!req.query.uuid || !req.query.title || !articleExists || !deleteArticle) res.redirect('/admin?code=3');
        else res.redirect('/admin?code=2');
    })


    // edition de commentaires
    .get('/admin/toggle_comment_visibility', async (req, res) => {
        if(!m.users.isConnected(req.cookies)) {
            res.redirect('/admin');
            return;
        }

        let ans = await m.articles.toggleArticleVisibility(req.query.articleID, req.query.commentID);
        res.redirect(`/admin?code=${ans}#comments`);
    })




    .post("/admin/update/main_image", upload.single('image'), async (req, res) => {
        if(!m.users.isConnected(req.cookies) || m.users.getPermission(req.cookies) != 100) {
            res.redirect('/admin');
            return;
        }

        res.setHeader('Content-Type', 'application/json');

        let success = await m.articles.updateMainImage(req, req.body.image, req.body.uuid, req.body.image_name);

        res.redirect(`/admin/edit?image_error=${!success ? '1' : '0'}&title=${req.body.title}&uuid=${req.body.uuid}&action_function=1`);
    })

    .post("/admin/delete/main_image", upload.single('i'), async (req, res) => {
        if(!m.users.isConnected(req.cookies) || m.users.getPermission(req.cookies) != 100) {
            res.redirect('/admin');
            return;
        }

        res.setHeader('Content-Type', 'application/json');

        let success = await m.articles.deleteMainImage(req.body.uuid, req.body.image_name);

        res.redirect(`/admin/edit?image_error=${!success ? '1' : '0'}&title=${req.body.title}&uuid=${req.body.uuid}&action_function=2`);
    })





    .post('/admin/connect', (req, res) => {
        if(m.users.isConnected(req.cookies)) {
            res.redirect('/admin');
            return;
        }

        let answer = m.users.connectUser(req.body.username, req.body.password, res, req);

        if(answer) res.redirect('/admin?code=4');
        else       res.redirect('/admin?code=5');
    })

    .get('/admin/deconnexion', async (req, res) => {
        if(!m.users.isConnected(req.cookies)) {
            res.redirect('/admin');
            return;
        }

        let answer = m.users.deconnectUser(req, res);

        if(answer) res.redirect('/admin?code=6');
        else       res.redirect('/admin?code=7');
    })
;



const WEBSITE_URL = (m.config.is_https ? "https://" : "http://") + m.config.site;

function getMainInfos(req, title) {
    if(title == undefined)
        title = 'MecanicaScience - La physique par la simulation';
    else
        title += ' - MecanicaScience - La physique par la simulation';

    return {
        version       : m.constants.version,
        action_link   : m.articles.getActionLink(req.body.q, req.query.s),
        connected     : m.users.isConnected(req.cookies),
        website_url   : WEBSITE_URL,
        website_title : title
    };
}



/* ====== SERVER ====== */
module.exports = router;
