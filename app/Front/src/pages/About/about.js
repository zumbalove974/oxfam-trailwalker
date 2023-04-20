import { createApp } from 'vue'
import App from './about.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';


const app = createApp(App);
// Utilisation du plugin PrimeVue pour ajouter les fonctionnalités
app.use(PrimeVue).use(ToastService).mount('#app');
