<template>
  <div id="map" class="map"></div>

  <Accordion :activeIndex="0" class="onglet up">
    <AccordionTab header="Ajouter une ou plusieurs équipes">
      <div class="flexColumn">
        <div class="flexRow evenly upSize spaceDown">
          <InputNumber placeholder="Device ID" v-model="deviceNumber" inputId="integeronly" />
          <div class="card flex justify-content-center">
            <Button label="Ajouter" />
          </div>
        </div>

        <div class="flexRow evenly upSize">
          <div>
            <label for="integeronly" class="font-bold block mb-2 spaceRight"> De </label>
            <InputNumber placeholder="First device" v-model="deviceNumber" inputId="integeronly" />
          </div>
          <div>
            <label for="integeronly" class="font-bold block mb-2 spaceRight"> à </label>
            <InputNumber placeholder="Last device" v-model="deviceNumber" inputId="integeronly" />
          </div>
        </div>
      </div>
    </AccordionTab>
  </Accordion>

  <Accordion :activeIndex="0" class="onglet left">
    <AccordionTab>

      <DataTable :value="devices" tableStyle="min-width: 10rem">
        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"></Column>
      </DataTable>
    </AccordionTab>
  </Accordion>

  <div class="onglet right">
    <div class="card">
      <div :style="{ position: 'relative', height: '350px' }">
        <SpeedDial id="test" ariaLabel="test" showIcon="pi pi-sliders-h" hideIcon="pi pi-times" :model="items"
          direction="down" class="right-0 bottom-0" buttonClass="p-button-help" :tooltipOptions="{ position: 'left' }" />
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
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

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
    Accordion,
    Button,
    DataTable,
    Column
  },
  data() {
    return {
      init: init,
      addItineraire: addItineraire,
      addItineraireEpaisseur: addItineraireEpaisseur,
      addItineraireSpeed3D: addItineraireSpeed3D,
      createDimensionEnvironment: createDimensionEnvironment,
      dimension: 2,
      devices: null,
      options: [
        { name: '2D', value: 2 },
        { name: '3D', value: 3 }
      ],
      items: [
        {
          label: 'Trajectoire simple',
          //icon: 'pi pi-pencil',
          id: "test",
          command: () => {
            this.addLine();
          }
        },
        {
          label: 'Épaisseur de la ligne',
          icon: 'pi pi-refresh',
          command: () => {
            this.addEpaisseur();
          }
        },
        {
          label: '2D+1 vitesses',
          icon: 'pi pi-trash',
          command: () => {
            this.addSpeed3D();
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
  top: 30px;
  left: 50%;
  transform: translate(-50%);
  width: 350px;
}

.right {
  right: 100px;
  top: 30px;
}

.left {
  left: 30px;
  top: 30px;
  height: 90vh;
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

#test_0 {
  background-color: aliceblue;
  color: aliceblue;
  background: aliceblue;
}
</style>
