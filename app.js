/*
 *  TREATS ALL APP FILES
 */

/* ====== DEPENDENCIES ====== */
const m = {
    express : require('express'),
    routes  : require('./routes/index'),
    sitemap : require('sitemap'),
    os      : require('os')
};







/* ======  VARIABLES   ====== */
// == Configs constants ==
const IS_HTTPS = true;
const SITE     = "mecanicascience.herokuapp.com";



// == Server ==
let isLocalHost = m.os.hostname().indexOf("local");
const PORT      = process.env.PORT || 5000;
const HOST      = isLocalHost > -1 ? SITE : "localhost:" + PORT;
const HOST_NAME = isLocalHost > -1 ? (IS_HTTPS ? "https://" : "http://") + HOST : HOST;







/* ====== APP ====== */
    // == Server config dependencies ==
const sitemap = m.sitemap.createSitemap({
    hostname: HOST_NAME,
    cacheTime: 600000,
    urls: [
        { url: isLocalHost ? HOST : HOST + HOST_NAME }
    ]
});

const app = m.express();




    // == Server config ==
app
    .get("/robots.txt", function(req, res) {
        res.header("Content-Type", "text/html");
        res.send("User-agent: *<br />Sitemap: " + HOST_NAME + "/sitemap.xml<br />Disallow :");
    })

    .get("/sitemap.xml", function(req, res) {
        res.header("Content-Type", "application/xml");
        res.send(sitemap.toString());
    })




    // == Files ==
app
    .use('/', m.routes);




    // == Errors ==
app
    .use((req, res, next) => {
        res.setHeader("Content-Type", "text/plain");
        res.status(404).send("Error 404 : Page not found :/");
    })







/* ====== MODULE ====== */
module.exports = app;
