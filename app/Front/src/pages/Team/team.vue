<template>
  <div id="app"> </div>
  <MenuBar pageName='Accueil' pageURL="home"></MenuBar>
  <div class="teamWrapper" id="who-we-are">
    <h1>Notre équipe</h1>
    <h4> Nous sommes un groupe de quatre étudiants en dernière année du cycle ingénieur à l'École Nationale des Sciences
      Géographiques. Passionés par l'Informatique, nous étudions les Technologies des Systèmes d'Information. </h4>

    <div class="wrapper">
      <div class="flexColumn center">
        <img class="image" :src="srcDD" @mouseover="hover = true" @mouseleave="hover = false" alt="Avatar">
        <h4> Damien D'arras </h4>
        <h5> The light of my devotion will set the world aflame.</h5>
        <h5>- death metal and kpop enthusiast - </h5>
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
        <h5> By grace, through faith. </h5>
        <h5> - Ambitious soul - </h5>

        <a label="Go to linkedin" href='https://fr.linkedin.com/in/lina-s-59678a157'>
          <i class="pi pi-linkedin"></i>
        </a>
        <a label="Go to Github" href='https://github.com/LinaSaba'>
          <i class="pi pi-github"></i>
        </a>
      </div>

      <div class="flexColumn center">
        <img class="image" src="./../../assets/HA.png" alt="Avatar">
        <h4> Hiba Ait Oumajoud </h4>
        <h5> phrase </h5>
        <a label="Go to linkedin" href='https://ma.linkedin.com/in/hiba-ait-oumajoud-775055182'>
          <i class="pi pi-linkedin"></i>
        </a>
        <a label="Go to Github" href='https://github.com/hibaa-ai'>
          <i class="pi pi-github"></i>
        </a>
      </div>
      <div class="flexColumn center">
        <img class="image" src="./../../assets/EO.png" alt="Avatar">
        <h4> Omran Edoo </h4>
        <h5> Les actes ne valent que par leurs intentions. </h5>
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
  },
  data() {
    return {
      srcDD: require("./../../assets/DD.png"),
      srcDDhov: require("./../../assets/DDhov.jpg"),
      hover: false
    }
  },
  computed: {
    pictureHover() {
      if (this.hover == true) {
        return this.srcDD
      } else {
        return this.srcDDhov
      }
    }
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
  padding: 5px;
}

.wrapper {
  display: grid;
  grid-template: "a a" auto;
}

.teamWrapper {
  color: whitesmoke;
  padding: 2px;
  font-family: Verdana, Geneva, Tahoma, sans-serif
}
</style>