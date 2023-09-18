const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

if (typeof(PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}

const port = (typeof(PhusionPassenger) !== 'undefined') ? 'passenger' : (process.env.PORT || 3000);
const app = next({ dev: process.env.NODE_ENV != "production", port });
const handle = app.getRequestHandler();
console.log("Starting on port: " + port);

app
    .prepare()
    .then(() => {
        console.log("Preparing to start server");
        const server = createServer((req, res) => {
            const parsedUrl = parse(req.url, true);
            const { pathname } = parsedUrl;
            handle(req, res, parsedUrl);
            console.log("> Pathname", pathname);
        });
        server.all(/^\/_next\/webpack-hmr(\/.*)?/, async (req, res) => {
            void handle(req, res)
        })
        server.listen(port, (err) => {
            if (err) throw err;

            console.log("Opening on port: " + port);
            console.log(`> Ready on http://localhost:${port}`);
        });
    })
    .catch((ex) => {
        console.error(ex.stack);
        process.exit(1);
    });
