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

      const info_schema = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%Interpolation%';"
      );

      let promise_array = [];
      info_schema.rows.forEach(async table => {
        promise_array.push(pool.query(`SELECT * FROM public."${table.table_name}" ORDER BY "timestamp"`));
      })

      let return_array = [];
      return Promise.all(promise_array)
        .then((response_array) => {
          response_array.forEach((response) => {
            return_array.push(response.rows);
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
    pool.end();
  })


});

module.exports = router;
