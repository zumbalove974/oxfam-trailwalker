import { createApp } from 'vue'
import App from './application.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

const app = createApp(App);
app.use(PrimeVue).use(ToastService).mount('#app');
app.directive('tooltip', Tooltip);