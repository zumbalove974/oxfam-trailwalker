var express = require('express');
var router = express.Router();
const { Pool } = require("pg");

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("0");

  const pool = new Pool({
    user: 'postgres_user',
    host: 'database',
    database: 'postgres_user',
    password: 'postgres_password',
    port: 5432,
  });

  const connectDb = async () => {
    try {
      await pool.connect();
      const response = await pool.query('SELECT x, y FROM public."Device_3504"');

      return response;
    } catch (error) {
      console.log(error)
    }
  }

  connectDb().then(r => {
    //res.render('index', { title: r });
    res.json(r);
    pool.end();
  })


});

module.exports = router;
