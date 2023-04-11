import { createApp } from 'vue';
import { createPinia } from 'pinia';

import 'vuetify/styles/main.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import App from './App.vue';
import router from './router';
import './registerServiceWorker';

const pinia = createPinia();

const vuetify = createVuetify({
  components,
  directives,
});

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.use(pinia);
app.mount('#app', true);
