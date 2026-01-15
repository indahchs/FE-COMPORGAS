<template>
  <div>
    <v-card>
      <v-card-text>
        <v-row>
          <v-col
            style="cursor: pointer"
            @click="goBack"
            cols="12"
            sm="6"
            md="4"
            lg="2"
          >
            <!-- <v-btn icon @click="goBack"> -->
            <v-icon class="mr-2" color="black">
              {{ icons.mdiArrowLeft }}
            </v-icon>
            <span style="color: #101010; font-weight: bold">{{
              !isSecre ? "MY EVENT REQUESTS" : "APPROVAL EVENT"
            }}</span>
            <!-- </v-btn> -->
          </v-col>
          <v-col cols="12" sm="6" md="5" lg="5">
            <!-- <v-text-field
              dense
              :append-icon="icons.mdiMagnify"
              v-model="searchFind"
              outlined
              label="Search"
            ></v-text-field> -->
          </v-col>
          <v-col cols="12" sm="6" md="2" lg="2">
            <v-select
              dense
              v-model="locatioFind"
              outlined
              label="Event Category"
              :items="eventItem"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2" lg="2">
            <v-select
              dense
              v-model="roomFind"
              outlined
              label="Department"
              :items="divisionItem"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="1" lg="1">
            <v-btn class="btn-submit" @click="createEvent" depressed>
              Create Event
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text>
        <v-data-table
          hide-default-footer
          :loading="myloadingvariable"
          style="width: 100%"
          :headers="headers"
          :items="items"
          @click:row="handleClick"
          :footer-props="{
            'items-per-page-options': [5, 10, 25],
            'items-per-page-text': 'Items per page:',
            'show-current-page': true,
            'show-first-last-page': true,
          }"
        >
          <template #[`item.startDate`]="{ item, index }">{{
            formatDate(item.startDate)
          }}</template>
          <template #[`item.endDate`]="{ item, index }">{{
            formatDate(item.endDate)
          }}</template>
          <template #[`item.startTime`]="{ item, index }"
            >{{ item.startTime }} - {{ item.endTime }}</template
          >
          <template #[`item.statusId`]="{ item, index }">
            <v-chip
              v-if="item.statusId !== 'SUBMITTED' && isSekre"
              :append-icon="icons.mdiCheck"
              class="label-approved"
              :color="getColor(item.statusId)"
              label
            >
              {{ item.statusName }}
              <v-icon class="icon-pos" color="white" end>{{
                icons.mdiCheck
              }}</v-icon>
            </v-chip>
            <v-btn
              v-on:click.stop="approveConfirm(item)"
              v-if="item.statusId === 'SUBMITTED' && isSekre"
              class="btn-approve mr-1"
              >Approve</v-btn
            >
            <v-btn
              style="float: right"
              v-if="item.statusId === 'SUBMITTED' && isSekre"
              v-on:click.stop="reject(item)"
              class="btn-reject"
              >Reject</v-btn
            >
            <v-chip
              v-if="!isSekre"
              :append-icon="icons.mdiCheck"
              class="label-approved"
              :color="getColor(item.statusId)"
              label
            >
              {{ item.statusName }}
              <v-icon class="icon-pos" color="white" end>{{
                icons.mdiCheck
              }}</v-icon>
            </v-chip>
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
    <EventDetailModal
      :datas="datas"
      :isEdit="isEdit"
      :open="openModal"
      @clicked="closeModal"
    />
    <RejectModal
      :datasReject="datasReject"
      :open="openModalReject"
      @clicked="closeModalReject"
    ></RejectModal>
    <CreateEventFormModal
      :open="openModalForm"
      @clicked="closeModalForm"
    ></CreateEventFormModal>
  </div>
