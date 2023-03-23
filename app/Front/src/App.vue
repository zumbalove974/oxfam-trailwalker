<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <div id="map" class="map"></div>
</template>

<script>
import { init } from './client/index.js'
import { getAllLiveData } from './client/bddConnexion.js'


export default {
  name: 'App',
  components: {

  },
  data() {
    return {
      init: init,
      getAllLiveData: getAllLiveData
    }
  },
  mounted() {
    this.init();
    this.getAllLiveData();
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


12346987
