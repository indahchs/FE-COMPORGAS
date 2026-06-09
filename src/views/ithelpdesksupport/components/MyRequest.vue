<template>
  <div class="helpdesk-container">
    <!-- Status Cards -->
    <div class="status-cards">
      <v-row>
        <v-col v-for="(stat, i) in statusCards" :key="i" @click="filterByStatus(stat.filter)" cols="6" md="2">
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
    <v-card class="mt-3">
      <v-card-text class="pa-3">
        <v-row class="ma-0">
          <v-col cols="12">
            <v-text-field dense outlined clearable hide-details label="Search ticket" v-model="keyword" :append-icon="icons.mdiMagnify" />
          </v-col>
          <v-col cols="6" sm="6" md="3">
            <v-select dense outlined clearable hide-details label="Catalog" v-model="catalogId" :items="catalogs" />
          </v-col>
          <v-col cols="6" sm="6" md="3">
            <date-picker v-model="startDate" format="DD-MM-YYYY" placeholder="Start Date" class="datetime-picker" />
          </v-col>
          <v-col cols="6" sm="6" md="3">
            <date-picker v-model="endDate" format="DD-MM-YYYY" placeholder="End Date" :disabled-date="d => startDate && d < new Date(startDate)" class="datetime-picker" />
          </v-col>
          <v-col v-if="canDownload" cols="6" sm="6" md="3">
            <v-btn class="btn-blue" :loading="exportLoading" @click="downloadExcel" depressed block>
              <v-icon left small>{{ icons.mdiDownload }}</v-icon> Download Excel
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-if="canAddRequest" class="ma-0 mt-2">
          <v-spacer />
          <v-col cols="12" sm="6" md="6">
            <v-btn class="btn-blue" @click="showModal = true" depressed block>
              <v-icon left small>{{ icons.mdiPlus }}</v-icon> New Request
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text class="pa-0">
        <v-data-table
          hide-default-footer
          :loading="loading"
          :headers="tableHeaders"
          :items="tickets"
          @click:row="viewDetail"
          :mobile-breakpoint="0"
        >
          <template #[`item.createdAt`]="{ item }">
            <span class="text-no-wrap">{{ formatDate(item.createdAt) }}</span>
          </template>
          <template #[`item.statusName`]="{ item }">
            <v-chip small :class="chipClass(item)" class="status-chip">
              <span class="status-text">{{ item.isLate && item.statusId !== 'RESOLVED' ? 'Late' : item.statusName }}</span>
              <v-icon color="white" x-small class="ml-1">{{ item.statusId === 'RESOLVED' ? icons.mdiCheckAll : icons.mdiCheck }}</v-icon>
            </v-chip>
          </template>
          <template v-if="isSuperUser" #[`item.actions`]="{ item }">
            <v-btn icon small @click.stop="openDeleteConfirm(item)">
              <v-icon small color="error">{{ icons.mdiDelete }}</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-text class="pa-2">
        <div class="pagination-wrapper">
          <span class="total-data-text">Total: {{ totalItems }}</span>
          <v-pagination v-model="page" :length="totalPages" @input="loadTickets" :total-visible="7" />
        </div>
      </v-card-text>
    </v-card>

    <!-- Form Modal -->
    <HelpdeskFormModal :open="showModal" :datas="modalData" @close="closeModal" />
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
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  mdiTicketConfirmationOutline, mdiClipboardTextClockOutline, mdiClipboardArrowRightOutline,
  mdiClipboardAlertOutline, mdiLoading, mdiCheckDecagramOutline,
  mdiMagnify, mdiDownload, mdiPlus, mdiCheck, mdiCheckAll,
  mdiDelete, mdiDeleteAlert, mdiClose,
} from "@mdi/js";

const svc  = ItHelpDeskService.build();
const dash = HelpdeskDashboardService.build();

