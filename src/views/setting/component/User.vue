<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="10"
        ><span class="title-page">User</span></v-col
      >
      <!-- <v-col cols="12" sm="6" md="4" lg="2">
        <v-btn class="btn-submit" @click="createFaq"> Create User </v-btn>
      </v-col> -->
    </v-row>
    <v-card class="mt-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="12">
            <v-text-field
              dense
              v-model="name"
              :append-icon="icons.mdiMagnify"
              outlined
              label="Search by Employee Name"
            ></v-text-field>
          </v-col>
          <!-- <v-col cols="12" sm="6" md="4" lg="3">
            <v-text-field
              dense
              v-model="email"
              outlined
              label="Email"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-text-field
              dense
              v-model="role"
              outlined
              label="Role"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-text-field
              v-model="title"
              outlined
              dense
              label="Title"
            ></v-text-field>
          </v-col> -->
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
          <template #[`item.aksi`]="{ item, index }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  color="#0172b9"
                  v-bind="attrs"
                  v-on="on"
                  size="20"
                  @click="handleClick(item)"
                  >{{ icons.mdiPencilOutline }}</v-icon
                > </template
              ><span>Edit</span></v-tooltip
            >
          </template>
        </v-data-table>
        <div class="ml-4" style="display: flex; justify-content: space-between">
          <span style="font-weight: 700; align-self: center"
            >Total Data : {{ totalItems }}</span
          ><br />
          <v-pagination
            v-model="pages"
            :length="totalPage"
            @input="onPageChangeDetil"
            :total-visible="7"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>
    <CreateUser
      :open="openModalFaq"
      :datas="datas"
      @clicked="closeModal"
    ></CreateUser>
  </div>
</template>
<script>
import Swal from "sweetalert2";
import {
  mdiChevronRight,
  mdiMagnify,
  mdiTrashCanOutline,
  mdiPencilOutline,
} from "@mdi/js";
import CreateUser from "./CreateUserFormModal.vue";
import UserService from "../../../services/management/user/userServices";

const getUser = UserService.build();
export default {
  components: {
    CreateUser,
  },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      name: "",
      email: "",
      role: "",
      title: "",
      datas: {},
      openModalFaq: false,
      selectedTab: 0,
      tabs: ["Eksternal", "Internal"],
      icons: {
        mdiPencilOutline,
        mdiMagnify,
        mdiChevronRight,
        mdiTrashCanOutline,
      },
      item: 0,
      headers: [
        { text: "Employee Name", value: "fullName" },
        { text: "Email", value: "email" },
        { text: "Role", value: "roleName" },
        { text: "Title", value: "title" },
        { text: "Action", value: "aksi" },
      ],
      items: [],
    };
  },
  watch: {
    name() {
      this.getUser(1);
    },
  },
  created() {
    this.getUser(1);
  },
  methods: {
    handleClick(x) {
      this.datas = x;
      this.openModalFaq = true;
    },
    closeModal() {
      this.openModalFaq = false;
      this.datas = {};
      this.onPageChangeDetil(1);
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
      const res = await getUser.deleteUser(param);
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
            this.getUser(1);
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
            this.getUser(1);
          }
        });
      }
    },
    async getUser(x) {
      const param = {
        name: this.name,
        size: this.itemsPerpage,
        sort: "DESC",
        page: x - 1,
      };
      const res = await getUser.getUser(param);
      const data = res.data.data.content;
      this.myloadingvariable = false;
      this.items = data;
      this.pages = x;
      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.totalItems = res.data.data.totalElements;
    },
    async onPageChangeDetil(value) {
      await this.getUser(value);
    },
    createFaq() {
      this.openModalFaq = true;
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
.edit-action {
  color: #0172b9;
  font-weight: bold;
  cursor: pointer;
}
</style>
