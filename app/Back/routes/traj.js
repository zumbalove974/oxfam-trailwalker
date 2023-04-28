var express = require('express');
var router = express.Router();
const { Pool } = require("pg");

/* Router qui retourne la trajectoire */

// Configuration de la connexion à la base de données PostgreSQL
router.pool = new Pool({
    user: 'postgres_user',
    host: 'database',
    database: 'postgres_user',
    password: 'postgres_password',
    port: 5432,
});

// Cette fonction se connecte à la base de données et récupère les la trajectoire.
// La requête PostgreSQL est exécutée, et la réponse est sauvegardée.
// Les données de réponse sont envoyées au client au format JSON.
// Si une erreur se produit pendant la requête, elle est enregistrée dans la console.
router.connectDB = async (req, that) => {
    try {
        const response = await that.pool.query(
            `SELECT x,y FROM public."Interpolation_3607" ORDER BY "index"`);

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
