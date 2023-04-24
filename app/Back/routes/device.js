var express = require('express');
var router = express.Router();
// Le package 'pg' est requis pour se connecter à une base de données PostgreSQL.
const { Pool } = require("pg");

/* Router par device */

// Configuration de la connexion à la base de données PostgreSQL
router.pool = new Pool({
    user: 'postgres_user',
    host: 'database',
    database: 'postgres_user',
    password: 'postgres_password',
    port: 5432,
});

// Cette fonction se connecte à la base de données et récupère les données d'un device spécifié.
// La requête PostgreSQL est exécutée, et la réponse est sauvegardée.
// Si une erreur se produit pendant la requête, elle est enregistrée dans la console.
router.connectDB = async (req, that) => {
    try {

        const response = await that.pool.query(
            `SELECT * FROM public."Device_${req.params.deviceNumber}" ORDER BY "timestamp"`);

        return response.rows;

    } catch (error) {
        console.log(error)
    }
}

// Cette route gère les requêtes GET pour récupérer les données.
// La fonction connectDB est appelée avec l'objet requête et le routeur passés en arguments.
// Les données de réponse sont envoyées au client au format JSON.
router.get('/:deviceNumber', function (req, res, next) {
    router.connectDB(req, router).then(r => {
        res.json(r);
    })
});

module.exports = router;
