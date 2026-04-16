<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="10">
        <span class="title-page">Role</span>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="2" v-if="isSuperRole">
        <v-btn class="btn-submit" @click="createRole"> Create Role </v-btn>
      </v-col>
    </v-row>
    <v-card class="mt-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="12">
            <v-text-field
              dense
              :append-icon="icons.mdiMagnify"
              v-model="search"
              outlined
              label="Search by Role Name"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text>
        <v-data-table
          hide-default-footer
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
          <template #[`item.aksi`]="{ item }">
            <template v-if="isSuperRole">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="mr-6"
                    v-bind="attrs"
                    v-on="on"
                    size="20"
                    style="color: blue"
                    @click="handleClick(item)"
                  >{{ icons.mdiPencilOutline }}</v-icon>
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
                    @click="deleteConfirm(item.id)"
                  >{{ icons.mdiTrashCanOutline }}</v-icon>
                </template>
                <span>Delete</span>
              </v-tooltip>
            </template>
            <span v-else>-</span>
          </template>
        </v-data-table>
        <div class="ml-4" style="display: flex; justify-content: space-between">
          <span style="font-weight: 700; align-self: center">
            Total Data : {{ totalItems }}
          </span>
          <v-pagination
            v-model="pages"
            :length="totalPage"
            @input="onPageChangeDetil"
            :total-visible="7"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>
    <CreateRole
      :open="openModalFaq"
      :datas="datas"
      @clicked="closeModal"
    ></CreateRole>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import {
  mdiMagnify,
  mdiChevronRight,
  mdiPencilOutline,
  mdiTrashCanOutline,
} from "@mdi/js";
import CreateRole from "./CreateRoleFormModal.vue";
import RoleService from "../../../services/management/role/roleServices";

const getRole = RoleService.build();

export default {
  components: { CreateRole },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      datas: {},
      search: "",
      openModalFaq: false,
      icons: {
        mdiMagnify,
        mdiPencilOutline,
        mdiChevronRight,
        mdiTrashCanOutline,
      },
      headers: [
        { text: "ID", value: "id" },
        { text: "Role Name", value: "name" },
        { text: "Description", value: "description" },
        { text: "Action", value: "aksi" },
      ],
      items: [],
    };
  },
  computed: {
    isSuperRole() {
      const user = JSON.parse(localStorage.getItem("dataUser"));
      return user?.roleId === "SUPER";
    },
  },
  watch: {
    search() {
      this.getRole(1);
    },
  },
  created() {
    this.getRole(1);
  },
  methods: {
    createRole() {
      this.datas = {};
      this.openModalFaq = true;
    },
    handleClick(item) {
      this.datas = item;
      this.openModalFaq = true;
    },
    closeModal() {
      this.openModalFaq = false;
      this.datas = {};
      this.onPageChangeDetil(1);
    },
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
          this.deleteData(id);
        }
      });
    },
    async deleteData(id) {
      try {
        const res = await getRole.deleteRole(id);
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
              this.getRole(1);
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
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Terjadi kesalahan saat menghapus data.",
        });
      }
    },
    async getRole(x) {
      const param = {
        size: this.itemsPerpage,
        sort: "DESC",
        page: x - 1,
        name: this.search,
      };
      const res = await getRole.getRole(param);
      const data = res.data.data.content;
      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.pages = x;
      this.totalItems = res.data.data.totalElements;
      this.items = data;
    },
    async onPageChangeDetil(value) {
      await this.getRole(value);
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