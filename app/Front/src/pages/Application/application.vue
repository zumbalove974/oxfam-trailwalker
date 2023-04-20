<template>
  <MenuBar pageName="Accueil" pageURL="home">></MenuBar>
  <div id="map" class="map"></div>

  <Toast position="bottom-center" />

  <Accordion @pointerover="removeEventListeners" v-on="{ pointerleave: dimension == 2 ? addEventListeners : null }"
    :activeIndex="0" class="onglet up">
    <AccordionTab header="Ajouter une ou plusieurs équipes">
      <div class="flexColumn">
        <div class="flexRow evenly upSize spaceDown">
          <span class="p-float-label">
            <InputNumber placeholder="Device ID" v-model="deviceNumber" inputId="integeronly" />
            <label for="number-input">Number</label>
          </span>

          <div class="card flex justify-content-center">
            <Button id="addTeamBtn" label="Ajouter" @click="addDevice" />
          </div>
        </div>

        <div class="flexRow evenly upSize">
          <div>
            <label for="integeronly" class="font-bold block mb-2 spaceRight"> De </label>
            <span class="p-float-label">
              <InputNumber placeholder="First device" v-model="deviceNumberFrom" inputId="integeronly" />
              <label for="number-input"></label>
            </span>
          </div>
          <div>
            <label for="integeronly" class="font-bold block mb-2 spaceRight"> à </label>
            <span class="p-float-label">
              <InputNumber placeholder="Last device" v-model="deviceNumberTo" inputId="integeronly" />
              <label for="number-input"></label>
            </span>
          </div>
        </div>
      </div>
    </AccordionTab>
    <AccordionTab header="Ajouter un marquer d'équipe à un temps donné">
      <div class="flexColumn">
        <div class="flexRow evenly upSize spaceDown">
          <InputNumber placeholder="Device ID" v-model="deviceNumber" inputId="integeronly" />
          <div class="card flex justify-content-center">
            <Button id="addTeamBtn" label="Ajouter les time stamps" @click="loadTimestamps" />
          </div>
        </div>
        <div class="flexRow evenly upSize">
          <div class="p-float-label">
            <div v-if="deviceNumber">
              <Dropdown v-if="timestamps.length > 0" v-model="selectedTimestamp" showClear editable :options="timestamps"
                :placeholder="'Choisir un timestamp'" :key="timestamps.toString()" />
              <div v-else>
                <p>Loading timestamps...</p>
                <Dropdown :options="['Loading...']" :disabled="true" />
              </div>
            </div>
            <div v-else>
              <p>Please select a device number.</p>
            </div>
          </div>
        </div>
      </div>
    </AccordionTab>
  </Accordion>

  <Accordion @pointerover="removeEventListeners" v-on="{ pointerleave: dimension == 2 ? addEventListeners : null }"
    expandIcon="pi pi-ellipsis-h" collapseIcon="pi pi-ellipsis-v" class="onglet left" :activeIndex="tabOpen">
    <AccordionTab>
      <DataTable v-model:selection="selectedProduct" @rowSelect="onRowSelect" @rowUnselect="onRowUnselect"
        @rowSelectAll="onRowSelectAll" @rowUnselectAll="onRowUnselectAll" scrollHeight="40vh" style="max-height: 80vh;"
        :resizable-columns=true :row-hover=true :scrollable=true :value="devicesTab"
        tableStyle="min-width: 10rem; max-height: 10rem;">
        <Column :selected=true v-for="col of columns" :selection-mode="col.selectionMode" :headerStyle="col.headerStyle"
          :key="col.field" :field="col.field" :header="col.header" :sortable="col.isSortable">
        </Column>
      </DataTable>
    </AccordionTab>
  </Accordion>
  <Accordion @pointerover="removeEventListeners" v-on="{ pointerleave: dimension == 2 ? addEventListeners : null }"
    expandIcon="pi pi-ellipsis-h" collapseIcon="pi pi-ellipsis-v" class="onglet right" :activeIndex="tabOpen">
    <AccordionTab>
      <div class="card flex justify-content-center">
        <div v-if="controller" class="flex flex-column gap-3">
          <div v-for="category in categories" :key="category.key" class="flex align-items-center"
            style="width:fit-content; margin-bottom: 1rem;">
            <VisuMur @data="actualiser" :toastProps="toast" :createDimensionEnvironmentProps="createDimensionEnvironment"
              :controllerProps="controller" :devicesProps="devices" :visu_functionProps="visu_function"
              :dimensionProps="dimension" :visu_meshesProps="visu_meshes" :categoryProps="category">
            </VisuMur>
          </div>
          <div v-for="category in categoriesCheckbox" :key="category.key" class="flex align-items-center"
            style="width:fit-content; margin-bottom: 1rem;">
            <Checkbox v-model="selectedCategory" :inputId="category.key" name="visualisation" :value="category.name"
              @input="category.function($event)" />
            <label :for="category.key" v-tooltip.bottom="category.detail" class="ml-2" style="margin-left: 1rem;">{{
              category.name }}</label>
          </div>
        </div>
      </div>
    </AccordionTab>
  </Accordion>

  <div @pointerover="removeEventListeners" v-on="{ pointerleave: dimension == 2 ? addEventListeners : null }">
    <div class="card" style="top: 0px; position: absolute;">
      <div :style="{ position: 'relative', height: '100vh', width: '100vw' }">
        <SpeedDial id="speedial" :model="items" :radius="80" type="semi-circle" direction="up"
          :style="{ left: 'calc(50% - 2rem)', bottom: '30px' }" />
      </div>
    </div>
  </div>

  <Fieldset v-if="isLegend" legend="Légende" class="onglet bottom-left" :toggleable="true">
    <div id="legend">
      <label id="minLegend" for="">{{ minLegend }}</label>
      <label id="maxLegend" for="">{{ maxLegend }}</label>
    </div>
  </Fieldset>

  <div id="dimensionBtnContainer" class="card flex justify-content-center p-button-lg">
    <SelectButton id="dimensionBtn" @click="changerDeDimension" v-model="dimension" :options="options" optionLabel="name"
      aria-labelledby="basic" />
  </div>
