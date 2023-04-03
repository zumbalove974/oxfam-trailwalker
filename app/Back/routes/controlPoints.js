var express = require('express');
var router = express.Router();
//const port = 5500;
console.log('hhh')

const controlPoints = {
    "point1": { "x": 119217.3831, "y": 6433404.488, "name": "Départ" },
    "point2": { "x": 124180.5423, "y": 6410453.993, "name": "PC3" },
    "point3": { "x": 132238.2362, "y": 6435533.093, "name": "PC1" },
    "point4": { "x": 105920.382, "y": 6414143.439, "name": "PC5" },
    "point5": { "x": 102033.4436, "y": 6428455.438, "name": "PC6" },
    "point6": { "x": 111821.8043, "y": 6409726.207, "name": "PC4" },
    "point7": { "x": 119217.3831, "y": 6433404.488, "name": "Arrivé" },
    "point8": { "x": 133515.4635, "y": 6422798.163, "name": "PC2" },
    "point9": { "x": 122185.2528, "y": 6434184.187, "name": "PC8" },
    "point10": { "x": 105412.5035, "y": 6430485.632, "name": "PC7" }
};
console.log(controlPoints, 'hhhh')
router.get('/controlPoints', (req, res) => {
    res.json(controlPoints);
});
module.exports = router;