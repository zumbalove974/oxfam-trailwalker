<template>
    <!-- Élément racine de l'application Vue -->
    <div id="app"> </div>
    <!-- Composant de la barre de menu -->
    <MenuBar pageName="Accueil" pageURL="home">></MenuBar>
    <a class='appButton' label="Go to app" href='/application'>
        <!-- Bouton de redirection -->
        <Button>Aller à la Visualisation </Button>
    </a>
    <!-- Section de présentation -->
    <div id="myPresentation">
        <h3>
            Le Trailwalker Oxfam est un événement sportif qui a eu lieu à Dieppe, où des équipes de quatre personnes
            marchent 100 km sans relais en moins de 30 heures. Cet exploit est à la fois physique et mental. <br>
        </h3>
        <h4>
            Pour mieux comprendre le comportement des équipes pendant la course, TrailLove76200 est une application qui
            permet de visualiser les trajectoires de chaque équipe. Cette application représente l'évolution de l'allure des
            participants en fonction de différents paramètres tels que le terrain, le moment de la course et la vitesse de
            l'équipe. Ainsi, le projet vise à offrir une analyse spatio-temporelle des trajectoires de la course Oxfam
            Trailwalker de 2021.
        </h4>
    </div>
    <!-- Image du site de l'Oxfam -->
    <img name="parcours" src="../../assets/parcours.png" width="700" height="400" />
</template>
  
<script>
// Primevue css
import "primevue/resources/themes/bootstrap4-dark-purple/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import MenuBar from '../../components/MenuBar.vue'
import Button from 'primevue/button';

export default {
    name: 'App',
    components: {
        MenuBar,
        Button
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
    font-family: system-ui;
    color: white;
    padding: 40px;
    text-align: center;
}

.p-button {
    margin-top: 50px;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    color: black;
}
</style>