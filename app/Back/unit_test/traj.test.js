const request = require("supertest");
const app = require("../app");

//MOCK
const PgMock2 = require('pgmock2').default;
const router = require("../routes/traj");
const truePool = router.pool;

router.pool = new PgMock2();

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

router.pool.connect()

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