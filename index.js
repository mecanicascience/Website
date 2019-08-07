/*
 *  MAIN STARTING FILE => Treats all dependencies and links
 */
/* ====== DEPENDANCIES ====== */
const app     = require('./app'); 


/* ======  VARIABLES   ====== */
const PORT = process.env.PORT || 8080;


/* ====== SERVER ====== */
const server = app.listen(PORT, () => console.log(`Express is running on port ${ PORT }`));
