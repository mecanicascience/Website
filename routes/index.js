/*
 *  TREATS ALL ROOT DIRECTORIES AND WEB LINKS
 */

/* ====== DEPENDANCIES ====== */
const m = {
    express     : require('express'),
    constants   : require('./../constants'),
    body_parser : require('body-parser'),
    articles    : require('./articles'),
    db          : require('./db')
};

const router = m.express.Router();




/* ====== APP ====== */
router
    .get('/', async (req, res) => {
        let article = await m.articles.getArticles(req.body.q, req.query.s);

        res.render('pages/index', {
            version       : m.constants.version,
            articles      : article,
            query_message : m.articles.getLabel     (req.body.q, req.query.s, article.length),
            action_link   : m.articles.getActionLink(req.body.q, req.query.s)
        });
    })
    .post("/", async (req, res) => {
        let article = await m.articles.getArticles(req.body.q, req.query.s);

        res.render('pages/index', {
            version       : m.constants.version,
            articles      : article,
            query_message : m.articles.getLabel     (req.body.q, req.query.s, article.length),
            action_link   : m.articles.getActionLink(req.body.q, req.query.s)
        });
    })

    .get('/about', (req, res) => res.render('pages/description/about', {
        version     : m.constants.version,
        action_link : m.articles.getActionLink(req.body.q, req.query.s)
    }))
    .get('/contact', (req, res) => res.render('pages/description/contact', {
        version     : m.constants.version,
        action_link : m.articles.getActionLink(req.body.q, req.query.s)
    }))
    .get('/legal', (req, res) => res.render('pages/description/legal', {
        version     : m.constants.version,
        action_link : m.articles.getActionLink(req.body.q, req.query.s)
    }))

    .get('/article', async (req, res) => {
        let articleExists = await m.articles.articleExistsAndVisible(req.query.uuid, req.query.title);

        if(!req.query.uuid || !req.query.title || !articleExists) {
            res.render('pages/articles/article_not_found', {
                version     : m.constants.version,
                action_link : m.articles.getActionLink(req.body.q, req.query.s)
            });
        }
        else {
            res.render('pages/articles/article', {
                version     : m.constants.version,
                action_link : m.articles.getActionLink(req.body.q, req.query.s),
                datas       : m.articles.getArticleDatas(articleExists)
            });
        }
    })


    .get('/admin/', async (req, res) => {
        let article = await m.articles.getArticles(undefined, undefined, parseInt(req.query.l), true);

        res.render('pages/admin/articles_interface', {
            version      : m.constants.version,
            action_link  : m.articles.getActionLink(req.body.q, req.query.s),
            articles     : article,
            post_count   : (req.query.l ? req.query.l : 20)
        });
    })
    .get('/admin/create_article', async (req, res) => {
        let new_article = await m.articles.createNewArticle();
        res.redirect('/admin/edit?title=' + new_article.title + '&uuid=' + new_article.uuid);
    })

    .get('/admin/edit', (req, res) => {
        res.send('hello world');
    });




/* ====== SERVER ====== */
module.exports = router;
