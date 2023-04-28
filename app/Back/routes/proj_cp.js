var express = require('express');
var router = express.Router();

/* Router point de controles projetés sur la trajectoires*/

// Récupère les données de points de contrôle en appelant l'API correspondante
fetch(`http://localhost:3000/cp`, {
    method: 'GET'
})
    .then((response) => response.json())
    .then((controlPoints) => {
        // Récupère les données de trajectoire en appelant l'API correspondante
        fetch(`http://localhost:3000/traj`, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((trajectory) => router.post('/', (req, res) => {
                // Convertit les points de contrôle et la trajectoire en tableaux de coordonnées
                const controlPointsArr = controlPoints.map((p) => [p[0], p[1]]);
                console.log('Control Points Array:', controlPointsArr);
                const trajectoryArr = trajectory.map((p) => [p.x, p.y]);
                console.log('Trajectory Array:', trajectoryArr);

                // Parcourt les points de contrôle et trouve le point le plus proche sur la trajectoire
                const projectedPoints = controlPointsArr.map((cp) => {
                    let minDistance = Number.MAX_VALUE;
                    let closestPoint = null;
                    for (let i = 0; i < trajectoryArr.length - 1; i++) {
                        const pt1 = trajectoryArr[i];
                        const pt2 = trajectoryArr[i + 1];
                        const distance = pointToLineDistance(cp, pt1, pt2);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestPoint = closestPointOnLine(cp, pt1, pt2);
                        }
                    }
                    console.log('Nearest Point:', closestPoint);
                    const coordinates = closestPoint;
                    if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
                        console.log('Invalid coordinates for nearest point:', closestPoint);
                        return null;
                    }
                    return {
                        x: parseFloat(coordinates[0]),
                        y: parseFloat(coordinates[1]),
                        name: cp[2],
                    };
                }).filter(p => p !== null);
                console.log('Projected Points:', projectedPoints);
                // Et renvoie les points projetés sous forme de JSON
                res.json(projectedPoints);
            }));
    });


// Cette fonction calcule le point le plus proche sur un segment de droite à partir d'un point donné
// elle prend en argument un segment de droite  et un point 
// Et retourne un point sur le segment en question
function closestPointOnLine(point, pt1, pt2) {
    const x = point[0], y = point[1];
    const x1 = pt1[0], y1 = pt1[1];
    const x2 = pt2[0], y2 = pt2[1];

    // Calculer la distance entre le point et le segment de droite
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) {
        // Calculer le paramètre qui indique l'emplacement du point le plus proche sur le segment
        param = dot / len_sq;
    }

    let xx, yy;
    // Si le paramètre est en dehors des limites du segment, calculer plutôt le point d'extrémité le plus proche
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    return [xx, yy];
}

// Cette fonction calcule la distance entre un point et un segment de droite
// elle prend en argument un segment de droite  et un point 
// Et retourne une distance
function pointToLineDistance(point, pt1, pt2) {
    const closestPoint = closestPointOnLine(point, pt1, pt2);
    const dx = point[0] - closestPoint[0];
    const dy = point[1] - closestPoint[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
}

module.exports = { router, pointToLineDistance, closestPointOnLine };