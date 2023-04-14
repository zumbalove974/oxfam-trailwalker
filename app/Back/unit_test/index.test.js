const request = require("supertest");
const app = require("../app");

//MOCK
const PgMock2 = require('pgmock2').default;
const router = require("../routes/index");
const truePool = router.pool;

router.pool = new PgMock2();

router.pool.add("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%Interpolation%';", [], {
    rowCount: 2,
    rows: [
        "Interpolation_3883", "Interpolation_3843"
    ]
})

router.pool.add('SELECT * FROM public."Interpolation_3883" ORDER BY "index"', [], {
    rowCount: 2,
    rows: [
        {
            "index": "0",
            "x": 120558.7126364244,
            "y": 6432977.242621139,
            "speed": 0,
            "timestamp":
                "2021-03-07T06:00:00.000Z",
            "interpolation_error": 0,
            "x_GPS": 120558.7126364244,
            "y_GPS": 6432977.242621139
        },
        {
            "index": "1",
            "x": 120580.09203932274,
            "y": 6432977.84723748,
            "speed": 0,
            "timestamp": "2021-03-07T06:00:00.000Z",
            "interpolation_error": 21.38795056122823,
            "x_GPS": 120558.7126364244,
            "y_GPS": 6432977.242621139
        }
    ]
})

router.pool.add('SELECT * FROM public."Interpolation_3843" ORDER BY "index"', [], {
    rowCount: 2,
    rows: [
        {
            "index": "10",
            "x": 120558.7126364244,
            "y": 6432977.242621139,
            "speed": 0,
            "timestamp":
                "2021-03-07T06:00:00.000Z",
            "interpolation_error": 0,
            "x_GPS": 120558.7126364244,
            "y_GPS": 6432977.242621139
        },
        {
            "index": "11",
            "x": 120580.09203932274,
            "y": 6432977.84723748,
            "speed": 0,
            "timestamp": "2021-03-07T06:00:00.000Z",
            "interpolation_error": 21.38795056122823,
            "x_GPS": 120558.7126364244,
            "y_GPS": 6432977.242621139
        }
    ]
})

router.pool.connect()

describe("Test the index path", () => {
    test("It should response the mock object", async () => {
        const response = await request(app).get("/")
        expect(response.statusCode).toBe(200);
        const body = response.body;
        console.log(body)
        expect(body).not.toBeNaN();
        expect(body).toHaveProperty('length', 2)
        expect(body[0]).toHaveProperty('length', 2)
        expect(body[0][0]).toEqual({
            index: "10",
            x: 120558.7126364244,
            y: 6432977.242621139,
            speed: 0,
            timestamp: "2021-03-07T06:00:00.000Z",
            interpolation_error: 0,
            x_GPS: 120558.7126364244,
            y_GPS: 6432977.242621139,
        });
    })
});

router.pool = truePool;