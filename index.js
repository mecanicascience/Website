/*
 *  MAIN STARTING FILE => Treats all dependencies and links
 */
/* ====== INITIAL MESSAGE ===== */
console.log(`Server initializing. Please wait...`);


/* ====== DEPENDANCIES ====== */
const app     = require('./app');


/* ======  VARIABLES   ====== */
const PORT = process.env.PORT || 8080;


/* ====== SERVER ====== */
const server = app.listen(PORT, () => console.log(`Server started.\nExpress is running on port ${ PORT }.`));
