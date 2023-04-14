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
            132238.2362,
            6435533.093,
            "PC1"
        ]);
    })
});