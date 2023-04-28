const { describe, expect, test } = require('@jest/globals');

describe("Test the application path", () => {
    test("It should respond with 200 status", async () => {
        const response = await fetch(`http://oxfam-trailwalker-vue-ui-1:80/application`, {
            method: 'GET'
        })
        expect(response).not.toBeNaN();
        expect(response).toHaveProperty('status', 200)
        expect(response).toHaveProperty('ok', true)
    });
});