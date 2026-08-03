import "vue";
import Vue from "vue";
import VueApexCharts from "vue-apexcharts";
import Vuelidate from "vuelidate";
import VueQuillEditor from "vue-quill-editor";

import HttpService from "./services/base/HttpService";
import StorageConfig from "./services/config/StorageConfig";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import FullCalendar from "vue-full-calendar";

// require styles
import "fullcalendar/dist/fullcalendar.min.css";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

if (StorageConfig.getToken()) {
  HttpService.setHeaderBroadcast();
  HttpService.setHeader();
}

Vue.use(VueQuillEditor);
Vue.use(FullCalendar);
Vue.config.productionTip = false;
Vue.component("apexchart", VueApexCharts);
Vue.use(Vuelidate);
new Vue({
  router,
  vuetify,
  VueApexCharts,
  render: (h) => h(App),
}).$mount("#app");
