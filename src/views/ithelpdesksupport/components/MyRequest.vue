<template>
  <div class="helpdesk-container">
    <!-- Status Cards Section -->
    <div class="status-cards-section">
      <v-row class="status-cards-row ma-0">
        <v-col 
          v-for="(stat, index) in statusCards" 
          :key="index"
          @click="filterStatus(stat.filter)" 
          cols="6" 
          sm="6" 
          md="4" 
          lg="2" 
          class="status-col"
        >
          <v-card :class="['detail-info', stat.class]">
            <v-card-text class="pa-3 pa-sm-4">
              <v-icon color="white" :size="iconSize">{{ icons[stat.icon] }}</v-icon>
              <div class="status-title mt-2">{{ stat.title }}</div>
              <div class="status-value mt-1">{{ stat.value }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Filters and Table Section -->
    <v-card class="main-card mt-3">
      <!-- Filter Controls -->
      <v-card-text class="pa-3 pa-sm-4">
        <v-row class="ma-0">
          <v-col cols="12" sm="6" md="3" class="pa-1 pa-sm-2">
            <v-select 
              dense 
              v-model="catalogId" 
              outlined 
              :items="dataCatalog" 
              label="Catalog" 
              clearable
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="6" sm="6" md="3" class="pa-1 pa-sm-2">
            <date-picker 
              :format="dateFormat" 
              v-model="startDate" 
              format="DD-MM-YYYY" 
              placeholder="Start Date"
              class="datetime-picker"
            ></date-picker>
          </v-col>
          <v-col cols="6" sm="6" md="3" class="pa-1 pa-sm-2">
            <date-picker 
              :format="dateFormat" 
              v-model="endDate" 
              :disabled-date="disabledFromStartDate" 
              format="DD-MM-YYYY"
              placeholder="End Date" 
              class="datetime-picker"
            ></date-picker>
          </v-col>
          <v-col v-if="!isITLead" cols="12" md="3" class="pa-1 pa-sm-2">
            <v-text-field 
              dense 
              :append-icon="icons.mdiMagnify" 
              v-model="keyword" 
              outlined
              label="Search ticket" 
              clearable
              hide-details
            ></v-text-field>
          </v-col>
          <v-col v-if="isITLead" cols="6" sm="6" md="3" class="pa-1 pa-sm-2">
            <v-btn 
              class="btn-blue" 
              :loading="exportLoading" 
              @click="downloadExcel" 
              depressed
              block
              small
            >
              <v-icon left small>{{ icons.mdiDownload }}</v-icon>
              <span class="hidden-xs-only">Download Excel</span>
              <span class="hidden-sm-and-up">Excel</span>
            </v-btn>
          </v-col>
        </v-row>

        <!-- New Request Button -->
        <v-row v-if="isITLead" class="ma-0 mt-2">
          <v-spacer></v-spacer>
          <v-col cols="12" sm="6" md="3" class="pa-1 pa-sm-2">
            <v-btn class="btn-blue" @click="addTicket" depressed block small>
              <v-icon left small>{{ icons.mdiPlus }}</v-icon>
              New Request
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Data Table -->
      <v-card-text class="pa-0 pa-sm-2">
        <div class="table-container">
          <v-data-table 
            hide-default-footer 
            :loading="loading" 
            :headers="tableHeaders" 
            :items="tickets"
            @click:row="handleClick" 
            :mobile-breakpoint="0"
            class="elevation-0"
          >
            <template #[`item.createdAt`]="{ item }">
              <span class="text-no-wrap">{{ formatDate(item.createdAt) }}</span>
            </template>
            <template #[`item.rating`]="{ item }">
              {{ item.rating !== "" && item.rating !== null ? "Yes" : "No" }}
            </template>
            <template #[`item.statusName`]="{ item }">
              <v-chip 
                small 
                :class="getStatusClass(item.statusId)"
                class="status-chip"
              >
                <span class="status-text">{{ item.statusName }}</span>
                <v-icon color="white" x-small class="ml-1">
                  {{ getStatusIcon(item.statusId) }}
                </v-icon>
              </v-chip>
            </template>
          </v-data-table>
        </div>
      </v-card-text>

      <!-- Pagination -->
      <v-card-text class="pa-2 pa-sm-3">
        <div class="pagination-wrapper">
          <span class="total-data-text">Total: {{ totalItems }}</span>
          <v-pagination 
            v-model="pages" 
            :length="totalPage" 
            @input="onPageChangeDetil" 
            :total-visible="paginationVisible"
            class="pagination-component"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>

    <!-- Modal -->
    <HelpdeskFormModal 
      :open="helpdeskModal" 
      :datas="datas" 
      @close="closeHelpdeskModal"
    ></HelpdeskFormModal>
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
  mdiDownload,
  mdiPlus,
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
        mdiDownload,
        mdiPlus,
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
    };
  },
  computed: {
    statusCards() {
      return [
        { title: "All Tickets", value: this.allTickets, class: "all-ticket", icon: "mdiTicketConfirmationOutline", filter: null },
        { title: "Assigned", value: this.assignedTickets, class: "assigned-ticket", icon: "mdiClipboardArrowRightOutline", filter: "ASSIGNED" },
        { title: "Progress", value: this.progressTickets, class: "progress-ticket", icon: "mdiLoading", filter: "INPROGRESS" },
        { title: "Pending", value: this.pendingTickets, class: "pending-ticket", icon: "mdiClipboardTextClockOutline", filter: "PENDING" },
        { title: "Late", value: this.lateTickets, class: "late-ticket", icon: "mdiClipboardAlertOutline", filter: "LATE" },
        { title: "Solved", value: this.solvedTickets, class: "solved-ticket", icon: "mdiCheckDecagramOutline", filter: "RESOLVED" },
      ];
    },
    tableHeaders() {
      if (this.$vuetify.breakpoint.xs) {
        return [
          { text: "Ticket", value: "number" },
          { text: "Title", value: "title" },
          { text: "Status", value: "statusName" },
        ];
      }
      if (this.$vuetify.breakpoint.sm) {
        return [
          { text: "Ticket", value: "number" },
          { text: "Date", value: "createdAt" },
          { text: "Title", value: "title" },
          { text: "Status", value: "statusName" },
        ];
      }
      return this.headers;
    },
    iconSize() {
      return this.$vuetify.breakpoint.xs ? 24 : 32;
    },
    paginationVisible() {
      if (this.$vuetify.breakpoint.xs) return 3;
      if (this.$vuetify.breakpoint.sm) return 5;
      return 7;
    }
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
  },
};
</script>

