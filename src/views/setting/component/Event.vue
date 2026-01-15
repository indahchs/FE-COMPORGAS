<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="9"
        ><span class="title-page">Event Category</span></v-col
      >
      <v-col cols="12" sm="6" md="4" lg="3">
        <v-btn class="btn-submit" @click="add"> Create Event Category </v-btn>
      </v-col>
    </v-row>
    <v-card class="mt-4">
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              dense
              v-model="param.keywords"
              outlined
              :append-icon="icons.mdiMagnify"
              label="Search by Event Category"
            ></v-text-field>
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
                  v-on:click.stop="edit(item)"
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
    <CreateEvent
      :open="openModal"
      :item="itemSelected"
      @close="closeModal"
    ></CreateEvent>
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
import CreateEvent from "./CreateEventFormModal.vue";
import EventCategoryService from "../../../services/management/event_category/eventCategoryServices";

const eventCategoryService = EventCategoryService.build();

export default {
  components: {
    CreateEvent,
  },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      myloadingvariable: true,
      openModal: false,

      icons: {
        mdiMagnify,
        mdiTrashCanOutline,
        mdiChevronRight,
        mdiPencilOutline,
      },
      headers: [
        { text: "Category Name", value: "name" },
        { text: "Description", value: "description" },
        { text: "Foreground Color", value: "color" },
        { text: "Background Color", value: "colorSecondary" },
        { text: "Action", value: "aksi" },
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
      param: {
        keywords: "",
        page: 0,
        size: 0,
        sort: "",
      },
    };
  },
  created() {
    this.getEventCategory(1);
  },
  watch: {
    "param.keywords"() {
      this.getEventCategory(1);
    },
  },
  methods: {
    add() {
      this.itemSelected = null;
      this.openModal = true;
    },
    edit(item) {
      this.itemSelected = item;
      this.openModal = true;
    },
    async getEventCategory(x) {
      const param = {
        size: this.itemsPerpage,
        name: this.param.keywords,
        page: x - 1,
      };
      const res = await eventCategoryService.getAll(param);
      const data = res.data.data;

      this.nameItems = this.items.map((a) => a.name);

      this.myloadingvariable = false;
      this.items = data.content;
      this.last = data.last;
      this.first = data.first;
      this.numberOfElements = data.numberOfElements;
      this.size = data.size;
      this.number = data.number;
      this.empty = data.empty;
      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.pages = x;
      this.totalItems = res.data.data.totalElements;
    },
    async onPageChangeDetil(value) {
      await this.getEventCategory(value);
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
      const res = await eventCategoryService.delete(id);
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
            this.getEventCategory(1);
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
    closeModal() {
      this.openModal = false;
      this.itemSelected = null;
      this.onPageChangeDetil(1);
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
