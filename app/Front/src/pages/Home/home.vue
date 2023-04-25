<template>
  <div id="app"> </div>
  <!-- Composant de la barre de menu -->
  <MenuBar pageName='À propos' pageURL="about"></MenuBar>
  <a label="Go to app" href='/application'>
    <!-- Bouton de redirection -->
    <Button>Aller à la Visualisation </Button>
  </a>
  <CarouSel />
</template>

<script>
// Primevue css
import "primevue/resources/themes/bootstrap4-dark-purple/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
// Importation du composant Button de Primevue
import Button from 'primevue/button';

// https://github.com/OmranEdoo/rasberryWeather974/tree/dev/Front/dist
// avoir une page router
// Importation du composant MenuBar
import MenuBar from '../../components/MenuBar.vue'
import CarouSel from '../../components/CarouSel.vue'

export default {
  name: 'App',
  components: {
    MenuBar,
    Button,
    CarouSel
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

.CarouSel {
  margin-top: 200px;
}
</style>