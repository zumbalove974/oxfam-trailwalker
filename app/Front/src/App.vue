<template>
  <div id="map" class="map"></div>
  <input type="text" v-model="deviceNumber" />
  <button @click="addLine()">Add line</button>
  <button @click="addEpaisseur()">Add epaisseur</button>
</template>

<script>
import { init, addItineraire, addItineraireEpaisseur } from './client/index.js'
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
    }
  },
  async mounted() {
    this.init();
    //this.result = await this.getAllLiveData();
  },
  methods: {
    addLine() {
      this.addItineraire(this.deviceNumber);
    },
    addEpaisseur() {
      this.addItineraireEpaisseur(this.deviceNumber);
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
