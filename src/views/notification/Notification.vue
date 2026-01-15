<template>
  <div style="margin-top: -60px; margin-bottom: 20px;">
    <v-card style="padding: 1px 0px 15px 0px">
      <v-card-title>
        <v-row align="center" justify="center">
          <v-col cols="6" class="text-left">
            <div id="label" class="text-left" style="font-weight: bold">
              <v-icon @click="goBack" style="cursor: pointer" color="black">
                {{ icons.mdiArrowLeft }}
              </v-icon>
              Notification
            </div>
          </v-col>
          <v-col cols="6" class="text-right">
            <v-btn @click="deleteAllConfirm()" class="float-right mr-2" depressed outlined>Delete All</v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <div>
        <v-card class="table-card">
          <v-data-table hide-default-footer :loading="myloadingvariable" loading-text="Please wait ....."
            style="box-shadow: none" hide-default-header :headers="headers" :items="itemData" :items-per-page="10"
            :item-class="itemRowBackground" :sort-key="sortKey" :sort-desc="sortDesc" @update:sort-key="updateSortKey"
            @update:sort-desc="updateSortDesc" @click:row="handleClick">
            <template #[`item.id`]="{ item, index }">
              <span><v-icon style="size: 10px; color: #0172b9">
                  {{ icons.mdiInformation }}
                </v-icon>
                Info | {{ item.createdAt }}</span><br />
              <span style="font-weight: bold">{{ item.title }}</span><br />
              <span>{{ item.message }}</span><br />
            </template>
            <template #[`item.hapus`]="{ item, index }">
              <v-icon style="size: 10px; color: #0172b9" v-on:click.stop="deleteConfirm(item.id)">
                {{ icons.mdiTrashCanOutline }}
              </v-icon>
            </template>
            <template v-slot:headers="{ columns }">
              <tr>
                <template v-for="column in columns">
                  <td>
                    <span class="mr-2 cursor-pointer">{{
                      column.text === "hapus" ? "Hapus Semua" : ""
                      }}</span>
                    <v-icon v-if="column.removable">{{
                      icons.mdiTrashCanOutline
                      }}</v-icon>
                  </td>
                </template>
              </tr>
            </template>
          </v-data-table>
          <div class="ml-4" style="display: flex; justify-content: space-between">
            <span style="font-weight: 700; align-self: center">Total Data : {{ totalItems }}</span>
            <v-pagination v-model="pages" :length="totalPage" @input="onPageChangeDetil"
              :total-visible="7"></v-pagination>
          </div>
        </v-card>
      </div>
    </v-card>
  </div>
</template>

<script>
import { mdiInformation, mdiTrashCanOutline, mdiArrowLeft } from "@mdi/js";
import personalNotificationServices from "../../services/notification/notificationServices.js";
import Swal from "sweetalert2";
const Notif = personalNotificationServices.build();
export default {
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      headers: [
        {
          text: "",
          value: "id",
          key: "id",
          removable: false,
        },
        {
          text: "",
          value: "hapus",
          key: "hapus",
          sortable: false,
          removable: true,
        },
      ],
      icons: {
        mdiInformation,
        mdiTrashCanOutline,
        mdiArrowLeft,
      },
      detailRoute: "notification",
      myloadingvariable: true,
      itemData: [],
      page: 1,
      itemsPerPage: 10,
      currentPage: 1,
      sortKey: "",
      sortDesc: false,
    };
  },
  created() {
    this.getData(1);
  },
  methods: {
    goBack() {
      this.$router.push({
        name: "home", //use name for router push
        params: true,
      });
    },
    readNotif(index) {
      this.notif[index].read = true;
    },
    itemRowBackground: function (item) {
      return item.read === false ? "style-1" : "style-2";
    },
    async getData(x) {
      const param = {
        page: x - 1,
        size: this.itemsPerPage,
      };
      const res = await Notif.getPage(param);
      const data = res.data.data.content;
      this.itemData = data;
      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.totalItems = res.data.data.totalElements;
      this.myloadingvariable = false;
    },
    async onPageChangeDetil(value) {
      await this.getData(value);
    },
    async deleteAllConfirm() {
      Swal.fire({
        icon: "warning",
        title: "Hapus",
        text: "Apakah anda yakin menghapus semua notifikasi ini?",
        showCancelButton: true,
        buttons: {
          cancel: false,
          confirm: true,
        },
        closeOnEsc: false,
        closeOnClickOutside: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteData("all");
        } else {
          return false;
        }
      });
    },
    async deleteConfirm(id) {
      Swal.fire({
        icon: "warning",
        title: "Hapus",
        text: "Apakah anda yakin menghapus notifikasi ini?",
        showCancelButton: true,
        buttons: {
          cancel: false,
          confirm: true,
        },
        closeOnEsc: false,
        closeOnClickOutside: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteData(id);
        } else {
          return false;
        }
      });
    },

    async deleteData(id) {
      const data = [id];
      const res = await Notif.postDeleteNotif(data);
      if (res.data.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Sukses",
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
            this.getData(1);
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
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
            // this.goBack()
          }
        });
      }
    },
    updateSortKey(sortKey) {
      this.sortKey = sortKey;
    },
    updateSortDesc(sortDesc) {
      this.sortDesc = sortDesc;
    },
    async handleClick(value) {
      const data = [value.id];
      await Notif.postReadNotif(data);
      switch (value.actionPath) {
        case "EVENT":
          this.$router.push("events-request").catch(() => { });
          break;
        case "MEETING":
          this.$router.push("meeting-booking").catch(() => { });
          break;
        case "TICKET":
          this.$router.push("ithelpdesksupport").catch(() => { });
          break;
        case "TICKET-USER":
          this.$router.push({
            name: "ithelpdesk-my-request-detail",
            params: { id: value.actionRefId }
          }).catch(() => { });
          break;
        default:
          break;
      }
      this.getData(1);
    },
  },
};
</script>

<style scoped>
.table-card {
  border: 1px solid #e0e0e0;
  border-radius: 0px;
  box-shadow: none !important;
}

::v-deep .style-1 {
  background-color: #d9eaf5;
  color: black !important;
}

::v-deep .style-2 {
  background-color: rgb(254, 254, 252);
}

.divider-color {
  background: #7bbdee;
}

::v-deep .v-data-table th {
  font-size: 18px !important;
}

::v-deep .v-data-table tbody tr td {
  /* background-color: #d9eaf5 !important; */
  padding-bottom: 12px !important;
  padding-top: 12px !important;
}
</style>
