import "regenerator-runtime/runtime";
import * as THREE from "three";
//import Feature from "ol/Feature";
import { VTController } from "./VTController";
import { mergedRender } from "./VTThreeViewer";// singleRender
import { planStyle } from "./OLViewer"; //  planStyle, grisStyle, 
import proj4 from "proj4";
import { proj4326, proj3857 } from "./Utils";
import { ZOOM_RES_L93 } from "./Utils";
import { getLiveDataDevice } from "./bddConnexion";

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

let visu_meshes = [];
let visu_function;
let device;
let line;
let line3d;
let mesh;
let dimension;

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

  //addObjects();
}

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

function clickUp() {
  controller.threeViewer.controls.enabled = true;
  pointerIsDown = false;

  pointer.x = 0;
  pointer.y = 0;

  raycaster.setFromCamera(pointer, controller.threeViewer.perspectiveCamera);
  let intersects = raycaster.intersectObjects(controller.threeViewer.planes.children);
  console.log("intersects", intersects);

  if (intersects.length) {
    let x = intersects[0].point.x * controller.threeViewer.zoomFactor + controller.threeViewer.mapCenter[0];
    let y = intersects[0].point.y * controller.threeViewer.zoomFactor + controller.threeViewer.mapCenter[1];

    controller.olViewer.map.getView().setCenter([x, y]);
    controller.threeViewer.mapCenter = [x, y];
  }

  controller.threeViewer.controls.enabled = false;

  controller.threeViewer.perspectiveCamera.position.set(0, 0, cameraZ);
  console.log(controller.threeViewer.perspectiveCamera.rotation);
  controller.threeViewer.perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
  controller.threeViewer.perspectiveCamera.rotation.z -= Math.PI / 2;

  controller.threeViewer.controls.enabled = true;

  controller.threeViewer.scene.remove(line);
  controller.threeViewer.scene.remove(line3d);
  controller.threeViewer.scene.remove(mesh);
  while (visu_meshes.length > 0) {
    controller.threeViewer.scene.remove(visu_meshes.pop());
  }


  if (device && visu_function)
    visu_function(device);

}

function clickDown(event) {
  controller.threeViewer.controls.enabled = false;
  pointerIsDown = true;

  initPointerX = event.clientX;
  initPointerY = event.clientY;

  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
}

function clickMove(event) {
  if (pointerIsDown) {
    newPointerX = event.clientX;
    newPointerY = event.clientY;

    controller.threeViewer.perspectiveCamera.position.x += (lastPointerX - newPointerX);
    controller.threeViewer.perspectiveCamera.position.y += (newPointerY - lastPointerY);

    lastPointerX = newPointerX;
    lastPointerY = newPointerY;
  }
}

function scroll() {
  console.log("__scroll__");

  const changeZ = controller.threeViewer.perspectiveCamera.position.z;

  let zoom = controller.olViewer.map.getView().getZoom();

  if (changeZ != cameraZ) {
    if (changeZ < cameraZ) {
      zoom += zoomPas;
    } else if (changeZ > cameraZ) {
      zoom -= zoomPas;

      controller.olViewer.map.getView().setZoom(Math.round(zoom));
      controller.threeViewer.perspectiveCamera.position.z = cameraZ;
      controller.threeViewer.zoomFactor = ZOOM_RES_L93[Math.round(zoom)];
    }

    controller.olViewer.map.getView().setZoom(Math.round(zoom));
    controller.threeViewer.perspectiveCamera.position.z = cameraZ;
    controller.threeViewer.zoomFactor = ZOOM_RES_L93[Math.round(zoom)];

    controller.threeViewer.scene.remove(line);
    controller.threeViewer.scene.remove(line3d);
    controller.threeViewer.scene.remove(mesh);
    while (visu_meshes.length > 0) {
      controller.threeViewer.scene.remove(visu_meshes.pop());
    }

    if (device && visu_function)
      visu_function(device);
  }
}

