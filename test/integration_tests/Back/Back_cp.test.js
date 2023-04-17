const { describe, expect, test } = require('@jest/globals');

describe("Test the cp path", () => {
    test("It should respond with the correct obj", async () => {
        const json = await fetch(`http://express-back:3000/cp`, {
            method: 'GET'
        })
            .then(response => response.json())
        expect(json).not.toBeNaN();
        expect(json).toHaveProperty('length', 10)
        expect(json).toEqual([
            [119217.3831, 6433404.488, "Départ"],
            [132238.2362, 6435533.093, "PC1"],
            [133515.4635, 6422798.163, "PC2"],
            [124180.5423, 6410453.993, "PC3"],
            [111821.8043, 6409726.207, "PC4"],
            [105920.382, 6414143.439, "PC5"],
            [102033.4436, 6428455.438, "PC6"],
            [105412.5035, 6430485.632, "PC7"],
            [122185.2528, 6434184.187, "PC8"],
            [119217.3831, 6433404.488, "Arrivé"]]);
    });
});