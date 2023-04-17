const { describe, expect, test } = require('@jest/globals');

describe("Test the inter path", () => {
    test("It should respond with the correct obj", async () => {
        const json = await fetch(`http://express-back:3000/traj`, {
            method: 'GET'
        })
            .then(response => response.json())
        expect(json).not.toBeNaN();
        expect(json).toHaveProperty('length', 3447)
        expect(json[0]).toEqual({
            x: 120558.7126364244,
            y: 6432977.242621139
        })
    });
});