<template>
  <div>
    <v-row style="background-color: #f1f1f7">
      <v-col @click="filterStatus(null)" cols="12" sm="6" md="4" lg="2">
        <v-card class="detail-info all-ticket">
          <v-card-text>
            <v-icon style="color: white">{{ icons.mdiTicketConfirmationOutline }}</v-icon><br />
            <span style="display: -webkit-inline-box; color: white">All Tickets</span>
            <br />
            <p style="font-weight: bold; font-size: x-large; color: white">{{ allTickets }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col @click="filterStatus('ASSIGNED')" cols="12" sm="6" md="4" lg="2">
        <v-card class="detail-info assigned-ticket">
          <v-card-text>
            <v-icon style="color: white">{{ icons.mdiClipboardArrowRightOutline }}</v-icon><br />
            <span style="display: -webkit-inline-box; color: white">Assigned Tickets</span>
            <br />
            <p style="font-weight: bold; font-size: x-large; color: white">{{ assignedTickets }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col @click="filterStatus('INPROGRESS')" cols="12" sm="6" md="4" lg="2">
        <v-card class="detail-info progress-ticket">
          <v-card-text>
            <v-icon style="color: white">{{ icons.mdiLoading }}</v-icon><br />
            <span style="display: -webkit-inline-box; color: white">Progress Tickets</span>
            <br />
            <p style="font-weight: bold; font-size: x-large; color: white">{{ progressTickets }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col @click="filterStatus('PENDING')" cols="12" sm="6" md="4" lg="2">
        <v-card class="detail-info pending-ticket">
          <v-card-text>
            <v-icon style="color: white">{{ icons.mdiClipboardTextClockOutline }}</v-icon><br />
            <span style="display: -webkit-inline-box; color: white">Pending Tickets</span>
            <br />
            <p style="font-weight: bold; font-size: x-large; color: white">{{ pendingTickets }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col @click="filterStatus('LATE')" cols="12" sm="6" md="4" lg="2">
        <v-card class="detail-info late-ticket">
          <v-card-text>
            <v-icon style="color: white">{{ icons.mdiClipboardAlertOutline }}</v-icon><br />
            <span style="display: -webkit-inline-box; color: white">Late Tickets</span>
            <br />
            <p style="font-weight: bold; font-size: x-large; color: white">{{ lateTickets }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col @click="filterStatus('RESOLVED')" cols="12" sm="6" md="4" lg="2">
        <v-card class="detail-info solved-ticket">
          <v-card-text>
            <v-icon style="color: white">{{ icons.mdiCheckDecagramOutline }}</v-icon><br />
            <span style="display: -webkit-inline-box; color: white">Solved Tickets</span>
            <br />
            <p style="font-weight: bold; font-size: x-large; color: white">{{ solvedTickets }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-4">
      <v-row class="px-4">
        <v-spacer />
        <v-col cols="12" sm="6" md="2" lg="2">
          <v-select dense v-model="catalogId" outlined :items="dataCatalog" label="Catalog" clearable></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="2" lg="2">
          <date-picker :format="dateFormat" v-model="startDate" format="DD-MM-YYYY" placeholder="Start Date"
            class="datetime-picker"></date-picker>
        </v-col>
        <v-col cols="12" sm="6" md="2" lg="2">
          <date-picker :format="dateFormat" v-model="endDate" :disabled-date="disabledFromStartDate" format="DD-MM-YYYY"
            placeholder="End Date" class="datetime-picker"></date-picker>
        </v-col>
        <v-col v-if="!isITLead" cols="12" sm="6" md="6" lg="6">
          <v-text-field dense :append-icon="icons.mdiMagnify" v-model="keyword" outlined
            label="Search by ticket number or title" clearable></v-text-field>
        </v-col>
        <v-col v-if="isITLead" cols="12" sm="6" md="4" lg="4">
          <v-text-field dense :append-icon="icons.mdiMagnify" v-model="keyword" outlined
            label="Search by ticket number or title" clearable></v-text-field>
        </v-col>
        <v-col v-if="isITLead" cols="12" sm="6" md="2" lg="2">
          <v-btn class="btn-blue" :loading="exportLoading" @click="downloadExcel" depressed>
            Download Excel
          </v-btn>
        </v-col>
      </v-row>
      <v-row class="px-4">
        <v-spacer></v-spacer>
        <v-col v-if="isITLead" cols="2">
          <v-btn class="btn-blue" @click="addTicket" depressed>
            New Request
          </v-btn>
        </v-col>
      </v-row>

      <v-row style="padding: 1%">
        <v-data-table hide-default-footer :loading="loading" style="width: 100%" :headers="tableHeaders" :items="tickets"
          @click:row="handleClick" :mobile-breakpoint="0" :footer-props="{
            'items-per-page-options': [5, 10, 25],
            'items-per-page-text': 'Items per page:',
            'show-current-page': true,
            'show-first-last-page': true,
          }">
          <template #[`item.createdAt`]="{ item }">
            <span>{{ formatDate(item.createdAt) }}</span>
          </template>
          <template #[`item.rating`]="{ item }">
            {{ item.rating !== "" && item.rating !== null ? "Yes" : "No" }}
          </template>
          <template #[`item.statusName`]="{ item }">
            <v-chip small :class="getStatusClass(item.statusId)" text-color="white">
              {{ item.statusName }}
            </v-chip>
          </template>
          <template v-if="isSuperUser" #[`item.actions`]="{ item }">
            <v-btn icon small @click.stop="openDeleteConfirm(item)">
              <v-icon small color="error">{{ icons.mdiDelete }}</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-row>
      <div class="ml-4 mb-4" style="display: flex; justify-content: space-between">
        <span style="font-weight: 700; align-self: center">Total Data : {{ totalItems }}</span>
        <v-pagination v-model="pages" :length="totalPage" @input="onPageChangeDetil" :total-visible="7"></v-pagination>
      </div>
    </v-card>

    <HelpdeskFormModal :open="helpdeskModal" :datas="datas" @close="closeHelpdeskModal"></HelpdeskFormModal>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import moment from "moment";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import HelpdeskFormModal from "./HelpdeskFormModal.vue";
import ItHelpDeskService from "@/services/ithelpdesk/itHelpDeskServices";
import HelpdeskDashboardService from "@/services/helpdeskdashboard/helpdeskDashboardServices";
import CatalogService from "@/services/catalog/catalogServices";

const dashboardService = HelpdeskDashboardService.build();
const ticketService = ItHelpDeskService.build();
const catalogService = CatalogService.build();

import {
  mdiTicketConfirmationOutline,
  mdiClipboardTextClockOutline,
  mdiClipboardArrowRightOutline,
  mdiClipboardAlertOutline,
  mdiLoading,
  mdiCheckDecagramOutline,
  mdiMagnify,
  mdiCheck,
  mdiCheckAll,
  mdiDelete,
} from "@mdi/js";

export default {
  components: {
    DatePicker,
    HelpdeskFormModal,
  },
  data() {
    return {
      icons: {
        mdiClipboardTextClockOutline,
        mdiClipboardArrowRightOutline,
        mdiClipboardAlertOutline,
        mdiLoading,
        mdiTicketConfirmationOutline,
        mdiCheckDecagramOutline,
        mdiMagnify,
        mdiCheck,
        mdiCheckAll,
        mdiDelete,
      },
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      dateFormat: "DD-MM-YYYY",
      loading: false,
      exportLoading: false,
      allTickets: 0,
      assignedTickets: 0,
      progressTickets: 0,
      pendingTickets: 0,
      lateTickets: 0,
      solvedTickets: 0,
      startDate: null,
      endDate: null,
      helpdeskModal: false,
      headers: [
        { text: "Name", value: "userName" },
        { text: "PIC", value: "picName" },
        { text: "Ticket Number", value: "number" },
        { text: "Date", value: "createdAt" },
        { text: "Title", value: "title" },
        { text: "Catalog", value: "catalogName" },
        { text: "Location", value: "officeName" },
        { text: "Status", value: "statusName" },
      ],
      dataCatalog: [],
      datas: {},
      tickets: [],
      keyword: null,
      locationId: null,
      catalogId: null,
      status: null,
      isITLead: false,
      isSuperUser: false,
      ticketToDelete: null,
      isDeleting: false,
    };
  },
  computed: {
    tableHeaders() {
      if (!this.isSuperUser) return this.headers;
      return [
        ...this.headers,
        { text: "Actions", value: "actions", sortable: false, width: "80px" },
      ];
    },
  },
  created() {
    this.getUserData();
    this.getCatalog();
    this.getTicketPage(1);
    this.getAllTicketsCount(null, null);
    this.getTicketAssignedCount(null, null);
    this.getTicketInProgressCount(null, null);
    this.getTicketPendingCount(null, null);
    this.getTicketResolvedCount(null, null);
    this.getTicketLateCount(null, null);
  },
  watch: {
    startDate() {
      this.getTicketPage(1);
    },
    endDate() {
      this.getTicketPage(1);
    },
    catalogId() {
      this.getTicketPage(1);
    },
    keyword() {
      this.getTicketPage(1);
    },
  },
  methods: {
    formatDate(x) {
      return moment(x).format("DD-MM-YYYY");
    },
    disabledFromStartDate(date) {
      const today = new Date(this.startDate);
      today.setHours(0, 0, 0, 0);
      return date <= today - 1;
    },
    async getCatalog() {
      const res = await catalogService.getAllOptions();
      const data = res.data.data;
      this.dataCatalog = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
    },
    async getTicketPage(selectedId) {
      this.loading = true;
      const param = {
        keyword: this.keyword,
        location: this.locationId,
        startDate: this.startDate !== null && this.startDate !== ""
          ? moment(this.startDate).format("YYYY-MM-DD")
          : null,
        endDate: this.endDate !== null && this.endDate !== ""
          ? moment(this.endDate).format("YYYY-MM-DD")
          : null,
        catalog: this.catalogId,
        status: this.status,
        size: this.itemsPerpage,
        page: typeof selectedId === "number" ? selectedId - 1 : 0,
      };
      const res = await ticketService.getTicketPic(param);
      this.tickets = res.data.data.content;
      this.totalPage = res.data.data.totalElements > 10
        ? Math.ceil(res.data.data.totalElements / 10)
        : 1;
      this.totalItems = res.data.data.totalElements;
      this.loading = false;
    },
    async onPageChangeDetil(value) {
      await this.getTicketPage(value);
    },
    async getAllTicketsCount(year, month) {
      const param = { year, month };
      const res = await dashboardService.getAllTicketsCount(param);
      this.allTickets = res.data.data;
    },
    async getTicketAssignedCount(year, month) {
      const param = { year, month };
      const res = await dashboardService.getTicketAssignedCount(param);
      this.assignedTickets = res.data.data;
    },
    async getTicketInProgressCount(year, month) {
      const param = { year, month };
      const res = await dashboardService.getTicketInProgressCount(param);
      this.progressTickets = res.data.data;
    },
    async getTicketPendingCount(year, month) {
      const param = { year, month };
      const res = await dashboardService.getTicketPendingCount(param);
      this.pendingTickets = res.data.data;
    },
    async getTicketResolvedCount(year, month) {
      const param = { year, month };
      const res = await dashboardService.getTicketResolvedCount(param);
      this.solvedTickets = res.data.data;
    },
    async getTicketLateCount(year, month) {
      const param = { year, month };
      const res = await dashboardService.getTicketLateCount(param);
      this.lateTickets = res.data.data;
    },
    handleClick(value) {
      this.$router.push({
        name: "ithelpdesksupport-my-request-detail",
        params: {
          id: value.id,
          ticket: value
        },
      });
    },
    addTicket() {
      this.helpdeskModal = true;
    },
    closeHelpdeskModal(val) {
      this.helpdeskModal = false;
      this.getTicketPage(1);
      if (val) {
        this.$router.push({
          name: "ithelpdesksupport-my-request-detail",
          params: { id: val },
        });
      }
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
    async filterStatus(status) {
      this.status = status;
      this.getTicketPage(1);
    },
    getUserData() {
      const userData = JSON.parse(localStorage.getItem("dataUser"));
      this.isITLead = userData.roleId === "IT_LEAD" || userData.roleId === "SUPER";
      this.isSuperUser = userData.roleId === "SUPER";
    },
    async downloadExcel() {
      this.exportLoading = true;
      const param = {
        keyword: this.keyword,
        location: this.locationId,
        startDate: this.startDate !== null && this.startDate !== ""
          ? moment(this.startDate).format("YYYY-MM-DD")
          : null,
        endDate: this.endDate !== null && this.endDate !== ""
          ? moment(this.endDate).format("YYYY-MM-DD")
          : null,
        catalog: this.catalogId,
        status: this.status,
      };
      const res = await ticketService.export(param);
      this.exportLoading = false;

      const file = "Ticket-" + moment().format("DD-MM-YYYY");
      const fileName = file.replace(/"/gi, "");

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/vnd.ms-excel" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
    },
    getStatusClass(statusId) {
      const statusClasses = {
        SUBMITTED: "status-submitted",
        INPROGRESS: "status-inprogress",
        PENDING: "status-pending",
        ASSIGNED: "status-assigned",
        LATE: "status-late",
        RESOLVED: "status-resolved",
      };
      return statusClasses[statusId] || "";
    },
    getStatusIcon(statusId) {
      return statusId === "RESOLVED" ? this.icons.mdiCheckAll : this.icons.mdiCheck;
    },
    openDeleteConfirm(item) {
      Swal.fire({
        icon: "warning",
        title: "Delete",
        text: `Are you sure you want to delete ticket ${item.number}?`,
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        closeOnEsc: false,
        closeOnClickOutside: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.ticketToDelete = item;
          this.confirmDelete();
        }
      });
    },
    async confirmDelete() {
      if (!this.ticketToDelete) return;
      this.isDeleting = true;
      try {
        await ticketService.deleteTicket(this.ticketToDelete.id);
        this.tickets = this.tickets.filter(t => t.id !== this.ticketToDelete.id);
        this.totalItems = Math.max(0, this.totalItems - 1);
        if (this.allTickets > 0) this.allTickets--;
        this.ticketToDelete = null;
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Tiket berhasil dihapus",
          confirmButtonText: "OK",
        }).then(() => { this.loading = false; });
      } catch (e) {
        console.error("Delete error:", e);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Gagal menghapus tiket",
          confirmButtonText: "OK",
        }).then(() => { this.loading = false; });
      } finally {
        this.isDeleting = false;
      }
    },
  },
};
</script>

<style scoped>
.btn-blue {
  background-color: rgb(1, 114, 185) !important;
  color: white;
  text-transform: none;
  width: 100%;
}

.detail-info {
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

.pending-ticket {
  background-color: #ffd401;
}

.late-ticket {
  background-color: #ec323f;
}

.solved-ticket {
  background-color: #adc43b;
}

.datetime-picker {
  width: 100%;
}

::v-deep .mx-input {
  height: 40px !important;
}

.status-badge {
  color: white;
  border-radius: 5px;
}

.status-submitted {
  background-color: #0172b9 !important;
}

.status-inprogress {
  background-color: #0172b9 !important;
}

.status-pending {
  background-color: #ff7a00 !important;
}

.status-assigned {
  background-color: #a11497 !important;
}

.status-late {
  background-color: #ec323f !important;
}

.status-resolved {
  background-color: #adc43b !important;
}
</style>