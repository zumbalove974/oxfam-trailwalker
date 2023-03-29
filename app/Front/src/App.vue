<template>
  <div id="map" class="map"></div>
  <input type="text" v-model="deviceNumber" />
  <button @click="addLine()">Add line</button>
  <button @click="addEpaisseur()">Add epaisseur</button>
  <button @click="addSpeed3D()">Add speed 2D+1</button>
  <button @click="changerDeDimension()">{{ dimension }}D</button>
</template>

<script>
import { init, addItineraire, addItineraireEpaisseur, addItineraireSpeed3D, createDimensionEnvironment } from './client/index.js'
//import { getAllLiveData } from './client/bddConnexion.js'


export default {
  name: 'App',

  components: {
  },
  data() {
    return {
      init: init,
      addItineraire: addItineraire,
      addItineraireEpaisseur: addItineraireEpaisseur,
      addItineraireSpeed3D: addItineraireSpeed3D,
      createDimensionEnvironment: createDimensionEnvironment,
      dimension: 2
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
      if (this.dimension == 2) {
        this.dimension = 3;
      } else {
        this.dimension = 2
      }

      createDimensionEnvironment(this.dimension);
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
  margin-top: 60px;
}
</style>
