<template>
  <MenuBar pageName="Accueil" pageURL="home">></MenuBar>
  <div id="map" class="map"></div>

  <Toast position="bottom-center" />

  <Accordion :style="[helpIndex === 0 ? { 'border': borderStyle } : { 'border': '' }]" @pointerover="removeEventListeners"
    v-on="{ pointerleave: dimension == 2 ? addEventListeners : null }" :activeIndex="accordionIndex" class="onglet up">
    <AccordionTab header="Ajouter une ou plusieurs équipes">
      <div class="flexColumn">
        <div class="flexRow evenly upSize spaceDown">
          <span class="p-float-label">
            <InputNumber placeholder="Device ID" v-model="deviceNumber" inputId="integeronly" />
            <label for="number-input">Number</label>
          </span>

          <div class="card flex justify-content-center">
            <Button id="addTeamBtn" label="Ajouter" @click="addDevice"></Button>
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
        <div class="flexRow evenly upSize spaceDown"
          :style="[helpIndex === 1 ? { 'border': borderStyle } : { 'border': '' }]">
          <InputNumber placeholder="Device ID" v-model="deviceNumber" inputId="integeronly" />
          <div class="card flex justify-content-center">
            <Button id="addTeamBtn" label="Ajouter les time stamps" @click="loadTimestamps"></Button>
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

  <Accordion :style="[helpIndex === 2 ? { 'border': borderStyle } : { 'border': '' }]" @pointerover="removeEventListeners"
    v-on="{ pointerleave: dimension == 2 ? addEventListeners : null }" expandIcon="pi pi-ellipsis-h"
    collapseIcon="pi pi-ellipsis-v" class="onglet left" :activeIndex="tabOpen">
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

  <Accordion :style="[helpIndex === 3 ? { 'border': borderStyle } : { 'border': '' }]" @pointerover="removeEventListeners"
    v-on="{ pointerleave: dimension == 2 ? addEventListeners : null }" expandIcon="pi pi-ellipsis-h"
    collapseIcon="pi pi-ellipsis-v" class="onglet right" :activeIndex="tabOpen">
    <AccordionTab>
      <div class="card flex justify-content-center">
        <div v-if="controller" class="flex flex-column gap-3">
          <div v-for="category in categories" :key="category.key" class="flex align-items-center"
            style="width:fit-content; margin-bottom: 1rem;">
            <VisuMur @data="actualiser" @legend="actualiserLegend" :toastProps="toast"
              :createDimensionEnvironmentProps="createDimensionEnvironment" :controllerProps="controller"
              :devicesProps="devices" :visu_functionProps="visu_function" :dimensionProps="dimension"
              :visu_meshesProps="visu_meshes" :categoryProps="category">
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

  <div @pointerover="removeEventListeners" v-on="{ pointerleave: dimension == 2 ? addEventListeners : null }">
    <Dialog v-model:visible="helpVisible" :style="{ width: '50vw' }" :position="'bottom'">
      <p>
        {{ textHelp[helpIndex] }}
      </p>
      <template #footer>
        <Button :label="btnTextHelp" icon="pi pi-angle-double-right" @click="nextHelp" autofocus />
      </template>
    </Dialog>
  </div>

  <Fieldset v-if="isLegend" legend="Légende" class="onglet bottom-left" :toggleable="true">
    <div id="legend" :style="{ background: rgbLegend }">
      <label v-for="legend in legends" :key="legend.value" for=""
        :style="{ position: 'absolute', transform: legend.decalage }">{{ legend.value }}</label>
    </div>
  </Fieldset>

  <div :style="[helpIndex === 4 ? { 'border': borderStyle } : { 'border': '' }]" id="dimensionBtnContainer"
    class="card flex justify-content-center p-button-lg">
    <SelectButton id="dimensionBtn" @click="changerDeDimension" v-model="dimension" :options="options" optionLabel="name"
      aria-labelledby="basic" />
  </div>
</template>


<script>

import { toRaw } from 'vue';

import { init, vavinCenter } from '../../client/index.js'
import VisuMur from './../../components/VisuMur.vue';
import { getLiveDataDevice, getControlPoints, getNoms } from "../../client/bddConnexion";

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
import Dialog from 'primevue/dialog';
import { useToast } from "primevue/usetoast";
import Fieldset from 'primevue/fieldset';
import Checkbox from 'primevue/checkbox';

