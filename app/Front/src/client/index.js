import "regenerator-runtime/runtime";
import * as THREE from "three";
//import Feature from "ol/Feature";
import { VTController } from "./VTController";
import { mergedRender } from "./VTThreeViewer";// singleRender
import { planStyle } from "./OLViewer"; //  planStyle, grisStyle, 
import proj4 from "proj4";
import { proj4326, proj3857 } from "./Utils";
import { ZOOM_RES_L93 } from "./Utils";

import { getLiveDataDevice, getControlPoints } from "./bddConnexion";

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

let cps = [];
let devices = [];
let time_stamp;
let device;
let GPSvisu_mesh;
/*
let line;
let line3d;*/
let mesh;
let wall;
let dimension;
let pdcs = [];

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

export const clickUp = function clickUp() {
  controller.threeViewer.controls.enabled = true;
  pointerIsDown = false;

  pointer.x = 0;
  pointer.y = 0;

  raycaster.setFromCamera(pointer, controller.threeViewer.perspectiveCamera);
  let intersects = raycaster.intersectObjects(controller.threeViewer.planes.children);

  if (intersects.length) {
    let x = intersects[0].point.x * controller.threeViewer.zoomFactor + controller.threeViewer.mapCenter[0];
    let y = intersects[0].point.y * controller.threeViewer.zoomFactor + controller.threeViewer.mapCenter[1];

    controller.olViewer.map.getView().setCenter([x, y]);
    controller.threeViewer.mapCenter = [x, y];
  }

  controller.threeViewer.controls.enabled = false;

  controller.threeViewer.perspectiveCamera.position.set(0, 0, cameraZ);
  controller.threeViewer.perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
  controller.threeViewer.perspectiveCamera.rotation.z -= Math.PI / 2;

  controller.threeViewer.controls.enabled = true;

  while (visu_meshes.length > 0) {
    controller.threeViewer.scene.remove(visu_meshes.pop());
  }

  if (devices.length && visu_function)
    visu_function(devices);
  else
    addItineraireReference();

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

    while (visu_meshes.length > 0) {
      controller.threeViewer.scene.remove(visu_meshes.pop());
    }

    if (devices.length && visu_function)
      visu_function(devices);
    else
      addItineraireReference();
  }
}

/* Lorsqu'on est en 3D l'utilisateur peut déplacer la caméra avec les flèches directionnelles */
function onKeyDown(event) {
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      controller.threeViewer.translateZ = -5;
      break;
    case 'ArrowDown':
      event.preventDefault();
      controller.threeViewer.translateZ = 5;
      break;
    case 'ArrowRight':
      event.preventDefault();
      controller.threeViewer.translateX = 5;
      break;
    case 'ArrowLeft':
      event.preventDefault();
      controller.threeViewer.translateX = -5;
      break;
  }
}

function onKeyUp() {
  controller.threeViewer.translateX = 0;
  controller.threeViewer.translateZ = 0;
}

export const resetCamera = function resetCamera(dimension) {

  //const worldCoords = controller.threeViewer.getWorldCoords(vavinCenter); // the getWorldCoords function transform webmercator coordinates into three js world coordinates
  //controller.threeViewer.perspectiveCamera.position.set(worldCoords[0], worldCoords[1], cameraZ);
  controller.olViewer.map.getView().setCenter(vavinCenter);

  createDimensionEnvironment(2)

  if (dimension == 3) {
    createDimensionEnvironment(3)
  }
}

/* Ajoute les évènements du scroll et du drag lorsqu'on est en 2D */
export const addEventListeners = function addEventListeners() {
  /* On désactive l'orbit control lors du click (drag) */
  document.addEventListener("pointerup", clickUp, true);
  document.addEventListener("pointerdown", clickDown, true);
  document.addEventListener("pointermove", clickMove, true);
  /* On modifie le zoom de la map lors du zoom et on ne change pas la position de la camera contrairement au fonctionement par défault de l'orbit control */
  controller.threeViewer.controls.addEventListener('change', scroll, true);
}

