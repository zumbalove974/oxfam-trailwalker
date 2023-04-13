var express = require('express');
var router = express.Router();
const { Pool } = require("pg");

router.pool = new Pool({
    user: 'postgres_user',
    host: 'database',
    database: 'postgres_user',
    password: 'postgres_password',
    port: 5432,
});

router.connectDB = async (req, that) => {
    try {
        const response = await that.pool.query(
            `SELECT x,y FROM public."Interpolation_3607" ORDER BY "index"`);

        return response.rows;
    } catch (error) {
        console.log(error)
    }
}

router.get('/', function (req, res, next) {

    router.connectDB(req, router).then(r => {
        res.json(r);
    })


});

module.exports = router;
