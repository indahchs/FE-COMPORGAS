<template>
  <div class="helpdesk-container">
    <!-- Main Content -->
    <v-card class="main-card">
      <!-- Filters -->
      <v-card-text class="pa-3 pa-sm-4">
        <v-col cols="12" md="12">
          <v-text-field 
            dense
            :append-icon="icons.mdiMagnify"
            v-model="keyword" 
            outlined
            label="Search by ticket number or title" 
            clearable
            hide-details
          />
        </v-col>
        <v-row class="ma-0">
          <v-col cols="6" sm="6" md="3">
            <v-select 
              dense
              v-model="catalogId" 
              outlined
              :items="dataCatalog" 
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
              :disabled-date="disabledFromStartDate"
              format="DD-MM-YYYY" 
              placeholder="End Date"
              class="datetime-picker"
            />
          </v-col>
          <v-col cols="6" sm="6" md="3">
            <v-btn 
              class="btn-blue"
              @click="addTicket" 
              depressed
              block
              big
            >
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
            :items="items"
            @click:row="handleClick"
            :mobile-breakpoint="0"
          >
            <template #[`item.createdAt`]="{ item }">
              <span class="text-no-wrap">{{ formatDate(item.createdAt) }}</span>
            </template>
            <template #[`item.statusName`]="{ item }">
              <v-chip 
                small 
                :class="getStatusClass(item.statusId, item.isLate)"
                class="status-chip"
              >
                <span class="status-text">
                  {{ item.isLate && item.statusId !== 'RESOLVED' ? 'Late' : item.statusName }}
                </span>
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
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Modal -->
    <HelpdeskFormModal 
      :open="helpdeskModal" 
      :datas="datas" 
      @close="closeHelpdeskModal"
    />
  </div>
</template>

<script>
import DatePicker from "vue2-datepicker";
import Swal from "sweetalert2";
import moment from "moment";
import HelpdeskFormModal from "./HelpdeskFormModal.vue";
import ItHelpDeskService from "@/services/ithelpdesk/itHelpDeskServices";
import CatalogService from "@/services/catalog/catalogServices";

import "vue2-datepicker/index.css";

const getTicket = ItHelpDeskService.build();
const catalogService = CatalogService.build();

import {
  mdiMagnify,
  mdiCheck,
  mdiCheckAll,
  mdiPlus,
} from "@mdi/js";

