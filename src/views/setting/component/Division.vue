<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="10"
        ><span class="title-page">Department</span></v-col
      >
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-btn class="btn-submit" @click="createFaq"> Create Department </v-btn>
      </v-col>
    </v-row>
    <v-card class="mt-4">
      <v-card-text>
        <v-row>
          <!-- <v-col cols="12" sm="6" md="4" lg="3">
            <v-select
              dense
              v-model="service"
              outlined
              label="Division Name"
              :items="[
                'California',
                'Colorado',
                'Florida',
                'Georgia',
                'Texas',
                'Wyoming',
              ]"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="6">
            <v-text-field
              dense
              v-model="service"
              outlined
              label="Deskription"
            ></v-text-field>
          </v-col> -->
          <v-col cols="12" sm="6" md="4" lg="12">
            <v-text-field
              dense
              v-model="search"
              outlined
              :append-icon="icons.mdiMagnify"
              label="Search by Department Name"
            ></v-text-field>
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
          :footer-props="{
            'items-per-page-options': [5, 10, 25],
            'items-per-page-text': 'Items per page:',
            'show-current-page': true,
            'show-first-last-page': true,
          }"
        >
          <template #[`item.noTicket`]="{ item, index }">
            <div
              :style="{ 'background-color': item.noTicket }"
              style="height: 20px; width: 20px; background-color: #101010"
            ></div>
          </template>
          <template #[`item.color`]="{ item, index }">
            <div
              :style="{ 'background-color': item.color }"
              style="height: 20px; width: 20px; background-color: #101010"
            ></div>
          </template>
          <template #[`item.colorSecondary`]="{ item, index }">
            <div
              :style="{ 'background-color': item.colorSecondary }"
              style="height: 20px; width: 20px; background-color: #101010"
            ></div>
          </template>
          <template #[`item.aksi`]="{ item, index }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  class="mr-6"
                  v-bind="attrs"
                  v-on="on"
                  size="20"
                  style="color: blue"
                  v-on:click.stop="handleClick(item)"
                >
                  {{ icons.mdiPencilOutline }}
                </v-icon>
              </template>
              <span>Edit</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                  size="20"
                  style="color: blue"
                  v-on:click.stop="deleteConfirm(item.id)"
                >
                  {{ icons.mdiTrashCanOutline }}
                </v-icon></template
              ><span>Delete</span></v-tooltip
            >
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
    <CreateDivision
      :open="openModalFaq"
      :datas="datas"
      @clicked="closeModal"
    ></CreateDivision>
  </div>
</template>
<script>
import Swal from "sweetalert2";
import {
  mdiChevronRight,
  mdiTrashCanOutline,
  mdiMagnify,
  mdiPencilOutline,
} from "@mdi/js";
import CreateDivision from "./CreateDivisionFormModal.vue";
import DivisionService from "../../../services/management/division/divisionServices";

const getDiv = DivisionService.build();
export default {
  components: {
    CreateDivision,
  },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      datas: {},
      myloadingvariable: true,
      openModalFaq: false,
      selectedTab: 0,
      tabs: ["Eksternal", "Internal"],
      icons: {
        mdiMagnify,
        mdiTrashCanOutline,
        mdiChevronRight,
        mdiPencilOutline,
      },
      item: 0,
      headers: [
        { text: "Department Name", value: "name" },
        { text: "Position", value: "position" },
        { text: "Yeaster Member ID", value: "yeastarMemberId" },
        { text: "Yeaster User ID", value: "yeastarUserId" },
        { text: "Foreground Color", value: "color" },
        { text: "Background Color", value: "colorSecondary" },
        { text: "Description", value: "description" },
        { text: "Action", value: "aksi" },
      ],
      items: [],
      listItems: [
        {
          id: 0,
          text: "PC / Laptop",
          subtitle: "Description 1",
          image: require("../../../assets/images/icons/catalog.png"),
        },
        {
          id: 1,
          text: "My Request",
          subtitle: "Description 2",
          image: require("../../../assets/images/icons/request.png"),
        },
        {
          id: 2,
          text: "Faq",
          subtitle: "Description 2",
          image: require("../../../assets/images/icons/faq.png"),
        },
      ],
      faqItems: [
        {
          question: "What is your product about?",
          answer: "Your answer goes here.",
        },
        {
          question: "How can I contact support?",
          answer: "Your answer goes here.",
        },
      ],
      search: "",
    };
  },
  created() {
    this.getDivision(1);
  },
  watch: {
    search() {
      this.getDivision(1);
    },
  },
  methods: {
    handleClick(x) {
      this.datas = x;
      this.openModalFaq = true;
    },
    async deleteConfirm(x) {
      Swal.fire({
        icon: "warning",
        title: "Delete",
        text: "Are you sure you deleted this data?",
        showCancelButton: true,
        buttons: {
          cancel: false,
          confirm: true,
        },
        closeOnEsc: false,
        closeOnClickOutside: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteData(x);
        } else {
          return false;
        }
      });
    },
    async deleteData(param) {
      const res = await getDiv.deleteDivision(param);
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
            this.getDivision(1);
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
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
            this.getRegulation();
          }
        });
      }
    },
    closeModal() {
      this.openModalFaq = false;
      this.datas = {};
      this.onPageChangeDetil(1);
    },
    async getDivision(x) {
      const param = {
        size: this.itemsPerpage,
        name: this.search,
        page: x - 1,
      };
      const res = await getDiv.getDivision(param);
      const data = res.data.data.content;
      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.pages = x;
      this.totalItems = res.data.data.totalElements;
      this.myloadingvariable = false;
      this.items = data;
    },
    async onPageChangeDetil(value) {
      await this.getDivision(value);
    },
    createFaq() {
      this.openModalFaq = true;
    },
    detailPage(x) {
      switch (x) {
        case 0:
          this.faqItems = [
            {
              question: "What is your product about?",
              answer: "Your answer goes here.",
            },
            {
              question: "How can I contact support?",
              answer: "Your answer goes here.",
            },
          ];
          break;
        case 1:
          this.faqItems = [
            {
              question: "kedua",
              answer: "Your answer goes here.",
            },
            {
              question: "Kedua",
              answer: "Your answer goes here.",
            },
          ];
          break;
        case 2:
          this.faqItems = [
            {
              question: "Ketiga",
              answer: "Your answer goes here.",
            },
            {
              question: "Ketiga",
              answer: "Your answer goes here.",
            },
          ];
          break;
        default:
          break;
      }
    },
  },
};
</script>
<style scope>
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
}
.title-page {
  font-weight: bold;
  color: #101010;
}
</style>
