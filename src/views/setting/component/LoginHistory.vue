<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="10"
        ><span class="title-page">Login History</span></v-col
      >
      <!-- <v-col cols="12" sm="6" md="4" lg="2">
        <v-btn class="btn-submit" @click="add"> Create Special Date </v-btn>
      </v-col> -->
    </v-row>
    <v-card class="mt-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="6">
            <date-picker
              v-model="date"
              :format="dateFormat"
              format="DD-MM-YYYY"
              placeholder="Date"
              class="datetime-picker"
            ></date-picker>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="6">
            <v-autocomplete
              dense
              outlined
              :items="dataEmail"
              v-model="emails"
              clearable
              label="Email"
            ></v-autocomplete>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text>
        <v-data-table
          hide-default-footer
          style="width: 100%"
          :loading="myloadingvariable"
          :headers="headers"
          :items="items"
          :footer-props="{
            'items-per-page-options': [5, 10, 25],
            'items-per-page-text': 'Items per page:',
            'show-current-page': true,
            'show-first-last-page': true,
          }"
        >
          <template #[`item.createdDate`]="{ item, index }">
            <span>{{ getDate(item.createdDate) }}</span>
          </template>
        </v-data-table>
        <div class="ml-4" style="display: flex; justify-content: space-between">
          <span style="font-weight: 700; align-self: center"
            >Total Data : {{ totalItems }}</span
          >
          <v-pagination
            v-model="pages"
            :length="totalPage"
            @input="onPageChangeDetil"
            :total-visible="7"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>
    <CreateQuote
      :open="openModal"
      :item="itemSelected"
      @close="closeModal"
    ></CreateQuote>
  </div>
</template>
<script>
import moment from "moment";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import { mdiChevronRight, mdiTrashCanOutline, mdiMagnify } from "@mdi/js";
import Swal from "sweetalert2";
import CreateQuote from "./CreateSpecialFormModal.vue";
import LoginHistoruService from "../../../services/management/login_history/loginHistoryServices";

const service = LoginHistoruService.build();

export default {
  components: {
    CreateQuote,
    DatePicker,
  },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      dataUser: [],
      dataEmail: [],
      users: "",
      emails: "",
      date: null,
      dateFormat: "DD-MM-YYYY",
      baseUrl: process.env.VUE_APP_PERTAGAS,
      myloadingvariable: true,
      openModal: false,
      icons: {
        mdiMagnify,
        mdiTrashCanOutline,
        mdiChevronRight,
      },
      headers: [
        { text: "Host", value: "host" },
        { text: "Email", value: "email" },
        { text: "Created Date", value: "createdDate" },
        { text: "Message", value: "message" },
      ],
      items: [],
      itemSelected: null,
      totalPages: 0,
      totalElements: 0,
      last: true,
      first: true,
      numberOfElements: 0,
      size: 20,
      number: 0,
      empty: true,
      keywords: "",
      param: {
        page: 0,
        size: 0,
        sort: "",
      },
    };
  },
  created() {
    this.getQuotes(1);
    this.getEmail();
    this.getUser();
  },
  watch: {
    emails() {
      this.getQuotes(1);
    },
    date() {
      this.getQuotes(1);
    },
  },
  methods: {
    async getEmail() {
      const res = await service.getEmail();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.dataEmail = filter;
    },
    async getUser() {
      const res = await service.getUser();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.dataUser = filter;
    },
    getDate(x) {
      return moment(x).format("DD-MM-YYYY");
    },
    add() {
      this.itemSelected = null;
      this.openModal = true;
    },
    edit(item) {
      this.itemSelected = item;
      this.openModal = true;
    },
    async getQuotes(x) {
      const param = {
        size: this.itemsPerpage,
        page: x - 1,
      };
      if (this.emails !== "") {
        param.email = this.emails;
      }
      if (this.date !== null) {
        param.date = moment(this.date).format("YYYY-MM-DD");
      }
      const res = await service.getData(param);
      const data = res.data.data;

      this.nameItems = this.items.map((a) => a.name);

      this.myloadingvariable = false;
      this.items = data.content;
      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.totalItems = res.data.data.totalElements;
      this.last = data.last;
      this.first = data.first;
      this.numberOfElements = data.numberOfElements;
      this.size = data.size;
      this.number = data.number;
      this.empty = data.empty;
    },
    async onPageChangeDetil(value) {
      await this.getQuotes(value);
    },
    closeModal() {
      this.openModal = false;
      this.itemSelected = null;
      this.getQuotes(1);
    },
  },
};
</script>
<style scoped>
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
}

.title-page {
  font-weight: bold;
  color: #101010;
}
.datetime-picker {
  width: 100%;
}
::v-deep .mx-input {
  height: 40px !important;
}
</style>