</template>


<script>

import { toRaw } from 'vue';

import { init, vavinCenter } from '../../client/index.js'
import VisuMur from './../../components/VisuMur.vue';
import { getLiveDataDevice, getControlPoints, getNoms } from "../../client/bddConnexion";
//import { tronquer } from "../../client/mathUtils";

// Primevue components
import Dropdown from 'primevue/dropdown';
import SelectButton from 'primevue/selectbutton';
import SpeedDial from 'primevue/speeddial';
import InputNumber from 'primevue/inputnumber';
import AccordionTab from 'primevue/accordiontab';
import Accordion from 'primevue/accordion';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toast from 'primevue/toast';
//import RadioButton from 'primevue/radiobutton';
import { useToast } from "primevue/usetoast";
import Fieldset from 'primevue/fieldset';
import Checkbox from 'primevue/checkbox';

// Primevue css
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

//import { preventDefault } from 'ol/events/Event';

import * as THREE from "three";

import { ZOOM_RES_L93, bounds } from "../../client/Utils";


export default {
  name: 'App',

  components: {
    Dropdown,
    SelectButton,
    SpeedDial,
    InputNumber,
    AccordionTab,
    Accordion,
    Button,
    DataTable,
    Column,
    Toast,
    Fieldset,
    Checkbox,
    VisuMur
  },
  data() {
    return {
      active: false,
      getLiveDataDevice: getLiveDataDevice,
      getNoms: getNoms,
      dimension: 2,
      depht_s: Math.tan(((45 / 2.0) * Math.PI) / 180.0) * 2.0,
      cameraZ: null,
      initPointerX: null,
      initPointerY: null,
      lastPointerX: null,
      lastPointerY: null,
      newPointerX: null,
      newPointerY: null,
      upLeft: [77759.67642890716, 6453645.108348264],
      bottomRight: [162041.48828865882, 6394327.021226578],
      zoomPas: 1,
      toast: null,
      tabOpen: 1,
      selectedTimestamp: '',
      timestamps: [],
      devices: [],
      visu_meshes: [],
      limitsMesh: null,
      teamMarkers: [],
      devicesTab: [],
      devicesName: [],
      raycaster: new THREE.Raycaster(),
      pointer: new THREE.Vector2(),
      deviceNumber: null,
      deviceNumberFrom: null,
      deviceNumberTo: null,
      visuFunction: null,
      controller: null,
      visu_function: null,
      pdcs: [],
      options: [
        { name: '2D', value: 2 },
        { name: '3D', value: 3 }
      ],
      isLegend: false,
      minLegend: null,
      maxLegend: null,
      selectedCategory: 'Production',
      categories: [
        { name: 'Trajectoire enregistrée', key: '1' },
        { name: 'Visu épaisseur', key: '2' },
        { name: 'Visu colline', key: '3' },
        { name: 'Visu Mur', key: '4' },
        { name: 'Visu Nuit', key: '5' },
        { name: 'Visu Moustache', key: '6' }
      ],
      categoriesCheckbox: [
        { name: 'Position des équipes', key: '7', function: this.displayPosEquipe },
        { name: 'Points de contrôle', key: '8', function: this.displayPDC }
      ],
      columns: [
        { selectionMode: "multiple", headerStyle: "background-color: #A855F7; max-width: 3rem", isSortable: false },
        { field: 'id', header: 'ID', headerStyle: "background-color: #A855F7; color: white", isSortable: true },
        { field: 'vitesse', header: 'Vitesse moy.', headerStyle: "background-color: #A855F7; color: white", isSortable: true }
      ],
      selectedProduct: null,
      items: [
        {
          label: 'Recentrer map',
          icon: 'pi pi-arrows-alt',
          command: () => {
            this.resetCamera(this.dimension);
          }
        },
        {
          label: 'Info',
          icon: 'pi pi-info-circle',
          command: () => {
            this.toast.add({ severity: 'success', summary: 'Info', detail: "Le premier numéro d'équipe doit être plus petit que le deuxième.", life: 2000 });
          }
        }
      ]
    }
  },
  async mounted() {
    this.toast = useToast();

    init().then(res => {
      this.controller = res;
      this.controller = toRaw(this.controller);

      this.createDimensionEnvironment(this.dimension);
      this.createBoundingLimit();
    });

    const noms = await this.getNoms();
    noms.forEach(element => {
      this.devicesName.push(this.getDeviceName(element['table_name']));
    });

    this.addItineraireReference();

    this.cameraZ = window.innerHeight / this.depht_s;

    if (this.deviceNumber) {
      await this.loadTimestamps();
    }

    // Modification du style des bouton du speed dial 
    // On y a pas accès autrement que par le DOM
    document.getElementById("speedial_0").children[0].innerHTML = "";
    document.getElementById("speedial_1").children[0].innerHTML = "";

    document.getElementById("speedial_0").children[0].style = "background-color: green";
    document.getElementById("speedial_1").children[0].style = "background-color: cyan";

  },
  methods: {
    actualiser: function (data) {
      console.log("____actualiser");
      this.visu_meshes = toRaw(data[0]);


      while (this.visu_meshes.length > 0) {
        this.controller.threeViewer.scene.remove(this.visu_meshes.pop());
      }

      if (this.devices.length && this.visu_function && data[1] != this.visu_function) {
        this.visu_function = data[1];
        this.visu_function(this.devices);
      }
      else {
        this.addItineraireReference();
      }
    },
    changerDeDimension() {
      this.dimension = this.dimension.value;
      this.createDimensionEnvironment(this.dimension);
    },
    getValuesFromDevicesTab() {
      let res = [];
      this.devicesTab.forEach(device => {
        res.push(device.id);
      })

      return res;
    },
    convertToKmH(vitesse) {
      return vitesse * 3.6
    },
    tronquer(nombre, decimal) {
      return Math.round(nombre * (10 ** decimal)) / (10 ** decimal);
    },
    async loadTimestamps() {
      try {
        console.log("Loading timestamps...");
        const liveData = await getLiveDataDevice(this.deviceNumber);
        const timestamps = liveData.map(row => row.timestamp);
        console.log("Timestamps loaded:", timestamps);
        this.timestamps = timestamps;
        console.log('console.log(this.timestamps):', this.timestamps)
      } catch (error) {
        console.error(error);
      }
    },
    addTeamMarkerPoint() {
      this.addTeamMarker(this.deviceNumber, this.selectedTimestamp)
    },
    async addDevice() {
      if (this.deviceNumber || (this.deviceNumberFrom && this.deviceNumberTo)) {
        if (this.deviceNumber) {
          const ids = this.getValuesFromDevicesTab();
          console.log("__noms", this.devicesName);
          if (!ids.includes(this.deviceNumber) && toRaw(this.devicesName).includes(this.deviceNumber.toString())) {
            const moyenne = await this.getVitesseMoyenne(this.deviceNumber);
            this.devicesTab.push({ id: this.deviceNumber, vitesse: this.tronquer(this.convertToKmH(moyenne), 2) });
            this.tabOpen = 0;
          }
        }

        if (this.deviceNumberFrom && this.deviceNumberTo) {
          if (this.deviceNumberFrom < this.deviceNumberTo) {
            for (let i = this.deviceNumberFrom; i <= this.deviceNumberTo; i++) {
              const ids = this.getValuesFromDevicesTab();
              if (!ids.includes(i) && toRaw(this.devicesName).includes(i.toString())) {
                const moyenne = await this.getVitesseMoyenne(i);
                this.devicesTab.push({ id: i, vitesse: this.tronquer(this.convertToKmH(moyenne), 2) });
                this.tabOpen = 0;
              }
            }
          } else {
            this.toast.add({ severity: 'warn', summary: 'Attention', detail: "Le premier numéro d'équipe doit être plus petit que le deuxième.", life: 2000 });
          }
        }
      } else {
        this.toast.add({ severity: 'warn', summary: 'Attention', detail: "Vous n'avez rien écris", life: 2000 });
      }
    },
    onRowSelect(event) {
      this.devices.push(event.data.id);
      if (this.visuFunction)
        this.visuFunction();
    },
    onRowUnselect(event) {
      this.devices = this.devices.filter(function (item) {
        return item !== event.data.id;
      })
      if (this.visuFunction)
        this.visuFunction();
    },
    onRowSelectAll(event) {
      event.data.forEach(device => {
        this.devices.push(device.id);
      })

      if (this.visuFunction)
        this.visuFunction();
    },
    onRowUnselectAll() {
      this.devices = [];

      if (this.visuFunction)
        this.visuFunction();
    },
    getDeviceName(tableName) {
      return tableName.split('_')[1];
    },
    displayPDC(input) {
      this.toast.removeAllGroups();
      this.removeCPS();

      if (input[input.length - 1] == "Points de contrôle") {
        this.addCPs();
        this.toast.add({ severity: 'info', summary: 'Info', detail: "Ajoute les points de contrôle du parcours.", life: 10000 });
      }
    },
    displayPosEquipe(input) {
      this.toast.removeAllGroups();
      this.removeTeamMarkers();

      if (input[input.length - 1] == "Position des équipes") {
        this.toast.add({ severity: 'info', summary: 'Info', detail: "Ajoute la position d'une équipe à un temp donné.", life: 10000 });
        this.addTeamMarker(this.deviceNumber, this.selectedTimestamp);
      }
    },
    createBoundingLimit() {

      let points = [];

      console.log("lll", this.controller.threeViewer.zoomFactor);
      this.upLeft = bounds[this.controller.threeViewer.zoomFactor][0];
      this.bottomRight = bounds[this.controller.threeViewer.zoomFactor][1];

      points.push(new THREE.Vector3(
        this.controller.threeViewer.getWorldCoords(this.upLeft)[0],
        this.controller.threeViewer.getWorldCoords(this.upLeft)[1],
        0)
      );

      points.push(new THREE.Vector3(
        this.controller.threeViewer.getWorldCoords(this.bottomRight)[0],
        this.controller.threeViewer.getWorldCoords(this.upLeft)[1],
        0)
      );

      points.push(new THREE.Vector3(
        this.controller.threeViewer.getWorldCoords(this.bottomRight)[0],
        this.controller.threeViewer.getWorldCoords(this.bottomRight)[1],
        0)
      );

      points.push(new THREE.Vector3(
        this.controller.threeViewer.getWorldCoords(this.upLeft)[0],
        this.controller.threeViewer.getWorldCoords(this.bottomRight)[1],
        0)
      );

      points.push(new THREE.Vector3(
        this.controller.threeViewer.getWorldCoords(this.upLeft)[0],
        this.controller.threeViewer.getWorldCoords(this.upLeft)[1],
        0)
      );

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: 0xff0000
      });

      this.limitsMesh = new THREE.Line(geometry, material);

      this.controller.threeViewer.scene.add(this.limitsMesh);

      console.log("this.limitsMesh", this.limitsMesh)
      this.visu_meshes.push(this.limitsMesh);
    },
    verifyView(center) {

      let x = center[0];
      let y = center[1];

      if (x < this.upLeft[0]) {
        x = this.upLeft[0];
      } else if (x > this.bottomRight[0]) {
        x = this.bottomRight[0];
      }

      if (y < this.bottomRight[1]) {
        y = this.bottomRight[1];
      } else if (y > this.upLeft[1]) {
        y = this.upLeft[1];
      }

      return [x, y];
    },
    clickUp() {
      this.controller.threeViewer.controls.enabled = true;
      this.pointerIsDown = false;

      this.pointer.x = 0;
      this.pointer.y = 0;

      this.raycaster.setFromCamera(this.pointer, this.controller.threeViewer.perspectiveCamera);
      let intersects = this.raycaster.intersectObjects(this.controller.threeViewer.planes.children);

      if (intersects.length) {
        let x = intersects[0].point.x * this.controller.threeViewer.zoomFactor + this.controller.threeViewer.mapCenter[0];
        let y = intersects[0].point.y * this.controller.threeViewer.zoomFactor + this.controller.threeViewer.mapCenter[1];

        let verifiedCoords = this.verifyView([x, y]);
        this.controller.olViewer.map.getView().setCenter(verifiedCoords);
        this.controller.threeViewer.mapCenter = verifiedCoords;
      }

      this.controller.threeViewer.controls.enabled = false;

      this.controller.threeViewer.perspectiveCamera.position.set(0, 0, this.cameraZ);
      this.controller.threeViewer.perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
      this.controller.threeViewer.perspectiveCamera.rotation.z -= Math.PI / 2;

      this.controller.threeViewer.controls.enabled = true;

      while (this.visu_meshes.length > 0) {
        this.controller.threeViewer.scene.remove(this.visu_meshes.pop());
      }

      if (this.devices.length && this.visu_function) {
        this.visu_function(this.devices);
      }
      else
        this.addItineraireReference();

      if (toRaw(this.teamMarkers).length > 0) {
        this.removeTeamMarkers();
        this.addTeamMarker(this.deviceNumber, this.selectedTimestamp);
      }

      if (toRaw(this.pdcs).length > 0) {
        this.removeCPS();
        this.addCPs();
      }

      this.createBoundingLimit();
    },
    clickDown(event) {
      this.controller.threeViewer.controls.enabled = false;
      this.pointerIsDown = true;

      this.initPointerX = event.clientX;
      this.initPointerY = event.clientY;

      this.lastPointerX = event.clientX;
      this.lastPointerY = event.clientY;
    },
    clickMove(event) {
      if (this.pointerIsDown) {
        this.newPointerX = event.clientX;
        this.newPointerY = event.clientY;

        this.controller.threeViewer.perspectiveCamera.position.x += (this.lastPointerX - this.newPointerX);
        this.controller.threeViewer.perspectiveCamera.position.y += (this.newPointerY - this.lastPointerY);

        this.lastPointerX = this.newPointerX;
        this.lastPointerY = this.newPointerY;
      }
    },
    scroll() {

      const changeZ = this.controller.threeViewer.perspectiveCamera.position.z;

      let zoom = this.controller.olViewer.map.getView().getZoom();

      if (changeZ != this.cameraZ) {
        if (changeZ < this.cameraZ) {
          zoom += this.zoomPas;
        } else if (changeZ > this.cameraZ) {
          zoom -= this.zoomPas;
        }

        this.controller.olViewer.map.getView().setZoom(Math.round(zoom));
        this.controller.threeViewer.perspectiveCamera.position.z = this.cameraZ;
        this.controller.threeViewer.zoomFactor = ZOOM_RES_L93[Math.round(zoom)];

        while (this.visu_meshes.length > 0) {
          this.controller.threeViewer.scene.remove(this.visu_meshes.pop());
        }

        if (this.devices.length && this.visu_function)
          this.visu_function(this.devices);
        else
          this.addItineraireReference();
      }

      if (toRaw(this.teamMarkers).length > 0) {
        this.removeTeamMarkers();
        this.addTeamMarker(this.deviceNumber, this.selectedTimestamp);
      }

      if (toRaw(this.pdcs).length > 0) {
        this.removeCPS();
        this.addCPs();
      }

      this.createBoundingLimit();
    },
    /* Lorsqu'on est en 3D l'utilisateur peut déplacer la caméra avec les flèches directionnelles */
    onKeyDown(event) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.controller.threeViewer.translateZ = -5;
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.controller.threeViewer.translateZ = 5;
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.controller.threeViewer.translateX = 5;
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.controller.threeViewer.translateX = -5;
          break;
      }
    },
    onKeyUp() {
      this.controller.threeViewer.translateX = 0;
      this.controller.threeViewer.translateZ = 0;
    },
    resetCamera(dimension) {

      //const worldCoords = controller.threeViewer.getWorldCoords(vavinCenter); // the getWorldCoords function transform webmercator coordinates into three js world coordinates
      //controller.threeViewer.perspectiveCamera.position.set(worldCoords[0], worldCoords[1], cameraZ);
      this.controller.olViewer.map.getView().setCenter(vavinCenter);

      this.createDimensionEnvironment(2)

      if (dimension == 3) {
        this.createDimensionEnvironment(3)
      }
    },
    /* Ajoute les évènements du scroll et du drag lorsqu'on est en 2D */
    addEventListeners() {
      /* On désactive l'orbit control lors du click (drag) */
      document.addEventListener("pointerup", this.clickUp, true);
      document.addEventListener("pointerdown", this.clickDown, true);
      document.addEventListener("pointermove", this.clickMove, true);
      /* On modifie le zoom de la map lors du zoom et on ne change pas la position de la camera contrairement au fonctionement par défault de l'orbit control */
      this.controller.threeViewer.controls.addEventListener('change', this.scroll, true);
    },
    /* Supprime les évènements du scroll et du drag lorsqu'on passe en 3D */
    removeEventListeners() {
      document.removeEventListener("pointerup", this.clickUp, true);
      document.removeEventListener("pointerdown", this.clickDown, true);
      document.removeEventListener("pointermove", this.clickMove, true);
      this.controller.threeViewer.controls.removeEventListener('change', this.scroll, true);
    },
    createDimensionEnvironment(dimensionNb) {

      this.dimension = dimensionNb;

      if (this.dimension == 2) {
        console.log("___dimension 2___");

        window.removeEventListener('keydown', this.onKeyDown, false);
        window.removeEventListener('keyup', this.onKeyUp, false);

        this.controller.threeViewer.controls.enabled = false;

        if (Object.keys(this.controller).length == 12)
          this.controller.threeViewer.mapCenter = this.controller.olViewer.map.getView().getCenter();

        this.controller.threeViewer.isTransitioning = [true, true];

        this.addEventListeners();

        //this.controller.threeViewer.scene.remove(wall);
        //this.controller.threeViewer.scene.remove(mesh);

        if (this.device && this.visu_function)
          this.visu_function(this.devices);
      } else {
        console.log("___dimension 3___");

        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('keyup', this.onKeyUp, false);

        this.removeEventListeners();
      }
    },
    async getVitesseMoyenne(device) {
      const data = await getLiveDataDevice(device);

      let somme = 0;

      data.forEach(point => {
        somme += point.speed;
      })

      return somme / data.length;
    },
    async addItineraireReference() {

      const coords = await getLiveDataDevice(3843);

      const GPSmaterial = new THREE.LineBasicMaterial({
        color: 0xff0000
      });

      const GPSpoints = [];

      for (let i = 0; i < coords.length; i++) {

        GPSpoints.push(new THREE.Vector3(
          this.controller.threeViewer.getWorldCoords([coords[i].x, coords[i].y])[0],
          this.controller.threeViewer.getWorldCoords([coords[i].x, coords[i].y])[1],
          0));
      }

      //console.log("GPSpoints", GPSpoints)

      const GPSgeometry = new THREE.BufferGeometry().setFromPoints(GPSpoints);

      let GPSvisu_mesh = new THREE.Line(GPSgeometry, GPSmaterial);
      this.visu_meshes.push(GPSvisu_mesh);

      this.controller.threeViewer.scene.add(GPSvisu_mesh);
    },
    async addCPs() {
      let cps = await getControlPoints();

      // Coordinates of the 10 points
      cps.forEach(point => {
        let worldCoords = toRaw(this.controller).threeViewer.getWorldCoords([point.x, point.y]); // the getWorldCoords function transform webmercator coordinates into three js world coordinates
        let geometry = new THREE.CylinderGeometry(10, 10, 70, 70);
        let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        let circle = new THREE.Mesh(geometry, material);
        circle.position.x = worldCoords[0];
        circle.position.y = worldCoords[1];
        circle.position.z = 35;
        circle.rotation.x = Math.PI / 2;
        this.controller.threeViewer.scene.add(circle);
        console.log("eee2", point)


        this.pdcs.push(circle);
      })
    },
    disposeThreeMesh(mesh) {
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.controller.threeViewer.scene.remove(mesh);
    },
    removeCPS() {
      this.pdcs.forEach(pdc => {
        this.disposeThreeMesh(pdc);
      });

      this.pdcs = [];
    },
    removeTeamMarkers() {
      this.teamMarkers.forEach(teamMarker => {
        this.disposeThreeMesh(teamMarker);
      });

      this.teamMarkers = [];
    },
    async addTeamMarker(deviceNumber, timeStamp) {
      this.device = deviceNumber;
      this.time_stamp = timeStamp;
      const teamPositions = await getLiveDataDevice(deviceNumber);

      for (let i = 0; i < teamPositions.length; i++) {
        if (teamPositions[i].timestamp === this.time_stamp) {
          // Convert the team's position from Web Mercator to world coordinates
          const worldCoords = this.controller.threeViewer.getWorldCoords([teamPositions[i].x, teamPositions[i].y]);
          const geometry = new THREE.SphereBufferGeometry(5, 32, 32);
          const material = new THREE.MeshStandardMaterial({ color: 0x297540 });
          const sphere = new THREE.Mesh(geometry, material);
          sphere.position.x = worldCoords[0];
          sphere.position.y = worldCoords[1];
          sphere.position.z = 0;
          this.controller.threeViewer.scene.add(sphere);

          this.teamMarkers.push(sphere);
        }
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  top: 200px;
}

#map {
  z-index: 1;
}