/* Supprime les évènements du scroll et du drag lorsqu'on passe en 3D */
export const removeEventListeners = function removeEventListeners() {
  document.removeEventListener("pointerup", clickUp, true);
  document.removeEventListener("pointerdown", clickDown, true);
  document.removeEventListener("pointermove", clickMove, true);
  controller.threeViewer.controls.removeEventListener('change', scroll, true);
}

export const createDimensionEnvironment = function createDimensionEnvironment(dimensionNb) {

  dimension = dimensionNb;

  if (dimension == 2) {
    console.log("___dimension 2___");

    window.removeEventListener('keydown', onKeyDown, false);
    window.removeEventListener('keyup', onKeyUp, false);

    controller.threeViewer.controls.enabled = false;
    controller.threeViewer.mapCenter = controller.olViewer.map.getView().getCenter();
    controller.threeViewer.isTransitioning = [true, true];

    addEventListeners();

    controller.threeViewer.scene.remove(wall);
    controller.threeViewer.scene.remove(mesh);

    if (device && visu_function)
      visu_function(devices);
  } else {
    console.log("___dimension 3___");

    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);

    removeEventListeners();
  }
}


export const getVitesseMoyenne = async function getVitesseMoyenne(device) {
  const data = await getLiveDataDevice(device);

  let somme = 0;

  data.forEach(point => {
    somme += point.speed;
  })

  return somme / data.length;
}


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


export const addCPs = async function addCPs() {
  cps = await getControlPoints();
  // Coordinates of the 10 points
  cps.forEach(async point => {
    let worldCoords = controller.threeViewer.getWorldCoords([point[0], point[1]]); // the getWorldCoords function transform webmercator coordinates into three js world coordinates
    let geometry = new THREE.CircleGeometry(10, 32);
    let material = new THREE.MeshStandardMaterial({ color: 0xff4500 });
    let circle = new THREE.Mesh(geometry, material);
    circle.position.x = worldCoords[0];
    circle.position.y = worldCoords[1];
    circle.position.z = 0;
    controller.threeViewer.scene.add(circle);

    pdcs.push(circle);
  })
};

export const removeCPS = function removeCPS() {
  pdcs.forEach(pdc => {
    disposeThreeMesh(pdc);
  })
}

