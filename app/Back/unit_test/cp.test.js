const request = require("supertest");
const app = require("../app");


describe("Test the cp path", () => {
    test("It should response the cp object", async () => {
        const response = await request(app).get("/cp")
        expect(response.statusCode).toBe(200);
        const body = response.body;
        expect(body).not.toBeNaN();
        expect(body).toHaveProperty('length', 10)
        expect(body[1]).toEqual([
            133325.23988534685, 6435602.446513227,
            133486.22446421266, 6435282.187671882,
            485, 613,
            "PC1"
        ]);
    })
});