import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import "@/scss/style.scss";
import VueApexCharts from "vue3-apexcharts";
import axios from "axios";

const app = createApp(App);

axios.interceptors.request.use(config => {
  if (!config.headers['Content-Type']) {
    config.headers['Accept'] = 'application/json';
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
}, error => {
  return Promise.reject(error);
});

app.config.globalProperties.$axios = axios;
app.use(VueApexCharts);
app.use(router);
app.use(vuetify).mount("#app");
