<template>
  <div class="helpdesk-container">
    <!-- Status Cards -->
    <div class="status-cards">
      <v-row>
        <v-col
          v-for="(stat, i) in statusCards"
          :key="i"
          @click="filterByStatus(stat.filter)"
          cols="6"
          md="2"
        >
          <v-card :class="['status-card', stat.class]">
            <v-card-text class="pa-3 text-center">
              <v-icon color="white" size="28">{{ icons[stat.icon] }}</v-icon>
              <div class="status-title">{{ stat.title }}</div>
              <div class="status-value">{{ stat.value }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Main Content -->
    <v-card class="main-card mt-3">
      <!-- Filters -->
      <v-card-text class="pa-3 pa-sm-4">
        <v-row class="ma-0">
          <v-col cols="12">
            <v-text-field
              dense
              :append-icon="icons.mdiMagnify"
              v-model="keyword"
              outlined
              label="Search ticket"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="6" sm="6" md="3">
            <v-select
              dense
              v-model="catalogId"
              outlined
              :items="catalogs"
              label="Catalog"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="6" sm="6" md="3">
            <date-picker
              v-model="startDate"
              format="DD-MM-YYYY"
              placeholder="Start Date"
              class="datetime-picker"
            />
          </v-col>
          <v-col cols="6" sm="6" md="3">
            <date-picker
              v-model="endDate"
              :disabled-date="disabledDate"
              format="DD-MM-YYYY"
              placeholder="End Date"
              class="datetime-picker"
            />
          </v-col>
          <v-col v-if="canDownload" cols="6" sm="6" md="3">
            <v-btn
              class="btn-blue"
              :loading="exportLoading"
              @click="downloadExcel"
              depressed block big
            >
              <v-icon left small>{{ icons.mdiDownload }}</v-icon>
              <span class="hidden-md-and-down">Download Excel</span>
              <span class="hidden-lg-and-up">Excel</span>
            </v-btn>
          </v-col>
        </v-row>

        <!-- New Request Button -->
        <v-row v-if="isITLead" class="ma-0 mt-2">
          <v-spacer />
          <v-col cols="12" sm="6" md="6">
            <v-btn class="btn-blue" @click="addTicket" depressed block big>
              <v-icon left small>{{ icons.mdiPlus }}</v-icon>
              New Request
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Table -->
      <v-card-text class="pa-0 pa-sm-2">
        <div class="table-container">
          <v-data-table
            hide-default-footer
            :loading="loading"
            :headers="headers"
            :items="tickets"
            @click:row="viewDetail"
            :mobile-breakpoint="0"
          >
            <template #[`item.createdAt`]="{ item }">
              <span class="text-no-wrap">{{ formatDate(item.createdAt) }}</span>
            </template>
            <template #[`item.statusName`]="{ item }">
              <v-chip small :class="getStatusClass(item.statusId)" class="status-chip">
                <span class="status-text">{{ item.statusName }}</span>
                <v-icon color="white" x-small class="ml-1">{{ getStatusIcon(item.statusId) }}</v-icon>
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
            v-model="page"
            :length="totalPages"
            @input="loadTickets"
            :total-visible="paginationVisible"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Modal -->
    <HelpdeskFormModal
      :open="showModal"
      :datas="modalData"
      @close="closeModal"
    />
  </div>
</template>

<script>
import moment from "moment";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import HelpdeskFormModal from "./HelpdeskFormModal.vue";
import ItHelpDeskService from "@/services/ithelpdesk/itHelpDeskServices";
import HelpdeskDashboardService from "@/services/helpdeskdashboard/helpdeskDashboardServices";
import CatalogService from "@/services/catalog/catalogServices";

import {
  mdiTicketConfirmationOutline, mdiClipboardTextClockOutline, mdiClipboardArrowRightOutline,
  mdiClipboardAlertOutline, mdiLoading, mdiCheckDecagramOutline,
  mdiMagnify, mdiDownload, mdiPlus, mdiCheck, mdiCheckAll,
} from "@mdi/js";

export default {
  components: { DatePicker, HelpdeskFormModal },

  data() {
    return {
      icons: {
        mdiTicketConfirmationOutline, mdiClipboardTextClockOutline, mdiClipboardArrowRightOutline,
        mdiClipboardAlertOutline, mdiLoading, mdiCheckDecagramOutline,
        mdiMagnify, mdiDownload, mdiPlus, mdiCheck, mdiCheckAll,
      },
      page: 1, totalPages: 1, totalItems: 0,
      loading: false, exportLoading: false,
      keyword: null, catalogId: null, startDate: null, endDate: null,
      status: null,
      tickets: [], catalogs: [],
      allTickets: 0, assignedTickets: 0, progressTickets: 0,
      pendingTickets: 0, lateTickets: 0, solvedTickets: 0,
      showModal: false, modalData: {},
      isITLead: false,
      canDownload: false,
      headers: [
        { text: "Name",     value: "userName" },
        { text: "PIC",      value: "picName" },
        { text: "Ticket",   value: "number" },
        { text: "Date",     value: "createdAt" },
        { text: "Title",    value: "title" },
        { text: "Catalog",  value: "catalogName" },
        { text: "Location", value: "officeName" },
        { text: "Status",   value: "statusName" },
      ],
    };
  },

  computed: {
    statusCards() {
      return [
        { title: "All",      value: this.allTickets,      class: "all",      icon: "mdiTicketConfirmationOutline",  filter: null        },
        { title: "Assigned", value: this.assignedTickets, class: "assigned", icon: "mdiClipboardArrowRightOutline", filter: "ASSIGNED"  },
        { title: "Progress", value: this.progressTickets, class: "progress", icon: "mdiLoading",                   filter: "INPROGRESS"},
        { title: "Pending",  value: this.pendingTickets,  class: "pending",  icon: "mdiClipboardTextClockOutline",  filter: "PENDING"   },
        { title: "Late",     value: this.lateTickets,     class: "late",     icon: "mdiClipboardAlertOutline",      filter: "LATE"      },
        { title: "Solved",   value: this.solvedTickets,   class: "solved",   icon: "mdiCheckDecagramOutline",       filter: "RESOLVED"  },
      ];
    },
    paginationVisible() {
      if (this.$vuetify.breakpoint.xs) return 3;
      if (this.$vuetify.breakpoint.sm) return 5;
      return 7;
    },
  },

  created() {
    this.checkUserRole();
    this.loadCatalogs();
    this.loadTickets();
    this.loadCounts();
  },

  watch: {
    keyword()    { this.page = 1; this.loadTickets(); },
    catalogId()  { this.page = 1; this.loadTickets(); },
    startDate()  { this.page = 1; this.loadTickets(); },
    endDate()    { this.page = 1; this.loadTickets(); },
  },

  methods: {
    checkUserRole() {
      const user = JSON.parse(localStorage.getItem("dataUser"));
      this.isITLead = user?.roleId === "IT_LEAD" || user?.roleId === "SUPER";
      this.canDownload = user?.roleId === "IT_LEAD" || user?.roleId === "SUPER" || user?.roleId === "IT";
    },

    async loadCatalogs() {
      try {
        const res = await CatalogService.build().getAllOptions();
        this.catalogs = res.data.data.map(c => ({ value: c.value, text: c.label }));
      } catch (e) { console.error(e); }
    },

    async loadTickets() {
      this.loading = true;
      try {
        const params = {
          keyword:   this.keyword,
          catalog:   this.catalogId,
          status:    this.status,
          startDate: this.startDate ? moment(this.startDate).format("YYYY-MM-DD") : null,
          endDate:   this.endDate   ? moment(this.endDate).format("YYYY-MM-DD")   : null,
          page:      this.page - 1,
          size:      10,
        };
        const res        = await ItHelpDeskService.build().getTicketPic(params);
        this.tickets     = res.data.data.content || [];
        this.totalItems  = res.data.data.totalElements || 0;
        this.totalPages  = Math.ceil(this.totalItems / 10) || 1;
      } catch (e) {
        console.error(e);
        this.tickets = [];
      } finally {
        this.loading = false;
      }
    },

    async loadCounts() {
      const svc   = HelpdeskDashboardService.build();
      const param = { year: null, month: null };
      const [all, assigned, progress, pending, solved, late] = await Promise.allSettled([
        svc.getAllTicketsCount(param),
        svc.getTicketAssignedCount(param),
        svc.getTicketInProgressCount(param),
        svc.getTicketPendingCount(param),
        svc.getTicketResolvedCount(param),
        svc.getTicketLateCount(param),
      ]);
      this.allTickets      = all.status      === 'fulfilled' ? (all.value.data.data      || 0) : 0;
      this.assignedTickets = assigned.status === 'fulfilled' ? (assigned.value.data.data || 0) : 0;
      this.progressTickets = progress.status === 'fulfilled' ? (progress.value.data.data || 0) : 0;
      this.pendingTickets  = pending.status  === 'fulfilled' ? (pending.value.data.data  || 0) : 0;
      this.solvedTickets   = solved.status   === 'fulfilled' ? (solved.value.data.data   || 0) : 0;
      this.lateTickets     = late.status     === 'fulfilled' ? (late.value.data.data     || 0) : 0;
    },

    filterByStatus(status) {
      this.status = status;
      this.page   = 1;
      this.loadTickets();
    },

    viewDetail(ticket) {
      this.$router.push({
        name:   "ithelpdesksupport-my-request-detail",
        params: { id: ticket.id, ticket },
      });
    },

    addTicket() { this.showModal = true; },

    closeModal(id) {
      this.showModal = false;
      this.loadTickets();
      this.loadCounts();
      if (id) this.$router.push({ name: "ithelpdesksupport-my-request-detail", params: { id } });
    },

    async downloadExcel() {
      this.exportLoading = true;
      try {
        const params = {
          keyword:   this.keyword,
          catalog:   this.catalogId,
          status:    this.status,
          startDate: this.startDate ? moment(this.startDate).format("YYYY-MM-DD") : null,
          endDate:   this.endDate   ? moment(this.endDate).format("YYYY-MM-DD")   : null,
        };
        const res  = await ItHelpDeskService.build().export(params);
        const url  = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href  = url;
        link.download = `Ticket-${moment().format("DD-MM-YYYY")}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (e) {
        console.error(e);
      } finally {
        this.exportLoading = false;
      }
    },

    formatDate(date) { return moment(date).format("DD-MM-YYYY"); },

    disabledDate(date) {
      if (!this.startDate) return false;
      return date < new Date(this.startDate);
    },

    getStatusClass(statusId) {
      return {
        SUBMITTED:  "status-submitted",
        INPROGRESS: "status-progress",
        PENDING:    "status-pending",
        ASSIGNED:   "status-assigned",
        LATE:       "status-late",
        RESOLVED:   "status-solved",
      }[statusId] || "";
    },

    getStatusIcon(statusId) {
      return statusId === "RESOLVED" ? this.icons.mdiCheckAll : this.icons.mdiCheck;
    },
  },
};
</script>

<style scoped>
.helpdesk-container { width: 100%; }

.status-cards { background: #f5f5f5; padding: 12px; border-radius: 8px; }

.status-card { cursor: pointer; transition: transform 0.2s; height: 100%; }
.status-card:hover { transform: translateY(-4px); }

.status-title { color: white; font-size: 12px; margin-top: 8px; }
.status-value { color: white; font-size: 24px; font-weight: bold; margin-top: 4px; }

.all      { background: linear-gradient(135deg, #9a9a9a, #e0c7c7); }
.assigned { background: linear-gradient(135deg, #a11497, #c554bb); }
.progress { background: linear-gradient(135deg, #0172b9, #69b1df); }
.pending  { background: linear-gradient(135deg, #ff7a00, #e6be00); }
.late     { background: linear-gradient(135deg, #ec323f, #d87479); }
.solved   { background: linear-gradient(135deg, #adc43b, #c2dc57); }

.status-chip  { color: white !important; border-radius: 5px; height: 24px !important; }
.status-text  { font-size: 10px; }
.status-submitted { background-color: #0172b9 !important; }
.status-progress  { background-color: #0172b9 !important; }
.status-pending   { background-color: #ff7a00 !important; }
.status-assigned  { background-color: #a11497 !important; }
.status-late      { background-color: #ec323f !important; }
.status-solved    { background-color: #adc43b !important; }

.pagination-wrapper { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.total-data-text { font-weight: 600; font-size: 13px; }
.table-container { width: 100%; }

::v-deep .v-data-table > .v-data-table__wrapper > table { min-width: 100%; }
::v-deep .v-data-table tbody tr { cursor: pointer; }
::v-deep .v-data-table tbody tr:hover { background-color: #f5f5f5 !important; }

.datetime-picker { width: 100%; }
::v-deep .mx-input { height: 40px; border: 1px solid rgba(0,0,0,0.38); border-radius: 4px; padding: 0 12px; }

.btn-blue { background-color: rgb(1, 114, 185) !important; color: white; text-transform: none; }
</style>