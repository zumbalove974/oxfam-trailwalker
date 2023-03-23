var express = require('express');
var router = express.Router();
const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

/* GET home page. */
router.get('/', function (req, res, next) {

  const connectDb = async () => {
    try {
      const client = new Client({
        user: "postgres_user",
        host: "localhost",
        database: "postgres_user",
        password: "postgres_password",
        port: 6500,
      });

      await client.connect();
      const response = await client.query('SELECT * FROM public."Device_3504"');
      await client.end();
      return response;
    } catch (error) {
      console.log(error)
    }
  }

  connectDb().then(r => {
    res.render('index', { title: r });
  })

});

module.exports = router;
