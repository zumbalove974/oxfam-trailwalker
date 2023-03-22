<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App 00000000000000000000000" />
  <div id="map" class="map"></div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import { init } from './client/index.js'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data() {
    return {
      init: init
    }
  },
  mounted() {
    this.init();
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
