/* ====== DEPENDENCIES ====== */
const express = require('express');
const routes  = require('./routes/index');



/* ====== APP ====== */
const app = express();

app.use('/', routes);




/* ====== MODULE ====== */
module.exports = app;
