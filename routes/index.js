/*
 *  TREATS ALL ROOT DIRECTORIES AND WEB LINKS
 */

/* ====== DEPENDANCIES ====== */
const express = require('express');
const router  = express.Router();



/* ====== APP ====== */
router.get('/', (req, res) => res.render('pages/index', { version: '1.0.0' }));



/* ====== SERVER ====== */
module.exports = router;
