/// <reference path="../vendor/typings/references.d.ts" />

import express = require('express');

var router = express.Router();
router.get('/', (req, res, next) => {
    res.sendStatus(200);
});

module.exports = router;