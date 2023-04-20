const request = require("supertest");
const app = require("../app");

/* Définition des tests pour l'endpoint '/cp'*/

describe("Test the cp path", () => {
    test("It should response the cp object", async () => {
        const response = await request(app).get("/cp")
        // Vérification du code de réponse HTTP
        expect(response.statusCode).toBe(200);
        const body = response.body;
        // Vérification que le corps de la réponse n'est pas NaN
        expect(body).not.toBeNaN();
        // Vérification que l'objet cp contient 10 éléments
        expect(body).toHaveProperty('length', 10)
        // Vérification de la valeur du deuxième élément de l'objet cp
        expect(body[1]).toEqual([
            133325.23988534685, 6435602.446513227,
            133486.22446421266, 6435282.187671882,
            485, 613,
            "PC1"
        ]);
    })
});