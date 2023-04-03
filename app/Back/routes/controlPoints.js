var express = require('express');
var router = express.Router();
const port = 5500;

const controlPoints = [
    [119217.3831, 6433404.488, "Départ"],
    [124180.5423, 6410453.993, "PC3"],
    [132238.2362, 6435533.093, "PC1"],
    [105920.382, 6414143.439, "PC5"],
    [102033.4436, 6428455.438, "PC6"],
    [111821.8043, 6409726.207, "PC4"],
    [119217.3831, 6433404.488, "Arrivé"],
    [133515.4635, 6422798.163, "PC2"],
    [122185.2528, 6434184.187, "PC8"],
    [105412.5035, 6430485.632, "PC7"]
];
console.log(controlPoints)
router.get('/controlPoints', (req, res) => {
    res.json(controlPoints);
});
router.listen(port);
module.exports = router;


