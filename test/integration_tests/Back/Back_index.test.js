const { describe, expect, test } = require('@jest/globals');

describe("Test the inter path", () => {
    test("It should respond with the correct obj", async () => {
        const json = await fetch(`http://express-back:3000/`, {
            method: 'GET'
        })
            .then(response => response.json())
        expect(json).not.toBeNaN();
        expect(json).toHaveProperty('length', 258)
        expect(json[0]).toHaveProperty('length', 3447)
        expect(json[0][0]).toEqual({
            index: "0",
            x: 120558.7126364244,
            y: 6432977.242621139,
            speed: 0,
            timestamp: "2021-03-07T06:00:00.000Z",
            interpolation_error: 20.71235893289073,
            x_GPS: 120578.19346238313,
            y_GPS: 6432970.207052041,
        })
    }, 60000);
});

