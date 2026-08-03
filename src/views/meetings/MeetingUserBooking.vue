<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-row align="center">
              <v-col cols="12" sm="6" md="4" lg="4">
                <div
                  style="
                    font-size: 16px;
                    line-height: 24px;
                    font-weight: 600;
                    color: #101010;
                    cursor: pointer;
                  "
                  @click="goBack()"
                >
                  <v-icon>{{ icons.mdiChevronLeft }}</v-icon>
                  {{ isSupported ? "APPROVAL MEETING" : "MY BOOKING" }}
                </div>
              </v-col>
              <!-- <v-spacer></v-spacer> -->
              <v-col cols="12" sm="6" md="4" lg="2">
                <!-- <v-text-field
                  label="Search"
                  dense
                  v-model="search"
                  outlined
                  hide-details
                  :append-icon="icons.mdiMagnify"
                ></v-text-field> -->
              </v-col>
              <v-col cols="12" sm="6" md="6" lg="2">
                <v-autocomplete
                  hide-details
                  dense
                  v-model="officeId"
                  :items="offices"
                  outlined
                  label="Office"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6" md="6" lg="2">
                <v-autocomplete
                  hide-details
                  dense
                  v-model="roomId"
                  :items="rooms"
                  outlined
                  label="Room"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="1">
                <v-btn depressed class="btn-blue" @click="resetFilter"
                  >RESET
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="1">
                <v-btn depressed class="btn-blue" @click="addBook"
                  >BOOK ROOM
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-card class="table-card">
              <v-data-table
                :loading="myloadingvariable"
                style="width: 100%"
                :headers="headers"
                :items="items"
                @click:row="handleClick"
                hide-default-footer
                :footer-props="{
                  'items-per-page-options': [5, 10, 25],
                  'items-per-page-text': 'Items per page:',
                  'show-current-page': true,
                  'show-first-last-page': true,
                }"
              >
                <template #[`item.startDate`]="{ item, index }">
                  {{ formatDate(item.startDate) }}</template
                >
                <template #[`item.endDate`]="{ item, index }"
                  >{{ formatDate(item.endDate) }}
                </template>
                <template #[`item.startTime`]="{ item, index }"
                  >{{ item.startTime }} - {{ item.endTime }}</template
                >
                <template #[`item.statusName`]="{ item, index }">
                  <v-chip
                    v-if="
                      item.statusId !== 'SUBMITTED' &&
                      item.statusId !== 'CANCELED' &&
                      isSekre
                    "
                    class="label-approved"
                    :color="item.statusColor"
                    label
                  >
                    {{ item.statusName }}
                    <v-icon class="icon-pos" color="white" end>{{
                      icons.mdiCheck
                    }}</v-icon>
                  </v-chip>
                  <v-chip
                    v-if="item.statusId === 'CANCELED' && isSekre"
                    class="btn-reject label-approved"
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
                    class="btn-approve"
                    >Approve</v-btn
                  >
                  <v-btn
                    style="float: right"
                    v-on:click.stop="reject(item)"
                    v-if="item.statusId === 'SUBMITTED' && isSekre"
                    class="btn-reject"
                    >Reject</v-btn
                  >
                  <v-chip
                    v-if="!isSekre"
                    class="label-approved"
                    :color="item.statusColor"
                    label
                  >
                    {{ item.statusName }}
                    <v-icon class="icon-pos" color="white" end>{{
                      icons.mdiCheck
                    }}</v-icon>
                  </v-chip>
                </template></v-data-table
              >
              <div
                class="ml-4"
                style="display: flex; justify-content: space-between"
              >
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
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <AddMeeting
      v-if="openModals"
      :open="openModals"
      :addDatas="addDatas"
      :isEdit="isEdit"
      @clicked="closeModal"
    ></AddMeeting>
    <RejectModal
      :open="openModalsRej"
      :datasReject="datasReject"
      @clicked="closeModalRej"
    ></RejectModal>
  </div>
</template>
<script>
import moment from "moment";
import Swal from "sweetalert2";
import { mdiMagnify, mdiChevronLeft, mdiCheck } from "@mdi/js";

