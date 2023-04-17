const request = require("supertest");
const app = require("../app");
const lib = require("../routes/proj_cp.js");

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

describe("Test the pcp path functions", () => {
    test('Test closestPointOnLine and pointToLineDistance functions', () => {
        // Define some test data
        const point = [5, 5];
        const pt1 = [0, 0];
        const pt2 = [10, 10];

        // Call the closestPointOnLine function
        const closestPoint = lib.closestPointOnLine(point, pt1, pt2);

        // Check that the closest point is correct
        expect(closestPoint).toEqual([5, 5]);

        // Call the pointToLineDistance function
        const distance = lib.pointToLineDistance(point, pt1, pt2);

        // Check that the distance is correct
        expect(distance).toBeCloseTo(0, 5);
    })
})
