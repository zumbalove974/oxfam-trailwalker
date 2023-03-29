var express = require('express');
var router = express.Router();
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

/* GET home page. */
router.get('/:deviceNumber', function (req, res, next) {

    const pool = new Pool({
        user: 'postgres_user',
        host: 'database',
        database: 'postgres_user',
        password: 'postgres_password',
        port: 5432,
    });

    const connectDb = async () => {
        try {
            const response = await pool.query(`SELECT * FROM public."Device_${req.params.deviceNumber}" ORDER BY "timestamp"`);

            console.log(response);

            return response.rows;
        } catch (error) {
            console.log(error)
        }
    }

    connectDb().then(r => {
        //res.render('index', { title: r });
        res.json(r);
        console.log("4");
        pool.end();
    })


});
module.exports = router;