export const addTeamMarker = async function addTeamMarker(deviceNumber, timeStamp) {
  device = deviceNumber;
  time_stamp = timeStamp;
  const teamPositions = await getLiveDataDevice(deviceNumber);
  for (let i = 0; i < teamPositions.length; i++) {
    if (teamPositions[i].timestamp === time_stamp) {
      console.log(teamPositions[i].timestamp);
      // Convert the team's position from Web Mercator to world coordinates
      const worldCoords = controller.threeViewer.getWorldCoords([teamPositions[i].x, teamPositions[i].y]);
      const geometry = new THREE.SphereBufferGeometry(5, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: 0x297540 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.x = worldCoords[0];
      sphere.position.y = worldCoords[1];
      sphere.position.z = 0;
      controller.threeViewer.scene.add(sphere);
    }
  }
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

function disposeThreeMesh(mesh) {
  mesh.geometry.dispose();
  mesh.material.dispose();
  controller.threeViewer.scene.remove(mesh);
}
/*
export const addItineraire = function addItineraire(deviceNumbers) {

  devices = deviceNumbers;
  //device = devices[0]; //////temporaire
  devices.forEach(async device => {
    visu_function = addItineraire;

    const coords = await getLiveDataDevice(device);

    const material = new THREE.LineBasicMaterial({
      color: 0xff0000
    });

    const points = [];

    for (let i = 0; i < coords.length; i++) {
      points.push(new THREE.Vector3(
        controller.threeViewer.getWorldCoords([coords[i].x_GPS, coords[i].y_GPS])[0],
        controller.threeViewer.getWorldCoords([coords[i].x_GPS, coords[i].y_GPS])[1],
        0));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    let visu_mesh = new THREE.Line(geometry, material);
    visu_meshes.push(visu_mesh);

    controller.threeViewer.scene.add(visu_mesh);
  })
}

export const addItineraireEpaisseur = async function addItineraireEpaisseur(deviceNumbers) {

  devices = deviceNumbers;
  const device = devices[0];

  const trace = await getLiveDataDevice(device);

  const maxSpeed = Math.max(...trace.map(t => t.speed));

  let shape = [];
  let color = [];

  for (let i = 0; i < trace.length - 2; i++) {

    let xA = controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[0];
    let yA = controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[1];
    let xB = controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[0];
    let yB = controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[1];
    let xC = controller.threeViewer.getWorldCoords([trace[i + 2].x, trace[i + 2].y])[0];
    let yC = controller.threeViewer.getWorldCoords([trace[i + 2].x, trace[i + 2].y])[1];
    let dA = (trace[i].speed ** 2) * 1.5;
    let dB = (trace[i + 1].speed ** 2) * 1.5;
    let normAB = Math.sqrt(Math.pow(xB - xA, 2) + Math.pow(yB - yA, 2))
    let normBC = Math.sqrt(Math.pow(xB - xC, 2) + Math.pow(yB - yC, 2));

    if (normAB === 0) { continue }

    if (dB != 0) {
      shape.push(
        xA + dA * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yA - dA * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
      shape.push(
        xB + dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yB - dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
      shape.push(
        xB - dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yB + dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
      color.push(
        1 - trace[i].speed / maxSpeed, trace[i].speed / maxSpeed, 0.2)
      color.push(
        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
      color.push(
        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
    }

    if (dA != 0) {
      shape.push(
        xA + dA * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yA - dA * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
      shape.push(
        xB - dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yB + dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
      shape.push(
        xA - dA * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yA + dA * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
      color.push(
        1 - trace[i].speed / maxSpeed, trace[i].speed / maxSpeed, 0.2)
      color.push(
        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
      color.push(
        1 - trace[i].speed / maxSpeed, trace[i].speed / maxSpeed, 0.2)
    }

    if (normAB != 0 && normBC != 0 && dB != 0) {
      shape.push(xB, yB, 0);
      shape.push(
        xB - dB * Math.cos((xC - xB) / normBC) * Math.sin((yC - yB) / normBC),
        yB + dB * Math.sin((xC - xB) / normBC) * Math.cos((yC - yB) / normBC), 0)
      shape.push(
        xB - dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yB + dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
      color.push(
        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
      color.push(
        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
      color.push(
        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)

      shape.push(xB, yB, 0);
      shape.push(
        xB + dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
        yB - dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
      shape.push(
        xB + dB * Math.cos((xC - xB) / normBC) * Math.sin((yC - yB) / normBC),
        yB - dB * Math.sin((xC - xB) / normBC) * Math.cos((yC - yB) / normBC), 0)
      color.push(
        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
      color.push(
        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
      color.push(
        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
    }

  }
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(shape), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(color), 3));

  let visu_mesh = new THREE.Mesh(geometry, material);
  visu_meshes.push(visu_mesh)
  controller.threeViewer.scene.add(visu_mesh);

  visu_function = addItineraireEpaisseur;

}

function createPoints2D(data, z) {
  const points = [];

  for (let i = 0; i < data.length; i++) {
    points.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
    points.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
    points.push(z);
  }

  return points;
}

function createColors2D(speeds) {
  const colors = [];

  for (let i = 0; i < speeds.length; i++) {
    colors.push(speeds[i]);
    colors.push(1.0 - speeds[i]);
    colors.push(0.2);
  }

  return colors;
}

function createLineColor(points, colors) {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

  // create material
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
  });


  return new THREE.Line(geometry, material);
}

export const addItineraireSpeed3D = async function addItineraireSpeed3D(deviceNumbers) {

  devices = deviceNumbers;
  const device = devices[0];
  visu_function = addItineraireSpeed3D;

  const data = await getLiveDataDevice(device);

  let speeds = [];

  for (let i = 0; i < data.length; i++) {
    speeds.push(data[i].speed);
  }

  let min = Math.min(...speeds);
  let max = Math.max(...speeds);

  /* Normalisation des vitesses pour les utiliser dans les couleurs /
  for (let i = 0; i < speeds.length; i++) {
    speeds[i] = (speeds[i] - min) / (max - min);
  }

  if (dimension == 2) {
    const points = createPoints2D(data, 0);
    const colors = createColors2D(speeds);

    line3d = createLineColor(points, colors);
    line3d.computeLineDistances();

    controller.threeViewer.scene.remove(line);

    visu_meshes.push(line3d);

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
      colors.push(1 - speeds[i]);
      colors.push(speeds[i]);
      colors.push(0.2);

      colors.push(1.0);
      colors.push(0.2);
      colors.push(0.2);

      colors.push(1.0);
      colors.push(0.2);
      colors.push(0.2);

      colors.push(1.0);
      colors.push(0.2);
      colors.push(0.2);

      colors.push(1 - speeds[i + 1]);
      colors.push(speeds[i + 1]);
      colors.push(0.2);

      colors.push(1 - speeds[i]);
      colors.push(speeds[i]);
      colors.push(0.2);

      //Face 2
      colors.push(1 - speeds[i]);
      colors.push(speeds[i]);
      colors.push(0.2);

      colors.push(1.0);
      colors.push(0.2);
      colors.push(0.2);

      colors.push(1.0);
      colors.push(0.2);
      colors.push(0.2);

      colors.push(1.0);
      colors.push(0.2);
      colors.push(0.2);

      colors.push(1 - speeds[i]);
      colors.push(speeds[i]);
      colors.push(0.2);

      colors.push(1 - speeds[i + 1]);
      colors.push(speeds[i + 1]);
      colors.push(0.2);
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

    visu_meshes.push(mesh);

    controller.threeViewer.scene.add(mesh);
  }

  return [min, max];
}

async function getMoyenneDevice(devices) {
  let moyennes = [];
  let moyennesDict = {};

  for (let i = 0; i < devices.length; i++) {
    let moyenne = await getVitesseMoyenne(devices[i]);

    moyennes.push(moyenne);
    moyennesDict[moyenne] = devices[i];
  }

  return [moyennes, moyennesDict];
}

export const addItineraireSpeedWall = async function addItineraireSpeedWall(deviceNumbers) {

  controller.threeViewer.shperes.forEach(sphere => {
    disposeThreeMesh(sphere.mesh);
    disposeThreeMesh(sphere.wall);
    disposeThreeMesh(sphere.line);
  })

  let indexVisu = 0;

  visu_function = addItineraireSpeedWall;

  devices = deviceNumbers;
  let moyennes
  let moyennesDict;

  let res = await getMoyenneDevice(devices);

  moyennes = res[0];
  moyennesDict = res[1];

  const medianMoyennes = asc(moyennes)[Math.round(moyennes.length / 2)];
  const deviceMedian = moyennesDict[medianMoyennes];

  const dataMedian = await getLiveDataDevice(deviceMedian);

  let speedsDataSorted = [];

  for (let i = 0; i < dataMedian.length; i++) {
    speedsDataSorted.push(dataMedian[i].speed);
  }

  const min = Math.min(...speedsDataSorted);
  const q1 = calculerPremierQuartile(speedsDataSorted);
  const q2 = calculerMedian(speedsDataSorted);
  const q3 = calculerTroisiemeQuartile(speedsDataSorted);
  const max = Math.max(...speedsDataSorted);

  devices.forEach(async device => {

    const data = await getLiveDataDevice(device);

    let points = [];
    let pointsLine = [];
    let colors = [];
    let colorsLine = [];
    let speedsData = [];

    for (let i = 0; i < data.length; i++) {
      speedsData.push(data[i].speed);
    }

    let speeds = [];

    for (let i = 0; i < speedsData.length; i++) {
      if (speedsData[i] < q1) {
        speeds.push((speedsData[i] - min) / (4 * (q1 - min)));
      } else if (speedsData[i] < q2) {
        speeds.push((speedsData[i] - q1) / (4 * (q2 - q1)) + 0.25);
      } else if (speedsData[i] < q3) {
        speeds.push((speedsData[i] - q2) / (4 * (q3 - q2)) + 0.5);
      } else {
        speeds.push((speedsData[i] - q3) / (4 * (max - q3)) + 0.75);
      }
    }

    const wallZtop = 20 * (indexVisu + 1);
    const wallZbottom = 20 * indexVisu;

    if (dimension == 2) {
      points = createPoints2D(data, 0);
      colors = createColors2D(speeds);

      line3d = createLineColor(points, colors);
      line3d.computeLineDistances();

      controller.threeViewer.scene.remove(line);

      visu_meshes.push(line3d);

      // add line to scene so it can be rendered
      controller.threeViewer.scene.add(line3d);
    } else {
      /* On dessine les lignes qui vont séparer les différentes portion du mur /
      pointsLine = createPoints2D(data, wallZtop);
      colorsLine = createColors2D(speeds);

      line3d = createLineColor(pointsLine, colorsLine);
      line3d.computeLineDistances();

      controller.threeViewer.scene.remove(line);

      visu_meshes.push(line3d);

      // add line to scene so it can be rendered
      controller.threeViewer.scene.add(line3d);

      /* On dessine le mur /
      let geometry = new THREE.BufferGeometry();

      let vertices = [];
      let colors = [];

      for (let i = 0; i < (data.length - 1); i++) {
        //Face 1
        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
        vertices.push(wallZtop);

        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
        vertices.push(wallZbottom);

        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
        vertices.push(wallZbottom);

        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
        vertices.push(wallZbottom);

        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
        vertices.push(wallZtop);

        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
        vertices.push(wallZtop);

        // Face 2
        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
        vertices.push(wallZtop);

        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
        vertices.push(wallZbottom);

        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
        vertices.push(wallZbottom);

        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
        vertices.push(wallZbottom);

        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
        vertices.push(wallZtop);

        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
        vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
        vertices.push(wallZtop);
      }

      for (let i = 0; i < (data.length - 1); i++) {
        // Face 1
        colors.push(1.0 - speeds[i]);
        colors.push(speeds[i]);
        colors.push(0.0);

        colors.push(1.0 - speeds[i]);
        colors.push(speeds[i]);
        colors.push(0.0);

        colors.push(1.0 - speeds[i + 1]);
        colors.push(speeds[i + 1]);
        colors.push(0.0);

        colors.push(1.0 - speeds[i + 1]);
        colors.push(speeds[i + 1]);
        colors.push(0.0);

        colors.push(1.0 - speeds[i + 1]);
        colors.push(speeds[i + 1]);
        colors.push(0.0);

        colors.push(1.0 - speeds[i]);
        colors.push(speeds[i]);
        colors.push(0.0);

        //Face 2
        colors.push(1.0 - speeds[i]);
        colors.push(speeds[i]);
        colors.push(0.0);

        colors.push(1.0 - speeds[i + 1]);
        colors.push(speeds[i + 1]);
        colors.push(0.0);

        colors.push(1.0 - speeds[i + 1]);
        colors.push(speeds[i + 1]);
        colors.push(0.0);

        colors.push(1.0 - speeds[i + 1]);
        colors.push(speeds[i + 1]);
        colors.push(0.0);

        colors.push(1.0 - speeds[i]);
        colors.push(speeds[i]);
        colors.push(0.0);

        colors.push(1.0 - speeds[i + 1]);
        colors.push(speeds[i + 1]);
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

      wall = new THREE.Mesh(geometry, material);

      visu_meshes.push(wall);

      controller.threeViewer.scene.add(wall);

      /* Création des sphères pour la simulation /
      const geometrySphere = new THREE.SphereGeometry(7, 32, 16);
      const materialSphere = new THREE.MeshBasicMaterial({ color: 0x0000ff });
      const sphere = new THREE.Mesh(geometrySphere, materialSphere);

      sphere.position.x = controller.threeViewer.getWorldCoords([data[0].x, data[0].y])[0];
      sphere.position.y = controller.threeViewer.getWorldCoords([data[0].x, data[0].y])[1];
      sphere.position.z = (wallZbottom + wallZtop) / 2;

      controller.threeViewer.scene.add(sphere);

      controller.threeViewer.shperes.push({ mesh: sphere, data: data, temps: 0, indexTraj: 0, indexPoint: 1, tempsBetweenPoints: 0, wall: wall, line: line3d, running: true });
      controller.threeViewer.animeTrailer = true;
      controller.threeViewer.state.clock.start();
    }

    indexVisu++;
  })

  return [min, max];
}*/
