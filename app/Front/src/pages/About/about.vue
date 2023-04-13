<template>
    <div id="app"> </div>
    <MenuBar pageName="Accueil" pageURL="home">></MenuBar>
</template>
  
<script>
// Primevue css
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

// https://github.com/OmranEdoo/rasberryWeather974/tree/dev/Front/dist
// avoir une page router

import MenuBar from '../../components/MenuBar.vue'

export default {
    name: 'App',
    components: {
        MenuBar
    }
}
</script>
  
<style>
#app {
    font-family: Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin: 0;
}
</style>