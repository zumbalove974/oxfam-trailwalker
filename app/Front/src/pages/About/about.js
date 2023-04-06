import { createApp } from 'vue'
import App from './about.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

const app = createApp(App);
app.use(PrimeVue).use(ToastService).mount('#app');
