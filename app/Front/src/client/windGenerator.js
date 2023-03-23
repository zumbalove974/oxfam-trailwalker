var turf = require("@turf/turf");
var proj4 = require("proj4");
const fs = require("fs");

const proj4326 = proj4.defs("EPSG:4326");
const proj3857 = proj4.defs("EPSG:3857");

var geometry = {
  type: "Polygon",
  coordinates: [
    [
      proj4(proj3857, proj4326, [259239, 6248476]),
      proj4(proj3857, proj4326, [259266, 6248502]),
      proj4(proj3857, proj4326, [259306, 6248293]),
      proj4(proj3857, proj4326, [259275, 6248267]),
      proj4(proj3857, proj4326, [259239, 6248476])
    ]
  ]
};

result = [];
var feature = turf.feature(geometry);
var options = { units: "kilometers" };
let grid = turf.squareGrid(turf.bbox(feature), 0.0025, options);
for (let item of grid.features) {
  if (turf.booleanContains(feature, item)) {
    let bbox = turf.bbox(item);
    let x = (bbox[2] + bbox[0]) / 2;
    let y = (bbox[3] + bbox[1]) / 2;
    result.push({ lat: y, lon: x, z: 0, u: 0.25, v: 1 });
  }
}

let newResult = [];
for (z = 0; z <= 4; z++) {
  for (let item of result) {
    newResult.push({ lat: item.lat, lon: item.lon, z: z, u: 0.25, v: 1 });
  }
}

console.log(result);
fs.writeFileSync("data/wind.json", JSON.stringify(newResult));
