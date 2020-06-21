/*
 *  TREATS ALL APP FILES
 */

/* ====== DEPENDENCIES ====== */
const m = {
    express        : require('express'),
    routes         : require('./routes/index'),
    sitemap        : require('sitemap'),
    os             : require('os'),
    path           : require('path'),
    body_parser    : require('body-parser'),
    config         : require('./datas/config.json'),
    private_db_key : require('./datas/private-db-key.json'),
    pass           : require('./datas/pass.json'),
    db             : require('./routes/db'),
    cookie_parser  : require('cookie-parser'),
    users          : require('./routes/users'),
    articles       : require('./routes/articles')
};







/* ====== UPDATE CONFIG FILES FROM LOCAL ENVIRONMENT VARIABLES ====== */
let envV;
let isRequireOk = true;
try {
    envV = require('./datas/env-vars.json');
}
catch (e) {
    envV        = process.env;
    isRequireOk = false;
}

m.config.main_image_link = envV.FIREBASE_MAIN_IMAGE_LINK;
m.config.bucket_name     = envV.FIREBASE_BUCKET_NAME;

m.pass.users[0].username    = envV.MAIN_USERNAME_0;
m.pass.users[0].password    = envV.MAIN_PASSWORD_0;
m.pass.users[0].permissions = envV.MAIN_PERMISSIONS_0;
m.pass.users[1].username    = envV.MAIN_USERNAME_1;
m.pass.users[1].password    = envV.MAIN_PASSWORD_1;
m.pass.users[1].permissions = envV.MAIN_PERMISSIONS_1;

m.private_db_key.project_id           =  envV.CREDENTIAL_PROJECT_ID;
m.private_db_key.private_key_id       =  envV.CREDENTIAL_PRIVATE_KEY_ID;
m.private_db_key.private_key          = (envV.CREDENTIAL_PRIVATE_KEY + "").replace(/&_&/g, '-');
m.private_db_key.client_email         = (envV.CREDENTIAL_CLIENT_EMAIL + "").replace(/&_&/g, '-');
m.private_db_key.client_id            =  envV.CREDENTIAL_CLIENT_ID;
m.private_db_key.client_x509_cert_url = (envV.CLIENT_CERT_URL + "").replace(/&_&/g, '-');

if(isRequireOk)
    m.private_db_key.private_key = m.private_db_key.private_key.replace(/\\n/g, '\n');
else
    m.private_db_key.private_key = m.private_db_key.private_key.replace(/\\\\n/g, '\n');







/* ======  VARIABLES   ====== */
// == Configs constants ==
const IS_HTTPS = m.config.is_https;
const SITE     = m.config.site;
const VERSION  = m.config.version;



// == Server ==
let isLocalHost = m.os.hostname().indexOf("local");
const PORT      = process.env.PORT || m.config.local_port;
const HOST      = isLocalHost > -1 ? SITE : "localhost:" + PORT;
const HTTP_OR_S = IS_HTTPS ? "https://" : "http://";
const HOST_NAME = isLocalHost > -1 ? HTTP_OR_S + HOST : HOST;







/* ====== APP ====== */
    // == Server config dependencies ==
const app = m.express();

m.db.initializeDb();




    // == Server config ==
app
    .get("/robots.txt", function(req, res) {
        res.header("Content-Type", "text/html");
        res.send("User-agent: *<br />Sitemap: " + HTTP_OR_S + SITE + "/sitemap.xml<br />Disallow :");
    });


let sitemap;
app
    .get("/sitemap.xml",async  function(req, res) {
        if(!sitemap) {
            let sitemap_url = await m.articles.getArticlesUrl(HTTP_OR_S + SITE);
            sitemap_url.unshift({ url: HTTP_OR_S + SITE });

            sitemap = m.sitemap.createSitemap({
                hostname: HOST_NAME,
                cacheTime: m.config.cache_time,
                urls: sitemap_url
            });
        }
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

    .use(m.cookie_parser())




    // == Files ==
app
    .use('/', m.routes);




    // == Errors ==
app
    .use((req, res, next) => res.status(404).render('pages/error', {
        errorCode     : 404,
        errorMessage  : 'La page n\'a pas été trouvée',
        link          : m.path.join(__dirname, "views/"),
        main : {
            version       : VERSION,
            action_link   : '/',
            connected     : m.users.isConnected(req.cookies),
            website_title : 'Erreur 404 - MecanicaScience'
        }
    }));







/* ====== MODULE ====== */
module.exports = app;