export default {
  components: {
    HelpdeskFormModal,
    DatePicker,
  },
  props: {
    dataReq: String,
  },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      loading: false,
      helpdeskModal: false,
      datas: {},
      icons: { mdiMagnify, mdiCheck, mdiCheckAll, mdiPlus },
      startDate: null,
      endDate: null,
      headers: [
        { text: "Ticket Number", value: "number" },
        { text: "Date",          value: "createdAt" },
        { text: "Title",         value: "title" },
        { text: "PIC",           value: "picName" },
        { text: "Service",       value: "catalogName" },
        { text: "Location",      value: "officeName" },
        { text: "Status",        value: "statusName" },
      ],
      items: [],
      dataCatalog: [],
      keyword: null,
      catalogId: null,
      status: null,
      // SLA map: { catalogName -> total SLA hours }
      catalogSlaMap: {},
    };
  },

  computed: {
    paginationVisible() {
      if (this.$vuetify.breakpoint.xs) return 3;
      if (this.$vuetify.breakpoint.sm) return 5;
      return 7;
    },
  },

  async created() {
    // Load SLA map & catalog bersamaan, baru fetch tiket
    await Promise.all([
      this.getCatalog(),
      this.loadCatalogSlaMap(),
    ]);
    this.getTicket(1);
  },

  watch: {
    startDate() { this.getTicket(1); },
    endDate()   { this.getTicket(1); },
    catalogId() { this.getTicket(1); },
    keyword()   { this.getTicket(1); },
  },

  methods: {
    // ─── SLA Helpers ───────────────────────────────────────────────
    async loadCatalogSlaMap() {
      try {
        const res      = await getTicket.getHelpDeskPage({ size: 100, page: 0 });
        const catalogs = res.data.data.content || [];
        this.catalogSlaMap = {};
        catalogs.forEach(c => {
          this.catalogSlaMap[c.name] = (c.slaDays * 24) + (c.slaHours || 0);
        });
      } catch (e) {
        console.error("Failed to load catalog SLA map:", e);
      }
    },

    isTicketLate(item) {
      if (item.statusId === "RESOLVED") return false;
      const slaTotalHours = this.catalogSlaMap[item.catalogName] || 0;
      if (slaTotalHours === 0) return false;
      const ageHours = moment().diff(moment(item.createdAt), "hours");
      return ageHours > slaTotalHours;
    },

    // ─── Data Fetching ─────────────────────────────────────────────
    async getCatalog() {
      try {
        const res    = await catalogService.getAllOptions();
        this.dataCatalog = res.data.data.map(c => ({ value: c.value, text: c.label }));
      } catch (e) { console.error(e); }
    },

    async getTicket(page) {
      this.loading = true;
      try {
        const param = {
          keyword:   this.keyword,
          catalog:   this.catalogId,
          status:    this.status,
          startDate: this.startDate ? moment(this.startDate).format("YYYY-MM-DD") : null,
          endDate:   this.endDate   ? moment(this.endDate).format("YYYY-MM-DD")   : null,
          page:      page - 1,
          size:      this.itemsPerpage,
        };

        const res  = await getTicket.getTicket(param);
        const data = res.data.data.content || [];

        // Tandai tiket yang LATE untuk chip
        this.items = data.map(item => ({
          ...item,
          isLate: this.isTicketLate(item),
        }));

        this.totalItems = res.data.data.totalElements || 0;
        this.totalPage  = Math.ceil(this.totalItems / this.itemsPerpage) || 1;
      } catch (e) {
        console.error(e);
        this.items = [];
      } finally {
        this.loading = false;
      }
    },

    // ─── Actions ───────────────────────────────────────────────────
    async onPageChangeDetil(value) {
      await this.getTicket(value);
    },

    handleClick(value) {
      this.$router.push(`/ithelpdesk/my-request/${value.id}`);
    },

    addTicket() {
      this.helpdeskModal = true;
    },

    closeHelpdeskModal(val) {
      this.helpdeskModal = false;
      this.getTicket(1);
      if (val) {
        this.$router.push(`/ithelpdesk/my-request/${val}`);
      }
    },

    // ─── Helpers ───────────────────────────────────────────────────
    formatDate(x) {
      return moment(x).format("DD-MM-YYYY");
    },

    disabledFromStartDate(date) {
      if (!this.startDate) return false;
      const start = new Date(this.startDate);
      start.setHours(0, 0, 0, 0);
      return date < start;
    },

    // isLate override chip jadi merah
    getStatusClass(statusId, isLate) {
      if (isLate && statusId !== "RESOLVED") return "status-late";
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

    errorPopup(val) {
      Swal.fire({ title: "Failed", text: val, icon: "error", button: false, timer: 2000 });
    },
  },
};
</script>

<style scoped>
.helpdesk-container { width: 100%; }
.main-card          { margin-top: 12px; }

.status-chip  { color: white !important; border-radius: 5px; height: 24px !important; }
.status-text  { font-size: 10px; }

.status-submitted { background-color: #0172b9 !important; }
.status-progress  { background-color: #0172b9 !important; }
.status-pending   { background-color: #ff7a00 !important; }
.status-assigned  { background-color: #a11497 !important; }
.status-late      { background-color: #ec323f !important; }
.status-solved    { background-color: #adc43b !important; }

.pagination-wrapper { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.total-data-text    { font-weight: 600; font-size: 13px; }
.table-container    { width: 100%; }

::v-deep .v-data-table > .v-data-table__wrapper > table { min-width: 100%; }
::v-deep .v-data-table tbody tr { cursor: pointer; }
::v-deep .v-data-table tbody tr:hover { background-color: #f5f5f5 !important; }

.datetime-picker { width: 100%; }
::v-deep .mx-input {
  height: 40px;
  border: 1px solid rgba(0,0,0,0.38);
  border-radius: 4px;
  padding: 0 12px;
}

.btn-blue { background-color: rgb(1, 114, 185) !important; color: white; text-transform: none; }
</style>