</template>
<script>
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { mdiArrowLeft, mdiMagnify, mdiCheck } from "@mdi/js";
import moment from "moment";
import EventService from "@/services/events/eventsServices";
import EventDetailModal from "./EventDetailModal.vue";
import RejectModal from "./RejectModal.vue";
import CreateEventFormModal from "./EventFormModal.vue";
const getEvent = EventService.build();
export default {
  component: { EventDetailModal },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      isSecre: false,
      openModalForm: false,
      openModalReject: false,
      locatioFind: "",
      roomFind: "",
      myloadingvariable: false,
      openModal: false,
      isEdit: false,
      datasReject: {},
      eventItem: [],
      divisionItem: [],
      isUser: false,
      isSekre: false,
      datas: {},
      items: [],
      headers: [
        { text: "Start Date", value: "startDate" },
        { text: "End Date", value: "endDate" },
        { text: "Time", value: "startTime" },
        { text: "Event Name", value: "name" },
        { text: "Event Category", value: "categoryEventName" },
        { text: "Event Location", value: "location" },
        { text: "Department", value: "divisionName" },
        { text: "Status", value: "statusId" },
      ],
      icons: {
        mdiCheck,
        mdiMagnify,
        mdiArrowLeft,
      },
    };
  },
  created() {
    this.getEvent(1);
    this.categoryEvent();
    this.getDivision();
  },
  watch: {
    locatioFind() {
      this.getEvent(1);
    },
    roomFind() {
      this.getEvent(1);
    },
  },
  methods: {
    reset() {
      this.locatioFind = "";
      this.roomFind = "";
      this.getEvent(1);
    },
    getColor(x) {
      if (x === "SUBMITTED") {
        return "#9A9A9A";
      } else if (x === "APPROVED") {
        return "#0172B9";
      } else if (x === "REJECTED") {
        return "#EC323F";
      } else if (x === "CANCELED") {
        return "#EC323F";
      } else {
        return "#ADC43B";
      }
    },
    closeModalForm() {
      this.openModalForm = false;
      this.getEvent(1);
    },
    createEvent() {
      this.openModalForm = true;
    },
    async categoryEvent() {
      const res = await getEvent.getEventsOpt();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.eventItem = filter;
    },
    async getDivision() {
      const res = await getEvent.getEventsDivision();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.divisionItem = filter;
    },
    formatDate(x) {
      return moment(x).format("DD-MM-YYYY");
    },
    reject(x) {
      this.datasReject = x;
      this.openModalReject = true;
    },
    approveConfirm(x) {
      Swal.fire({
        icon: "warning",
        title: "Approval",
        text: "Are you sure you want to approve this event?",
        showCancelButton: true,
        showConfirmButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.approve(x);
        } else {
          return false;
        }
      });
    },
    async approve(x) {
      const res = await getEvent.approveEvents(x.id);
      if (res.data.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.message,
          buttons: {
            cancel: false,
            confirm: true,
          },
          closeOnEsc: false,
          closeOnClickOutside: false,
        }).then((result) => {
          if (result) {
            this.loading = false;
            this.getEvent(1);
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text:
            res.data.errors !== null
              ? res.data.errors[0].message
              : res.data.message,
          buttons: {
            cancel: false,
            confirm: true,
          },
          closeOnEsc: false,
          closeOnClickOutside: false,
        }).then((result) => {
          if (result) {
            this.loading = false;
            this.getEvent(1);
          }
        });
      }
    },
    searchData() {},
    closeModalReject() {
      this.openModalReject = false;
      this.getEvent(1);
    },
    closeModal() {
      this.openModal = false;
      this.isEdit = false;
      this.datas = {};
      this.onPageChangeDetil(1);
    },
    handleClick(x) {
      this.openModal = true;
      this.isEdit = true;
      this.datas = x;
    },
    async getEvent(x) {
      const role = JSON.parse(localStorage.getItem("dataUser"));
      this.isSecre = role.roleId === "SEKRETARIS" ? true : false;
      this.myloadingvariable = true;
      const param = {
        size: this.itemsPerpage,
        sort: "DESC",
        page: x - 1,
      };
      if (this.locatioFind !== "") {
        param.categoryEventId = this.locatioFind;
      }
      if (this.roomFind !== "") {
        param.divisionId = this.roomFind;
      }
      const res = await getEvent.getMyEvents(param);
      const data = res.data.data.content;
      const user = JSON.parse(localStorage.getItem("dataUser"));
      this.isUser = user.roleId === "USER" ? true : false;
      this.isSekre =
        user.roleId === "SEKRETARIS" || user.roleId === "SUPER" ? true : false;
      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.totalItems = res.data.data.totalElements;
      this.myloadingvariable = false;
      this.items = data;
      this.pages = x;
    },
    async onPageChangeDetil(value) {
      await this.getEvent(value);
    },
    goBack() {
      this.$router.push("events").catch(() => {});
    },
  },
  components: { EventDetailModal, RejectModal, CreateEventFormModal },
};
</script>
<style scoped>
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
}
.btn-reject {
  color: white !important;
  background-color: #ec323f !important;
  width: 48%;
}
.btn-approve {
  color: white !important;
  background-color: #0172b9 !important;
  width: 48%;
}
.label-approved {
  width: 100%;
}
.icon-pos {
  float: right;
}
::v-deep .v-chip .v-chip__content {
  display: block !important;
  width: 100% !important;
  margin-top: 10px;
}
::v-deep
  .theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr:last-child
  > th {
  font-size: 16px !important;
}
</style>
