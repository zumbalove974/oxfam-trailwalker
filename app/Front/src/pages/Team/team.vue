<template>
  <div id="app"> </div>
  <MenuBar pageName='Accueil' pageURL="home"></MenuBar>
  <div class="teamWrapper" id="who-we-are">
    <div class="wrapper">
      <div class="flexColumn center">
        <img class="image" src="./../../assets/DD.png" alt="Avatar">
        <h4> Damien D'arras </h4>
        <a label="Go to linkedin" href='https://fr.linkedin.com/in/damien-d-arras-9b38a4239'>
          <i class="pi pi-linkedin"></i>
        </a>
        <a label="Go to Github" href='https://github.com/VenziaTurmoil'>
          <i class="pi pi-github"></i>
        </a>
      </div>
      <div class="flexColumn center">
        <img class="image" src="./../../assets/LS.png" alt="Avatar">
        <h4> Lina Saba </h4>
        <a label="Go to linkedin"
          href='https://fr.linkedin.com/in/lina-s-59678a157/fr?trk=people-guest_people_search-card'>
          <i class="pi pi-linkedin"></i>
        </a>
        <a label="Go to Github" href='https://github.com/LinaSaba'>
          <i class="pi pi-github"></i>
        </a>
      </div>

      <div class="flexColumn center">
        <img class="image" src="./../../assets/HA.png" alt="Avatar">
        <h4> Hiba Ait Oumajoud </h4>
        <a label="Go to linkedin" href='https://ma.linkedin.com/in/hiba-ait-oumajoud-775055182/en'>
          <i class="pi pi-linkedin"></i>
        </a>
        <a label="Go to Github" href='https://github.com/hibaa-ai'>
          <i class="pi pi-github"></i>
        </a>
      </div>
      <div class="flexColumn center">
        <img class="image" src="./../../assets/EO.png" alt="Avatar">
        <h4> Omran Edoo </h4>
        <a label="Go to linkedin" href='https://fr.linkedin.com/in/omran-edoo-6a170022a'>
          <i class="pi pi-linkedin"></i>
        </a>
        <a label="Go to Github" href='https://github.com/OmranEdoo'>
          <i class="pi pi-github"></i>
        </a>
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
  object-fit: contain;
}

.flexColumn {
  justify-self: center;
  display: flex;
  flex-direction: column;
}

.wrapper {
  display: grid;
  grid-template: "a a" auto;
  color: blueviolet;

}
</style>