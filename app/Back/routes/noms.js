var express = require('express');
var router = express.Router();
const { Pool } = require("pg");

/* Router nom de tables*/

// Configuration de la connexion à la base de données
router.pool = new Pool({
    user: 'postgres_user',
    host: 'database',
    database: 'postgres_user',
    password: 'postgres_password',
    port: 5432,
});

// Fonction pour se connecter à la base de données et récupérer les noms des tabes
// Et renvoie les données sous forme de JSON
router.connectDB = async (req, that) => {
    try {
        const response = await that.pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%Interpolation%'"
        );

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
