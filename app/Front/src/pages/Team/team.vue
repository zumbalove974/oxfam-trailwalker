<template>
  <div id="app"> </div>
  <MenuBar pageName='Accueil' pageURL="home"></MenuBar>
  <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" size="100rem" shape="circle" />
  <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png" size="xlarge" shape="circle" />
  <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/onyamalimba.png" size="xlarge" shape="circle" />
</template>

<script>
// Primevue css
import "primevue/resources/themes/bootstrap4-dark-purple/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

import MenuBar from '../../components/MenuBar.vue'
import Avatar from 'primevue/avatar';
//import AvatarGroup from 'primevue/avatargroup';   //Optional for grouping

export default {
  name: 'App',
  components: {
    MenuBar,
    Avatar
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