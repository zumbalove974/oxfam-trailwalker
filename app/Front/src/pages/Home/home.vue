<template>
  <div id="app"> </div>
  <MenuBar></MenuBar>
  <a label="Go to app" href='/application'>
    <Button>
      Aller à la Visualisation </Button></a>
  <img src="../../assets/trailove.png" />
</template>





<script>
// Primevue css
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import Button from 'primevue/button';

// https://github.com/OmranEdoo/rasberryWeather974/tree/dev/Front/dist
// avoir une page router

import MenuBar from '../../components/MenuBar.vue'

export default {
  name: 'App',
  components: {
    MenuBar,
    Button
  },
  // methods: {
  //   allerPage2() {
  //     this.$router.go('application');
  //   }
  // },
  // mounted() {
  //   console.log({ router: this.$router });
  // }
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