import { createApp } from 'vue'
import App from './application.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

const app = createApp(App);
app.use(PrimeVue).use(ToastService).mount('#app');
