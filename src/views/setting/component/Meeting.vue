<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="10"><span class="title-page">Meeting Room</span></v-col>
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-btn class="btn-submit" @click="add"> Create Meeting Room </v-btn>
      </v-col>
    </v-row>
    <v-card class="mt-4 mb-4">
      <v-card-text>
        <v-row>
          <v-col v-for="(item, id) in dataSummary" :key="id" cols="12" sm="6" md="4" lg="3">
            <v-card class="detail-info progress-ticket">
              <v-card-text style="text-align: center">
                <v-row>
                  <v-col cols="2" style="align-self: center">
                    <v-icon class="mb-4" style="color: white">{{
                      icons.mdiOfficeBuildingOutline
                    }}</v-icon>
                  </v-col>
                  <v-col cols="10">
                    <span style="display: -webkit-inline-box; color: white">{{ item.nameOffice }}
                    </span>
                    <br />
                    <p style="
                        font-weight: bold;
                        font-size: x-large;
                        color: white;
                      ">
                      {{ item.totalRoom }}
                      <span style="font-size: large">Ruang</span>
                    </p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card class="mt-4 mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="12">
            <v-text-field dense clearable v-model="search" outlined :append-icon="icons.mdiMagnify"
              label="Search by Room Name"></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text>
        <v-data-table hide-default-footer style="width: 100%" :loading="myloadingvariable" :headers="headers"
          :items="items" :footer-props="{
            'items-per-page-options': [5, 10, 25],
            'items-per-page-text': 'Items per page:',
            'show-current-page': true,
            'show-first-last-page': true,
          }">
          <template #[`item.aksi`]="{ item, index }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon class="mr-6" v-bind="attrs" v-on="on" size="20" style="color: blue"
                  v-on:click.stop="handleClick(item)">
                  {{ icons.mdiPencilOutline }}
                </v-icon>
              </template>
              <span>Edit</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on" size="20" style="color: blue" v-on:click.stop="deleteConfirm(item.id)">
                  {{ icons.mdiTrashCanOutline }}
                </v-icon></template><span>Delete</span></v-tooltip>
          </template>
        </v-data-table>
        <div class="ml-4" style="display: flex; justify-content: space-between">
          <span style="font-weight: 700; align-self: center">Total Data : {{ totalItems }}</span>
          <v-pagination v-model="pages" :length="totalPage" @input="onPageChangeDetil"
            :total-visible="7"></v-pagination>
        </div>
      </v-card-text>
    </v-card>
    <CreateMeeting :item="datas" :open="openModal" @close="closeModal"></CreateMeeting>
  </div>
</template>
<script>
import {
  mdiChevronRight,
  mdiTrashCanOutline,
  mdiMagnify,
  mdiPencilOutline,
  mdiOfficeBuildingOutline,
} from "@mdi/js";
import Swal from "sweetalert2";
import CreateMeeting from "./CreateMeetingFormModal.vue";
import OfficeService from "../../../services/management/office/officeLocationServices";
import MeetingRoomService from "../../../services/management/meeting_room/meetingRoomServices";

const officeService = OfficeService.build();
const meetingRoomService = MeetingRoomService.build();
export default {
  components: {
    CreateMeeting,
  },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      datas: {},
      roomData: "",
      officeData: "",
      capacity: "",
      search: "",
      myloadingvariable: true,
      openModal: false,
      officeFilter: "",
      capacityFilter: "",
      keywords: "",
      dataSummary: [],
      locationOptions: [],
      officeOptions: [],
      dataCapacity: [],
      icons: {
        mdiOfficeBuildingOutline,
        mdiPencilOutline,
        mdiMagnify,
        mdiTrashCanOutline,
        mdiChevronRight,
      },
      itemSelected: null,
      headers: [
        { text: "Meeting Room", value: "name" },
        { text: "Office Location", value: "officeName" },
        { text: "Room Capacity", value: "capacity" },
        { text: "Yeaster ID", value: "yeastarId" },
        { text: "Description", value: "description" },
        { text: "Action", value: "aksi" },
      ],
      items: [],
    };
  },
  created() {
    this.getMeetingRoom(1);
    this.getMeetingSummary();
  },
  watch: {
    search() {
      this.getMeetingRoom(1);
    },
  },
  methods: {
    async getMeetingSummary() {
      const res = await meetingRoomService.getMeetingSummary();
      this.dataSummary = res.data.data;
    },
    handleClick(x) {
      this.datas = x;
      this.openModal = true;
    },
    closeModal() {
      this.openModal = false;
      this.datas = {};
      this.getMeetingRoom(1);
    },
    add() {
      this.datas = {};
      this.openModal = true;
    },
    edit(item) {
      this.itemSelected = item;
      this.openModal = true;
    },
    async getMeetingRoom(x) {
      const param = {
        name: this.search,
        size: this.itemsPerpage,
        sort: "DESC",
        page: x - 1,
      };
      const res = await meetingRoomService.getAll(param);
      const data = res.data.data;
      this.items = data.content;
      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.pages = x;
      this.totalItems = res.data.data.totalElements;
      this.myloadingvariable = false;
    },
    async onPageChangeDetil(value) {
      await this.getMeetingRoom(value);
    },
    async deleteConfirm(id) {
      Swal.fire({
        icon: "warning",
        title: "Delete",
        text: "Are you sure you deleted this data?",
        showCancelButton: true,
        showConfirmButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.delete(id);
        } else {
          return false;
        }
      });
    },
    async delete(id) {
      const res = await meetingRoomService.delete(id);
      if (res.data.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.message,
          showCancelButton: false,
          showConfirmButton: true,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((result) => {
          if (result) {
            this.loading = false;
            this.getMeetingRoom(1);
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res.data.message,
          showCancelButton: false,
          showConfirmButton: true,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((result) => {
          if (result) {
            this.loading = false;
          }
        });
      }
    },
    async getLocationOptions() {
      const multiplesOf100 = [];

      for (let i = 100; i <= 10000; i += 100) {
        multiplesOf100.push(i);
      }
      this.dataCapacity = multiplesOf100;
      const res = await meetingRoomService.getLocation();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.locationOptions = filter;
    },
    async getOfficeOptions() {
      const res = await meetingRoomService.getOptions();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.officeOptions = filter;
    },
    closeModal() {
      this.openModal = false;
      this.itemSelected = null;
      this.onPageChangeDetil(1);
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

detail-info {
  text-align: center;
  cursor: pointer;
}

.all-ticket {
  background-color: #9a9a9a;
  color: white;
}

.assigned-ticket {
  background-color: #a11497;
}

.progress-ticket {
  background-color: #0172b9;
}
</style>
