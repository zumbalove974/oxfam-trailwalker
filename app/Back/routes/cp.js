var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
  // controlpoints est un tableau de listes 
  // Chaque ligne constitue une liste définit comme : [x1, y1, x2, y2, indice1, indice2, difficulte, label] 
  // (x1,y1) le premier point du checkpoint
  // (x2,y2) le dernier point du checkpoint
  // (indice1, indice2) leurs indices respectifs sur la trajectoire
  const controlPoints = [
    [120559.10059648633, 6432978.774882918, 120559.10059648633, 6432978.774882918, 0, 0, 0, "Départ"],
    [133325.23988534685, 6435602.446513227, 133486.22446421266, 6435282.187671882, 485, 613, 2, "PC1"],
    [130698.18696593112, 6423899.554340629, 130745.96565456253, 6423631.992474135, 1038, 1074, 3, "PC2"],
    [124327.73571309846, 6410592.335040327, 124086.54161488569, 6410451.347171999, 1629, 1681, 1, "PC3"],
    [111865.1535365635, 6409688.852152717, 112187.91244816661, 6409626.882446654, 2167, 2078, 5, "PC4"],
    [105948.74193284813, 6414073.486174198, 106204.72373319913, 6414076.853273098, 2431, 2462, 3, "PC5"],
    [106879.57181468268, 6424193.320547786, 106628.71951908505, 6424451.333203454, 2625, 2651, 4, "PC6"],
    [105414.8506223609, 6430630.754249729, 105414.8506223609, 6430630.754249729, 2833, 2833, 1, "PC7"],
    [110611.43854708769, 6430265.078979768, 110971.18913121062, 6430241.618308167, 2960, 3007, 2, "PC8"],
    [119178.27111171802, 6433549.716790822, 119178.27111171802, 6433549.716790822, 3438, 3438, 5, "Arrivée"]
  ];
  // RESULT OF THIS FUNCTION IS : 
  // findClosestPoint(controlPoints).then(r => console.log("result", r))


  res.json(controlPoints);

});

async function findClosestPoint(controlPoints) {
  const traj = await fetch(`http://localhost:3000/traj`, {
    method: 'GET'
  }).then(response => response.json())
    ;
  const cp = controlPoints

  const res = []
  console.log("traj", traj)
  for (let i = 0; i < cp.length; i++) {
    let min_index_f = 0
    let mini_f = Math.pow(cp[i][0] - traj[0].x, 2) + Math.pow(cp[i][1] - traj[0].y, 2)
    let min_index_l = 0
    let mini_l = Math.pow(cp[i][2] - traj[0].x, 2) + Math.pow(cp[i][3] - traj[0].y, 2)
    for (let j = 1; j < traj.length; j++) {
      if (Math.pow(cp[i][0] - traj[j].x, 2) + Math.pow(cp[i][1] - traj[j].y, 2) < mini_f) {
        min_index_f = j
        mini_f = Math.pow(cp[i][0] - traj[j].x, 2) + Math.pow(cp[i][1] - traj[j].y, 2)
      }
      if (Math.pow(cp[i][2] - traj[j].x, 2) + Math.pow(cp[i][3] - traj[j].y, 2) < mini_l) {
        min_index_l = j
        mini_l = Math.pow(cp[i][2] - traj[j].x, 2) + Math.pow(cp[i][3] - traj[j].y, 2)
      }
    }
    res.push(min_index_f, min_index_l)
  }

  return res
}

module.exports = router;
