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
        <div class="flex flex-column gap-3">
          <div v-for="category in categories" :key="category.key" class="flex align-items-center"
            style="width:fit-content; margin-bottom: 1rem;">
            <RadioButton v-model="selectedCategory" :inputId="category.key" name="visualisation" :value="category.name"
              @click="category.function" />
            <label :for="category.key" v-tooltip.bottom="category.detail" class="ml-2" style="margin-left: 1rem;">{{
              category.name }}</label>
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
        <SpeedDial :model="items" :radius="80" type="semi-circle" direction="up"
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

import {
  init,
  getVitesseMoyenne,
  resetCamera,
  addItineraire,
  addItineraireEpaisseur,
  addItineraireSpeed3D,
  addItineraireSpeedWall,
  createDimensionEnvironment,
  addCPs,
  removeCPS,
  addTeamMarker,
  removeEventListeners,
  addEventListeners,
  addNightCoverage
} from '../../client/index.js'
import { getLiveDataDevice } from "../../client/bddConnexion";
import { tronquer } from "../../client/mathUtils";

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
import { useToast } from "primevue/usetoast";
import RadioButton from 'primevue/radiobutton';
import Fieldset from 'primevue/fieldset';
import Checkbox from 'primevue/checkbox';

// Primevue css
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

//import { preventDefault } from 'ol/events/Event';

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
    RadioButton,
    Fieldset,
    Checkbox
  },
  data() {
    return {
      active: false,
      init: init,
      addItineraire: addItineraire,
      addItineraireEpaisseur: addItineraireEpaisseur,
      addItineraireSpeed3D: addItineraireSpeed3D,
      addItineraireSpeedWall: addItineraireSpeedWall,
      addCPs: addCPs,
      getLiveDataDevice: getLiveDataDevice,
      addTeamMarker: addTeamMarker,
      createDimensionEnvironment: createDimensionEnvironment,
      removeEventListeners: removeEventListeners,
      addEventListeners: addEventListeners,
      getVitesseMoyenne: getVitesseMoyenne,
      resetCamera: resetCamera,
      addNightCoverage: addNightCoverage,
      removeCPS: removeCPS,
      dimension: 2,
      toast: null,
      tabOpen: 1,
      selectedTimestamp: '',
      timestamps: [],
      devices: [],
      devicesTab: [],
      deviceNumber: null,
      deviceNumberFrom: null,
      deviceNumberTo: null,
      visuFunction: null,
      options: [
        { name: '2D', value: 2 },
        { name: '3D', value: 3 }
      ],
      isLegend: false,
      minLegend: null,
      maxLegend: null,
      selectedCategory: 'Production',
      categories: [
        { name: 'Trajectoire enregistrée', key: '1', function: this.displayVisuSimple, detail: "La trajectoire mesurée par le GPS est affichée." },
        { name: 'Visu épaisseur', key: '2', function: this.displayVisuEpaisseur, detail: "Cette visualisation permet de voir la vitesse des coureurs sur le parcours, plus la ligne est épaisse plus le coureur est rapide." },
        { name: 'Visu colline', key: '3', function: this.displayVisuMontagne, detail: "Cette visualisation en 2D+1 permet de visualiser les vitesses des coureurs sur l'axe verticale ainsi que grâce au code couleur. Si vous ajoutez plusieurs équipes, leur vitesse est définit uniquement par le code couleur et l'axe verticale permet de comparer vitesses des différentes équipe sur chaque portion du terrain." },
        { name: 'Points de contrôle', key: '4', function: this.displayPDC, detail: "Ajoute les points de contrôle du parcours." },
        { name: 'Position des équipes', key: '5', function: this.displayPosEquipe, detail: "Ajoute la position d'une équipe à un temp donné." },
        { name: 'Visu Mur', key: '6', function: this.displayVisuMur, detail: "Visualisation 2D+1 qui permet de comparer les vitesses des différentes équipes." },
        { name: 'Visu Nuit', key: '7', function: this.displayVisuNuit, detail: "Visualisation 2D+1 qui permet d'obeserver le parcours realise la nuit." }

      ],
      /*
      categoriesCheckbox: [
        { name: 'Position des équipes', key: '5', function: this.displayPosEquipe, detail: "Ajoute la position d'une équipe à un temp donné." },
        { name: 'Points de contrôle', key: '4', function: this.displayPDC, detail: "Ajoute les points de contrôle du parcours." }
      ],*/
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
          id: 'speedial',
          command: () => {
            this.resetCamera(this.dimension);
          }
        },
        {
          label: 'Info',
          icon: 'pi pi-info-circle',
          id: 'speedial',
          command: () => {
            this.toast.add({ severity: 'success', summary: 'Info', detail: "Le premier numéro d'équipe doit être plus petit que le deuxième.", life: 2000 });
          }
        }
      ]
    }
  },
  async mounted() {
    this.init();

    this.toast = useToast();
    if (this.deviceNumber) {
      await this.loadTimestamps();
    }

    createDimensionEnvironment(this.dimension);
    //this.result = await this.getAllLiveData();

    // Modification du style des bouton du speed dial 
    // On y a pas accès autrement que par le DOM
    document.getElementById("speedial_0").children[0].innerHTML = "";
    document.getElementById("speedial_1").children[0].innerHTML = "";

    document.getElementById("speedial_0").children[0].style = "background-color: green";
    document.getElementById("speedial_1").children[0].style = "background-color: cyan";

  },
  methods: {
    changerDeDimension() {
      this.dimension = this.dimension.value;
      createDimensionEnvironment(this.dimension);
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
          if (!ids.includes(this.deviceNumber)) {
            const moyenne = await this.getVitesseMoyenne(this.deviceNumber);
            this.devicesTab.push({ id: this.deviceNumber, vitesse: this.tronquer(this.convertToKmH(moyenne), 2) });
            this.tabOpen = 0;
          }
        }

        if (this.deviceNumberFrom && this.deviceNumberTo) {
          if (this.deviceNumberFrom < this.deviceNumberTo) {
            for (let i = this.deviceNumberFrom; i <= this.deviceNumberTo; i++) {
              const ids = this.getValuesFromDevicesTab();
              if (!ids.includes(i)) {
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
    displayVisuSimple() {
      this.toast.removeAllGroups();
      this.visuFunction = this.displayVisuSimple;
      this.toast.add({ severity: 'info', summary: 'Info', detail: "La trajectoire mesurée par le GPS est affichée.", life: 10000 });
      this.addItineraire(this.devices);
    },
    async displayPDC() {
      await this.addCPs();
      this.toast.add({ severity: 'info', summary: 'Info', detail: "Ajoute les points de contrôle du parcours.", life: 10000 });
      // Delay the execution of the removeCPS() function
      setTimeout(() => {
        this.removeCPS();
      }, 10000); // Remove the control points after 10 seconds
    },
    displayPosEquipe() {
      this.toast.add({ severity: 'info', summary: 'Info', detail: "Ajoute la position d'une équipe à un temp donné.", life: 10000 });
      this.addTeamMarker(this.deviceNumber, this.selectedTimestamp);
    },
    displayVisuEpaisseur() {
      this.toast.removeAllGroups();
      this.visuFunction = this.displayVisuEpaisseur;

      if (this.devices.length > 1)
        this.toast.add({ severity: 'warn', summary: 'Warn', detail: "Vous devez choisir une seule devices pour afficher cette visualisation.", life: 3000 });
      else
        this.toast.add({ severity: 'info', summary: 'Info', detail: "Cette visualisation permet de voir la vitesse des coureurs sur le parcours, plus la ligne est épaisse plus le coureur est rapide.", life: 10000 });

      this.addItineraireEpaisseur(this.devices);
      this.isLegend = true;
    },
    displayVisuNuit() {
      this.toast.removeAllGroups();
      this.visuFunction = this.displayVisuNuit;

      if (this.devices.length === 0)
        this.toast.add({ severity: 'warn', summary: 'Warn', detail: "Vous devez choisir au moins un device pour afficher cette visualisation.", life: 3000 });
      else
        this.toast.add({ severity: 'info', summary: 'Info', detail: "Cette visualisation permet de voir les portions du parcours sur lesquelles les coureurs se deplacent la nuit.", life: 10000 });

      this.addNightCoverage(this.devices);
      this.isLegend = true;
    },
    displayVisuMontagne() {
      this.toast.removeAllGroups();
      this.visuFunction = this.displayVisuMontagne;

      if (this.devices.length > 1)
        this.toast.add({ severity: 'warn', summary: 'Warn', detail: "Vous devez choisir une seule devices pour afficher cette visualisation.", life: 3000 });
      else
        this.toast.add({ severity: 'info', summary: 'Info', detail: "Cette visualisation en 2D+1 permet de visualiser les vitesses des coureurs sur l'axe verticale ainsi que grâce au code couleur. Si vous ajoutez plusieurs équipes, leur vitesse est définit uniquement par le code couleur et l'axe verticale permet de comparer vitesses des différentes équipe sur chaque portion du terrain.", life: 10000 });

      this.addItineraireSpeed3D(this.devices, this.dimension).then(res => {
        this.minLegend = tronquer(res[0], 2);
        this.maxLegend = tronquer(res[1], 2);
      });


      this.dimension = 3;
      createDimensionEnvironment(3);

      this.isLegend = true;
    },
    displayVisuMur() {
      this.toast.removeAllGroups();
      this.visuFunction = this.displayVisuMur;

      this.toast.add({ severity: 'info', summary: 'Info', detail: "Visualisation 2D+1 qui permet de comparer les vitesses des différentes équipes.", life: 10000 });

      this.addItineraireSpeedWall(this.devices).then(res => {
        this.minLegend = tronquer(res[0], 2);
        this.maxLegend = tronquer(res[1], 2);
      });

      this.dimension = 3;
      createDimensionEnvironment(3);

      this.isLegend = true;
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
