var express = require('express');
var router = express.Router();

// Fetch control points data
fetch(`http://localhost:3000/cp`, {
    method: 'GET'
})
    .then((response) => response.json())
    .then((controlPoints) => {
        // Fetch trajectory data
        fetch(`http://localhost:3000/traj`, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((trajectory) => router.post('/', (req, res) => {
                // Convert the control points and trajectory to arrays of coordinates
                const controlPointsArr = controlPoints.map((p) => [p[0], p[1]]);
                console.log('Control Points Array:', controlPointsArr);
                const trajectoryArr = trajectory.map((p) => [p.x, p.y]);
                console.log('Trajectory Array:', trajectoryArr);

                // Loop through the control points and find the closest point on the trajectory
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
                // Send the projected points as response
                res.json(projectedPoints);
            }));
    });
module.exports = router;

// Returns the distance between a point and a line segment
function closestPointOnLine(point, pt1, pt2) {
    const x = point[0], y = point[1];
    const x1 = pt1[0], y1 = pt1[1];
    const x2 = pt2[0], y2 = pt2[1];

    // Calculate the distance between the point and the line segment
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) {
        // Calculate the parameter that indicates the location of the closest point on the segment
        param = dot / len_sq;
    }

    let xx, yy;
    // If the parameter is outside the segment bounds, calculate the closest endpoint instead
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
function pointToLineDistance(point, pt1, pt2) {
    const closestPoint = closestPointOnLine(point, pt1, pt2);

    // Calculate the distance between the point and its projection onto the line segment
    const dx = point[0] - closestPoint[0];
    const dy = point[1] - closestPoint[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance;
}