<template>
  <div id="map" class="map"></div>

  <Toast position="bottom-right" />

  <Accordion @pointerover="removeEventListeners" v-on="{ pointerleave: dimension == 2 ? addEventListeners : null }"
    :activeIndex="0" class="onglet up">
    <AccordionTab header="Ajouter une ou plusieurs équipes">
      <div class="flexColumn">
        <div class="flexRow evenly upSize spaceDown">
          <InputNumber placeholder="Device ID" v-model="deviceNumber" inputId="integeronly" />
          <div class="card flex justify-content-center">
            <Button id="addTeamBtn" label="Ajouter" @click="addDevice" />
          </div>
        </div>

        <div class="flexRow evenly upSize">
          <div>
            <label for="integeronly" class="font-bold block mb-2 spaceRight"> De </label>
            <InputNumber placeholder="First device" v-model="deviceNumberFrom" inputId="integeronly" />
          </div>
          <div>
            <label for="integeronly" class="font-bold block mb-2 spaceRight"> à </label>
            <InputNumber placeholder="Last device" v-model="deviceNumberTo" inputId="integeronly" />
          </div>
        </div>
      </div>
    </AccordionTab>
  </Accordion>

  <Accordion @pointerover="removeEventListeners" v-on="{ pointerleave: dimension == 2 ? addEventListeners : null }"
    expandIcon="pi pi-ellipsis-h" collapseIcon="pi pi-ellipsis-v" class="onglet left" :activeIndex="tabOpen">
    <AccordionTab>
      <DataTable scrollHeight="80vh" style="max-height: 80vh;" :resizable-columns=true :row-hover=true :scrollable=true
        :value="devicesTab" tableStyle="min-width: 10rem; max-height: 10rem;">
        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"
          headerStyle="background-color: #A855F7; color: white" :sortable=true></Column>
      </DataTable>
    </AccordionTab>
  </Accordion>

  <div @pointerover="removeEventListeners" v-on="{ pointerleave: dimension == 2 ? addEventListeners : null }"
    class="onglet right">
    <div class="card">
      <div :style="{ position: 'relative', height: '350px' }">
        <SpeedDial id="speedial" showIcon="pi pi-sliders-h" hideIcon="pi pi-times" :model="items"
          buttonClass="p-button-help" direction="down" :tooltipOptions="{ position: 'left' }" mask
          :style="{ right: 0, top: 0 }" />
      </div>
    </div>
  </div>

  <div id="dimensionBtn" class="card flex justify-content-center">
    <SelectButton @click="changerDeDimension" v-model="dimension" :options="options" optionLabel="name"
      aria-labelledby="basic" />
  </div>
</template>


<script>
import { init, addItineraire, addItineraireEpaisseur, addItineraireSpeed3D, addItineraireSpeedWall, createDimensionEnvironment, addCPs, removeEventListeners, addEventListeners } from './client/index.js'

// Primevue components
import SelectButton from 'primevue/selectbutton';
import SpeedDial from 'primevue/speeddial';
import InputNumber from 'primevue/inputnumber';
import AccordionTab from 'primevue/accordiontab';
import Accordion from 'primevue/accordion';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toast from 'primevue/toast';

// Primevue css
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

import { useToast } from "primevue/usetoast";
//import { preventDefault } from 'ol/events/Event';



