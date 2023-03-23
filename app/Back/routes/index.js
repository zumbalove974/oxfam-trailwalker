var express = require('express');
var router = express.Router();
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
  user: 'postgres_user',
  host: 'localhost',
  database: 'postgres_user',
  password: 'postgres_password',
  port: 6500,
});


/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("0");

  const connectDb = async () => {
    try {
      console.log("1");

      await pool.connect();
      const response = await pool.query('SELECT x, y FROM public."Device_3504"');

      console.log("2");


      console.log(response);


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
