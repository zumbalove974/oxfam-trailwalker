<template>
  <div id="app"> </div>
  <MenuBar pageName='Accueil' pageURL="home"></MenuBar>
  <div class="teamWrapper" id="who-we-are">
    <div class="wrapper">
      <div class="flexColumn center">
        <img class="image" src="./../../assets/DD.png" alt="Avatar">
        <h4> Damien D'arras </h4>
      </div>
      <div class="flexColumn center">
        <img class="image" src="./../../assets/HA.png" alt="Avatar">
        <h4> Hiba Ait Oumajoud </h4>
      </div>
      <div class="flexColumn center">
        <img class="image" src="./../../assets/OE.jpeg" alt="Avatar">
        <h4> Omran Edoo </h4>
      </div>
      <div class="flexColumn center">
        <img class="image" src="./../../assets/LSa.png" alt="Avatar">
        <h4> Lina Saba </h4>
      </div>
    </div>
  </div>
</template>

<script>
// Primevue css
import "primevue/resources/themes/bootstrap4-dark-purple/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

import MenuBar from '../../components/MenuBar.vue'
//import AvatarGroup from 'primevue/avatargroup';   //Optional for grouping

export default {
  name: 'App',
  components: {
    MenuBar,
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

.aboutText {
  text-align: justify;
  width: 50%;
  color: aliceblue;
}

.centerItself {
  justify-self: center;
  align-self: center;
  width: fit-content;
  padding-bottom: 10px;
}

.image {
  border-radius: 50%;
  width: 200px;
  height: 200px;
  margin-bottom: 10px;
}

.flexColumn {
  justify-self: center;
  display: flex;
  flex-direction: column;
}
</style>