import RejectModal from "./component/RejectModal.vue";
import AddMeeting from "./component/AddMeetingModal";
import MeetingRoomService from "@/services/management/meeting_room/meetingRoomServices";
const getMeeting = MeetingRoomService.build();
export default {
  components: { AddMeeting, RejectModal },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      isSupported: false,
      addDatas: {},
      isEdit: false,
      datasReject: {},
      openModalsRej: false,
      isSekre: false,
      openModals: false,
      myloadingvariable: false,
      itemsPerPage: 10,
      pagination: {
        page: 1, // Current page
        rowsPerPage: 10, // Items per page
      },
      totalItems: 0, // Total number of items from the server
      icons: {
        mdiMagnify,
        mdiChevronLeft,
        mdiCheck,
      },
      offices: [],
      rooms: [],
      officeId: "",
      roomId: "",
      headers: [
        {
          text: "Start Date",
          value: "startDate",
          align: "center",
        },
        {
          text: "End Date",
          value: "endDate",
          align: "center",
        },
        {
          text: "Time",
          value: "startTime",
          align: "center",
        },
        {
          text: "Meeting Title",
          value: "title",
          align: "center",
        },
        {
          text: "Meeting Room",
          value: "roomName",
          align: "center",
        },
        {
          text: "Office Location",
          value: "officeName",
          align: "center",
        },
        {
          text: "Status",
          value: "statusName",
        },
      ],
      items: [],
    };
  },
  watch: {
    officeId() {
      this.getOptMeetingRoom();
      this.getMeeting(1);
    },
    roomId() {
      this.getMeeting(1);
    },
  },
  created() {
    this.getMeeting(1);
    // this.getOptMeeting();
    this.getOptLocation();
  },
  methods: {
    resetFilter() {
      this.officeId = "";
      this.roomId = "";
    },
    formatDate(date) {
      return moment(date).format("DD-MM-YYYY");
    },
    handleClick(x) {
      this.isEdit = false;
      this.addDatas = x;
      this.openModals = true;
    },
    reject(x) {
      this.datasReject = x;
      this.openModalsRej = true;
    },
    approveConfirm(x) {
      Swal.fire({
        icon: "warning",
        title: "Approval",
        text: "Are you sure you want to approve this meeting?",
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
      const res = await getMeeting.approveMeeting(x.id);
      if (res.data.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.message,
          buttons: {
            cancel: false,
            confirm: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
          },
          closeOnEsc: false,
          closeOnClickOutside: false,
        }).then((result) => {
          if (result) {
            this.loading = false;
            this.getMeeting(1);
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
            this.getMeeting(1);
          }
        });
      }
    },

    addBook() {
      this.openModals = true;
      this.isEdit = true;
    },
    closeModal() {
      this.openModals = false;
      this.getMeeting(1);
    },
    closeModalRej() {
      this.openModalsRej = false;
      this.getMeeting(1);
    },
    async getMeeting(x) {
      const role = JSON.parse(localStorage.getItem("dataUser"));
      const roleStatus =
        role.roleId === "GS" || role.roleId === "SUPER" ? true : false;
      this.isSupported = roleStatus;
      var param = {
        size: this.itemsPerPage,
        page: x - 1,
      };
      if (this.roomId !== "") {
        param.meetingRoomId = this.roomId;
      }
      if (this.officeId !== "") {
        param.officeLocationId = this.officeId;
      }
      const res = roleStatus
        ? await getMeeting.getMeetingById(param)
        : await getMeeting.getMeetingById(param);
      const data = roleStatus ? res.data.data.content : res.data.data.content;
      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.totalItems = res.data.data.totalElements;
      this.isSekre = roleStatus;
      this.items = data;
    },
    async onPageChangeDetil(value) {
      await this.getMeeting(value);
    },
    async getOptMeetingRoom() {
      const res = await getMeeting.getRoomById(this.officeId);
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.id,
        text: project.name,
      }));
      this.rooms = filter;
    },
    async getOptLocation() {
      const res = await getMeeting.getLocation();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.offices = filter;
    },
    goBack() {
      this.$router.push("meetings").catch(() => {});
    },
  },
};
</script>
<style scoped>
.btn-blue {
  width: 100%;
  background-color: rgb(1, 114, 185) !important;
  color: white;
  text-transform: none;
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
.table-card {
  border: 1px solid #e0e0e0;
  border-radius: 0px;
  box-shadow: none !important;
}
.label-approved {
  width: 100%;
}
::v-deep .v-data-table th {
  font-size: 14px !important;
}
.icon-pos {
  float: right;
}
::v-deep .v-chip .v-chip__content {
  display: block !important;
  width: 100% !important;
  margin-top: 10px;
}
</style>
