/* ====== DEPENDANCIES ====== */
const app = require('./app');


/* ====== SERVER ====== */
const server = app.listen(3000, () => {
    console.log(`Express is running on port ${server.adress().port}`);
});
