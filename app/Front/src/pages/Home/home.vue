<template>
  <div id="app">
    <!-- Composant de la barre de menu -->
    <MenuBar class='menui' pageName='À propos' pageURL="about"></MenuBar>
    <a class='appButton' label="Go to app" href='/application'>
      <!-- Bouton de redirection -->
      <Button>Aller à la Visualisation </Button>
    </a>
    <CarouSel class='carouseli' />
  </div>
</template>

<script>
// Primevue css
import "primevue/resources/themes/bootstrap4-dark-purple/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import Button from 'primevue/button';
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

.p-button {
  margin-top: 50px;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  color: black;
}


.carouseli {
  margin-top: 50px;

}
</style>