// Primevue css
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";


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
    VisuMur,
    Dialog
  },
  data() {
    return {
      active: false,
      accordionIndex: 0,
      // help section
      helpVisible: false,
      helpIndex: -1,
      textHelp: [
        "Cet onglet permet d'ajouter de nouvelles équipes avec leur ID. Vous pouvez ajouter une équipe individuellement (zone de texte du haut) et/ou ajouter plusieurs équipes en même temps (zone de texte du bas).",
        "Cet onglet permet d'afficher la position d'une équipe a un temps donné.",
        "Cet onglet recense les équipes sélectionnés pour chaque visualisation. Lorsque vous ajoutez des équipes elles appraissent dans cet onglet et vous pouvez ensuite les sélectionner pour les intégrer dans les visualisations.",
        "Cet onglet permet d'afficher les différentes visualisations. Certaines visualisations nécessite une équipe, d'autres plusieurs, vous aurez plus d'informations en cliquant dessus.",
        "Ce bouton permet de passer de la 2D à la 3D et vice versa."
      ],
      btnTextHelp: "Suivant",
      borderStyle: 'dashed 3px blueviolet',
      accordionStyle: "",
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
      toast: useToast(),
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
      legends: [],
      rgbMinLegend: '',
      rgbMaxLegend: '',
      rgbLegend: '',
      selectedCategory: 'Production',
      categories: [
        { name: 'Trajectoire enregistrée', key: '1' },
        { name: 'Visu épaisseur', key: '2' },
        { name: 'Visu colline', key: '3' },
        { name: 'Visu Mur', key: '4' },
        { name: 'Visu Nuit', key: '5' },
        { name: 'Visu Moustache', key: '6' },
        { name: 'Visu Difficulte', key: '9' }
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
            this.helpVisible = true;
            this.helpIndex = 0;
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

      document.addEventListener("pointerup", this.rightClickUp, true);
      document.addEventListener("contextmenu", (e) => { e.preventDefault(); return false; })
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
    //document.getElementById("speedial_0").children[0].innerHTML = "";
    //document.getElementById("speedial_1").children[0].innerHTML = "";

    document.getElementById("speedial_0").children[0].style = "background-color: green";
    document.getElementById("speedial_1").children[0].style = "background-color: cyan";

  },
  methods: {
    /**
     * Met à jour l'affichage de la vue en retirant les maillages existants 
     * et en affichant les nouveaux maillages en utilisant la fonction de visualisation 
     * @param {*} data tableau contenant deux éléments :
     **** data[0] : une liste de maillages à visualiser
     **** data[1] : une fonction qui prend en paramètre une liste de devices et qui est supposée afficher les maillages.
     */
    actualiser: function (data) {
      this.visu_meshes = toRaw(data[0]);

      while (this.visu_meshes.length > 0) {
        this.controller.threeViewer.scene.remove(this.visu_meshes.pop());
      }

      console.log("oooooooooooooo", data[1] != this.visu_function)

      if (data[1] && (data[1] != this.visu_function)) {
        this.visu_function = data[1];
        this.visu_function(this.devices);
      }
      else {
        this.addItineraireReference();
      }
    },
    actualiserLegend: function (legend) {
      this.legends = [];
      let index = 0;
      legend[0].forEach(nombre => {
        toRaw(this.legends).push({ value: nombre, decalage: 'translate(' + (200 / (legend[0].length - 1) * index - 5).toString() + 'px , -20px)' });
        index++;
      });

      this.rgbLegend = 'linear-gradient(90deg, ';
      legend[1].forEach(couleur => {
        this.rgbLegend += couleur + ','
      });
      this.rgbLegend = this.rgbLegend.substring(0, this.rgbLegend.length - 1) + ')';
      console.log("----", this.rgbLegend);
      this.isLegend = true;
    },
    /**
     * Cette méthode est appelée lorsque l'utilisateur souhaite changer de dimension. 
     * Elle met à jour la variable de dimension
     * puis crée l'environnement de la nouvelle dimension.
     */
    changerDeDimension() {
      this.dimension = this.dimension.value;
      this.createDimensionEnvironment(this.dimension);
    },
    nextHelp() {
      this.helpIndex++;

      switch (this.helpIndex) {
        case 1:
          this.accordionIndex = 1;
          break;
        case 2:
          this.tabOpen = 0;
          break;
        case this.textHelp.length - 1:
          this.btnTextHelp = "Fermer";
          break;
        case this.helpIndex == this.textHelp.length:
          this.helpIndex = -1;
          this.btnTextHelp = "Suivant";
          this.accordionStyle = "";
          this.helpVisible = false;
          break;
      }

    },
    /**
     * Obtient une liste des identifiants des périphériques 
     * à partir du tableau de périphériques sélectionnés
     * @returns {Array} Liste des identifiants de périphériques sélectionnés
     */
    getValuesFromDevicesTab() {
      let res = [];
      this.devicesTab.forEach(device => {
        res.push(device.id);
      })

      return res;
    },
    /**
     * convertit une vitesse de m/s en km/h
     * @param {*} vitesse en m/s 
     * @returns vitesse en km/h
     */
    convertToKmH(vitesse) {
      return vitesse * 3.6
    },
    /**
     * Tronque un nombre en précisant le nombre de décimales à conserver.
     * @param {*} nombre Le nombre à tronquer.
     * @param {*} decimal Le nombre de décimales à conserver.
     * @returns Le nombre tronqué.
     */
    tronquer(nombre, decimal) {
      return Math.round(nombre * (10 ** decimal)) / (10 ** decimal);
    },
    /**
     *  Permet de charger les timestamps des données en temps réel d'un périphérique spécifié par deviceNumber
     */
    async loadTimestamps() {
      try {
        const liveData = await getLiveDataDevice(this.deviceNumber);
        const timestamps = liveData.map(row => row.timestamp);
        this.timestamps = timestamps;
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * Cette fonction ajoute un marqueur à la carte représentant la position de l'appareil au moment sélectionnée. 
     */
    addTeamMarkerPoint() {
      this.addTeamMarker(this.deviceNumber, this.selectedTimestamp)
    },
    /**
     * Cette fonction ajoute un appareil à la liste des appareils en fonction des données fournies par l'utilisateur.
     */
    async addDevice() {
      if (this.deviceNumber || (this.deviceNumberFrom && this.deviceNumberTo)) {
        if (this.deviceNumber) {
          const ids = this.getValuesFromDevicesTab();
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
    /**
     * Cette fonction est appelée lorsqu'une ligne de la table des appareils est sélectionnée.
     * Elle ajoute l'ID de l'appareil sélectionné à la liste des appareils à afficher.
     * Si une fonction de visualisation est définie, elle l'appelle.
     * @param {*} event  L'événement de sélection de de ligne.
     */
    onRowSelect(event) {
      this.devices.push(event.data.id);
      if (this.visuFunction)
        this.visuFunction();
    },
    /**
     * Gère l'événement de déselection d'une ligne dans un tableau.
     * Supprime l'identifiant de l'équipe correspondant à la ligne déselectionnée de la liste des équipes sélectionnées.
     * Si une fonction de visualisation est définie, elle est appelée.
     * @param {*} event L'événement de déselection de ligne.
     */
    onRowUnselect(event) {
      this.devices = this.devices.filter(function (item) {
        return item !== event.data.id;
      })
      if (this.visuFunction)
        this.visuFunction();
    },
    /**
     * Ajoute toutes les équipes sélectionnées à la liste des équipes à afficher
     * @param {*} event L'événement de sélection de toutes les lignes.
     */
    onRowSelectAll(event) {
      event.data.forEach(device => {
        this.devices.push(device.id);
      })

      if (this.visuFunction)
        this.visuFunction();
    },
    /**
     * Gère l'événement de déselection de toutes les lignes
     */
    onRowUnselectAll() {
      this.devices = [];

      if (this.visuFunction)
        this.visuFunction();
    },
    /**
     * Obtient le nom du dispositif à partir du nom de la table.
     * @param {*} tableName  Le nom de la table contenant les données du dispositif.
     */
    getDeviceName(tableName) {
      return tableName.split('_')[1];
    },
    /**
     * Affiche les points de contrôle du parcours si l'input se termine par "Points de contrôle".
     * Supprime tous les messages de toast en groupe avant d'afficher le nouveau message.
     * Supprime également les marqueurs de course de l'équipe.
     * Le nom de l'input sélectionné.
     * @param {*} input 
     */
    displayPDC(input) {
      this.toast.removeAllGroups();
      this.removeCPS();

      if (input[input.length - 1] == "Points de contrôle") {
        this.addCPs();
        this.toast.add({ severity: 'info', summary: 'Info', detail: "Ajoute les points de contrôle du parcours.", life: 3000 });
      }
    },
    /**
     * Affiche la position de l'équipe sélectionnée à un temps donné.
     * @param {*} input L'input du composant d'entrée de commande.
     */
    displayPosEquipe(input) {
      this.toast.removeAllGroups();
      this.removeTeamMarkers();

      if (input[input.length - 1] == "Position des équipes") {
        this.toast.add({ severity: 'info', summary: 'Info', detail: "Ajoute la position d'une équipe à un temp donné.", life: 3000 });
        this.addTeamMarker(this.deviceNumber, this.selectedTimestamp);
      }
    },
    /**
     * Cette fonction crée un contour de limite en se basant sur les limites de zoom de la vue 3D.
     * Elle récupère les coordonnées des points supérieurs gauche et inférieurs droits, puis les convertit en coordonnées du monde 3D.
     * En utilisant ces coordonnées, elle crée un mesh en forme de rectangle qui sera affiché sur la vue 3D.
     * Ce mesh est ajouté à la scène de la vue 3D et stocké dans le tableau des meshes visuels pour pouvoir le supprimer ultérieurement.
     */
    createBoundingLimit() {

      let points = [];

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

      this.visu_meshes.push(this.limitsMesh);
    },
    /**
     * Vérifie si la vue est valide pour les limites de la carte.
     * @param {*} center Les coordonnées du centre de la vue.
     * @returns un tableau contenant les coordonnées du centre de la vue ajustées si elles sont en dehors des limites de la carte.
     */
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
    /**
     * Méthode appelée lors du clic sur le bouton de la souris en 2D.
     * Active le contrôle de la caméra, vérifie l'intersection avec le sol,
     * met à jour la position de la caméra et des coordonnées,
     * et lance la fonction de visualisation si des dispositifs sont présents.
     * Ajoute également des marqueurs d'équipe et des checkpoints si présents.
     */
    clickUp2D(event) {
      if (event.button === 0) {
        this.controller.threeViewer.controls.enabled = true;
        this.pointerIsDown = false;

        // Decallage de la carte en 2D
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

        // Mise a jour des objects Three.js

        while (this.visu_meshes.length > 0) {
          this.controller.threeViewer.scene.remove(this.visu_meshes.pop());
        }
        if (this.visu_function) {
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
      }
    },
    /**
     * Méthode appelée lors du clic sur le bouton droit de la souris.
     * N'agit que sur la visualisation Difficulte
     * @param {*} event L'evenement de clic de souris
     */
    rightClickUp(event) {
      if (event.button === 2) {
        let mouse = {
          x: (event.clientX / window.innerWidth) * 2 - 1,
          y: -(event.clientY / window.innerHeight) * 2 + 1
        }

        this.raycaster.setFromCamera(mouse, this.controller.threeViewer.perspectiveCamera);
        let intersected_traj_part = this.raycaster.intersectObjects(this.controller.threeViewer.traj_parts.children);

        // Mise a jour de la visu Difficulte
        intersected_traj_part.forEach(intersection => {
          this.changeDiffPart(intersection.object)
        })
      }
    },
    /**
     * Gère l'événement de clic de souris enfoncée.
     * @param {*} event L'événement de clic de souris.
     */
    clickDown(event) {
      this.controller.threeViewer.controls.enabled = false;
      this.pointerIsDown = true;

      this.initPointerX = event.clientX;
      this.initPointerY = event.clientY;

      this.lastPointerX = event.clientX;
      this.lastPointerY = event.clientY;
    },
    /**
     * Déplace la vue de la caméra en fonction du déplacement de la souris lors d'un clic.
     * @param {*} event L'événement de clic de la souris.
     */
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
    /**
     * La fonction met à jour le niveau de zoom de la carte OpenLayers en fonction de la position de la caméra Three.js, et met à jour le facteur de zoom Three.js.
     * La fonction supprime également les marqueurs d'équipe et les points de contrôle précédemment affichés sur la carte, puis ajoute les nouveaux marqueurs d'équipe et points de contrôle. 
     * La fonction crée une limite de zone de visualisation pour la carte.
     */
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

        if (this.visu_function)
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
    /**
     * Cette fonction est appelée à chaque fois qu'une touche est enfoncée dans la zone de rendu 3D.
     * Elle permet de déplacer la caméra de visualisation en fonction de la touche pressée.
     * @param {*} event L'événement du clavier qui a déclenché cette fonction.
     */
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
    /**
     * Cette fonction est appelée lorsque l'utilisateur lâche une touche du clavier.
     * Elle réinitialise les translations horizontales et verticales de la caméra Three.js à zéro.
     */
    onKeyUp() {
      this.controller.threeViewer.translateX = 0;
      this.controller.threeViewer.translateZ = 0;
    },
    /**
     * Réinitialise la caméra en recentrant la vue sur le centre de Vavin et en créant un environnement en 2 dimensions.
     * @param {*} dimension  La dimension de l'environnement à créer (2 ou 3).
     */
    resetCamera(dimension) {
      this.controller.olViewer.map.getView().setCenter(vavinCenter);

      while (this.visu_meshes.length > 0) {
        this.controller.threeViewer.scene.remove(this.visu_meshes.pop());
      }

      if (this.visu_function) {
        this.visu_function(this.devices);
      }
      else
        this.addItineraireReference();

      this.createDimensionEnvironment(2)
      if (dimension == 3) {
        this.createDimensionEnvironment(3);
      }
    },
    /* Ajoute les évènements du scroll et du drag lorsqu'on est en 2D */
    addEventListeners() {
      /* On désactive l'orbit control lors du click (drag) */
      document.addEventListener("pointerup", this.clickUp2D, true);
      document.addEventListener("pointerdown", this.clickDown, true);
      document.addEventListener("pointermove", this.clickMove, true);
      /* On modifie le zoom de la map lors du zoom et on ne change pas la position de la camera contrairement au fonctionement par défault de l'orbit control */
      this.controller.threeViewer.controls.addEventListener('change', this.scroll, true);
    },
    /* Supprime les évènements du scroll et du drag lorsqu'on passe en 3D */
    removeEventListeners() {
      document.removeEventListener("pointerup", this.clickUp2D, true);
      document.removeEventListener("pointerdown", this.clickDown, true);
      document.removeEventListener("pointermove", this.clickMove, true);
      this.controller.threeViewer.controls.removeEventListener('change', this.scroll, true);
    },
    /**
     * Cette méthode permet de créer un environnement de dimension spécifiée.
     * @param {*} dimensionNb le nombre de dimensions, peut être 2 ou 3.
     */
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

        if (this.visu_function)

          this.visu_function(this.devices);
      } else {
        console.log("___dimension 3___");

        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('keyup', this.onKeyUp, false);

        this.removeEventListeners();
      }
    },
    /**
     * Récupère la vitesse moyenne d'un dispositif spécifié en calculant la moyenne des vitesses de tous les points de données de ce dispositif.
     * @param {*} device Le numéro du dispositif dont la vitesse moyenne est calculée.
     * @returns la vitesse moyenne du dispositif spécifié.
     */
    async getVitesseMoyenne(device) {
      const data = await getLiveDataDevice(device);

      let somme = 0;

      data.forEach(point => {
        somme += point.speed;
      })

      return somme / data.length;
    },
    /**
     * Cette fonction ajoute un itinéraire de référence à la scène.
     */
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
      const GPSgeometry = new THREE.BufferGeometry().setFromPoints(GPSpoints);
      let GPSvisu_mesh = new THREE.Line(GPSgeometry, GPSmaterial);
      this.visu_meshes.push(GPSvisu_mesh);
      this.controller.threeViewer.scene.add(GPSvisu_mesh);
    },
    /*
     * Récupère les points de contrôle et dessine un cylindre jaune dans la scène à l'appelle de cette fonction.
     */
    async addCPs() {
      let cps = await getControlPoints();

      // Coordinates of the 10 points
      cps.forEach(point => {
        let worldCoords = toRaw(this.controller).threeViewer.getWorldCoords([point.x, point.y]); // the getWorldCoords function transform webmercator coordinates into three js world coordinates

        if (this.dimension == 2) {

          const geometry = new THREE.CircleGeometry(5, 32);
          const material = new THREE.MeshStandardMaterial({ color: 0xff9000 });
          const cercle = new THREE.Mesh(geometry, material);

          cercle.position.x = worldCoords[0];
          cercle.position.y = worldCoords[1];
          cercle.position.z = 0;

          this.controller.threeViewer.scene.add(cercle);
          this.pdcs.push(cercle);
        } else {
          const hauteurCylindre = 40;

          const geometry = new THREE.CylinderGeometry(5, 5, hauteurCylindre, 64);
          const material = new THREE.MeshBasicMaterial({ color: 0xff9000 });
          const cylindre = new THREE.Mesh(geometry, material);

          cylindre.position.x = worldCoords[0];
          cylindre.position.y = worldCoords[1];
          cylindre.position.z = hauteurCylindre / 2;
          cylindre.rotation.x = Math.PI / 2;

          this.controller.threeViewer.scene.add(cylindre);
          this.pdcs.push(cylindre);
        }
      })
    },
    /**
     * Supprime la géométrie, le matériau et le maillage three.js de l'objet mesh spécifié.
     * @param {*} mesh L'objet mesh three.js à supprimer.
     */
    disposeThreeMesh(mesh) {
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.controller.threeViewer.scene.remove(mesh);
    },
    /**
     * Supprime les points de contrôle de la scène.
     */
    removeCPS() {
      this.pdcs.forEach(pdc => {
        this.disposeThreeMesh(pdc);
      });

      this.pdcs = [];
    },
    /**
     * Supprime tous les marqueurs d'équipe de la carte en supprimant les mesh ThreeJS associés.
     */
    removeTeamMarkers() {
      this.teamMarkers.forEach(teamMarker => {
        this.disposeThreeMesh(teamMarker);
      });

      this.teamMarkers = [];
    },
    /**
     *  Ajoute un marqueur pour l'équipe sélectionnée à l'instant donné.
     * @param {*} deviceNumber Le numéro de l'appareil de l'équipe.
     * @param {*} timeStamp Le temps de l'instant sélectionné.
     */
    async addTeamMarker(deviceNumber, timeStamp) {
      this.device = deviceNumber;
      this.time_stamp = timeStamp;
      const teamPositions = await getLiveDataDevice(deviceNumber);

      for (let i = 0; i < teamPositions.length; i++) {
        if (teamPositions[i].timestamp === this.time_stamp) {

          // Convert the team's position from Web Mercator to world coordinates
          const worldCoords = this.controller.threeViewer.getWorldCoords([teamPositions[i].x, teamPositions[i].y]);

          if (this.dimension == 2) {

            const geometry = new THREE.CircleGeometry(5, 32);
            const material = new THREE.MeshStandardMaterial({ color: 0x297540 });
            const sphere = new THREE.Mesh(geometry, material);

            sphere.position.x = worldCoords[0];
            sphere.position.y = worldCoords[1];
            sphere.position.z = 0;

            this.controller.threeViewer.scene.add(sphere);
            this.teamMarkers.push(sphere);

          } else {

            const hauteurCylindre = 40;

            const geometry = new THREE.CylinderGeometry(5, 5, hauteurCylindre, 64);
            const material = new THREE.MeshStandardMaterial({ color: 0x297540 });
            const cylindre = new THREE.Mesh(geometry, material);

            cylindre.position.x = worldCoords[0];
            cylindre.position.y = worldCoords[1];
            cylindre.position.z = hauteurCylindre / 2;
            cylindre.rotateX(Math.PI / 2);

            this.controller.threeViewer.scene.add(cylindre);
            this.teamMarkers.push(cylindre);
          }
        }
      }
    },
    /**
     * Change la couleur de l'objet selectionne, reset celle des autres, 
     * et affiche un toast contenant les informations sur l'objet.
     * @param {*} obj L'objet concerne, qui est une partie de la trajectoire.
     */
    async changeDiffPart(obj) {
      const diff_data = await fetch(`http://localhost:5500/diff`, {
        method: 'GET'
      }).then(response => response.json())
      this.controller.threeViewer.traj_parts.children.forEach(child => {
        child.material.color.setRGB(
          1,
          1 - (diff_data[child.cp].niveau_diff + 1) / 6,
          1 - (diff_data[child.cp].niveau_diff + 1) / 6,
        )
      })
      obj.material.color.setRGB(0.3, 0.3, 1)

      let detail = " ID de la zone = " + diff_data[obj.cp].id +
        " Dénivelé + = " + diff_data[obj.cp].denivele_positif +
        " m, Dénivelé - = " + diff_data[obj.cp].denivele_negatif +
        " m, Distance depuis le dernier point de contrôle = " + diff_data[obj.cp].distance +
        " km, Distance depuis le début de la course = " + diff_data[obj.cp].distance_cummulee +
        " km, niveau de difficulté = " + diff_data[obj.cp].niveau_diff

      if (this.devices.length) {
        detail += ", \nVitesse moyenne = " + obj.vitesse_moy + " km/h"
      }

      this.toast.add(
        {
          severity: 'success',
          summary: 'Description',
          detail: detail,
          life: 5000
        }
      );

    },
  }
}
</script>

<style>
html {
  width: 100%;
  height: 100%;
  position: fixed;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
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
  text-align: start;
}
</style>