export const createDimensionEnvironment = function createDimensionEnvironment(dimensionNb) {

  dimension = dimensionNb;

  if (dimension == 2) {
    console.log("___dimension 2___");

    controller.threeViewer.controls.enabled = false;

    controller.threeViewer.perspectiveCamera.position.set(0, 0, cameraZ);
    console.log(controller.threeViewer.perspectiveCamera.rotation);
    controller.threeViewer.perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
    controller.threeViewer.perspectiveCamera.rotation.z -= Math.PI / 2;

    controller.threeViewer.controls.enabled = true;

    /* On désactive l'orbit control lors du click (drag) */
    document.addEventListener("pointerup", clickUp, true);
    document.addEventListener("pointerdown", clickDown, true);
    document.addEventListener("pointermove", clickMove, true);
    /* On modifie le zoom de la map lors du zoom et on ne change pas la position de la camera contrairement au fonctionement par défault de l'orbit control */
    controller.threeViewer.controls.addEventListener('change', scroll, true);

    controller.threeViewer.scene.remove(line3d);
    controller.threeViewer.scene.remove(mesh);
  } else {
    console.log("___dimension 3___");

    document.removeEventListener("pointerup", clickUp, true);
    document.removeEventListener("pointerdown", clickDown, true);
    document.removeEventListener("pointermove", clickMove, true);
    controller.threeViewer.controls.removeEventListener('change', scroll, true);
  }
}
/*
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
}*/

export const addItineraire = async function addItineraire(deviceNumber) {

  device = deviceNumber;
  visu_function = addItineraire;

  const coords = await getLiveDataDevice(deviceNumber);

  const material = new THREE.LineBasicMaterial({
    color: 0xff0000
  });

  const points = [];

  for (let i = 0; i < coords.length; i++) {

    points.push(new THREE.Vector3(
      controller.threeViewer.getWorldCoords([coords[i].x, coords[i].y])[0],
      controller.threeViewer.getWorldCoords([coords[i].x, coords[i].y])[1],
      0));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  let visu_mesh = new THREE.Line(geometry, material);
  visu_meshes.push(visu_mesh);

  // controller.threeViewer.currentCamera.position.set(coords[0].y, coords[0].x, 11)
  // controller.threeViewer.currentCamera.lookAt(new THREE.Vector3(coords[0].y, coords[0].x, 0))
  // controller.threeViewer.currentCamera.updateProjectionMatrix()

  controller.threeViewer.scene.add(visu_mesh);
}

export const addItineraireEpaisseur = async function addItineraireEpaisseur(deviceNumber) {

  const trace = await getLiveDataDevice(deviceNumber);
  visu_function = addItineraireEpaisseur;

  const material = new THREE.MeshBasicMaterial({
    color: "blue"
  });

  let shape = new THREE.Shape();
  shape.moveTo(
    controller.threeViewer.getWorldCoords([trace[0].x, trace[0].y])[0],
    controller.threeViewer.getWorldCoords([trace[0].x, trace[0].y])[1]
  )

  for (let i = 0; i < trace.length - 1; i++) {

    let xA = controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[0];
    let yA = controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[1];
    let xB = controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[0];
    let yB = controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[1];
    let dA = trace[i].speed;
    let dB = trace[i + 1].speed;
    let normAB = Math.sqrt(Math.pow(xB - xA, 2) + Math.pow(yB - yA, 2))
    if (normAB <= 0) { continue }

    shape.lineTo(
      xA + dA * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
      yA - dA * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB))
    shape.lineTo(
      xB + dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
      yB - dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB))
  }

  for (let i = trace.length - 2; i >= 0; i--) {

    let xA = controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[0];
    let yA = controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[1];
    let xB = controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[0];
    let yB = controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[1];
    let dA = trace[i].speed;
    let dB = trace[i + 1].speed;
    let normAB = Math.sqrt(Math.pow(xB - xA, 2) + Math.pow(yB - yA, 2))
    if (normAB <= 0) { continue }

    shape.lineTo(
      xB - dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
      yB + dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB))
    shape.lineTo(
      xA - dA * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
      yA + dA * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB))
  }

  shape.lineTo(
    controller.threeViewer.getWorldCoords([trace[0].x, trace[0].y])[0],
    controller.threeViewer.getWorldCoords([trace[0].x, trace[0].y])[1]
  )

  const geometry = new THREE.ShapeBufferGeometry(shape);
  let visu_mesh = new THREE.Mesh(geometry, material);
  visu_meshes.push(visu_mesh)
  controller.threeViewer.scene.add(visu_mesh);

  //addItineraire(deviceNumber);
}


