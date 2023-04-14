import { createApp } from 'vue'
import App from './about.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
// console.log("1", PrimeVue)
// const primeVue = usePrimeVue();
// console.log("2", primeVue)

const app = createApp(App);
app.use(PrimeVue).use(ToastService).mount('#app');