<style scoped>
.helpdesk-container {
  width: 100%;
}

/* Status Cards */
.status-cards-section {
  background-color: #f1f1f7;
  border-radius: 8px;
  padding: 8px 4px;
}

.status-cards-row {
  margin: 0 !important;
}

.status-col {
  padding: 4px;
}

.detail-info {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  border-radius: 8px;
}

.detail-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-title {
  color: white;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
}

.status-value {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.all-ticket {
  background: linear-gradient(135deg, #9a9a9a 0%, #7a7a7a 100%);
}

.assigned-ticket {
  background: linear-gradient(135deg, #a11497 0%, #810d77 100%);
}

.progress-ticket {
  background: linear-gradient(135deg, #0172b9 0%, #015a93 100%);
}

.pending-ticket {
  background: linear-gradient(135deg, #ffd401 0%, #e6be00 100%);
}

.late-ticket {
  background: linear-gradient(135deg, #ec323f 0%, #c9262f 100%);
}

.solved-ticket {
  background: linear-gradient(135deg, #adc43b 0%, #8fa62e 100%);
}

/* Main Card */
.main-card {
  border-radius: 8px;
}

/* Button */
.btn-blue {
  background-color: rgb(1, 114, 185) !important;
  color: white;
  text-transform: none;
}

/* Date Picker */
.datetime-picker {
  width: 100%;
}

::v-deep .mx-input {
  height: 40px !important;
  font-size: 14px;
}

/* Table */
.table-container {
  overflow-x: auto;
  width: 100%;
}

::v-deep .v-data-table > .v-data-table__wrapper > table {
  min-width: 100%;
}

::v-deep .v-data-table tbody tr {
  cursor: pointer;
}

::v-deep .v-data-table tbody tr:hover {
  background-color: #f5f5f5 !important;
}

/* Status Chip */
.status-chip {
  color: white !important;
  border-radius: 4px;
  font-weight: 500;
  font-size: 11px;
  height: 24px !important;
}

.status-text {
  font-size: 11px;
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

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.total-data-text {
  font-weight: 600;
  font-size: 13px;
}

/* Tablet */
@media (max-width: 960px) {
  .status-title {
    font-size: 10px;
  }

  .status-value {
    font-size: 20px;
  }

  ::v-deep .v-data-table th,
  ::v-deep .v-data-table td {
    font-size: 13px;
    padding: 0 8px !important;
  }
}

/* Mobile */
@media (max-width: 600px) {
  .status-cards-section {
    padding: 4px 2px;
  }

  .status-col {
    padding: 2px;
  }

  .status-title {
    font-size: 9px;
    margin-top: 4px !important;
  }

  .status-value {
    font-size: 18px;
    margin-top: 2px !important;
  }

  .detail-info .v-card__text {
    padding: 8px !important;
  }

  .pagination-wrapper {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .total-data-text {
    font-size: 12px;
    width: 100%;
    text-align: center;
  }

  .pagination-component {
    width: 100%;
  }

  ::v-deep .v-pagination__navigation,
  ::v-deep .v-pagination__item {
    min-width: 28px !important;
    height: 28px !important;
    margin: 1px !important;
    font-size: 12px;
  }

  ::v-deep .v-data-table th,
  ::v-deep .v-data-table td {
    font-size: 11px !important;
    padding: 0 4px !important;
  }

  .status-chip {
    font-size: 10px;
    height: 20px !important;
  }

  .status-text {
    font-size: 10px;
  }
}
</style>