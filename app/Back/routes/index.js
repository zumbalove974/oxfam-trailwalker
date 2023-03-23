var express = require('express');
var router = express.Router();
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
  user: 'postgres_user',
  host: 'database',
  database: 'postgres_user',
  password: 'postgres_password',
  port: 5432,
});

let jsonValue = {};

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("0");

  const connectDb = async () => {
    try {
      console.log("1");

      await pool.connect();
      const response = await pool.query('SELECT * FROM public."Device_3504"');

      console.log("2");

      jsonValue = {
        test: 4
      }

      console.log(response);

      //await pool.end();
      console.log("3");

      return response;
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
console.log('325');
module.exports = router;
