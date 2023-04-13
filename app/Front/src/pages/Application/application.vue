<template>
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
            <VisuMur @func="test" :controllerProps="controller" :devicesProps="devices"
              :visu_functionProps="visu_function" :dimensionProps="dimension" :categoryProps="category">
            </VisuMur>
          </div>
          <div v-for="category in categoriesCheckbox" :key="category.key" class="flex align-items-center"
            style="width:fit-content; margin-bottom: 1rem;">
            <Checkbox v-model="selectedCategory" :inputId="category.key" name="visualisation" :value="category.name"
              @input="category.function($event)" />
            <label :for="category.key" class="ml-2" style="margin-left: 1rem;">{{ category.name }}</label>
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

import { init, removeCPS, getVitesseMoyenne, resetCamera/*, addItineraire, addItineraireEpaisseur, addItineraireSpeed3D, addItineraireSpeedWall*/, createDimensionEnvironment, addCPs, addTeamMarker, removeEventListeners, addEventListeners } from '../../client/index.js'
import VisuMur from './../../components/VisuMur.vue';
import { getLiveDataDevice } from "../../client/bddConnexion";
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
import Fieldset from 'primevue/fieldset';
import Checkbox from 'primevue/checkbox';

// Primevue css
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

import { useToast } from "primevue/usetoast";
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
    //RadioButton,
    Fieldset,
    Checkbox,
    VisuMur
  },
  data() {
    return {
      init: init,
      //addItineraire: addItineraire,
      //addItineraireEpaisseur: addItineraireEpaisseur,
      //addItineraireSpeed3D: addItineraireSpeed3D,
      //addItineraireSpeedWall: addItineraireSpeedWall,
      addCPs: addCPs,
      getLiveDataDevice: getLiveDataDevice,
      addTeamMarker: addTeamMarker,
      createDimensionEnvironment: createDimensionEnvironment,
      removeEventListeners: removeEventListeners,
      addEventListeners: addEventListeners,
      getVitesseMoyenne: getVitesseMoyenne,
      resetCamera: resetCamera,
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
      controller: null,
      visu_function: null,
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
        { name: 'Visu Mur', key: '4' }
      ],
      categoriesCheckbox: [
        { name: 'Position des équipes', key: '5', function: this.displayPosEquipe },
        { name: 'Points de contrôle', key: '6', function: this.displayPDC }
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
    this.controller = this.init();

    console.log("________dfdfdfdf", this.controller)
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
    test: function (data) {
      console.log("ttt ", data)
    },
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
    displayPDC(input) {
      this.toast.removeAllGroups();
      this.removeCPS();

      if (input[input.length - 1] == "Points de contrôle") {
        this.addCPs();
        this.toast.add({ severity: 'info', summary: 'Info', detail: "Ajoute les points de contrôle du parcours.", life: 10000 });
      }
    },
    displayPosEquipe() {
      this.toast.add({ severity: 'info', summary: 'Info', detail: "Ajoute la position d'une équipe à un temp donné.", life: 10000 });
      this.addTeamMarker(this.deviceNumber, this.selectedTimestamp);
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
