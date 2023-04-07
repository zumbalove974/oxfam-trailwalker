import { createApp } from 'vue'
import App from './home.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Menubar from 'primevue/menubar';

const app = createApp(App);
app.use(PrimeVue).use(ToastService).component("Menubar", Menubar).mount('#app');