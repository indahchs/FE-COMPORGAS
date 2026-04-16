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
    <v-dialog v-model="comparisonDialog" max-width="960px" scrollable>
      <v-card>
        <v-card-title class="primary white--text">
          <v-icon left color="white">{{ icons.mdiChartLine }}</v-icon>
          Period Comparison
          <v-spacer></v-spacer>
          <v-btn icon dark @click="comparisonDialog = false">
            <v-icon>{{ icons.mdiClose }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">

          <!-- Period Label -->
          <div class="d-flex align-center justify-center mb-5" style="gap: 10px;">
            <div class="period-label prev-label">
              <v-icon small class="mr-1">{{ icons.mdiCalendar }}</v-icon>
              Previous: {{ comparisonData.previousPeriod }}
            </div>
            <v-icon small color="grey">{{ icons.mdiArrowRight }}</v-icon>
            <div class="period-label curr-label">
              <v-icon small class="mr-1">{{ icons.mdiCalendar }}</v-icon>
              Current: {{ comparisonData.currentPeriod }}
            </div>
          </div>

          <!-- Stat Cards -->
          <v-row>
            <v-col
              v-for="(stat, index) in comparisonData.stats"
              :key="index"
              cols="12" sm="6" md="4"
            >
              <v-card outlined elevation="1" class="comparison-stat-card">
                <v-card-text class="pa-4">

                  <!-- Header: icon + name + value + badge -->
                  <div class="d-flex align-center mb-3">
                    <v-avatar
                      size="38"
                      class="mr-3"
                      style="background: white; border: 2px solid #e0e0e0;"
                    >
                      <v-icon :color="stat.change >= 0 ? 'success' : 'error'" small>
                        {{ getStatIcon(stat.name) }}
                      </v-icon>
                    </v-avatar>
                    <div>
                      <div class="caption grey--text">{{ stat.name }}</div>
                      <div class="text-h6 font-weight-bold">{{ stat.currentValue }}</div>
                    </div>
                    <v-spacer></v-spacer>
                    <v-chip
                      :color="stat.change >= 0 ? 'success' : 'error'"
                      dark x-small
                      class="font-weight-bold"
                    >
                      <v-icon left x-small>{{ stat.change >= 0 ? icons.mdiArrowUp : icons.mdiArrowDown }}</v-icon>
                      {{ Math.abs(stat.change) }}%
                    </v-chip>
                  </div>

                  <!-- Previous vs Current label -->
                  <div class="d-flex justify-space-between caption grey--text mb-1">
                    <span>Previous: {{ stat.previousValue }}</span>
                    <span>Current: {{ stat.currentValue }}</span>
                  </div>

                  <!-- Previous bar -->
                  <v-progress-linear
                    :value="stat.previousPercent"
                    color="grey lighten-1"
                    height="6"
                    rounded
                    class="mb-1"
                  ></v-progress-linear>

                  <!-- Current bar -->
                  <v-progress-linear
                    :value="stat.currentPercent"
                    :color="stat.change >= 0 ? 'success' : 'error'"
                    height="6"
                    rounded
                  ></v-progress-linear>

                  <!-- Trend text -->
                  <div class="mt-2 text-caption text-center">
                    <span v-if="stat.change > 0" class="success--text">
                      ↑ Increased by {{ stat.change }}%
                    </span>
                    <span v-else-if="stat.change < 0" class="error--text">
                      ↓ Decreased by {{ Math.abs(stat.change) }}%
                    </span>
                    <span v-else class="grey--text">No change</span>
                  </div>

                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Legend -->
          <v-card flat color="grey lighten-4" class="mt-4">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-around flex-wrap" style="gap: 8px;">
                <div class="d-flex align-center">
                  <span class="legend-dot grey-dot mr-2"></span>
                  <span class="caption">Previous period</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon color="success" small class="mr-1">{{ icons.mdiArrowUp }}</v-icon>
                  <span class="caption">Green = increase</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon color="error" small class="mr-1">{{ icons.mdiArrowDown }}</v-icon>
                  <span class="caption">Red = decrease</span>
                </div>
                <v-chip x-small outlined>
                  <v-icon left x-small>{{ icons.mdiInformationOutline }}</v-icon>
                  {{ currentPeriodText }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="grey darken-1" @click="comparisonDialog = false">Close</v-btn>
          <v-btn color="primary" @click="refreshComparison" :loading="isLoading">
            <v-icon left small>{{ icons.mdiRefresh }}</v-icon>
            Refresh
          </v-btn>
        </v-card-actions>
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
              <v-btn block color="primary" @click="refreshAllData" :loading="isLoading" big>
                <v-icon left small>{{ icons.mdiRefresh }}</v-icon>
                <span class="hidden-xxs-only">Refresh</span>
              </v-btn>
            </v-col>
            <v-col cols="6" sm="4" md="2" class="pa-1 pa-sm-2">
              <v-btn block color="success" @click="exportToExcel" :loading="exporting" big>
                <v-icon left small>{{ icons.mdiDownload }}</v-icon>
                <span class="hidden-xxs-only">Export</span>
              </v-btn>
            </v-col>
            <v-col cols="6" sm="4" md="2" class="pa-1 pa-sm-2">
              <v-btn block color="info" @click="toggleView" big>
                <v-icon left small>{{ isChart ? icons.mdiTable : icons.mdiChartBar }}</v-icon>
                {{ isChart ? "Table" : "Charts" }}
              </v-btn>
            </v-col>
            <v-col cols="6" sm="4" md="2" class="pa-1 pa-sm-2">
              <v-btn block color="purple" dark @click="showComparison" big>
                <v-icon left small>{{ icons.mdiChartLine }}</v-icon>
                <span class="hidden-xxs-only">Compare</span>
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
                  <v-icon left color="primary" small>{{ icons.mdiChartBar }}</v-icon>Tickets by Day
                </v-card-title>
                <v-card-text class="pa-2">
                  <apexchart ref="chartDailyRef" type="bar" :height="chartHeight" :options="chartDailyOptions" :series="seriesDaily"></apexchart>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" lg="6" class="pa-1 pa-sm-2">
              <v-card outlined>
                <v-card-title class="text-subtitle-2 text-sm-subtitle-1 pa-2 pa-sm-3">
                  <v-icon left color="primary" small>{{ icons.mdiShape }}</v-icon>Tickets by Category
                </v-card-title>
                <v-card-text class="pa-2">
                  <apexchart ref="chartCategoryRef" type="bar" :height="chartHeight" :options="chartCategoryOptions" :series="seriesCategory"></apexchart>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" lg="6" class="pa-1 pa-sm-2">
              <v-card outlined>
                <v-card-title class="text-subtitle-2 text-sm-subtitle-1 pa-2 pa-sm-3">
                  <v-icon left color="primary" small>{{ icons.mdiAccount }}</v-icon>Tickets by Assignee
                </v-card-title>
                <v-card-text class="pa-2">
                  <apexchart ref="chartPicRef" type="bar" :height="chartHeight" :options="chartPicOptions" :series="seriesPic"></apexchart>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" lg="6" class="pa-1 pa-sm-2">
              <v-card outlined>
                <v-card-title class="text-subtitle-2 text-sm-subtitle-1 pa-2 pa-sm-3">
                  <v-icon left color="primary" small>{{ icons.mdiMapMarker }}</v-icon>Tickets by Location
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
          <div class="d-flex align-center flex-wrap">
            <v-icon left>{{ icons.mdiTable }}</v-icon>
            <span class="text-subtitle-1 text-sm-h6">{{ titleHeader || 'Ticket List' }}</span>
            <v-chip class="ml-2" small outlined color="primary">{{ currentPeriodText }}</v-chip>
          </div>
          <v-spacer class="hidden-xxs-only"></v-spacer>
          <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details clearable outlined dense class="mt-2 mt-sm-0" style="max-width: 400px"></v-text-field>
        </v-card-title>
        <v-card-text class="pa-0 pa-sm-2">
          <div class="table-wrapper">
            <v-data-table
              :headers="tableHeaders"
              :items="items"
              :search="search"
              :loading="isLoading"
              @click:row="openTicketDetail"
              class="elevation-0 row-pointer"
              :mobile-breakpoint="0"
              :footer-props="{ 'items-per-page-options': [10, 25, 50, 100] }"
            >
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
  mdiClockOutline, mdiAccount, mdiShape, mdiArrowUp, mdiArrowDown,
  mdiInformationOutline, mdiTrendingUp, mdiTrendingDown,
} from "@mdi/js";
import moment from "moment";
import ItHelpDeskService from "@/services/ithelpdesk/itHelpDeskServices";
import HelpdeskDashboardService from "@/services/helpdeskdashboard/helpdeskDashboardServices";

const getTicket        = ItHelpDeskService.build();
const dashboardService = HelpdeskDashboardService.build();

export default {
  name: "HelpdeskDashboard",
  data() {
    return {
      isLoading: false, exporting: false, isChart: true, isPersonal: false,
      search: "", detailDialog: false, comparisonDialog: false,
      selectedTicket: null, currentFilter: null, statusFilter: null,
      snackbar: { show: false, message: "", color: "success" },
      comparisonData: {
        previousPeriod: "",
        currentPeriod: "",
        stats: []
      },
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
        mdiArrowUp, mdiArrowDown, mdiInformationOutline, mdiTrendingUp, mdiTrendingDown,
      },
      allTickets: 0, assignedTickets: 0, progressTickets: 0,
      pendingTickets: 0, lateTickets: 0, solvedTickets: 0,
      yearOptions: [], titleHeader: "",
      // SLA map: { catalogName -> total SLA hours }
      catalogSlaMap: {},
      headers: [
        { text: "Name", value: "userName" }, { text: "PIC", value: "picName" },
        { text: "Ticket No", value: "number" }, { text: "Date", value: "createdAt" },
        { text: "Title", value: "title" }, { text: "Service", value: "catalogName" },
        { text: "Location", value: "officeName" }, { text: "Status", value: "statusName" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      items: [],
      seriesDaily:    [{ name: "Tickets", data: [] }],
      seriesCategory: [{ name: "Tickets", data: [] }],
      seriesPic:      [{ name: "Tickets", data: [] }],
      seriesOffice:   [{ name: "Tickets", data: [] }],
      seriesStack: [
        { name: "Avg SLA", type: "bar",  data: [] },
        { name: "Max SLA", type: "line", data: [] },
      ],
      chartDailyOptions: {}, chartCategoryOptions: {},
      chartPicOptions: {}, chartOfficeOptions: {}, chartOptionsStack: {},
    };
  },

  computed: {
    ticketStats() {
      return [
        { title: "All Tickets", value: this.allTickets,      icon: this.icons.mdiTicketConfirmationOutline,  class: "all-ticket",      filter: "all",      hover: false },
        { title: "Assigned",    value: this.assignedTickets, icon: this.icons.mdiClipboardArrowRightOutline, class: "assigned-ticket", filter: "assigned", hover: false },
        { title: "In Progress", value: this.progressTickets, icon: this.icons.mdiLoading,                   class: "progress-ticket", filter: "progress", hover: false },
        { title: "Pending",     value: this.pendingTickets,  icon: this.icons.mdiClipboardTextClockOutline,  class: "pending-ticket",  filter: "pending",  hover: false },
        { title: "Late",        value: this.lateTickets,     icon: this.icons.mdiClipboardAlertOutline,      class: "late-ticket",     filter: "late",     hover: false },
        { title: "Solved",      value: this.solvedTickets,   icon: this.icons.mdiCheckDecagramOutline,       class: "solved-ticket",   filter: "solved",   hover: false },
      ];
    },
    currentPeriodText() {
      const monthName = this.monthList.find(m => m.value === this.globalMonth)?.name;
      return `${monthName} ${this.globalYear}`;
    },
    slaPerformanceColor() {
      if (!this.seriesStack[0].data.length) return "grey";
      const avg   = this.seriesStack[0].data.reduce((a, b) => a + b, 0) / this.seriesStack[0].data.length;
      const max   = Math.max(...this.seriesStack[1].data);
      const ratio = avg / max;
      if (ratio < 0.5)  return "success";
      if (ratio < 0.75) return "warning";
      return "error";
    },
    slaPerformanceText() {
      return { success: "Excellent", warning: "Good", error: "Attention", grey: "No Data" }[this.slaPerformanceColor];
    },
    tableHeaders() {
      if (this.$vuetify.breakpoint.xs) return [
        { text: "Ticket", value: "number" },
        { text: "Title",  value: "title" },
        { text: "Status", value: "statusName" },
      ];
      if (this.$vuetify.breakpoint.sm) return [
        { text: "Ticket", value: "number" },
        { text: "Date",   value: "createdAt" },
        { text: "Title",  value: "title" },
        { text: "Status", value: "statusName" },
      ];
      return this.headers;
    },
    chartHeight() {
      if (this.$vuetify.breakpoint.xs) return 250;
      if (this.$vuetify.breakpoint.sm) return 300;
      return 350;
    },
    iconSize() { return this.$vuetify.breakpoint.xs ? 24 : 32; },
  },

  mounted() {
    this.initializeChartOptions();
    this.initializeDashboard();
  },

  methods: {
    initializeChartOptions() {
      this.chartDailyOptions    = this.getBaseChartOptions("Date", "Tickets");
      this.chartCategoryOptions = this.getBaseChartOptions("Category", "Tickets");
      this.chartPicOptions      = this.getBaseChartOptions("Assignee", "Tickets");
      this.chartOfficeOptions   = this.getBaseChartOptions("Location", "Tickets");
      this.chartOptionsStack    = this.getSLAChartOptions();
    },

    async initializeDashboard() {
      this.isLoading = true;
      try {
        await this.getYearOptions();
        await this.loadAllData();
        this.showSnackbar("Dashboard loaded", "success");
      } catch (e) {
        this.showSnackbar("Error loading dashboard", "error");
      } finally {
        this.isLoading = false;
      }
    },

    async loadAllData() {
      // SLA map harus load duluan sebelum getTicketLateCount
      await this.loadSlaMap();
      await Promise.all([
        this.getAllTicketsCount(), this.getTicketAssignedCount(),
        this.getTicketInProgressCount(), this.getTicketPendingCount(),
        this.getTicketResolvedCount(), this.getTicketLateCount(),
        this.getTicketsByMonth(), this.getTicketsByCategory(),
        this.getTicketsByPic(), this.getTicketsByOffice(),
        this.getTicketsByCategorySlaHours(),
      ]);
    },

    async refreshAllData() {
      this.isLoading = true;
      try {
        await this.loadAllData();
        if (!this.isChart) await this.loadTableData();
        this.showSnackbar("Data refreshed", "success");
      } catch (e) {
        this.showSnackbar("Error refreshing", "error");
      } finally {
        this.isLoading = false;
      }
    },

    async updateAllFilters() {
      this.isLoading = true;
      try {
        await this.loadAllData();
        if (!this.isChart) await this.loadTableData();
      } finally {
        this.isLoading = false;
      }
    },

    //  SLA 
    async loadSlaMap() {
      try {
        const res = await getTicket.getHelpDeskPage({ size: 100, page: 0 });
        this.catalogSlaMap = {};
        (res.data.data.content || []).forEach(c => {
          this.catalogSlaMap[c.name] = c.slaDays * 24 + (c.slaHours || 0);
        });
      } catch (e) { console.error(e); }
    },

    isLate(item) {
      if (item.statusId === "RESOLVED") return false;
      const slaHours = this.catalogSlaMap[item.catalogName] || 0;
      return slaHours > 0 && moment().diff(moment(item.createdAt), "hours") > slaHours;
    },

    //  API Count 
    async getAllTicketsCount() {
      try { this.allTickets      = (await dashboardService.getAllTicketsCount({ year: this.globalYear, month: this.globalMonth })).data.data || 0; } catch { this.allTickets = 0; }
    },
    async getTicketAssignedCount() {
      try { this.assignedTickets = (await dashboardService.getTicketAssignedCount({ year: this.globalYear, month: this.globalMonth })).data.data || 0; } catch { this.assignedTickets = 0; }
    },
    async getTicketInProgressCount() {
      try { this.progressTickets = (await dashboardService.getTicketInProgressCount({ year: this.globalYear, month: this.globalMonth })).data.data || 0; } catch { this.progressTickets = 0; }
    },
    async getTicketPendingCount() {
      try { this.pendingTickets  = (await dashboardService.getTicketPendingCount({ year: this.globalYear, month: this.globalMonth })).data.data || 0; } catch { this.pendingTickets = 0; }
    },
    async getTicketResolvedCount() {
      try { this.solvedTickets   = (await dashboardService.getTicketResolvedCount({ year: this.globalYear, month: this.globalMonth })).data.data || 0; } catch { this.solvedTickets = 0; }
    },

    // LATE dihitung client-side berdasarkan SLA map
    async getTicketLateCount() {
      try {
        const res  = await getTicket.getTicketPic({ status: null, size: 1000, page: 0 });
        const data = (res.data.data.content || []).filter(item => {
          const d = moment(item.createdAt);
          return d.year() === this.globalYear && (d.month() + 1) === this.globalMonth;
        });
        this.lateTickets = data.filter(i => this.isLate(i)).length;
      } catch { this.lateTickets = 0; }
    },

    //  API Charts 
    async getTicketsByMonth() {
      try {
        const data = (await dashboardService.getTicketCountByMonth({ year: this.globalYear, month: this.globalMonth })).data.data || [];
        this.seriesDaily[0].data = data.map(i => i.totalCount);
        this.chartDailyOptions.xaxis.categories = data.map(i => i.groupName);
        this.$refs.chartDailyRef?.refresh();
      } catch (e) { console.error(e); }
    },
    async getTicketsByCategory() {
      try {
        const data = (await dashboardService.getTicketCountByCatalog({ year: this.globalYear, month: this.globalMonth })).data.data || [];
        this.seriesCategory[0].data = data.map(i => i.totalCount);
        this.chartCategoryOptions.xaxis.categories = data.map(i => i.groupName);
        this.$refs.chartCategoryRef?.refresh();
      } catch (e) { console.error(e); }
    },
    async getTicketsByPic() {
      try {
        const data = (await dashboardService.getTicketCountByPic({ year: this.globalYear, month: this.globalMonth })).data.data || [];
        this.seriesPic[0].data = data.map(i => i.totalCount);
        this.chartPicOptions.xaxis.categories = data.map(i => i.groupName);
        this.$refs.chartPicRef?.refresh();
      } catch (e) { console.error(e); }
    },
    async getTicketsByOffice() {
      try {
        const data = (await dashboardService.getTicketCountByOffice({ year: this.globalYear, month: this.globalMonth })).data.data || [];
        this.seriesOffice[0].data = data.map(i => i.totalCount);
        this.chartOfficeOptions.xaxis.categories = data.map(i => i.groupName);
        this.$refs.chartOfficeRef?.refresh();
      } catch (e) { console.error(e); }
    },
    async getTicketsByCategorySlaHours() {
      try {
        const data = (await dashboardService.getTicketCountByCatalogSlaHours({ year: this.globalYear, month: this.globalMonth })).data.data || [];
        this.chartOptionsStack.xaxis.categories = data.map(i => i.groupName);
        this.seriesStack[0].data = data.map(i => i.avgSla || 0);
        this.seriesStack[1].data = data.map(i => i.sla    || 0);
        this.$refs.chartSLARef?.refresh();
      } catch (e) { console.error(e); }
    },
    async getYearOptions() {
      try { this.yearOptions = (await dashboardService.getYearOptions()).data.data || []; }
      catch { this.yearOptions = [new Date().getFullYear()]; }
    },

    //  Table 
    async viewDetails(title, filter) {
      this.currentFilter = filter;
      this.titleHeader   = title;
      const statusMap    = { all: null, assigned: "ASSIGNED", progress: "INPROGRESS", pending: "PENDING", solved: "RESOLVED", late: "LATE" };
      this.statusFilter  = statusMap[filter];
      this.isChart       = false;
      await this.loadTableData();
    },

    async loadTableData() {
      this.isLoading = true;
      try {
        const res  = await getTicket.getTicketPic({
          keyword: null, location: null, startDate: null, endDate: null, catalog: null,
          status:  this.statusFilter === "LATE" ? null : this.statusFilter,
          size:    1000, page: 0,
        });
        let data   = res.data.data.content || [];

        // Filter tahun & bulan dari createdAt
        data = data.filter(item => {
          const d = moment(item.createdAt);
          return d.year() === this.globalYear && (d.month() + 1) === this.globalMonth;
        });

        // Filter LATE client-side
        if (this.statusFilter === "LATE") {
          data = data.filter(i => this.isLate(i));
        }

        this.items = data;
        this.showSnackbar(`Loaded ${this.items.length} tickets`, "success");
      } catch (e) {
        this.showSnackbar("Error loading tickets", "error");
        this.items = [];
      } finally {
        this.isLoading = false;
      }
    },

    toggleView() {
      this.isChart = !this.isChart;
      if (!this.isChart) {
        this.currentFilter = "all";
        this.titleHeader   = "All Tickets";
        this.statusFilter  = null;
        this.loadTableData();
      }
    },

    goBack() {
      this.isChart       = true;
      this.titleHeader   = "";
      this.currentFilter = null;
      this.statusFilter  = null;
    },

    //  Ticket Actions 
    openTicketDetail(item) { this.selectedTicket = item; this.detailDialog = true; },
    editTicket(ticket) {
      this.detailDialog = false;
      this.$router.push({ name: "ithelpdesksupport-my-request-detail", params: { id: ticket.id } });
    },

    getStatIcon(statName) {
  const iconMap = {
    "All":      this.icons.mdiTicketConfirmationOutline,
    "Assigned": this.icons.mdiClipboardArrowRightOutline,
    "Progress": this.icons.mdiLoading,
    "Pending":  this.icons.mdiClipboardTextClockOutline,
    "Late":     this.icons.mdiClipboardAlertOutline,
    "Solved":   this.icons.mdiCheckDecagramOutline,
  };
  return iconMap[statName] || this.icons.mdiChartLine;
},

    // Comparison - IMPROVED VERSION
    async showComparison() {
      this.isLoading = true;
      try {
        // Calculate previous period
        let prevYear = this.globalYear, prevMonth = this.globalMonth - 1;
        if (prevMonth === 0) { 
          prevMonth = 12; 
          prevYear -= 1; 
        }
        
        const prevPeriod = { year: prevYear, month: prevMonth };
        const currentPeriod = { year: this.globalYear, month: this.globalMonth };
        
        // Set period display names
        this.comparisonData.previousPeriod = this.getPeriodName(prevYear, prevMonth);
        this.comparisonData.currentPeriod = this.getPeriodName(this.globalYear, this.globalMonth);
        
        // Fetch previous period data
        const [pAll, pAssigned, pProgress, pPending, pSolved] = await Promise.all([
          dashboardService.getAllTicketsCount(prevPeriod),
          dashboardService.getTicketAssignedCount(prevPeriod),
          dashboardService.getTicketInProgressCount(prevPeriod),
          dashboardService.getTicketPendingCount(prevPeriod),
          dashboardService.getTicketResolvedCount(prevPeriod),
        ]);
        
        // Fetch late tickets for previous period (client-side calculation)
        let pLate = 0;
        try {
          const res = await getTicket.getTicketPic({ status: null, size: 1000, page: 0 });
          const data = (res.data.data.content || []).filter(item => {
            const d = moment(item.createdAt);
            return d.year() === prevYear && (d.month() + 1) === prevMonth;
          });
          pLate = data.filter(i => this.isLate(i)).length;
        } catch { pLate = 0; }
        
        const prevValues = {
          all: pAll.data.data || 0,
          assigned: pAssigned.data.data || 0,
          progress: pProgress.data.data || 0,
          pending: pPending.data.data || 0,
          late: pLate,
          solved: pSolved.data.data || 0
        };
        
        const currentValues = {
          all: this.allTickets,
          assigned: this.assignedTickets,
          progress: this.progressTickets,
          pending: this.pendingTickets,
          late: this.lateTickets,
          solved: this.solvedTickets
        };
        
        const maxValue = Math.max(
          ...Object.values(prevValues),
          ...Object.values(currentValues)
        );
        
        // Build stats array
        const statNames = ["All", "Assigned", "Progress", "Pending", "Late", "Solved"];
        this.comparisonData.stats = statNames.map(name => {
          const key = name.toLowerCase();
          const previousValue = prevValues[key];
          const currentValue = currentValues[key];
          const change = this.calculateChange(previousValue, currentValue);
          
          return {
            name: name,
            previousValue: previousValue,
            currentValue: currentValue,
            change: change,
            percentage: maxValue > 0 ? (currentValue / maxValue) * 100 : 0,
            previousPercent: maxValue > 0 ? (previousValue / maxValue) * 100 : 0,
            currentPercent: maxValue > 0 ? (currentValue / maxValue) * 100 : 0
          };
        });
        
        this.comparisonDialog = true;
      } catch (e) {
        console.error("Comparison error:", e);
        this.showSnackbar("Error loading comparison data", "error");
      } finally {
        this.isLoading = false;
      }
    },
    
    getPeriodName(year, month) {
      const monthName = this.monthList.find(m => m.value === month)?.name || "";
      return `${monthName} ${year}`;
    },
    
    async refreshComparison() {
      await this.showComparison();
    },

    calculateChange(oldVal, newVal) {
      if (oldVal === 0) return newVal > 0 ? 100 : 0;
      return Math.round(((newVal - oldVal) / oldVal) * 100);
    },

    //  Export 
    async exportToExcel() {
      this.exporting = true;
      try {
        this.showSnackbar(`Loading data for ${this.currentPeriodText}...`, "info");

        const res = await getTicket.getTicketPic({
          keyword: null, location: null, startDate: null, endDate: null,
          catalog: null, status: null, size: 1000, page: 0,
        });

        const data = (res.data.data.content || []).filter(item => {
          const d = moment(item.createdAt);
          return d.year() === this.globalYear && (d.month() + 1) === this.globalMonth;
        });

        if (!data.length) {
          this.showSnackbar(`No tickets found for ${this.currentPeriodText}`, "warning");
          return;
        }

        const XLSX = await import("xlsx");

        const headers = ["No", "Name", "PIC", "Ticket Number", "Created Date", "Title", "Service Category", "Location/Office", "Status"];

        const rows = data.map((item, i) => [
          i + 1,
          item.userName    || "-",
          item.picName     || "-",
          item.number      || "-",
          this.formatDate(item.createdAt),
          item.title       || "-",
          item.catalogName || "-",
          item.officeName  || "-",
          item.statusName  || "-",
        ]);

        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        ws["!cols"] = headers.map((h, colIndex) => {
          const maxLen = Math.max(
            h.length,
            ...rows.map(row => String(row[colIndex] || "").length)
          );
          return { wch: Math.min(maxLen + 2, 60) };
        });

        ws["!freeze"] = { xSplit: 0, ySplit: 1 };

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tickets");

        const summaryData = [
          ["Summary", ""],
          ["Period", this.currentPeriodText],
          ["Total Tickets", this.allTickets],
          ["Assigned", this.assignedTickets],
          ["In Progress", this.progressTickets],
          ["Pending", this.pendingTickets],
          ["Late", this.lateTickets],
          ["Solved", this.solvedTickets],
          ["Export Date", moment().format("DD MMM YYYY HH:mm")],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        wsSummary["!cols"] = [{ wch: 20 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        XLSX.writeFile(wb, `Helpdesk_Tickets_${this.currentPeriodText.replace(/ /g, "_")}_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);

        this.showSnackbar(`Exported ${data.length} tickets`, "success");
      } catch (e) {
        console.error("Export error:", e);
        this.showSnackbar("Export error. Please try again.", "error");
      } finally {
        this.exporting = false;
      }
    },

    //  Helpers 
    escapeHTML(text) { const d = document.createElement("div"); d.textContent = text; return d.innerHTML; },
    formatDate(date) { return moment(date).format("DD MMM YYYY"); },
    calculatePercentage(value) {
      if (!this.allTickets) return 0;
      return ((value / this.allTickets) * 100).toFixed(1);
    },
    getStatusColor(statusId) {
      return { SUBMITTED: "#0172b9", INPROGRESS: "#0172b9", PENDING: "#ff7a00", ASSIGNED: "#a11497", LATE: "#ec323f", RESOLVED: "#adc43b" }[statusId] || "#9a9a9a";
    },
    getStatusIcon(statusId) { return statusId === "RESOLVED" ? this.icons.mdiCheckAll : this.icons.mdiCheck; },
    showSnackbar(message, color = "success") { this.snackbar = { show: true, message, color }; },

    getBaseChartOptions(xLabel, yLabel) {
      return {
        chart: { toolbar: { show: false }, type: "bar" },
        plotOptions: { bar: { distributed: true, horizontal: false, borderRadius: 6, dataLabels: { position: "top" } } },
        colors: ["#33b2df","#546E7A","#d4526e","#13d8aa","#A5978B","#2b908f","#f9a3a4","#90ee7e","#f48024","#69d2e7"],
        dataLabels: { enabled: true, offsetY: -20, style: { fontSize: "11px", colors: ["#304758"] } },
        xaxis: { categories: [], title: { text: xLabel }, labels: { style: { fontSize: "11px" } } },
        yaxis: { title: { text: yLabel }, labels: { formatter: v => Number.isInteger(v) ? v.toFixed(0) : "", style: { fontSize: "11px" } } },
        legend: { show: false },
        tooltip: { y: { formatter: v => `${v} tickets` } },
      };
    },
    getSLAChartOptions() {
      return {
        chart: { stacked: false, toolbar: { show: false } },
        colors: ["#33b2df", "#f9a3a4"],
        dataLabels: { enabled: true, enabledOnSeries: [0], style: { fontSize: "10px" } },
        stroke: { width: [0, 3], curve: "smooth" },
        plotOptions: { bar: { columnWidth: "50%", borderRadius: 5 } },
        xaxis: { categories: [], labels: { style: { fontSize: "11px" } } },
        yaxis: { title: { text: "Hours" }, labels: { formatter: v => Number.isInteger(v) ? v.toFixed(0) : "", style: { fontSize: "11px" } } },
        tooltip: { shared: true, intersect: false, y: { formatter: v => `${v} hours` } },
        legend: { position: "top", horizontalAlign: "left", fontSize: "11px" },
      };
    },
  },
};
</script>

<style scoped>
.resume-container { width: 100%; }
.detail-info { text-align: center; transition: all 0.3s ease; cursor: pointer; border-radius: 8px; }
.detail-info:hover { transform: translateY(-2px); }
.stat-title  { font-size: 11px; font-weight: 500; }
.stat-value  { font-size: 24px; }
.all-ticket      { background: linear-gradient(135deg, #9a9a9a, #e0c7c7); }
.assigned-ticket { background: linear-gradient(135deg, #a11497, #c554bb); }
.progress-ticket { background: linear-gradient(135deg, #0172b9, #69b1df); }
.pending-ticket  { background: linear-gradient(135deg, #ff7a00, #e6be00); }
.late-ticket     { background: linear-gradient(135deg, #ec323f, #d87479); }
.solved-ticket   { background: linear-gradient(135deg, #adc43b, #c2dc57); }
.table-wrapper   { overflow-x: auto; width: 100%; }
.row-pointer >>> tbody tr { cursor: pointer; }
.row-pointer >>> tbody tr:hover { background-color: #f5f5f5; }

.comparison-stat-card {
  border-radius: 10px;
}

.period-label {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: #f5f5f5;
  color: #555;
}

.curr-label {
  background: #e3f2fd;
  color: #0d47a1;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.grey-dot {
  background: #bdbdbd;
}
</style>