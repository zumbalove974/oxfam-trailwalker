<template>
  <div id="map" class="map"></div>

  <Accordion :activeIndex="0" class="onglet up">
    <AccordionTab header="Ajouter une ou plusieurs équipes">
      <InputNumber placeholder="Device ID" v-model="deviceNumber" inputId="integeronly" />
      <div class="flex-auto">
        <label for="integeronly" class="font-bold block mb-2"> De </label>
        <InputNumber placeholder="First device" v-model="deviceNumber" inputId="integeronly" />
        <label for="integeronly" class="font-bold block mb-2"> à </label>
        <InputNumber placeholder="Last device" v-model="deviceNumber" inputId="integeronly" />
      </div>
    </AccordionTab>
  </Accordion>

  <div class="onglet right">
    <div class="card">
      <div :style="{ position: 'relative', height: '350px' }">
        <SpeedDial :model="items" direction="down" class="right-0 bottom-0" buttonClass="p-button-help"
          :tooltipOptions="{ position: 'left' }" />
      </div>
    </div>
  </div>

  <div id="dimensionBtn" class="card flex justify-content-center">
    <SelectButton @click="changerDeDimension" v-model="dimension" :options="options" optionLabel="name"
      aria-labelledby="basic" />
  </div>
</template>

<script>
import { init, addItineraire, addItineraireEpaisseur, addItineraireSpeed3D, createDimensionEnvironment } from './client/index.js'


// Primevue components
import SelectButton from 'primevue/selectbutton';
import SpeedDial from 'primevue/speeddial';
import InputNumber from 'primevue/inputnumber';
import AccordionTab from 'primevue/accordiontab';
import Accordion from 'primevue/accordion';


// Primevue css
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";


export default {
  name: 'App',

  components: {
    SelectButton,
    SpeedDial,
    InputNumber,
    AccordionTab,
    Accordion
  },
  data() {
    return {
      init: init,
      addItineraire: addItineraire,
      addItineraireEpaisseur: addItineraireEpaisseur,
      addItineraireSpeed3D: addItineraireSpeed3D,
      createDimensionEnvironment: createDimensionEnvironment,
      dimension: 2,
      options: [
        { name: '2D', value: 2 },
        { name: '3D', value: 3 }
      ],
      items: [
        {
          label: 'Add',
          icon: 'pi pi-pencil',
          command: () => {
            this.addLine();
          }
        },
        {
          label: 'Update',
          icon: 'pi pi-refresh',
          command: () => {
            this.addEpaisseur();
          }
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
            this.addSpeed3D();
          }
        }
      ]
    }
  },
  async mounted() {
    this.init();
    createDimensionEnvironment(this.dimension);
    //this.result = await this.getAllLiveData();
  },
  methods: {
    addLine() {
      this.addItineraire(this.deviceNumber);
    },
    addEpaisseur() {
      this.addItineraireEpaisseur(this.deviceNumber);
    },
    addSpeed3D() {
      this.addItineraireSpeed3D(this.deviceNumber, this.dimension);
    },
    changerDeDimension() {
      createDimensionEnvironment(this.dimension.value);
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
  top: 50px;
  left: 50%;
  transform: translate(-50%);
}

.right {
  right: 50px;
  top: 50px;
}

#dimensionBtn {
  position: absolute;
  z-index: 2;
  bottom: 50px;
  right: 50px;
}

.font-bold {
  font-weight: bold;
}
</style>
