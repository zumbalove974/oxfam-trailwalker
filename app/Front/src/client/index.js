import "regenerator-runtime/runtime";
import * as THREE from "three";
//import Feature from "ol/Feature";
import { VTController } from "./VTController";
import { mergedRender } from "./VTThreeViewer";// singleRender
import { muetStyle } from "./OLViewer"; //  planStyle, grisStyle, 
import proj4 from "proj4";
import { proj4326, proj3857 } from "./Utils";

//data can be imported like this or read from the data folder
//import windData from "../../data/wind.json";
//import covidData from "../../data/covid_data.json";
//import * as geotiff from "geotiff";

const width = window.innerWidth; // this makes the 3D canvas full screen
const height = window.innerHeight; // this makes the 3D canvas full screen

//let parisLatLon = [48.8534, 2.3488];
//let parisCenter = proj4(proj4326, proj3857, [parisLatLon[1], parisLatLon[0]]);

let vavinLatLon = [49.93825150, 1.21090698];
let vavinCenter = proj4(proj4326, proj3857, [vavinLatLon[1], vavinLatLon[0]]);
//console.log("index.vavinCenter ", vavinCenter)

/*
const paramsCovid = {
  center: parisCenter,
  zoom: 10,
  layers: [],
  style: planStyle
};
*/

const paramsWind = {
  center: vavinCenter,
  zoom: 18,
  layers: [],//["bati_surf", "bati_zai"],
  style: muetStyle
};

let params = paramsWind;
let controller = null;
export const init = async function init() {
  // to read tiff file: https://geotiffjs.github.io/geotiff.js/. other files to be read should be added to the data folder
  // let tiffData = await geotiff.fromUrl("Hauteurs.tif");


  controller = new VTController(
    width,
    height,
    params.center, //center coordinates in webmercator
    params.zoom, //zoom level
    params.layers, //layers to be rendered as 3D features
    mergedRender, //render type, merged render more efficient but does not provide access to each feature
    params.style, //style for the tiles
    false
  );

  addObjects();
}

function addObjects() {
  //example to add an object to the scene
  let worldCoords = controller.threeViewer.getWorldCoords(vavinCenter); // the getWorldCoords function transform webmercator coordinates into three js world coordinates
  var geometry = new THREE.BoxBufferGeometry(10, 10, 10);
  var material = new THREE.MeshStandardMaterial({ color: 0xff4500 });
  var cube = new THREE.Mesh(geometry, material); //a three js mesh needs a geometry and a material
  cube.position.x = worldCoords[0];
  cube.position.y = worldCoords[1];
  cube.position.z = 0;

  // console.log("cube.position.x =", cube.position.x)
  // console.log("cube.position.y =", cube.position.y)
  controller.threeViewer.scene.add(cube); //all objects have to be added to the threejs scene
}



export const addItineraire = function addItineraire(coords) {
  const material = new THREE.LineBasicMaterial({
    color: 0xff0000
  });

  const points = [];
  for (let i = 0; i < coords.length; i++) {
    points.push(new THREE.Vector3(
      controller.threeViewer.getWorldCoords([coords[i].x, coords[i].y])[0],
      controller.threeViewer.getWorldCoords([coords[i].x, coords[i].y])[1],
      1));
  }
  //console.log("points", points)

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const line = new THREE.Line(geometry, material);
  //console.log("line", line)
  // console.log("coords")
  // console.log(coords);

  // controller.threeViewer.currentCamera.position.set(coords[0].x, coords[0].y, 11)
  // controller.threeViewer.currentCamera.lookAt(new THREE.Vector3(coords[0].x, coords[0].y, 0))
  // controller.threeViewer.currentCamera.updateProjectionMatrix()

  controller.threeViewer.scene.add(line);
}

export const addItineraireEpaisseur = function addItineraireEpaisseur(trace) {
  const material = new THREE.MeshBasicMaterial({
    color: "blue"
  });

  console.log("index.trace", trace)

  const shapes = [];

  for (let i = 0; i < trace.length - 1; i++) {

    if (trace[i].speed > 0 || trace[i + 1] > 0) {
      let shape = new THREE.Shape();
      let xA = controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[0];
      let yA = controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[1];
      let xB = controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[0];
      let yB = controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[1];
      let dA = trace[i].speed;
      let dB = trace[i + 1].speed;
      let normAB = Math.sqrt(Math.pow(xB - xA, 2) + Math.pow(yB - yA, 2))

      shape.moveTo(
        xA + dA * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yA - dA * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB))
      shape.lineTo(
        xB + dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yB - dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB))
      shape.lineTo(
        xB - dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yB + dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB))
      shape.lineTo(
        xA - dA * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yA + dA * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB))
      shape.lineTo(
        xA + dA * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yA - dA * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB))

      shapes.push(shape);
    }
  }
  console.log(shapes[0])
  const geometry = new THREE.ShapeBufferGeometry(shapes);
  const mesh = new THREE.Mesh(geometry, material);
  controller.threeViewer.scene.add(mesh);

  addItineraire(trace);

}