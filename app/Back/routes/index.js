var express = require('express');
var router = express.Router();
const { Pool } = require("pg");

/* Router pour tous les devices interpolés */

// Configuration de la connexion à la base de données PostgreSQL
router.pool = new Pool({
  user: 'postgres_user',
  host: 'database',
  database: 'postgres_user',
  password: 'postgres_password',
  port: 5432,
});

// Fonction pour se connecter à la base de données et récupérer les données d'interpolation
// Et renvoie les données sous forme de JSON
router.connectDB = async (req, that) => {
  try {

    const info_schema = await that.pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%Interpolation%'"
    );
    let promise_array = [];
    info_schema.rows.forEach(async table => {
      promise_array.push(
        that.pool.query(
          `SELECT * FROM public."${table.table_name}" ORDER BY "index"`
        )
      );
    })
    // On attend que toutes les promesses soient résolues pour renvoyer les résultats
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

router.get('/', function (req, res, next) {
  router.connectDB(req, router).then(r => {
    res.json(r);
  })


});

module.exports = router;
