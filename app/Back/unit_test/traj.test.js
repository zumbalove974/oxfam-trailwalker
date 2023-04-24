const request = require("supertest");
const app = require("../app");
const PgMock2 = require('pgmock2').default;
const router = require("../routes/traj");
const truePool = router.pool;

/* Définition des tests pour le router traj*/

// Remplacement de la pool de connexion par le mock
router.pool = new PgMock2();
// Ajout des réponses du mock pour les requêtes à la base de données
router.pool.add('SELECT x,y FROM public."Interpolation_3607" ORDER BY "index"', [], {
    rowCount: 2,
    rows: [
        {
            x: 120558.7126364244,
            y: 6432977.242621139
        },
        {
            x: 120580.09203932274,
            y: 6432977.84723748
        }
    ]
})
// Connexion au mock pool de connexion à la bd
router.pool.connect()

/* Tester traj : code de statut de la réponse, 
pas de NaN, réponse a une propriété de longueur de 2, 
Vérifiez que la première valeur de la deuxième liste dans le corps de la réponse est égale au mock spécifié
*/
describe("Test the traj path", () => {
    test("It should response the mock object", async () => {
        const response = await request(app).get("/traj")
        expect(response.statusCode).toBe(200);
        const body = response.body;
        expect(body).not.toBeNaN();
        expect(body).toHaveProperty('length', 2)
        expect(body[0]).toEqual({
            x: 120558.7126364244,
            y: 6432977.242621139
        });
    })
});