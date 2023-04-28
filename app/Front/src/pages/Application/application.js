import { createApp } from 'vue'
import App from './application.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

const app = createApp(App);
// Utilisation du plugin PrimeVue pour ajouter les fonctionnalités
app.use(PrimeVue).use(ToastService).mount('#app');
//afficher des infobulles lorsque l'utilisateur survole l'élément.
app.directive('tooltip', Tooltip);