export default {
  name: 'App',

  components: {
    SelectButton,
    SpeedDial,
    InputNumber,
    AccordionTab,
    Accordion,
    Button,
    DataTable,
    Column,
    Toast
  },
  data() {
    return {
      init: init,
      addItineraire: addItineraire,
      addItineraireEpaisseur: addItineraireEpaisseur,
      addItineraireSpeed3D: addItineraireSpeed3D,
      addItineraireSpeedWall: addItineraireSpeedWall,
      addCPs: addCPs,
      createDimensionEnvironment: createDimensionEnvironment,
      removeEventListeners: removeEventListeners,
      addEventListeners: addEventListeners,
      dimension: 2,
      toast: null,
      tabOpen: 1,
      devices: [],
      devicesTab: [],
      deviceNumber: null,
      deviceNumberFrom: null,
      deviceNumberTo: null,
      options: [
        { name: '2D', value: 2 },
        { name: '3D', value: 3 }
      ],
      items: [
        {
          label: 'Trajectoire simple',
          command: () => {
            this.toast.add({ severity: 'info', summary: 'Info', detail: "La trajectoire de base est affichée", life: 10000 });
            this.addItineraire(this.devices);
          }
        },
        {
          label: 'Épaisseur de la ligne',
          command: () => {
            this.toast.add({ severity: 'info', summary: 'Info', detail: "Cette visualisation permet de voir la vitesse des coureurs sur le parcours, plus la ligne est épaisse plus le coureur est rapide.", life: 10000 });
            this.addItineraireEpaisseur(this.devices);
          }
        },
        {
          label: '2D+1 vitesses',
          command: () => {
            this.toast.add({ severity: 'info', summary: 'Info', detail: "Cette visualisation en 2D+1 permet de visualiser les vitesses des coureurs sur l'axe verticale ainsi que grâce au code couleur. Si vous ajoutez plusieurs équipes, leur vitesse est définit uniquement par le code couleur et l'axe verticale permet de comparer vitesses des différentes équipe sur chaque portion du terrain.", life: 10000 });
            this.addItineraireSpeed3D(this.devices, this.dimension);
          }
        },
        {
          label: 'Points de contrôle',
          command: () => {
            this.toast.add({ severity: 'info', summary: 'Info', detail: "Ajoute les points de contrôle du parcours.", life: 10000 });
            this.addCPs();
          }
        },
        {
          label: 'Visualisation du mur',
          command: () => {
            this.toast.add({ severity: 'info', summary: 'Info', detail: "Visualisation 2D+1 qui permet de comparer les vitesses des différentes équipes.", life: 10000 });
            this.addItineraireSpeedWall(this.devices);
          }
        }
      ],
      columns: [
        { field: 'id', header: 'ID' },
        { field: 'vitesse', header: 'Vitesse moy.' }
      ]
    }
  },
  async mounted() {
    this.toast = useToast();

    this.init();
    createDimensionEnvironment(this.dimension);
    //this.result = await this.getAllLiveData();

    // Modification du style des bouton du speed dial 
    // On y a pas accès autrement que par le DOM
    document.getElementById("speedial_0").children[0].innerHTML = "1";
    document.getElementById("speedial_1").children[0].innerHTML = "2";
    document.getElementById("speedial_2").children[0].innerHTML = "3";
    document.getElementById("speedial_3").children[0].innerHTML = "4";
    document.getElementById("speedial_4").children[0].innerHTML = "5";


    document.getElementById("speedial_1").children[0].style = "background-color: green";
    document.getElementById("speedial_2").children[0].style = "background-color: cyan";
    document.getElementById("speedial_3").children[0].style = "background-color: blue";
    document.getElementById("speedial_4").children[0].style = "background-color: red";
  },
  methods: {
    changerDeDimension() {
      this.dimension = this.dimension.value;
      createDimensionEnvironment(this.dimension);
    },
    addDevice() {
      if (this.deviceNumber || (this.deviceNumberFrom && this.deviceNumberTo)) {
        if (this.deviceNumber) {
          if (!this.devices.includes(this.deviceNumber)) {
            this.devices.push(this.deviceNumber);
            this.devicesTab.push({ id: this.deviceNumber, vitesse: 10 });
            this.tabOpen = 0;
          }
        }

        if (this.deviceNumberFrom && this.deviceNumberTo) {
          if (this.deviceNumberFrom < this.deviceNumberTo) {
            for (let i = this.deviceNumberFrom; i <= this.deviceNumberTo; i++) {
              if (!this.devices.includes(i)) {
                this.devices.push(i);
                this.devicesTab.push({ id: i, vitesse: 10 });
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
  height: 90vh;
  max-height: 90vh;
}

#dimensionBtn {
  position: absolute;
  z-index: 2;
  bottom: 50px;
  right: 50px;
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
</style>
