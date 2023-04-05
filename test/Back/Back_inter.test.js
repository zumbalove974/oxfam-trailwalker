const { describe, expect, test } = require('@jest/globals');

describe("Test the inter path", () => {
    test("It should response the correct obj", async () => {
        const json = await fetch(`http://localhost:5500/inter/3883`, {
            method: 'GET'
        })
            .then(response => response.json())
        expect(json).not.toBeNaN();
        expect(json).toHaveProperty('length', 3447)
        expect(json[0]).toEqual({
            index: "0",
            x: 120558.7126364244,
            y: 6432977.242621139,
            speed: 0,
            timestamp: "2021-03-07T06:00:00.000Z",
            interpolation_error: 0,
            x_GPS: 120558.7126364244,
            y_GPS: 6432977.242621139,
        })
    });
});