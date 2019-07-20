/*
 *  TREATS ALL ROOT DIRECTORIES AND WEB LINKS
 */

/* ====== DEPENDANCIES ====== */
const express = require('express');
const router  = express.Router();



/* ====== APP ====== */
router.get('/', (req, res) => {
    res.send('It works!');
});



/* ====== SERVER ====== */
module.exports = router;
