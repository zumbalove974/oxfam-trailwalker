<template>
    <!-- Élément racine de l'application Vue -->
    <div id="app"> </div>
    <!-- Composant de la barre de menu -->
    <MenuBar pageName="Accueil" pageURL="home">></MenuBar>
    <!-- Section de présentation -->
    <div id="myPresentation">
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
            magna
            aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat.
            Duis
            aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
            occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
    </div>
    <!-- Image de l'aaplication -->
    <img name="parcours" src="../../assets/parcours.png" width="700" height="400" />
</template>
  
<script>
// Primevue css
import "primevue/resources/themes/bootstrap4-dark-purple/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

// https://github.com/OmranEdoo/rasberryWeather974/tree/dev/Front/dist
// avoir une page router

// Importation du composant de la barre de menu
import MenuBar from '../../components/MenuBar.vue'

export default {
    name: 'App',
    components: {
        MenuBar
    }
}
</script>
  
<style>
/* Style pour l'élément racine */
#app {
    font-family: Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin: 0;
}

/* Style pour la section de présentation */
#myPresentation {
    background-color: ;
    color: white;
    padding: 40px;
    text-align: center;
}
</style>