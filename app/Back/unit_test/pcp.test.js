const request = require("supertest");
const app = require("../app");
const lib = require("../routes/proj_cp.js");

/* Définition des tests pour le router pcp*/

/* Tester pcp : 
    - Définition de la route "pcp" avec une méthode POST
    - Récupération des données envoyées dans la requête
    - Création d'un nouvel objet "pcp" avec les données reçues
    - Retourne une réponse avec un statut 201 (créé) et les données du tableau "pcps"
    - Si une erreur est survenue, retourne une réponse avec un statut 500 (erreur interne du serveur) et l'erreur rencontrée
*/
describe("Test the pcp path", () => {
    test("It should response the pcp object", async () => {
        app.post("/pcp", (req, res) => {
            try {
                const { x, y, name } = req.body;
                const newPcp = {
                    x,
                    y,
                    name,
                };
                pcps.push(newPcp);
                return res.status(201).json({
                    data: pcps,
                    error: null,
                });
            } catch (error) {
                return res.status(500).json({
                    data: null,
                    error: error,
                });
            }
        });
    })
});


// Test des fonctions "closestPointOnLine" et "pointToLineDistance"
describe("Test the pcp path functions", () => {
    test('Test closestPointOnLine and pointToLineDistance functions', () => {
        // Définition des données de test
        const point = [5, 5];
        const pt1 = [0, 0];
        const pt2 = [10, 10];

        // Appel de la fonction "closestPointOnLine"
        const closestPoint = lib.closestPointOnLine(point, pt1, pt2);

        // Vérification que le point le plus proche est correct
        expect(closestPoint).toEqual([5, 5]);

        // Appel de la fonction "pointToLineDistance"
        const distance = lib.pointToLineDistance(point, pt1, pt2);

        // Vérification que la distance est correcte
        expect(distance).toBeCloseTo(0, 5);
    })
})
