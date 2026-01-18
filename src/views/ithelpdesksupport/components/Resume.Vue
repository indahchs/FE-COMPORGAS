<template>
  <div class="resume-container">
    <!-- Loading Overlay -->
    <v-overlay :value="isLoading" z-index="999">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p class="mt-4 white--text">Loading data...</p>
    </v-overlay>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" top right>
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- Ticket Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="primary white--text">
          <v-icon left color="white">{{ icons.mdiTicketConfirmationOutline }}</v-icon>
          Ticket Details
          <v-spacer></v-spacer>
          <v-btn icon dark @click="detailDialog = false">
            <v-icon>{{ icons.mdiClose }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4" v-if="selectedTicket">
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-3">
                <span class="font-weight-bold">Ticket Number:</span>
                <v-chip class="ml-2" color="primary" outlined small>{{ selectedTicket.number }}</v-chip>
              </div>
              <div class="mb-3">
                <span class="font-weight-bold">Title:</span>
                <p class="mt-1 mb-0">{{ selectedTicket.title }}</p>
              </div>
              <div class="mb-3">
                <span class="font-weight-bold">Service:</span>
                <v-chip class="ml-2" small>{{ selectedTicket.catalogName }}</v-chip>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-3">
                <span class="font-weight-bold">Status:</span>
                <v-chip class="ml-2" :color="getStatusColor(selectedTicket.statusId)" dark small>
                  {{ selectedTicket.statusName }}
                  <v-icon right small>{{ getStatusIcon(selectedTicket.statusId) }}</v-icon>
                </v-chip>
              </div>
              <div class="mb-3">
                <span class="font-weight-bold">Location:</span>
                <p class="mt-1 mb-0">
                  <v-icon small>{{ icons.mdiMapMarker }}</v-icon>
                  {{ selectedTicket.officeName }}
                </p>
              </div>
              <div class="mb-3">
                <span class="font-weight-bold">Created Date:</span>
                <p class="mt-1 mb-0">
                  <v-icon small>{{ icons.mdiCalendar }}</v-icon>
                  {{ formatDate(selectedTicket.createdAt) }}
                </p>
              </div>
            </v-col>
            <v-col cols="12" v-if="selectedTicket.description">
              <v-divider class="my-2"></v-divider>
              <div class="mb-3">
                <span class="font-weight-bold">Description:</span>
                <p class="mt-2 mb-0">{{ selectedTicket.description || 'No description' }}</p>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="detailDialog = false">Close</v-btn>
          <v-btn color="primary" @click="editTicket(selectedTicket)">
            <v-icon left small>{{ icons.mdiPencil }}</v-icon>
            Edit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Comparison Dialog -->
    <v-dialog v-model="comparisonDialog" max-width="1200px" scrollable>
      <v-card>
        <v-card-title class="primary white--text">
          <v-icon left color="white">{{ icons.mdiChartLine }}</v-icon>
          Period Comparison
          <v-spacer></v-spacer>
          <v-btn icon dark @click="comparisonDialog = false">
            <v-icon>{{ icons.mdiClose }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-card outlined>
                <v-card-subtitle>Previous Period</v-card-subtitle>
                <v-card-text>
                  <div v-for="stat in comparisonData.previous" :key="stat.name" class="d-flex justify-space-between mb-2">
                    <span>{{ stat.name }}:</span>
                    <strong>{{ stat.value }}</strong>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card outlined>
                <v-card-subtitle>Current Period</v-card-subtitle>
                <v-card-text>
                  <div v-for="stat in comparisonData.current" :key="stat.name" class="d-flex justify-space-between mb-2">
                    <span>{{ stat.name }}:</span>
                    <strong>{{ stat.value }}</strong>
                    <v-chip x-small :color="stat.change >= 0 ? 'success' : 'error'" dark>
                      {{ stat.change >= 0 ? '+' : '' }}{{ stat.change }}%
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Header with Back Button -->
    <v-row v-if="!isChart" class="ma-0 mb-3">
      <v-col cols="12" class="pa-2">
        <v-btn icon small @click="goBack">
          <v-icon color="black">{{ icons.mdiArrowLeft }}</v-icon>
        </v-btn>
        <span class="text-h6 font-weight-bold black--text ml-2">{{ titleHeader }}</span>
      </v-col>
    </v-row>

    <div v-if="!isPersonal">
      <!-- Date Range Filter -->
      <v-card flat outlined class="mb-3">
        <v-card-text class="pa-2 pa-sm-3">
          <v-row class="ma-0">
            <v-col cols="6" sm="4" md="2" class="pa-1 pa-sm-2">
              <v-select dense outlined hide-details v-model="globalYear" :items="yearOptions" label="Year" @change="updateAllFilters"></v-select>
            </v-col>
            <v-col cols="6" sm="4" md="2" class="pa-1 pa-sm-2">
              <v-select dense outlined hide-details v-model="globalMonth" :items="monthList" item-text="name" item-value="value" label="Month" @change="updateAllFilters"></v-select>
            </v-col>
            <v-col cols="6" sm="4" md="2" class="pa-1 pa-sm-2">
              <v-btn block color="primary" @click="refreshAllData" :loading="isLoading" small>
                <v-icon left small>{{ icons.mdiRefresh }}</v-icon>
                <span class="hidden-xs-only">Refresh</span>
              </v-btn>
            </v-col>
            <v-col cols="6" sm="4" md="2" class="pa-1 pa-sm-2">
              <v-btn block color="success" @click="exportToExcel" :loading="exporting" small>
                <v-icon left small>{{ icons.mdiDownload }}</v-icon>
                <span class="hidden-xs-only">Export</span>
              </v-btn>
            </v-col>
            <v-col cols="6" sm="4" md="2" class="pa-1 pa-sm-2">
              <v-btn block color="info" @click="toggleView" small>
                <v-icon left small>{{ isChart ? icons.mdiTable : icons.mdiChartBar }}</v-icon>
                {{ isChart ? "Table" : "Charts" }}
              </v-btn>
            </v-col>
            <v-col cols="6" sm="4" md="2" class="pa-1 pa-sm-2">
              <v-btn block color="purple" dark @click="showComparison" small>
                <v-icon left small>{{ icons.mdiChartLine }}</v-icon>
                <span class="hidden-xs-only">Compare</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Ticket Stats Cards -->
      <v-row class="ma-0 mb-3">
        <v-col v-for="(stat, index) in ticketStats" :key="index" cols="6" sm="6" md="4" lg="2" class="pa-1 pa-sm-2">
          <v-card :class="stat.class" class="detail-info" hover @click="viewDetails(stat.title, stat.filter)" :elevation="stat.hover ? 8 : 2" @mouseover="stat.hover = true" @mouseleave="stat.hover = false">
            <v-card-text class="pa-3">
              <v-icon :size="iconSize" style="color: white">{{ stat.icon }}</v-icon>
              <div class="white--text mt-2 stat-title">{{ stat.title }}</div>
              <div class="stat-value font-weight-bold white--text mt-2">{{ stat.value }}</div>
              <div class="caption white--text mt-1">{{ calculatePercentage(stat.value) }}%</div>
              <v-progress-linear :value="calculatePercentage(stat.value)" color="white" height="3" class="mt-2"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts View -->
      <v-card v-if="isChart" class="mt-3">
        <v-card-title class="flex-column flex-sm-row pa-2 pa-sm-3">
          <span class="text-subtitle-1 text-sm-h6">Dashboard Analytics</span>
          <v-spacer class="hidden-xs-only"></v-spacer>
          <v-chip color="primary" outlined small class="mt-2 mt-sm-0">
            <v-icon left x-small>{{ icons.mdiCalendar }}</v-icon>
            {{ currentPeriodText }}
          </v-chip>
        </v-card-title>
        <v-card-text class="pa-2 pa-sm-3">
          <v-row class="ma-0">
            <v-col cols="12" lg="6" class="pa-1 pa-sm-2">
              <v-card outlined>
                <v-card-title class="text-subtitle-2 text-sm-subtitle-1 pa-2 pa-sm-3">
                  <v-icon left color="primary" small>{{ icons.mdiChartBar }}</v-icon>
                  Tickets by Day
                </v-card-title>
                <v-card-text class="pa-2">
                  <apexchart ref="chartDailyRef" type="bar" :height="chartHeight" :options="chartDailyOptions" :series="seriesDaily"></apexchart>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" lg="6" class="pa-1 pa-sm-2">
              <v-card outlined>
                <v-card-title class="text-subtitle-2 text-sm-subtitle-1 pa-2 pa-sm-3">
                  <v-icon left color="primary" small>{{ icons.mdiShape }}</v-icon>
                  Tickets by Category
                </v-card-title>
                <v-card-text class="pa-2">
                  <apexchart ref="chartCategoryRef" type="bar" :height="chartHeight" :options="chartCategoryOptions" :series="seriesCategory"></apexchart>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" lg="6" class="pa-1 pa-sm-2">
              <v-card outlined>
                <v-card-title class="text-subtitle-2 text-sm-subtitle-1 pa-2 pa-sm-3">
                  <v-icon left color="primary" small>{{ icons.mdiAccount }}</v-icon>
                  Tickets by Assignee
                </v-card-title>
                <v-card-text class="pa-2">
                  <apexchart ref="chartPicRef" type="bar" :height="chartHeight" :options="chartPicOptions" :series="seriesPic"></apexchart>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" lg="6" class="pa-1 pa-sm-2">
              <v-card outlined>
                <v-card-title class="text-subtitle-2 text-sm-subtitle-1 pa-2 pa-sm-3">
                  <v-icon left color="primary" small>{{ icons.mdiMapMarker }}</v-icon>
                  Tickets by Location
                </v-card-title>
                <v-card-text class="pa-2">
                  <apexchart ref="chartOfficeRef" type="bar" :height="chartHeight" :options="chartOfficeOptions" :series="seriesOffice"></apexchart>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" class="pa-1 pa-sm-2">
              <v-card outlined>
                <v-card-title class="text-subtitle-2 text-sm-subtitle-1 pa-2 pa-sm-3">
                  <v-icon left color="primary" small>{{ icons.mdiClockOutline }}</v-icon>
                  SLA Performance
                  <v-spacer></v-spacer>
                  <v-chip :color="slaPerformanceColor" text-color="white" x-small>{{ slaPerformanceText }}</v-chip>
                </v-card-title>
                <v-card-text class="pa-2">
                  <apexchart ref="chartSLARef" type="bar" :height="chartHeight" :options="chartOptionsStack" :series="seriesStack"></apexchart>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Table View -->
      <v-card class="mt-3" v-else>
        <v-card-title class="flex-column flex-sm-row pa-2 pa-sm-3">
          <div class="d-flex align-center">
            <v-icon left>{{ icons.mdiTable }}</v-icon>
            <span class="text-subtitle-1 text-sm-h6">Ticket List</span>
          </div>
          <v-spacer class="hidden-xs-only"></v-spacer>
          <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details clearable outlined dense class="mt-2 mt-sm-0" style="max-width: 400px"></v-text-field>
        </v-card-title>
        <v-card-text class="pa-0 pa-sm-2">
          <div class="table-wrapper">
            <v-data-table :headers="tableHeaders" :items="items" :search="search" :loading="isLoading" @click:row="openTicketDetail" class="elevation-0 row-pointer" :mobile-breakpoint="0" :footer-props="{ 'items-per-page-options': [10, 25, 50, 100] }">
              <template #[`item.number`]="{ item }">
                <v-chip small color="primary" outlined>{{ item.number }}</v-chip>
              </template>
              <template #[`item.createdAt`]="{ item }">
                <div class="d-flex align-center text-no-wrap">
                  <v-icon small class="mr-1">{{ icons.mdiCalendar }}</v-icon>
                  {{ formatDate(item.createdAt) }}
                </div>
              </template>
              <template #[`item.statusName`]="{ item }">
                <v-chip :color="getStatusColor(item.statusId)" dark small>
                  {{ item.statusName }}
                  <v-icon right x-small>{{ getStatusIcon(item.statusId) }}</v-icon>
                </v-chip>
              </template>
              <template #[`item.actions`]="{ item }">
                <v-btn icon small @click.stop="openTicketDetail(item)">
                  <v-icon small color="primary">{{ icons.mdiEye }}</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import {
  mdiTicketConfirmationOutline, mdiClipboardTextClockOutline, mdiClipboardArrowRightOutline,
  mdiClipboardAlertOutline, mdiLoading, mdiCheckDecagramOutline, mdiMagnify, mdiCheck,
  mdiCheckAll, mdiArrowLeft, mdiRefresh, mdiDownload, mdiTable, mdiChartBar,
  mdiEye, mdiClose, mdiPencil, mdiCalendar, mdiMapMarker, mdiChartLine,
  mdiClockOutline, mdiAccount, mdiShape,
} from "@mdi/js";
import moment from "moment";
import ItHelpDeskService from "@/services/ithelpdesk/itHelpDeskServices";
import HelpdeskDashboardService from "@/services/helpdeskdashboard/helpdeskDashboardServices";

const getTicket = ItHelpDeskService.build();
const dashboardService = HelpdeskDashboardService.build();

export default {
  name: "HelpdeskDashboard",
  data() {
    return {
      isLoading: false, exporting: false, isChart: true, isPersonal: false,
      search: "", detailDialog: false, comparisonDialog: false,
      selectedTicket: null, currentFilter: null, statusFilter: null,
      snackbar: { show: false, message: "", color: "success" },
      comparisonData: { previous: [], current: [] },
      globalYear: new Date().getFullYear(),
      globalMonth: new Date().getMonth() + 1,
      monthList: [
        { name: "Jan", value: 1 }, { name: "Feb", value: 2 }, { name: "Mar", value: 3 },
        { name: "Apr", value: 4 }, { name: "May", value: 5 }, { name: "Jun", value: 6 },
        { name: "Jul", value: 7 }, { name: "Aug", value: 8 }, { name: "Sep", value: 9 },
        { name: "Oct", value: 10 }, { name: "Nov", value: 11 }, { name: "Dec", value: 12 },
      ],
      icons: {
        mdiArrowLeft, mdiClipboardTextClockOutline, mdiClipboardArrowRightOutline,
        mdiClipboardAlertOutline, mdiLoading, mdiTicketConfirmationOutline,
        mdiCheckDecagramOutline, mdiMagnify, mdiCheck, mdiCheckAll, mdiRefresh,
        mdiDownload, mdiTable, mdiChartBar, mdiEye, mdiClose, mdiPencil,
        mdiCalendar, mdiMapMarker, mdiChartLine, mdiClockOutline, mdiAccount, mdiShape,
      },
      allTickets: 0, assignedTickets: 0, progressTickets: 0,
      pendingTickets: 0, lateTickets: 0, solvedTickets: 0,
      yearOptions: [], titleHeader: "",
      headers: [
        { text: "Name", value: "userName" }, { text: "PIC", value: "picName" },
        { text: "Ticket No", value: "number" }, { text: "Date", value: "createdAt" },
        { text: "Title", value: "title" }, { text: "Service", value: "catalogName" },
        { text: "Location", value: "officeName" }, { text: "Status", value: "statusName" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      items: [],
      seriesDaily: [{ name: "Tickets", data: [] }],
      seriesCategory: [{ name: "Tickets", data: [] }],
      seriesPic: [{ name: "Tickets", data: [] }],
      seriesOffice: [{ name: "Tickets", data: [] }],
      seriesStack: [
        { name: "Avg SLA", type: "bar", data: [] },
        { name: "Max SLA", type: "line", data: [] },
      ],
      chartDailyOptions: {}, chartCategoryOptions: {},
      chartPicOptions: {}, chartOfficeOptions: {}, chartOptionsStack: {},
    };
  },
  computed: {
    ticketStats() {
      return [
        { title: "All Tickets", value: this.allTickets, icon: this.icons.mdiTicketConfirmationOutline, class: "all-ticket", filter: "all", hover: false },
        { title: "Assigned", value: this.assignedTickets, icon: this.icons.mdiClipboardArrowRightOutline, class: "assigned-ticket", filter: "assigned", hover: false },
        { title: "In Progress", value: this.progressTickets, icon: this.icons.mdiLoading, class: "progress-ticket", filter: "progress", hover: false },
        { title: "Pending", value: this.pendingTickets, icon: this.icons.mdiClipboardTextClockOutline, class: "pending-ticket", filter: "pending", hover: false },
        { title: "Late", value: this.lateTickets, icon: this.icons.mdiClipboardAlertOutline, class: "late-ticket", filter: "late", hover: false },
        { title: "Solved", value: this.solvedTickets, icon: this.icons.mdiCheckDecagramOutline, class: "solved-ticket", filter: "solved", hover: false },
      ];
    },
    currentPeriodText() {
      const monthName = this.monthList.find(m => m.value === this.globalMonth)?.name;
      return `${monthName} ${this.globalYear}`;
    },
    slaPerformanceColor() {
      if (this.seriesStack[0].data.length === 0) return "grey";
      const avgSLA = this.seriesStack[0].data.reduce((a, b) => a + b, 0) / this.seriesStack[0].data.length;
      const maxSLA = Math.max(...this.seriesStack[1].data);
      const ratio = avgSLA / maxSLA;
      if (ratio < 0.5) return "success";
      if (ratio < 0.75) return "warning";
      return "error";
    },
    slaPerformanceText() {
      const color = this.slaPerformanceColor;
      if (color === "success") return "Excellent";
      if (color === "warning") return "Good";
      if (color === "error") return "Attention";
      return "No Data";
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
    chartHeight() {
      if (this.$vuetify.breakpoint.xs) return 250;
      if (this.$vuetify.breakpoint.sm) return 300;
      return 350;
    },
    iconSize() {
      return this.$vuetify.breakpoint.xs ? 24 : 32;
    }
  },
  mounted() {
    this.initializeChartOptions();
    this.initializeDashboard();
  },
  methods: {
    initializeChartOptions() {
      this.chartDailyOptions = this.getBaseChartOptions("Date", "Tickets");
      this.chartCategoryOptions = this.getBaseChartOptions("Category", "Tickets");
      this.chartPicOptions = this.getBaseChartOptions("Assignee", "Tickets");
      this.chartOfficeOptions = this.getBaseChartOptions("Location", "Tickets");
      this.chartOptionsStack = this.getSLAChartOptions();
    },
    async initializeDashboard() {
      this.isLoading = true;
      try {
        await this.getYearOptions();
        await this.loadAllData();
        this.showSnackbar("Dashboard loaded", "success");
      } catch (error) {
        this.showSnackbar("Error loading dashboard", "error");
      } finally {
        this.isLoading = false;
      }
    },
    async loadAllData() {
      const promises = [
        this.getAllTicketsCount(), this.getTicketAssignedCount(),
        this.getTicketInProgressCount(), this.getTicketPendingCount(),
        this.getTicketResolvedCount(), this.getTicketLateCount(),
        this.getTicketsByMonth(), this.getTicketsByCategory(),
        this.getTicketsByPic(), this.getTicketsByOffice(),
        this.getTicketsByCategorySlaHours(),
      ];
      await Promise.all(promises);
    },
    async refreshAllData() {
      this.isLoading = true;
      try {
        await this.loadAllData();
        this.showSnackbar("Data refreshed", "success");
      } catch (error) {
        this.showSnackbar("Error refreshing", "error");
      } finally {
        this.isLoading = false;
      }
    },
    async updateAllFilters() {
      this.isLoading = true;
      try { await this.loadAllData(); } 
      finally { this.isLoading = false; }
    },
    async getAllTicketsCount() {
      try {
        const param = { year: this.globalYear, month: this.globalMonth };
        const res = await dashboardService.getAllTicketsCount(param);
        this.allTickets = res.data.data || 0;
      } catch (error) { this.allTickets = 0; }
    },
    async getTicketAssignedCount() {
      try {
        const param = { year: this.globalYear, month: this.globalMonth };
        const res = await dashboardService.getTicketAssignedCount(param);
        this.assignedTickets = res.data.data || 0;
      } catch (error) { this.assignedTickets = 0; }
    },
    async getTicketInProgressCount() {
      try {
        const param = { year: this.globalYear, month: this.globalMonth };
        const res = await dashboardService.getTicketInProgressCount(param);
        this.progressTickets = res.data.data || 0;
      } catch (error) { this.progressTickets = 0; }
    },
    async getTicketPendingCount() {
      try {
        const param = { year: this.globalYear, month: this.globalMonth };
        const res = await dashboardService.getTicketPendingCount(param);
        this.pendingTickets = res.data.data || 0;
      } catch (error) { this.pendingTickets = 0; }
    },
    async getTicketResolvedCount() {
      try {
        const param = { year: this.globalYear, month: this.globalMonth };
        const res = await dashboardService.getTicketResolvedCount(param);
        this.solvedTickets = res.data.data || 0;
      } catch (error) { this.solvedTickets = 0; }
    },
    async getTicketLateCount() {
      try {
        const param = { year: this.globalYear, month: this.globalMonth };
        const res = await dashboardService.getTicketLateCount(param);
        this.lateTickets = res.data.data || 0;
      } catch (error) { this.lateTickets = 0; }
    },
    async getTicketsByMonth() {
      try {
        const param = { year: this.globalYear, month: this.globalMonth };
        const res = await dashboardService.getTicketCountByMonth(param);
        const data = res.data.data || [];
        this.seriesDaily[0].data = data.map(item => item.totalCount);
        this.chartDailyOptions.xaxis.categories = data.map(item => item.groupName);
        if (this.$refs.chartDailyRef) this.$refs.chartDailyRef.refresh();
      } catch (error) { console.error(error); }
    },
    async getTicketsByCategory() {
      try {
        const param = { year: this.globalYear, month: this.globalMonth };
        const res = await dashboardService.getTicketCountByCatalog(param);
        const data = res.data.data || [];
        this.seriesCategory[0].data = data.map(item => item.totalCount);
        this.chartCategoryOptions.xaxis.categories = data.map(item => item.groupName);
        if (this.$refs.chartCategoryRef) this.$refs.chartCategoryRef.refresh();
      } catch (error) { console.error(error); }
    },
    async getTicketsByPic() {
      try {
        const param = { year: this.globalYear, month: this.globalMonth };
        const res = await dashboardService.getTicketCountByPic(param);
        const data = res.data.data || [];
        this.seriesPic[0].data = data.map(item => item.totalCount);
        this.chartPicOptions.xaxis.categories = data.map(item => item.groupName);
        if (this.$refs.chartPicRef) this.$refs.chartPicRef.refresh();
      } catch (error) { console.error(error); }
    },
    async getTicketsByOffice() {
      try {
        const param = { year: this.globalYear, month: this.globalMonth };
        const res = await dashboardService.getTicketCountByOffice(param);
        const data = res.data.data || [];
        this.seriesOffice[0].data = data.map(item => item.totalCount);
        this.chartOfficeOptions.xaxis.categories = data.map(item => item.groupName);
        if (this.$refs.chartOfficeRef) this.$refs.chartOfficeRef.refresh();
      } catch (error) { console.error(error); }
    },
    async getTicketsByCategorySlaHours() {
      try {
        const param = { year: this.globalYear, month: this.globalMonth };
        const res = await dashboardService.getTicketCountByCatalogSlaHours(param);
        const data = res.data.data || [];
        this.chartOptionsStack.xaxis.categories = data.map(item => item.groupName);
        this.seriesStack[0].data = data.map(item => item.avgSla || 0);
        this.seriesStack[1].data = data.map(item => item.sla || 0);
        if (this.$refs.chartSLARef) this.$refs.chartSLARef.refresh();
      } catch (error) { console.error(error); }
    },
    async getYearOptions() {
      try {
        const res = await dashboardService.getYearOptions();
        this.yearOptions = res.data.data || [];
      } catch (error) {
        this.yearOptions = [new Date().getFullYear()];
      }
    },
    async viewDetails(title, filter) {
      this.currentFilter = filter;
      this.titleHeader = title;
      const statusMap = {
        'all': null, 'assigned': 'ASSIGNED', 'progress': 'INPROGRESS',
        'pending': 'PENDING', 'late': 'LATE', 'solved': 'RESOLVED',
      };
      this.statusFilter = statusMap[filter];
      this.isChart = false;
      await this.loadTableData();
    },
    async loadTableData() {
      try {
        this.isLoading = true;
        const param = {
          keyword: null, location: null, startDate: null, endDate: null,
          catalog: null, status: this.statusFilter, size: 1000, page: 0,
        };
        const res = await getTicket.getTicketPic(param);
        this.items = res.data.data.content || [];
        this.showSnackbar(`Loaded ${this.items.length} tickets`, "success");
      } catch (error) {
        this.showSnackbar("Error loading tickets", "error");
        this.items = [];
      } finally {
        this.isLoading = false;
      }
    },
    openTicketDetail(item) {
      this.selectedTicket = item;
      this.detailDialog = true;
    },
    editTicket(ticket) {
      this.detailDialog = false;
      this.$router.push({
        name: "ithelpdesksupport-my-request-detail",
        params: { id: ticket.id },
      });
    },
    async showComparison() {
      this.isLoading = true;
      try {
        let prevYear = this.globalYear;
        let prevMonth = this.globalMonth - 1;
        if (prevMonth === 0) {
          prevMonth = 12;
          prevYear -= 1;
        }
        const prevParam = { year: prevYear, month: prevMonth };
        const [prevAll, prevAssigned, prevProgress, prevPending, prevLate, prevSolved] = 
          await Promise.all([
            dashboardService.getAllTicketsCount(prevParam),
            dashboardService.getTicketAssignedCount(prevParam),
            dashboardService.getTicketInProgressCount(prevParam),
            dashboardService.getTicketPendingCount(prevParam),
            dashboardService.getTicketLateCount(prevParam),
            dashboardService.getTicketResolvedCount(prevParam),
          ]);
        const prevData = {
          all: prevAll.data.data || 0, assigned: prevAssigned.data.data || 0,
          progress: prevProgress.data.data || 0, pending: prevPending.data.data || 0,
          late: prevLate.data.data || 0, solved: prevSolved.data.data || 0,
        };
        this.comparisonData.previous = [
          { name: "All", value: prevData.all },
          { name: "Assigned", value: prevData.assigned },
          { name: "Progress", value: prevData.progress },
          { name: "Pending", value: prevData.pending },
          { name: "Late", value: prevData.late },
          { name: "Solved", value: prevData.solved },
        ];
        this.comparisonData.current = [
          { name: "All", value: this.allTickets, change: this.calculateChange(prevData.all, this.allTickets) },
          { name: "Assigned", value: this.assignedTickets, change: this.calculateChange(prevData.assigned, this.assignedTickets) },
          { name: "Progress", value: this.progressTickets, change: this.calculateChange(prevData.progress, this.progressTickets) },
          { name: "Pending", value: this.pendingTickets, change: this.calculateChange(prevData.pending, this.pendingTickets) },
          { name: "Late", value: this.lateTickets, change: this.calculateChange(prevData.late, this.lateTickets) },
          { name: "Solved", value: this.solvedTickets, change: this.calculateChange(prevData.solved, this.solvedTickets) },
        ];
        this.comparisonDialog = true;
      } catch (error) {
        this.showSnackbar("Error loading comparison", "error");
      } finally {
        this.isLoading = false;
      }
    },
    calculateChange(oldVal, newVal) {
      if (oldVal === 0) return newVal > 0 ? 100 : 0;
      return Math.round(((newVal - oldVal) / oldVal) * 100);
    },
    async exportToExcel() {
      this.exporting = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const headers = ["Name", "PIC", "Ticket", "Date", "Title", "Service", "Location", "Status"];
        const csvData = this.items.map(item => [
          item.userName || "", item.picName || "", item.number || "",
          this.formatDate(item.createdAt), item.title || "",
          item.catalogName || "", item.officeName || "", item.statusName || ""
        ]);
        const csvContent = [
          headers.join(","),
          ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `tickets_${this.currentPeriodText}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showSnackbar("Exported successfully", "success");
      } catch (error) {
        this.showSnackbar("Export error", "error");
      } finally {
        this.exporting = false;
      }
    },
    formatDate(date) {
      return moment(date).format("DD MMM YYYY");
    },
    calculatePercentage(value) {
      if (this.allTickets === 0) return 0;
      return ((value / this.allTickets) * 100).toFixed(1);
    },
    getStatusColor(statusId) {
      const colorMap = {
        "SUBMITTED": "#0172b9", "INPROGRESS": "#0172b9", "PENDING": "#ff7a00",
        "ASSIGNED": "#a11497", "LATE": "#ec323f", "RESOLVED": "#adc43b",
      };
      return colorMap[statusId] || "#9a9a9a";
    },
    getStatusIcon(statusId) {
      if (statusId === "RESOLVED") return this.icons.mdiCheckAll;
      return this.icons.mdiCheck;
    },
    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    toggleView() {
      this.isChart = !this.isChart;
      if (!this.isChart && this.items.length === 0) {
        this.currentFilter = 'all';
        this.statusFilter = null;
        this.loadTableData();
      }
    },
    goBack() {
      this.isChart = true;
      this.titleHeader = "";
      this.currentFilter = null;
      this.statusFilter = null;
    },
    getBaseChartOptions(xLabel, yLabel) {
      return {
        chart: { toolbar: { show: false }, type: "bar" },
        plotOptions: {
          bar: {
            distributed: true, horizontal: false, borderRadius: 6,
            dataLabels: { position: "top" },
          },
        },
        colors: ["#33b2df", "#546E7A", "#d4526e", "#13d8aa", "#A5978B", "#2b908f", "#f9a3a4", "#90ee7e", "#f48024", "#69d2e7"],
        dataLabels: {
          enabled: true, offsetY: -20,
          style: { fontSize: "11px", colors: ["#304758"] },
        },
        xaxis: {
          categories: [], title: { text: xLabel },
          labels: { style: { fontSize: "11px" } }
        },
        yaxis: {
          title: { text: yLabel },
          labels: {
            formatter: (val) => Number.isInteger(val) ? val.toFixed(0) : "",
            style: { fontSize: "11px" }
          },
        },
        legend: { show: false },
        tooltip: { y: { formatter: (val) => `${val} tickets` } },
      };
    },
    getSLAChartOptions() {
      return {
        chart: { stacked: false, toolbar: { show: false } },
        colors: ["#33b2df", "#f9a3a4"],
        dataLabels: {
          enabled: true, enabledOnSeries: [0],
          style: { fontSize: "10px" }
        },
        stroke: { width: [0, 3], curve: "smooth" },
        plotOptions: {
          bar: { columnWidth: "50%", borderRadius: 5 },
        },
        xaxis: {
          categories: [],
          labels: { style: { fontSize: "11px" } }
        },
        yaxis: {
          title: { text: "Hours" },
          labels: {
            formatter: (val) => Number.isInteger(val) ? val.toFixed(0) : "",
            style: { fontSize: "11px" }
          },
        },
        tooltip: {
          shared: true, intersect: false,
          y: { formatter: (val) => `${val} hours` },
        },
        legend: {
          position: "top", horizontalAlign: "left",
          fontSize: "11px"
        },
      };
    },
  },
};
</script>

<style scoped>
.resume-container {
  width: 100%;
}

.detail-info {
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 8px;
}

.detail-info:hover {
  transform: translateY(-2px);
}

.stat-title {
  font-size: 11px;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
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

.table-wrapper {
  overflow-x: auto;
  width: 100%;
}

.row-pointer >>> tbody tr {
  cursor: pointer;
}

.row-pointer >>> tbody tr:hover {
  background-color: #f5f5f5;
}
</style>