/*
 *  TREATS ALL ROOT DIRECTORIES AND WEB LINKS
 */

/* ====== DEPENDANCIES ====== */
const express   = require('express');
const router    = express.Router();
const constants = require('./../constants');



/* ====== APP ====== */
router.get('/', (req, res) => res.render('pages/index', { version: constants.version }));



/* ====== SERVER ====== */
module.exports = router;
