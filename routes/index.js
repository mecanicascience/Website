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
    gen_xml     : require('./generate_xml')
};

const router = m.express.Router();




/* ====== APP ====== */
router
    // root folder
    .get('/', async (req, res) => {
        let article = await m.articles.getArticles(req.body.q, req.query.s);

        res.render('pages/index', {
            version       : m.constants.version,
            articles      : article,
            query_message : m.articles.getLabel     (req.body.q, req.query.s, article.length),
            action_link   : m.articles.getActionLink(req.body.q, req.query.s),
            connected     : m.users.isConnected(req.cookies)
        });
    })
    .post("/", async (req, res) => {
        let article = await m.articles.getArticles(req.body.q, req.query.s);

        res.render('pages/index', {
            version       : m.constants.version,
            articles      : article,
            query_message : m.articles.getLabel     (req.body.q, req.query.s, article.length),
            action_link   : m.articles.getActionLink(req.body.q, req.query.s),
            connected     : m.users.isConnected(req.cookies)
        });
    })


    // rss
    .get('/feed/', (req, res) => {
        res.redirect('/feed/actualites.xml');
    })
    .get('/feed/actualites.xml', async (req, res) => {
        let rss = await m.gen_xml.generateRSS('https://mecanicascience.herokuapp.com');

        res.setHeader('Content-Type', 'application/rss+xml');
        res.end(rss);
    })



    // à propos du site
    .get('/about', (req, res) => res.render('pages/description/about', {
        version     : m.constants.version,
        action_link : m.articles.getActionLink(req.body.q, req.query.s),
        connected   : m.users.isConnected(req.cookies)
    }))
    .get('/contact', (req, res) => res.render('pages/description/contact', {
        version     : m.constants.version,
        action_link : m.articles.getActionLink(req.body.q, req.query.s),
        connected   : m.users.isConnected(req.cookies)
    }))
    .get('/legal', (req, res) => res.render('pages/description/legal', {
        version     : m.constants.version,
        action_link : m.articles.getActionLink(req.body.q, req.query.s),
        connected   : m.users.isConnected(req.cookies)
    }))

    .get('/article', async (req, res) => {
        let articleExists = await m.articles.articleExistsAndVisible(req.query.uuid, req.query.title);

        if(!req.query.uuid || !req.query.title || !articleExists) {
            res.render('pages/articles/article_not_found', {
                version     : m.constants.version,
                action_link : m.articles.getActionLink(req.body.q, req.query.s),
                connected   : m.users.isConnected(req.cookies)
            });
        }
        else {
            let datas = m.articles.getArticleDatas(articleExists);
            let article = await m.articles.getArticlesForSuggestions(datas.category_id, 3);

            res.render('pages/articles/article', {
                version     : m.constants.version,
                action_link : m.articles.getActionLink(req.body.q, req.query.s),
                datas       : datas,
                connected   : m.users.isConnected(req.cookies),
                articles    : article
            });
        }
    })



    // partie admin
    .get('/admin', async (req, res) => {
        if(!m.users.isConnected(req.cookies)) {
            res.render('pages/admin/connection', {
                version      : m.constants.version,
                action_link  : m.articles.getActionLink(req.body.q, req.query.s),
                connected    : false,
                code         : (req.query.code  ? req.query.code  : false)
            });
            return;
        }


        let article = await m.articles.getArticles(undefined, undefined, parseInt(req.query.l), true, true);

        res.render('pages/admin/articles_interface', {
            version      : m.constants.version,
            action_link  : m.articles.getActionLink(req.body.q, req.query.s),
            articles     : article,
            post_count   : (req.query.l     ? req.query.l     : 20),
            code         : (req.query.code  ? req.query.code  : false),
            new_title    : (req.query.title ? req.query.title : null),
            new_uuid     : (req.query.uuid  ? req.query.uuid  : null),
            connected    : m.users.isConnected(req.cookies)
        });
    })

    .get('/admin/create_article', async (req, res) => {
        if(!m.users.isConnected(req.cookies)) {
            res.redirect('/admin');
            return;
        }


        let new_article = await m.articles.createNewArticle();
        res.redirect('/admin?code=1&title=' + new_article.title + '&uuid=' + new_article.uuid);
    })

    .get('/admin/edit', async (req, res) => {
        if(!m.users.isConnected(req.cookies)) {
            res.redirect('/admin');
            return;
        }


        let articleExists = await m.articles.articleExistsAndVisible(req.query.uuid, req.query.title, true);

        if(!req.query.uuid || !req.query.title || !articleExists) {
            res.render('pages/articles/article_not_found', {
                version     : m.constants.version,
                action_link : m.articles.getActionLink(req.body.q, req.query.s),
                connected   : m.users.isConnected(req.cookies)
            });
        }
        else {
            res.render('pages/admin/edit_article', {
                version     : m.constants.version,
                action_link : m.articles.getActionLink(req.body.q, req.query.s),
                datas       : m.articles.getArticleDatas(articleExists),
                connected   : m.users.isConnected(req.cookies)
            });
        }
    })

    .post("/admin/update", async (req, res) => {
        if(!m.users.isConnected(req.cookies)) {
            res.redirect('/admin');
            return;
        }


        res.setHeader('Content-Type', 'application/json');

        let success = await m.articles.editArticle(
            req.body.category_id,
            req.body.content,
            req.body.date,
            req.body.description,
            req.body.image_name,
            req.body.pref_size,
            req.body.short_title,
            req.body.title,
            req.body.uuid,
            req.body.visible
        );

        if(success) {
            res.end( JSON.stringify({ error: 0 }));
        }
        else res.end(JSON.stringify({ error: 1 }));
    })


    .get('/admin/delete', async (req, res) => {
        if(!m.users.isConnected(req.cookies)) {
            res.redirect('/admin');
            return;
        }


        let articleExists = await m.articles.articleExistsAndVisible(req.query.uuid, req.query.title, true);

        let deleteArticle;
        if(articleExists) deleteArticle = await m.articles.deleteArticle(req.query.uuid);

        if(!req.query.uuid || !req.query.title || !articleExists || !deleteArticle) res.redirect('/admin?code=3');
        else res.redirect('/admin?code=2');
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

    .get('/admin/deconnection', async (req, res) => {
        if(!m.users.isConnected(req.cookies)) {
            res.redirect('/admin');
            return;
        }

        let answer = m.users.deconnectUser(req, res);

        if(answer) res.redirect('/admin?code=6');
        else       res.redirect('/admin?code=7');
    })







/* ====== SERVER ====== */
module.exports = router;
