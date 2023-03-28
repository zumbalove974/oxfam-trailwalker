import "regenerator-runtime/runtime";
import * as THREE from "three";
//import Feature from "ol/Feature";
import { VTController } from "./VTController";
import { mergedRender } from "./VTThreeViewer";// singleRender
import { planStyle } from "./OLViewer"; //  planStyle, grisStyle, 
import proj4 from "proj4";
import { proj4326, proj3857 } from "./Utils";
import { ZOOM_RES_L93 } from "./Utils";


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
/*
const paramsCovid = {
  center: parisCenter,
  zoom: 10,
  layers: [],
  style: planStyle
};
*/

let line;
let coordinates;

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

  const depht_s = Math.tan(((45 / 2.0) * Math.PI) / 180.0) * 2.0;
  const zoomPas = 1;
  let lastCameraZ = window.innerHeight / depht_s;

  /* On désactive l'orbit control lors du click (drag) */
  document.addEventListener("pointerup", () => {
    controller.threeViewer.controls.enabled = true;
  });

  document.addEventListener("pointerdown", () => {
    controller.threeViewer.controls.enabled = false;
  });

  /* On modifie le zoom de la map lors du zoom et on ne change pas la position de la camera contrairement au fonctionement par défault de l'orbit control */
  controller.threeViewer.controls.addEventListener('change', function () {
    console.log("__scroll__");

    const changeZ = controller.threeViewer.perspectiveCamera.position.z;

    let zoom = controller.olViewer.map.getView().getZoom();

    if (changeZ != lastCameraZ) {
      if (changeZ < lastCameraZ) {
        zoom += zoomPas;
      } else if (changeZ > lastCameraZ) {
        zoom -= zoomPas;
      }

      controller.olViewer.map.getView().setZoom(Math.round(zoom));
      controller.threeViewer.perspectiveCamera.position.z = lastCameraZ;
      controller.threeViewer.zoomFactor = ZOOM_RES_L93[Math.round(zoom)];
      controller.threeViewer.scene.remove(line);

      if (coordinates)
        addItineraire(coordinates);
    } else {
      lastCameraZ = changeZ;
    }
  });

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

  controller.threeViewer.scene.add(cube); //all objects have to be added to the threejs scene
}


export const addItineraire = function addItineraire(coords) {

  coordinates = coords;

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

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  line = new THREE.Line(geometry, material);
  /*
  controller.threeViewer.currentCamera.position.set(coords[0].x, coords[0].y, 11)
  controller.threeViewer.currentCamera.lookAt(new Vector3(coords[0].x, coords[0].y, 0))
  controller.threeViewer.currentCamera.updateProjectionMatrix()*/
  controller.threeViewer.scene.add(line);
}
