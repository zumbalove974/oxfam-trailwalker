import "regenerator-runtime/runtime";
import * as THREE from "three";
//import Feature from "ol/Feature";
import { VTController } from "./VTController";
import { mergedRender } from "./VTThreeViewer";// singleRender
import { planStyle } from "./OLViewer"; //  planStyle, grisStyle, 
import proj4 from "proj4";
import { proj4326, proj3857 } from "./Utils";

import { getLiveDataDevice } from "./bddConnexion";

//import { asc, calculerPremierQuartile, calculerMedian, calculerTroisiemeQuartile } from "./mathUtils.js";


//data can be imported like this or read from the data folder
//import windData from "../../data/wind.json";
//import covidData from "../../data/covid_data.json";
//import * as geotiff from "geotiff";

const width = window.innerWidth; // this makes the 3D canvas full screen
const height = window.innerHeight; // this makes the 3D canvas full screen

//let parisLatLon = [48.8534, 2.3488];
//let parisCenter = proj4(proj4326, proj3857, [parisLatLon[1], parisLatLon[0]]);

let vavinLatLon = [49.868241, 1.069527];
export let vavinCenter = proj4(proj4326, proj3857, [vavinLatLon[1], vavinLatLon[0]]);

let visu_meshes = [];

let GPSvisu_mesh;

const paramsWind = {
  center: vavinCenter,
  zoom: 12,
  layers: ["bati_surf", "bati_zai"],//["bati_surf", "bati_zai"],
  style: planStyle
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

  addCursor();
  addItineraireReference();

  controller.threeViewer.cameraZ = cameraZ;
  controller.threeViewer.vavinCenter = vavinCenter;

  return controller;
}

const depht_s = Math.tan(((45 / 2.0) * Math.PI) / 180.0) * 2.0;
//const zoomPas = 1;
const cameraZ = window.innerHeight / depht_s;

// eslint-disable-next-line no-unused-vars
let initPointerX;
// eslint-disable-next-line no-unused-vars
let initPointerY;
// eslint-disable-next-line no-unused-vars
let lastPointerX;
// eslint-disable-next-line no-unused-vars
let lastPointerY;
// eslint-disable-next-line no-unused-vars
let newPointerX;
// eslint-disable-next-line no-unused-vars
let newPointerY;
// eslint-disable-next-line no-unused-vars
let pointerIsDown = false;


/* Ajoute un curseur au centre de la scene */
function addCursor() {

  const worldCoords = controller.threeViewer.getWorldCoords(vavinCenter); // the getWorldCoords function transform webmercator coordinates into three js world coordinates

  const geometryVertical = new THREE.BoxBufferGeometry(2, 10, 1);
  const geometryHorizontal = new THREE.BoxBufferGeometry(10, 2, 1);

  const material = new THREE.MeshStandardMaterial({ color: 0xff4500 });
  const traitVertical = new THREE.Mesh(geometryVertical, material); //a three js mesh needs a geometry and a material
  const traitHorizontal = new THREE.Mesh(geometryHorizontal, material); //a three js mesh needs a geometry and a material

  traitVertical.position.x = worldCoords[0];
  traitVertical.position.y = worldCoords[1];
  traitVertical.position.z = 0;

  traitHorizontal.position.x = worldCoords[0];
  traitHorizontal.position.y = worldCoords[1];
  traitHorizontal.position.z = 0;

  controller.threeViewer.scene.add(traitVertical);
  controller.threeViewer.scene.add(traitHorizontal);
}



async function addItineraireReference() {

  const coords = await getLiveDataDevice(3843);

  const GPSmaterial = new THREE.LineBasicMaterial({
    color: 0xff0000
  });

  const GPSpoints = [];

  for (let i = 0; i < coords.length; i++) {

    GPSpoints.push(new THREE.Vector3(
      controller.threeViewer.getWorldCoords([coords[i].x, coords[i].y])[0],
      controller.threeViewer.getWorldCoords([coords[i].x, coords[i].y])[1],
      0));
  }

  //console.log("GPSpoints", GPSpoints)

  const GPSgeometry = new THREE.BufferGeometry().setFromPoints(GPSpoints);

  GPSvisu_mesh = new THREE.Line(GPSgeometry, GPSmaterial);
  visu_meshes.push(GPSvisu_mesh);

  controller.threeViewer.scene.add(GPSvisu_mesh);
}
