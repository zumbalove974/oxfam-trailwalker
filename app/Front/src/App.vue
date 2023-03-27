<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <div id="map" class="map"></div>
  <button @click="addLine()">Add line</button>
</template>

<script>
import { init, addItineraire } from './client/index.js'
import { getAllLiveData } from './client/bddConnexion.js'


export default {
  name: 'App',
  components: {

  },
  data() {
    return {
      init: init,
      getAllLiveData: getAllLiveData,
      result: null,
      addItineraire: addItineraire
    }
  },
  async mounted() {
    this.init();
    this.result = await this.getAllLiveData();
    // console.log("App.bddConnection.result", this.result);
  },
  methods: {
    addLine() {
      this.addItineraire(this.result);
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
