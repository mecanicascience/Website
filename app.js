/*
 *  TREATS ALL APP FILES
 */

/* ====== DEPENDENCIES ====== */
const m = {
    express     : require('express'),
    routes      : require('./routes/index'),
    sitemap     : require('sitemap'),
    os          : require('os'),
    path        : require('path'),
    body_parser : require('body-parser'),
    constants   : require('./constants')
};







/* ======  VARIABLES   ====== */
// == Configs constants ==
const IS_HTTPS = m.constants.is_https;
const SITE     = m.constants.site;
const VERSION  = m.constants.version;



// == Server ==
let isLocalHost = m.os.hostname().indexOf("local");
const PORT      = process.env.PORT || 8080;
const HOST      = isLocalHost > -1 ? SITE : "localhost:" + PORT;
const HTTP_OR_S = IS_HTTPS ? "https://" : "http://";
const HOST_NAME = isLocalHost > -1 ? HTTP_OR_S + HOST : HOST;







/* ====== APP ====== */
    // == Server config dependencies ==
const sitemap = m.sitemap.createSitemap({
    hostname: HOST_NAME,
    cacheTime: 600000,
    urls: [
        { url: HTTP_OR_S + SITE }
    ]
});

const app = m.express();




    // == Server config ==
app
    .get("/robots.txt", function(req, res) {
        res.header("Content-Type", "text/html");
        res.send("User-agent: *<br />Sitemap: " + HTTP_OR_S + SITE + "/sitemap.xml<br />Disallow :");
    })

    .get("/sitemap.xml", function(req, res) {
        res.header("Content-Type", "application/xml");
        res.send(sitemap.toString());
    })




    // == Render views engine ==
    .use(m.express.static(m.path.join(__dirname, "public")))
    .set("views", m.path.join(__dirname, "views"))
    .set("view engine", "ejs")

    .use(m.body_parser.json())
    .use(m.body_parser.urlencoded({
        extended: true
    }))




    // == Files ==
app
    .use('/', m.routes);




    // == Errors ==
app
    .use((req, res, next) => res.status(404).render('pages/error', {
        errorCode     : 404,
        errorMessage  : 'La page n\'a pas été trouvée',
        link          : m.path.join(__dirname, "views/"),
        version       : VERSION
    }));







/* ====== MODULE ====== */
module.exports = app;
