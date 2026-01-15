<template>
  <div>
    <v-row class="mx-1">
      <v-spacer />
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-select dense v-model="catalogId" outlined :items="dataCatalog" label="Catalog" clearable></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="2">
        <date-picker :format="dateFormat" v-model="startDate" format="DD-MM-YYYY" placeholder="Start Date"
          class="datetime-picker"></date-picker>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="2">
        <date-picker :format="dateFormat" v-model="endDate" :disabled-date="disabledFromStartDate" format="DD-MM-YYYY"
          placeholder="End Date" class="datetime-picker"></date-picker>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="4">
        <v-text-field dense :append-icon="icons.mdiMagnify" v-model="keyword" outlined
          label="Search by ticket number or title" clearable></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="2" lg="2">
        <v-btn @click="addTicket" class="btn-search" depressed>New Request</v-btn>
      </v-col>
    </v-row>
    <v-row style="padding: 1%">
      <v-data-table hide-default-footer style="width: 100%" :headers="headers" :loading="loading" :items="items"
        @click:row="handleClick" :footer-props="{
          'items-per-page-options': [5, 10, 25],
          'items-per-page-text': 'Items per page:',
          'show-current-page': true,
          'show-first-last-page': true,
        }">
        <template #[`item.createdAt`]="{ item, index }">
          <span>{{ formatDate(item.createdAt) }}</span>
        </template>
        <template #[`item.rating`]="{ item, index }">
          {{ item.rating !== "" && item.rating !== null ? "Yes" : "No" }}
        </template>
        <template #[`item.statusName`]="{ item, index }">
          <span class="pa-2" style="
              color: white;
              background-color: #0172b9;
              border-radius: 5px;
            " v-if="item.statusId === 'SUBMITTED'">{{ item.statusName }}
            <v-icon color="white">{{ icons.mdiCheck }}</v-icon></span>
          <span class="pa-2" style="
              color: white;
              background-color: #ff7a00;
              border-radius: 5px;
            " v-if="item.statusId === 'PENDING'">{{ item.statusName }}
            <v-icon color="white">{{ icons.mdiCheck }}</v-icon></span>
          <span class="pa-2" style="
              color: white;
              background-color: #a11497;
              border-radius: 5px;
            " v-if="item.statusId === 'ASSIGNED'">{{ item.statusName }}
            <v-icon color="white">{{ icons.mdiCheck }}</v-icon></span>
          <span class="pa-2" style="
              color: white;
              background-color: #ec323f;
              border-radius: 5px;
            " v-if="item.statusId === 'LATE'">{{ item.statusName }}
            <v-icon color="white">{{ icons.mdiCheck }}</v-icon></span>
          <span class="pa-2" style="
              color: white;
              background-color: #adc43b;
              border-radius: 5px;
            " v-if="item.statusId === 'RESOLVED'">{{ item.statusName }}
            <v-icon color="white">{{ icons.mdiCheckAll }}</v-icon></span>
          <span class="pa-2" style="
              color: white;
              background-color: #0172b9;
              border-radius: 5px;
            " v-if="item.statusId === 'INPROGRESS'">{{ item.statusName }}
            <v-icon color="white">{{ icons.mdiCheck }}</v-icon></span>
        </template>
      </v-data-table>
    </v-row>
    <div class="ml-4 mb-4" style="display: flex; justify-content: space-between">
      <span style="font-weight: 700; align-self: center">Total Data : {{ totalItems }}</span>
      <v-pagination v-model="pages" :length="totalPage" @input="onPageChangeDetil" :total-visible="7"></v-pagination>
    </div>

    <HelpdeskFormModal :open="helpdeskModal" :datas="datas" @close="closeHelpdeskModal"></HelpdeskFormModal>
  </div>
</template>

<script>
import DatePicker from "vue2-datepicker";
import Swal from "sweetalert2";
import moment from "moment";
import HelpdeskFormModal from "./HelpdeskFormModal.vue";
import ItHelpDeskService from "@/services/ithelpdesk/itHelpDeskServices";
import CatalogService from "@/services/catalog/catalogServices";

import "vue2-datepicker/index.css";

const getTicket = ItHelpDeskService.build();
const catalogService = CatalogService.build();

import {
  mdiMagnify,
  mdiCheck,
  mdiCheckAll,
} from "@mdi/js";

export default {
  components: {
    HelpdeskFormModal,
    DatePicker,
  },
  props: {
    dataReq: String,
  },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      dateFormat: "DD-MM-YYYY",
      loading: false,
      helpdeskModal: false,
      datas: {},
      icons: {
        mdiMagnify,
        mdiCheck,
        mdiCheckAll,
      },
      startDate: null,
      endDate: null,
      headers: [
        { text: "Ticket Number", value: "number" },
        { text: "Date", value: "createdAt" },
        { text: "Title", value: "title" },
        { text: "PIC", value: "picName" },
        { text: "Service", value: "catalogName" },
        { text: "Location", value: "officeName" },
        { text: "Status", value: "statusName" },
      ],
      items: [],
      dataCatalog: [],
      keyword: null,
      catalogId: null,
      status: null,
    };
  },
  created() {
    this.getCatalog();
    this.getTicket(1);
  },
  watch: {
    startDate() {
      this.getTicket(1);
    },
    endDate() {
      this.getTicket(1);
    },
    catalogId() {
      this.getTicket(1);
    },
    keyword() {
      this.getTicket(1);
    },
  },
  methods: {
    formatDate(x) {
      return moment(x).format("DD-MM-YYYY");
    },
    disabledFromStartDate(date) {
      const today = new Date(this.startDate);
      today.setHours(0, 0, 0, 0);
      return date <= today - 1;
    },
    addTicket() {
      this.helpdeskModal = true;
    },
    closeHelpdeskModal(val) {
      this.helpdeskModal = false;
      this.getTicket(1);
      if (val) {
        this.$router.push(`/ithelpdesk/my-request/${val}`);
      }
    },
    async getCatalog() {
      const res = await catalogService.getAllOptions();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.dataCatalog = filter;
    },
    async getTicket(page) {
      this.loading = true;
      const param = {
        keyword: this.keyword,
        startDate:
          this.startDate !== null && this.startDate !== ""
            ? moment(this.startDate).format("YYYY-MM-DD")
            : null,
        endDate:
          this.endDate !== null && this.endDate !== ""
            ? moment(this.endDate).format("YYYY-MM-DD")
            : null,
        catalog: this.catalogId,
        status: this.status,
      };
      const res = await getTicket.getTicket(param);
      const data = res.data.data.content;
      this.items = data;

      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.totalItems = res.data.data.totalElements;
      this.loading = false;
    },
    async onPageChangeDetil(value) {
      await this.getTicket(value);
    },
    handleClick(value) {
      this.$router.push(`/ithelpdesk/my-request/${value.id}`);
    },
    errorPopup(val) {
      Swal.fire({
        title: "Failed",
        text: val,
        icon: "error",
        button: false,
        timer: 2000,
      });
    },
  },
};
</script>

<style scoped>
.btn-search {
  background-color: rgb(1, 114, 185) !important;
  color: white;
  text-transform: none;
  width: 100%;
}

.datetime-picker {
  width: 100%;
}

::v-deep .mx-input {
  height: 40px !important;
}
</style>