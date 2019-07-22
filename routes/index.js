/*
 *  TREATS ALL ROOT DIRECTORIES AND WEB LINKS
 */

/* ====== DEPENDANCIES ====== */
const m = {
    express     : require('express'),
    constants   : require('./../constants'),
    body_parser : require('body-parser'),
    articles    : require('./articles')
};

const router = m.express.Router();




/* ====== APP ====== */
router
    .get('/', (req, res) => {
        res.render('pages/index', {
            version       : m.constants.version,
            articles      : m.articles.getArticles(req.body.q, req.query.s),
            query_message : m.articles.getLabel   (req.body.q, req.query.s)
        });
    })
    .post("/", (req, res) => {
        res.render('pages/index', {
            version       : m.constants.version,
            articles      : m.articles.getArticles(req.body.q, req.query.s),
            query_message : m.articles.getLabel   (req.body.q, req.query.s)
        });
    });




/* ====== SERVER ====== */
module.exports = router;
