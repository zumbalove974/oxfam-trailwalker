import { createApp } from 'vue'
import App from './home.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Menubar from 'primevue/menubar';

const app = createApp(App);
// Utilisation du plugin PrimeVue pour ajouter les fonctionnalités
// Ajout du composant "Menubar" à l'application
app.use(PrimeVue).use(ToastService).component("Menubar", Menubar).mount('#app');