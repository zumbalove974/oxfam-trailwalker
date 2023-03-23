var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  const connectDb = async () => {
    try {
      const pool = new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
      });

      await pool.connect()
      const res = await pool.query('SELECT * FROM public."Device_3504"')
      console.log(res)
      await pool.end()
    } catch (error) {
      console.log(error)
    }
  }
  res.send('respond with a resource');
});

module.exports = router;
