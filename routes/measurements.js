const express = require('express'),
    router = express.Router();

const db = require("../db/index");

router.route('/measurements')
    .get(async (req, res) => {
        const response = await db.query('SELECT * FROM measurements');

        res.status(200).send({measurements: response.rows});
    });

module.exports = router;
