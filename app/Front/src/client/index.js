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

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  /* On désactive l'orbit control lors du click (drag) */
  document.addEventListener("pointerup", () => {
    controller.threeViewer.controls.enabled = true;
    pointerIsDown = false;

    pointer.x = 0;
    pointer.y = 0;

    raycaster.setFromCamera(pointer, controller.threeViewer.perspectiveCamera);
    let intersects = raycaster.intersectObjects(controller.threeViewer.planes.children);
    let x = intersects[0].point.x * controller.threeViewer.zoomFactor + controller.threeViewer.mapCenter[0];
    let y = intersects[0].point.y * controller.threeViewer.zoomFactor + controller.threeViewer.mapCenter[1];

    console.log(intersects);
    controller.olViewer.map.getView().setCenter([x, y]);
    controller.threeViewer.mapCenter = [x, y];
    controller.threeViewer.perspectiveCamera.position.set(0, 0, cameraZ);

    controller.threeViewer.scene.remove(line);

    if (coordinates)
      addItineraire(coordinates);
  });

  document.addEventListener("pointerdown", (event) => {
    controller.threeViewer.controls.enabled = false;
    pointerIsDown = true;

    initPointerX = event.clientX;
    initPointerY = event.clientY;

    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
  });

  document.addEventListener("pointermove", (event) => {
    if (pointerIsDown) {
      newPointerX = event.clientX;
      newPointerY = event.clientY;

      controller.threeViewer.perspectiveCamera.position.x += (lastPointerX - newPointerX);
      controller.threeViewer.perspectiveCamera.position.y += (newPointerY - lastPointerY);

      lastPointerX = newPointerX;
      lastPointerY = newPointerY;
    }
  });

  /* On modifie le zoom de la map lors du zoom et on ne change pas la position de la camera contrairement au fonctionement par défault de l'orbit control */
  controller.threeViewer.controls.addEventListener('change', function () {
    console.log("__scroll__");

    const changeZ = controller.threeViewer.perspectiveCamera.position.z;

    let zoom = controller.olViewer.map.getView().getZoom();

    if (changeZ != cameraZ) {
      if (changeZ < cameraZ) {
        zoom += zoomPas;
      } else if (changeZ > cameraZ) {
        zoom -= zoomPas;
      }

      controller.olViewer.map.getView().setZoom(Math.round(zoom));
      controller.threeViewer.perspectiveCamera.position.z = cameraZ;
      controller.threeViewer.zoomFactor = ZOOM_RES_L93[Math.round(zoom)];
      controller.threeViewer.scene.remove(line);

      if (coordinates)
        addItineraire(coordinates);
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

export const addItineraireEpaisseur = function addItineraireEpaisseur(trace) {
  const material = new THREE.MeshBasicMaterial({
    color: "blue"
  });

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
  const geometry = new THREE.ShapeBufferGeometry(shapes);
  const mesh = new THREE.Mesh(geometry, material);
  controller.threeViewer.scene.add(mesh);

  addItineraire(trace);

}