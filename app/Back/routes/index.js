var express = require('express');
var router = express.Router();
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

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
      const info_schema = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%Device%';"
      );

      let promise_array = [];
      info_schema.rows.forEach(async table => {
        promise_array.push(pool.query(`SELECT * FROM ${table.table_name}`));
      })

      let return_array = [];
      return Promise.all(promise_array)
        .then((response_array) => {
          response_array.rows.forEach((row) => {
            return_array.push(row);
          })
          return return_array
        })

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
