<template>
  <div style="margin-top: -5rem">
    <v-row>
      <v-col v-for="(item, index) in businessApps" :key="index" cols="12" sm="6" md="4" lg="3">
        <v-card>
          <v-card-title class="title-apps">
            <v-icon class="icon-apps mr-2">{{ icons.mdiDotsGrid }}</v-icon>
            {{ item.name }}
            <v-spacer></v-spacer>
            <v-icon v-if="isIT" @click="detailApps(1, item)" class="icon-apps add-apps mr-2">
              {{ icons.mdiPlus }}
            </v-icon>
          </v-card-title>

          <v-card-text class="card-text-apps">
            <v-container fill-height fluid v-show="item.apps == null">
              <v-spacer />
              <div class="text-center">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-img v-bind="attrs" v-on="on" style="height: 60px; width: 60px; margin: 0 auto"
                      :src="item.link === 0 ? item.imageUrl : baseUrl + item.imageUrl" alt="Application Image"
                      @click="detailApps(item.link)"></v-img>
                  </template>
                  <span>{{ item.description }}</span>
                </v-tooltip>
              </div>
              <v-spacer />
            </v-container>
            <v-row v-if="item.apps != null">
              <v-col class="center-hr" v-for="(data, id) in item.apps" :key="id" cols="4"
                @click="detailApps(data.link)">
                <v-menu v-if="isIT" offset-y>
                  <template v-slot:activator="{ on }">
                    <v-btn style="right: -25px; top: 10px" icon v-on="on">
                      <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="menuItemClicked(data, 0)">
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="menuItemClicked(data, 2)">
                      <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <br />
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <img v-bind="attrs" v-on="on" :src="baseUrl + data.imageUrl" alt="Application Image" width="48"
                      height="48" />
                  </template>
                  <span>{{ data.description }}</span>
                </v-tooltip>
                <br />
                <span style="cursor: pointer">{{ data.name }}</span>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <AddApps :addBisnis="addBisnis" :isBsns="true" :open="openModalCatalog" :datas="datas" @clicked="closeModal"
      :isEdit="isEdit"></AddApps>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import { mdiDotsGrid, mdiPlus, mdiDotsVertical } from "@mdi/js";
import AddApps from "./component/CreateAppsFormModal.vue";
import ApplicationService from "../../services/application/applicationServices";

const getApps = ApplicationService.build();
export default {
  components: {
    AddApps,
  },
  data() {
    return {
      addBisnis: false,
      isIT: false,
      isEdit: false,
      baseUrl: process.env.VUE_APP_PERTAGAS,
      datas: {},
      openModalCatalog: false,
      currentIndex: 0,
      icons: {
        mdiDotsVertical,
        mdiPlus,
        mdiDotsGrid,
      },
      businessApps: [],
    };
  },
  created() {
    this.getAppsBsns();
    this.getRole();
  },
  methods: {
    updateDialogVisible(value) {
      this.openModalCatalog = false;
      this.dialogVisible = value;
    },
    getRole() {
      const role = JSON.parse(localStorage.getItem("dataUser"));
      if (
        role.roleId === "IT" ||
        role.roleId === "IT_LEAD" ||
        role.roleId === "SUPER"
      ) {
        this.isIT = true;
      } else {
        this.isIT = false;
      }
    },
    async menuItemClicked(x, y) {
      if (y === 0) {
        this.datas = x;
        this.addBisnis = false;
        this.isEdit = true;
        this.openModalCatalog = true;
      } else {
        this.deleted(x);
      }
    },
    async deleteData(x) {
      const res = await getApps.deleteAppsBsns(x.id);
      if (res.data.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.message,
          buttons: {
            cancel: false,
            confirm: true,
          },
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          closeOnEsc: false,
          closeOnClickOutside: false,
        }).then((result) => {
          if (result) {
            this.loading = false;
            this.getAppsBsns();
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
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          closeOnEsc: false,
          closeOnClickOutside: false,
        }).then((result) => {
          if (result) {
            this.loading = false;
            this.getAppsBsns();
          }
        });
      }
    },
    async deleted(x) {
      Swal.fire({
        icon: "warning",
        title: "Delete",
        text: "Are you sure you deleted this data?",
        showCancelButton: true,
        buttons: {
          cancel: false,
          confirm: true,
        },
        confirmButtonText: "Yes",
        cancelButtonText: "No",
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
    successPopup(val) {
      Swal.fire({
        title: "Success",
        text: val,
        icon: "success",
        button: false,
        timer: 2000,
      });
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
    async getImg(x) {
      if (x !== null || x !== undefined) {
        const res = await getApps.getFile(x.id);
        const base = this.arrayBufferToBase64(res.data);
        return `data:image/png;base64,${base}`;
      }
    },
    arrayBufferToBase64(buffer) {
      let binary = "";
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      return window.btoa(binary);
    },
    closeModal() {
      this.openModalCatalog = false;
      this.datas = {};
      this.getAppsBsns();
    },
    detailApps(x, y) {
      if (x === 0) {
        this.addBisnis = false;
        this.openModalCatalog = true;
      } else if (x === 1) {
        this.openModalCatalog = true;
        this.datas = y;
        this.addBisnis = true;
      } else if (typeof x === "string") {
        window.open(x, "_blank");
      }
    },
    async getAppsBsns() {
      const res = await getApps.getAppsBsns();
      const data = res.data.data;
      this.businessApps = data;
    },
    limitText(text, limit) {
      if (text.length > limit) {
        return text.substring(0, limit) + "\n" + text.substring(limit);
      }
      return text;
    },
  },
};
</script>

<style scoped>
.container-img {
  position: relative;
  display: inline-block;
}

.overlay-image {
  position: absolute;
  top: -45px;
  right: 0;
}

.card-text-apps {
  height: 21rem;
  overflow-y: auto;
}

.card-title {
  font-size: 16px;
  color: #0172b9;
  font-weight: bold;
}

.card-content {
  white-space: pre-line;
  overflow: hidden;
  font-size: 14px;
}

.icon-header {
  color: #101010 !important;
}

.add-apps {
  cursor: pointer;
}

.icon-apps {
  color: #0172b9 !important;
}

.title-apps {
  color: #0172b9 !important;
}

.title-header {
  color: #101010 !important;
  justify-content: center;
}

.center-hr {
  text-align: center;
}

.horizontal-rule {
  width: 5%;
  border-top: 5px solid black;
  margin: 20px auto;
}
</style>