export const addItineraireSpeed3D = async function addSpeed3D(deviceNumber) {

  device = deviceNumber;
  visu_function = addItineraireSpeed3D;

  const data = await getLiveDataDevice(deviceNumber);

  const points = [];
  const colors = [];
  let speeds = [];

  for (let i = 0; i < data.length; i++) {
    speeds.push(data[i].speed);
  }

  let min = Math.min(...speeds);
  let max = Math.max(...speeds);

  /* Normalisation des vitesses pour les utiliser dans les couleurs */
  for (let i = 0; i < speeds.length; i++) {
    speeds[i] = (speeds[i] - min) / (max - min);
  }

  if (dimension == 2) {
    for (let i = 0; i < data.length; i++) {
      points.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
      points.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
      points.push(0);
    }

    for (let i = 0; i < data.length; i++) {
      colors.push(speeds[i]);
      colors.push(1 - speeds[i]);
      colors.push(0.2);
    }

    // create geometry
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));

    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

    // create material
    const material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.VertexColors
    });

    controller.threeViewer.scene.remove(line);

    line3d = new THREE.Line(geometry, material);
    line3d.computeLineDistances();

    // add line to scene so it can be rendered
    controller.threeViewer.scene.add(line3d);
  } else {

    let geometry = new THREE.BufferGeometry();
    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.
    let vertices = [];
    let colors = [];
    const maxZ = 50;

    for (let i = 0; i < (data.length - 1); i++) {
      //Face 1
      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
      vertices.push(data[i].speed / max * maxZ);

      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
      vertices.push(0);

      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
      vertices.push(0);

      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
      vertices.push(0);

      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
      vertices.push(data[i + 1].speed / max * maxZ);

      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
      vertices.push(data[i].speed / max * maxZ);

      // Face 2
      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
      vertices.push(data[i].speed / max * maxZ);

      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
      vertices.push(0);

      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
      vertices.push(0);

      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
      vertices.push(0);

      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
      vertices.push(data[i].speed / max * maxZ);

      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
      vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
      vertices.push(data[i + 1].speed / max * maxZ);
    }

    for (let i = 0; i < (data.length - 1); i++) {
      // Face 1
      colors.push(speeds[i]);
      colors.push(0.0);
      colors.push(0.0);

      colors.push(0.2);
      colors.push(1.0);
      colors.push(0.2);

      colors.push(0.2);
      colors.push(1.0);
      colors.push(0.2);

      colors.push(0.2);
      colors.push(1.0);
      colors.push(0.2);

      colors.push(speeds[i + 1]);
      colors.push(0.0);
      colors.push(0.0);

      colors.push(speeds[i]);
      colors.push(0.0);
      colors.push(0.0);

      //Face 2
      colors.push(speeds[i]);
      colors.push(0.0);
      colors.push(0.0);

      colors.push(0.2);
      colors.push(1.0);
      colors.push(0.2);

      colors.push(0.2);
      colors.push(1.0);
      colors.push(0.2);

      colors.push(0.2);
      colors.push(1.0);
      colors.push(0.2);

      colors.push(speeds[i]);
      colors.push(0.0);
      colors.push(0.0);

      colors.push(speeds[i + 1]);
      colors.push(0.0);
      colors.push(0.0);
    }

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

    // create material
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    mesh = new THREE.Mesh(geometry, material);

    console.log("-------------", geometry)

    controller.threeViewer.scene.add(mesh);
  }
}