body {
  font-family: (--font-family);
  margin: 0;
}

.flexRow {
  display: flex;
  flex-direction: row;
}

.flexColumn {
  display: flex;
  flex-direction: column;
}

.borderOnglet {
  padding: 50px;
  border: 2px solid green;
}

.onglet {
  position: absolute;
  z-index: 2;
}

.up {
  top: 30px;
  left: 50%;
  transform: translate(-50%);
  width: 350px;
}

.right {
  right: 30px;
  top: 30px;
}

.left {
  left: 30px;
  top: 30px;
}

.bottom-left {
  left: 30px;
  bottom: 30px;
  width: fit-content;
  max-height: 40vw;
}

#dimensionBtnContainer {
  position: absolute;
  z-index: 2;
  bottom: 50px;
  right: 50px;
}

#dimensionBtn>.p-button.p-component:focus {
  background-color: #A855F7 !important;
}

.font-bold {
  font-weight: bold;
  font-size: larger;
}

#integeronly {
  width: 100px;
  height: 45px
}

.p-accordion-content {
  display: flex;
  justify-content: space-evenly;
}

.evenly {
  justify-content: space-evenly;
  align-items: center;
}

.upSize {
  width: 350px;
}

.spaceUp {
  margin-top: 20px;
}

.spaceDown {
  margin-bottom: 20px;
}

.spaceRight {
  margin-right: 10px;
}

#addTeamBtn {
  background-color: #A855F7;
}

.p-button.p-component.p-highlight {
  background-color: #A855F7 !important;
}

#resetCameraBtn {
  position: absolute;
  z-index: 2;
  bottom: 50px;
  left: 50px;
}

#legend {
  width: 200px;
  height: 30px;
  border: 1px solid black;
  background: linear-gradient(90deg, rgb(0, 255, 51), rgb(255, 0, 51));
  text-align: start;
}

#minLegend {
  position: absolute;
  transform: translate(-5px, -20px);
}

#maxLegend {
  position: absolute;
  transform: translate(185px, -20px);
}
</style>