export default {
  components: { DatePicker, HelpdeskFormModal },
  data() {
    return {
      icons: {
        mdiTicketConfirmationOutline, mdiClipboardTextClockOutline, mdiClipboardArrowRightOutline,
        mdiClipboardAlertOutline, mdiLoading, mdiCheckDecagramOutline,
        mdiMagnify, mdiDownload, mdiPlus, mdiCheck, mdiCheckAll,
        mdiDelete, mdiDeleteAlert, mdiClose,
      },
      page: 1, totalPages: 1, totalItems: 0,
      loading: false, exportLoading: false,
      keyword: null, catalogId: null, startDate: null, endDate: null, status: null,
      tickets: [], catalogs: [], catalogSlaMap: {},
      allTickets: 0, assignedTickets: 0, progressTickets: 0, pendingTickets: 0, lateTickets: 0, solvedTickets: 0,
      showModal: false, modalData: {},
      canAddRequest: false,
      canDownload: false,
      isSuperUser: false,
      ticketToDelete: null, isDeleting: false,
      headers: [
        { text: "Name",     value: "userName"    },
        { text: "PIC",      value: "picName"     },
        { text: "Ticket",   value: "number"      },
        { text: "Date",     value: "createdAt"   },
        { text: "Title",    value: "title"       },
        { text: "Catalog",  value: "catalogName" },
        { text: "Location", value: "officeName"  },
        { text: "Status",   value: "statusName"  },
      ],
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
  },

  async created() {
    const user          = JSON.parse(localStorage.getItem("dataUser"));
    this.canAddRequest  = user?.roleId === "SUPER";
    this.canDownload    = ["IT_LEAD", "SUPER", "IT"].includes(user?.roleId);
    this.isSuperUser    = user?.roleId === "SUPER";
    await Promise.all([this.loadCatalogs(), this.loadSlaMap()]);
    this.loadTickets();
    this.loadCounts();
  },

  watch: {
    keyword()   { this.page = 1; this.loadTickets(); },
    catalogId() { this.page = 1; this.loadTickets(); },
    startDate() { this.page = 1; this.loadTickets(); },
    endDate()   { this.page = 1; this.loadTickets(); },
  },

  methods: {
    //  SLA 
    async loadSlaMap() {
      try {
        const res = await svc.getHelpDeskPage({ size: 100, page: 0 });
        (res.data.data.content || []).forEach(c => {
          this.catalogSlaMap[c.name] = c.slaDays * 24 + (c.slaHours || 0);
        });
      } catch (e) { console.error(e); }
    },

    isLate(item) {
      if (item.statusId === "RESOLVED") return false;
      const slaHours = this.catalogSlaMap[item.catalogName] || 0;
      const elapsed  = moment().diff(moment(item.createdAt), "hours"); 
      console.log(`${item.catalogName} - elapsed: ${elapsed}h, sla: ${slaHours}h`); 
      return slaHours > 0 && elapsed > slaHours;
    },

    chipClass(item) {
      if (item.isLate && item.statusId !== "RESOLVED") return "status-late";
      return {
        SUBMITTED:  "status-submitted",
        INPROGRESS: "status-progress",
        PENDING:    "status-pending",
        ASSIGNED:   "status-assigned",
        LATE:       "status-late",
        RESOLVED:   "status-solved",
      }[item.statusId] || "";
    },

    //  Data 
    async loadCatalogs() {
      try {
        const res = await CatalogService.build().getAllOptions();
        this.catalogs = res.data.data.map(c => ({ value: c.value, text: c.label }));
      } catch (e) { console.error(e); }
    },

    async loadTickets() {
      if (this.status === "LATE") { await this.loadLateTickets(); return; }
      this.loading = true;
      try {
        const res = await svc.getTicketPic({
          keyword:   this.keyword,
          catalog:   this.catalogId,
          status:    this.status,
          startDate: this.startDate ? moment(this.startDate).format("YYYY-MM-DD") : null,
          endDate:   this.endDate   ? moment(this.endDate).format("YYYY-MM-DD")   : null,
          page:      this.page - 1,
          size:      10,
        });
        this.tickets    = (res.data.data.content || []).map(i => ({ ...i, isLate: this.isLate(i) }));
        this.totalItems = res.data.data.totalElements || 0;
        this.totalPages = Math.ceil(this.totalItems / 10) || 1;
      } catch (e) { this.tickets = []; }
      finally { this.loading = false; }
    },

    async loadLateTickets() {
      this.loading = true;
      try {
        const res = await svc.getTicketPic({ status: null, size: 1000, page: 0 });
        let data  = (res.data.data.content || []).filter(i => this.isLate(i));

        if (this.keyword)   { const kw = this.keyword.toLowerCase(); data = data.filter(i => (i.title + i.number + i.userName).toLowerCase().includes(kw)); }
        if (this.catalogId) data = data.filter(i => i.catalogId === this.catalogId);
        if (this.startDate) data = data.filter(i => moment(i.createdAt).isSameOrAfter(moment(this.startDate), "day"));
        if (this.endDate)   data = data.filter(i => moment(i.createdAt).isSameOrBefore(moment(this.endDate), "day"));

        this.totalItems = data.length;
        this.totalPages = Math.ceil(data.length / 10) || 1;
        this.tickets    = data.slice((this.page - 1) * 10, this.page * 10).map(i => ({ ...i, isLate: true }));
      } catch (e) { this.tickets = []; }
      finally { this.loading = false; }
    },

    async loadCounts() {
      const p = { year: null, month: null };
      const [all, assigned, progress, pending, solved] = await Promise.allSettled([
        dash.getAllTicketsCount(p), dash.getTicketAssignedCount(p),
        dash.getTicketInProgressCount(p), dash.getTicketPendingCount(p),
        dash.getTicketResolvedCount(p),
      ]);
      this.allTickets      = all.status      === "fulfilled" ? all.value.data.data      || 0 : 0;
      this.assignedTickets = assigned.status === "fulfilled" ? assigned.value.data.data || 0 : 0;
      this.progressTickets = progress.status === "fulfilled" ? progress.value.data.data || 0 : 0;
      this.pendingTickets  = pending.status  === "fulfilled" ? pending.value.data.data  || 0 : 0;
      this.solvedTickets   = solved.status   === "fulfilled" ? solved.value.data.data   || 0 : 0;

      try {
        const res = await svc.getTicketPic({ status: null, size: 1000, page: 0 });
        this.lateTickets = (res.data.data.content || []).filter(i => this.isLate(i)).length;
      } catch { this.lateTickets = 0; }
    },

    filterByStatus(status) { this.status = status; this.page = 1; this.loadTickets(); },

    viewDetail(ticket) {
      this.$router.push({ name: "ithelpdesksupport-my-request-detail", params: { id: ticket.id, ticket } });
    },

    closeModal(id) {
      this.showModal = false;
      this.loadTickets();
      this.loadCounts();
      if (id) this.$router.push({ name: "ithelpdesksupport-my-request-detail", params: { id } });
    },

    async downloadExcel() {
      this.exportLoading = true;
      try {
        if (this.status === "LATE") {
          const res = await svc.getTicketPic({ status: null, size: 1000, page: 0 });
          let data  = (res.data.data.content || []).filter(i => this.isLate(i));

          if (this.keyword)   { const kw = this.keyword.toLowerCase(); data = data.filter(i => (i.title + i.number + i.userName).toLowerCase().includes(kw)); }
          if (this.catalogId) data = data.filter(i => i.catalogId === this.catalogId);
          if (this.startDate) data = data.filter(i => moment(i.createdAt).isSameOrAfter(moment(this.startDate), "day"));
          if (this.endDate)   data = data.filter(i => moment(i.createdAt).isSameOrBefore(moment(this.endDate), "day"));

          if (!data.length) return;

          const rows = data.map(i => ({
            "Name":     i.userName    ?? "",
            "PIC":      i.picName     ?? "",
            "Ticket":   i.number      ?? "",
            "Date":     moment(i.createdAt).format("DD-MM-YYYY"),
            "Title":    i.title       ?? "",
            "Catalog":  i.catalogName ?? "",
            "Location": i.officeName  ?? "",
            "Status":   "Late",
          }));

          const ws = XLSX.utils.json_to_sheet(rows);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Tickets");
          ws["!cols"] = Object.keys(rows[0]).map(key => ({
            wch: Math.max(key.length, ...rows.map(r => String(r[key]).length)) + 2,
          }));
          XLSX.writeFile(wb, `Ticket-Late-${moment().format("DD-MM-YYYY")}.xlsx`);
          return;
        }

        const res  = await svc.export({
          keyword:   this.keyword,
          catalog:   this.catalogId,
          status:    this.status,
          startDate: this.startDate ? moment(this.startDate).format("YYYY-MM-DD") : null,
          endDate:   this.endDate   ? moment(this.endDate).format("YYYY-MM-DD")   : null,
        });
        const link    = document.createElement("a");
        link.href     = window.URL.createObjectURL(new Blob([res.data]));
        link.download = `Ticket-${moment().format("DD-MM-YYYY")}.xlsx`;
        link.click();
      } catch (e) { console.error(e); }
      finally { this.exportLoading = false; }
    },
    // Delete
    openDeleteConfirm(item) {
      Swal.fire({
        icon: "warning",
        title: "Delete",
        text: `Are you sure you want to delete ticket ${item.number}?`,
        showCancelButton: true,
        buttons: { cancel: false, confirm: true },
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        closeOnEsc: false,
        closeOnClickOutside: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.ticketToDelete = item;
          this.confirmDelete();
        } else {
          return false;
        }
      });
    },

    async confirmDelete() {
      if (!this.ticketToDelete) return;
      this.isDeleting = true;
      try {
        await svc.deleteTicket(this.ticketToDelete.id);

        this.tickets    = this.tickets.filter(t => t.id !== this.ticketToDelete.id);
        this.totalItems = Math.max(0, this.totalItems - 1);
        if (this.allTickets > 0) this.allTickets--;
        this.ticketToDelete = null;

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Tiket berhasil dihapus",
          buttons: { cancel: false, confirm: true },
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          closeOnEsc: false,
          closeOnClickOutside: false,
        }).then((result) => {
          if (result) this.loading = false;
        });

      } catch (e) {
        console.error("Delete error:", e);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Gagal menghapus tiket",
          buttons: { cancel: false, confirm: true },
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          closeOnEsc: false,
          closeOnClickOutside: false,
        }).then((result) => {
          if (result) this.loading = false;
        });
      } finally {
        this.isDeleting = false;
      }
    },

    formatDate(d) { return moment(d).format("DD-MM-YYYY"); },
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
.status-chip { color: white !important; border-radius: 5px; height: 24px !important; }
.status-text { font-size: 10px; }
.status-submitted { background-color: #0172b9 !important; }
.status-progress  { background-color: #0172b9 !important; }
.status-pending   { background-color: #ff7a00 !important; }
.status-assigned  { background-color: #a11497 !important; }
.status-late      { background-color: #ec323f !important; }
.status-solved    { background-color: #adc43b !important; }
.pagination-wrapper { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.total-data-text { font-weight: 600; font-size: 13px; }
::v-deep .v-data-table tbody tr { cursor: pointer; }
::v-deep .v-data-table tbody tr:hover { background-color: #f5f5f5 !important; }
.datetime-picker { width: 100%; }
::v-deep .mx-input { height: 40px; border: 1px solid rgba(0,0,0,0.38); border-radius: 4px; padding: 0 12px; }
.btn-blue { background-color: rgb(1, 114, 185) !important; color: white; text-transform: none; }
</style>