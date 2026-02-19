<template>
  <div>
    <v-card v-if="isList">
      <v-card-title>
        <v-row align="center">
          <v-col cols="12" sm="10" md="10" lg="10">
            <v-text-field
              dense
              clearable
              v-model="keyword"
              outlined
              :append-icon="icons.mdiMagnify"
              label="Catalog"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="2" md="2" lg="2">
            <v-btn class="btn-submit" @click="createCatalog">CREATE</v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-data-table
          hide-default-footer
          style="width: 100%"
          :loading="myloadingvariable"
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
          <template #[`item.logo`]="{ item, index }">
            <img
              style="width: 40px"
              v-if="item.imageUrl !== null"
              :src="baseUrl + item.imageUrl"
            />
          </template>
          <template #[`item.slaDays`]="{ item, index }">
            <span>{{ item.slaDays }} Days</span>
          </template>
          <template #[`item.slaHours`]="{ item, index }">
            <span>{{ item.slaHours }} Hours</span>
          </template>
          <template #[`item.aksi`]="{ item, index }">
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
    <v-card style="padding: 3%" v-else>
      <PageAddCatalog :isEdit="isEdit" :datas="datas" @clicked="onClickChild" />
    </v-card>
    <HelpdeskFormModal
      :open="openModal"
      @close="openModal = false"
    ></HelpdeskFormModal>
    <CreateCatalog :open="openModalCatalog" @close="closeModal"></CreateCatalog>
  </div>
</template>
<script>
import Swal from "sweetalert2";
import { mdiChevronRight, mdiTrashCanOutline, mdiMagnify } from "@mdi/js";
import ItHelpDeskService from "../../../services/ithelpdesk/itHelpDeskServices";
import CreateCatalog from "./CreateCatalogFormModal.vue";
import HelpdeskFormModal from "./HelpdeskFormModal.vue";
import PageAddCatalog from "./PageAddCatalog.vue";

const getHelpDesk = ItHelpDeskService.build();
export default {
  components: {
    HelpdeskFormModal,
    CreateCatalog,
    PageAddCatalog,
  },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      baseUrl: process.env.VUE_APP_PERTAGAS,
      isList: true,
      myloadingvariable: true,
      icons: {
        mdiMagnify,
        mdiTrashCanOutline,
        mdiChevronRight,
      },
      headers: [
        { text: "Catalog", value: "name" },
        // { text: "Lokasi Kantor", value: "officeLocationName" },
        { text: "Logo", value: "logo" },
        { text: "SLA Days", value: "slaDays" },
        { text: "SLA Hours", value: "slaHours" },
        { text: "Action", value: "aksi" },
      ],
      items: [],
      isEdit: false,
      datas: {},
      totalPages: 0,
      totalElements: 0,
      last: true,
      search: "",
      first: true,
      numberOfElements: 0,
      size: 20,
      number: 0,
      keyword: null,
      officeData: "",
      locationOptions: [],
      openModalCatalog: false,
      openModal: false,
      dataCatalog: [],
    };
  },
  created() {
    this.getHelpDesk(1);
    this.getLocations();
  },

  watch: {
    keyword() {
      this.getHelpDesk(1);
    },
  },

  methods: {
    async deleteConfirm(id) {
      Swal.fire({
        icon: "warning",
        title: "Delete",
        text: "Are you sure you want to delete this data?",
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
      const res = await getHelpDesk.deleteHelpDesk(id);
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
            this.getHelpDesk(1);
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
    onClickChild() {
      this.isList = true;
      this.getHelpDesk(1);
    },
    async getLocations() {
      const res = await getHelpDesk.getLocation();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.locationOptions = filter;
    },
    handleClick(x) {
      this.isEdit = true;
      this.datas = x;
      this.isList = false;
    },
    async getHelpDesk(x) {
      const param = {
        keyword: this.keyword,
        size: this.itemsPerpage,
        page: x - 1,
      };
      const res = await getHelpDesk.getHelpDeskPage(param);
      const data = res.data.data;
      this.items = data.content;
      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.totalItems = res.data.data.totalElements;
      this.myloadingvariable = false;
    },
    async onPageChangeDetil(value) {
      await this.getHelpDesk(value);
    },
    createCatalog() {
      this.openModalCatalog = true;
      // this.isList = false;
    },
    openForm(id) {
      if (id) {
      }

      this.openModal = true;
    },
    closeModal() {
      this.items = [];
      this.openModalCatalog = false;
      this.getHelpDesk(1);
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
</style>
