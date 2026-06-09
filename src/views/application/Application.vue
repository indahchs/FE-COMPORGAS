<template>
  <div style="margin-top: -5rem">
    <!-- Toggle View & Filter Section -->
    <v-row class="mb-4">
      <v-col cols="12" :md="canViewAnalytics ? 8 : 12">
        <v-card flat outlined>
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="12" :md="canViewAnalytics ? 6 : 6">
                <v-text-field
                  v-model="searchQuery"
                  :append-icon="icons.mdiMagnify"
                  label="Search applications"
                  outlined
                  dense
                  hide-details
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedCategory"
                  :items="categoryOptions"
                  label="Filter by Category"
                  outlined
                  dense
                  hide-details
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="sortBy"
                  :items="sortOptions"
                  label="Sort by"
                  outlined
                  dense
                  hide-details
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="canViewAnalytics" cols="12" md="4">
        <v-card flat outlined>
          <v-card-text>
            <v-row align="center">
              <v-col cols="6">
                <v-btn
                  block
                  :color="viewMode === 'grid' ? 'primary' : 'default'"
                  @click="viewMode = 'grid'"
                >
                  <v-icon left>{{ icons.mdiViewGrid }}</v-icon>
                  Grid
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  block
                  :color="viewMode === 'analytics' ? 'primary' : 'default'"
                  @click="viewMode = 'analytics'"
                >
                  <v-icon left>{{ icons.mdiChartBar }}</v-icon>
                  Analytics
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Analytics View -->
    <div v-if="viewMode === 'analytics' && canViewAnalytics">
      <!-- Stats Cards -->
      <v-row class="mb-4">
        <v-col
          v-for="(stat, index) in appStats"
          :key="index"
          cols="12"
          sm="6"
          md="6"
        >
          <v-card
            :class="stat.class"
            class="stat-card"          
          >
            <v-card-text>
              <v-icon large style="color: white">{{ stat.icon }}</v-icon>
              <div class="white--text mt-2 text-subtitle-2">{{ stat.title }}</div>
              <div class="text-h4 font-weight-bold white--text mt-2">
                {{ stat.value }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts Section -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <v-icon left color="primary">{{ icons.mdiChartPie }}</v-icon>
              Apps Distribution by Category
            </v-card-title>
            <v-card-text>
              <apexchart
                type="pie"
                height="350"
                :options="pieChartOptions"
                :series="pieChartSeries"
              ></apexchart>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <v-icon left color="primary">{{ icons.mdiChartBar }}</v-icon>
              Apps per Category
            </v-card-title>
            <v-card-text>
              <apexchart
                type="bar"
                height="350"
                :options="barChartOptions"
                :series="barChartSeries"
              ></apexchart>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Detailed Table -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon left>{{ icons.mdiTable }}</v-icon>
              Application List
              <v-spacer></v-spacer>
              <v-btn color="success" @click="exportData">
                <v-icon left>{{ icons.mdiDownload }}</v-icon>
                Export
              </v-btn>
            </v-card-title>
            <v-data-table
              :headers="tableHeaders"
              :items="filteredTableApps"
              :search="searchQuery"
              class="elevation-1"
              :footer-props="{
                'items-per-page-options': [10, 25, 50],
              }"
            >
              <template #[`item.imageUrl`]="{ item }">
                <v-avatar size="40">
                  <v-img :src="baseUrl + item.imageUrl"></v-img>
                </v-avatar>
              </template>
              <template #[`item.link`]="{ item }">
                <v-chip v-if="!item.link || item.link.trim() === ''" x-small color="grey">
                  No Link
                </v-chip>
                <v-btn
                  v-else
                  icon
                  small
                  color="primary"
                  @click="openLink(item.link)"
                >
                  <v-icon small>{{ icons.mdiOpenInNew }}</v-icon>
                </v-btn>
              </template>
              <template #[`item.category`]="{ item }">
                <v-chip small :color="getCategoryColor(item.category)" dark>
                  {{ item.category }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Grid View (Original) -->
    <v-row v-else>
      <v-col
        v-for="(item, index) in filteredBusinessApps"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card>
          <v-card-title class="title-apps">
            <v-icon class="icon-apps mr-2">{{ icons.mdiDotsGrid }}</v-icon>
            {{ item.name }}
            <v-spacer></v-spacer>
            <v-icon
              v-if="isIT"
              @click="detailApps(1, item)"
              class="icon-apps add-apps mr-2"
            >
              {{ icons.mdiPlus }}
            </v-icon>
          </v-card-title>

          <v-card-text class="card-text-apps">
            <v-container fill-height fluid v-show="item.apps == null">
              <v-spacer />
              <div class="text-center">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-img
                      v-bind="attrs"
                      v-on="on"
                      style="height: 60px; width: 60px; margin: 0 auto"
                      :src="item.link === 0 ? item.imageUrl : baseUrl + item.imageUrl"
                      alt="Application Image"
                      @click="detailApps(item.link)"
                    ></v-img>
                  </template>
                  <span>{{ item.description }}</span>
                </v-tooltip>
              </div>
              <v-spacer />
            </v-container>
            <v-row v-if="item.apps != null">
              <v-col
                class="center-hr"
                v-for="(data, id) in item.apps"
                :key="id"
                cols="4"
                @click="detailApps(data.link)"
              >
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
                    <img
                      v-bind="attrs"
                      v-on="on"
                      :src="baseUrl + data.imageUrl"
                      alt="Application Image"
                      width="48"
                      height="48"
                    />
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

    <AddApps
      :addBisnis="addBisnis"
      :isBsns="true"
      :open="openModalCatalog"
      :datas="datas"
      @clicked="closeModal"
      :isEdit="isEdit"
    ></AddApps>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import {
  mdiDotsGrid,
  mdiPlus,
  mdiDotsVertical,
  mdiMagnify,
  mdiChartBar,
  mdiChartPie,
  mdiViewGrid,
  mdiTable,
  mdiDownload,
  mdiOpenInNew,
  mdiShape,
} from "@mdi/js";
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
      
      viewMode: "grid",
      searchQuery: "",
      selectedCategory: null,
      linkFilter: null,
      sortBy: "category",
      
      userRole: null,
      
      icons: {
        mdiDotsVertical,
        mdiPlus,
        mdiDotsGrid,
        mdiMagnify,
        mdiChartBar,
        mdiChartPie,
        mdiViewGrid,
        mdiTable,
        mdiDownload,
        mdiOpenInNew,
        mdiShape,
      },
      businessApps: [],
      
      sortOptions: [
        { text: "Category", value: "category" },
        { text: "Name (A-Z)", value: "name" },
      ],
      
      tableHeaders: [
        { text: "Image", value: "imageUrl", sortable: false },
        { text: "Name", value: "name" },
        { text: "Category", value: "category" },
        { text: "Description", value: "description" },
        { text: "Link", value: "link", sortable: false },
      ],
      
      pieChartOptions: {
        chart: {
          type: "pie",
        },
        labels: [],
        colors: ["#0172b9", "#a11497", "#adc43b", "#ff7a00", "#ec323f"],
        legend: {
          position: "bottom",
        },
      },
      pieChartSeries: [],
      
      barChartOptions: {
        chart: {
          type: "bar",
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            distributed: true,
            borderRadius: 8,
            horizontal: false,
          },
        },
        colors: ["#0172b9", "#a11497", "#adc43b", "#ff7a00", "#ec323f"],
        xaxis: {
          categories: [],
        },
        yaxis: {
          labels: {
            formatter: (val) => (Number.isInteger(val) ? val.toFixed(0) : ""),
          },
        },
        legend: { show: false },
      },
      barChartSeries: [{ name: "Apps", data: [] }],
    };
  },
  
  computed: {
    canViewAnalytics() {
      return this.userRole === "SUPER" || this.userRole === "IT_LEAD";
    },
    
    flattenedApps() {
      const apps = [];
      this.businessApps.forEach(category => {
        if (category.apps && category.apps.length > 0) {
          category.apps.forEach(app => {
            apps.push({
              ...app,
              category: category.name,
            });
          });
        }
      });
      return apps;
    },
    
    filteredTableApps() {
      let filtered = [...this.flattenedApps];

      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(app => app.category === this.selectedCategory);
      }

      // Filter by link status
      if (this.linkFilter === "active") {
        filtered = filtered.filter(app =>
          app.link && typeof app.link === 'string' && app.link.trim() !== ''
        );
      } else if (this.linkFilter === "inactive") {
        filtered = filtered.filter(app =>
          !app.link || typeof app.link !== 'string' || app.link.trim() === ''
        );
      }

      // Sort
      if (this.sortBy === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.sortBy === "category") {
        filtered.sort((a, b) => a.category.localeCompare(b.category));
      }

      return filtered;
    },
    
    filteredBusinessApps() {
      let filtered = [...this.businessApps];
      
      if (this.selectedCategory) {
        filtered = filtered.filter(item => item.name === this.selectedCategory);
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item => {
          const nameMatch = item.name.toLowerCase().includes(query);
          const appsMatch = item.apps && item.apps.some(app => 
            app.name.toLowerCase().includes(query)
          );
          return nameMatch || appsMatch;
        });
      }
      
      if (this.sortBy === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.sortBy === "name_desc") {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
      }

      return filtered;
    },
    
    categoryOptions() {
      return this.businessApps.map(item => ({
        text: item.name,
        value: item.name,
      }));
    },
    
    appStats() {
      const totalApps = this.flattenedApps.length;
      const totalCategories = this.businessApps.length;
      
      const activeApps = this.flattenedApps.filter(app => 
        app.link && typeof app.link === 'string' && app.link.trim() !== ''
      ).length;
      
      const inactiveApps = totalApps - activeApps;
      
      return [
        {
          title: "Total Applications",
          value: this.flattenedApps.length,
          icon: this.icons.mdiDotsGrid,
          class: "stat-total",
        },
        {
          title: "Total Categories",
          value: this.businessApps.length,
          icon: this.icons.mdiShape,
          class: "stat-primary",
        },
      ];
    },
  },
  
  watch: {
    businessApps: {
      handler() {
        this.updateCharts();
      },
      deep: true,
    },
  },
  
  created() {
    this.getAppsBsns();
    this.getRole();
  },
  
  methods: {
    updateCharts() {
      const categoryData = {};
      this.businessApps.forEach(category => {
        if (category.apps) {
          categoryData[category.name] = category.apps.length;
        }
      });

      const labels = Object.keys(categoryData);
      const values = Object.values(categoryData);

      this.pieChartOptions = {
        ...this.pieChartOptions,
        labels: labels,
      };
      this.pieChartSeries = values;

      this.barChartOptions = {
        ...this.barChartOptions,
        xaxis: {
          ...this.barChartOptions.xaxis,
          categories: labels,
        },
      };
      this.barChartSeries = [{ name: "Apps", data: values }];
    },
    
    filterByCategory(filter) {
      if (!filter) return;
      
      if (filter === "active" || filter === "inactive") {
        this.selectedCategory = null;
        this.linkFilter = filter;
        this.viewMode = "analytics";
      } else {
        this.selectedCategory = filter;
        this.linkFilter = null;
        this.viewMode = "grid";
      }
    },
    
    getCategoryColor(category) {
      const colors = {
        default: "#0172b9",
      };
      return colors[category] || colors.default;
    },
    
    openLink(link) {
      if (typeof link === "string") {
        window.open(link, "_blank");
      }
    },
    
    exportData() {
      import('xlsx').then(XLSX => {
        const headers = ["No", "Name", "Category", "Description", "Link"];

        const rows = this.flattenedApps.map((app, index) => [
          index + 1,
          app.name || "",
          app.category || "",
          app.description || "",
          app.link && typeof app.link === "string" && app.link.trim() !== ""
            ? app.link.trim()
            : "No Link",
        ]);

        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Auto-fit lebar kolom berdasarkan konten terpanjang
        const colWidths = headers.map((h, colIndex) => {
          const maxLen = Math.max(
            h.length,
            ...rows.map(row => String(row[colIndex] || "").length)
          );
          return { wch: Math.min(maxLen + 2, 60) }; // max 60 karakter
        });
        ws['!cols'] = colWidths;

        // Style header: bold
        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
          const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
          if (!ws[cellAddr]) continue;
          ws[cellAddr].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "0172B9" } },
            font: { bold: true, color: { rgb: "FFFFFF" } },
          };
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Business Applications");

        XLSX.writeFile(wb, `business_applications_${new Date().toISOString().slice(0, 10)}.xlsx`);
      });
    },
    
    updateDialogVisible(value) {
      this.openModalCatalog = false;
      this.dialogVisible = value;
    },
    
    getRole() {
      const role = JSON.parse(localStorage.getItem("dataUser"));
      this.userRole = role.roleId;
      
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
      const res = await getApps.getAppsBsns()
      this.businessApps = this.transformApiData(res.data)
    },
    transformApiData(apiData) {
      const content = apiData?.data
      if (!Array.isArray(content)) return []
      return content.map(division => ({
        id:          division.id,
        name:        division.name        || 'Unnamed Division',
        description: division.description || '',
        apps:        Array.isArray(division.apps)
          ? division.apps.map(app => ({
              id:          app.id,
              name:        app.name        || 'Unnamed App',
              description: app.description || '',
              link:        app.link        || '',
              imageUrl:    app.imageUrl    || '',
              divisionId:  app.divisionId,
              position:    app.position,
              createdBy:   app.createdBy,
              createdAt:   app.createdAt,
            }))
          : [],
      }))
    },
  },
};
</script>

<style scoped>
.stat-card {
  text-align: center;
}

.stat-total {
  background: linear-gradient(135deg, #0172b9, #69b1df);
  color: white;
}

.stat-primary {
  background: linear-gradient(135deg, #a11497, #c554bb);
  color: white;
}

.stat-success {
  background: linear-gradient(135deg, #adc43b, #c2dc57);
  color: white;
}

.stat-warning {
  background: linear-gradient(135deg, #ff7a00, #e6be00);
  color: white;
}

.card-text-apps {
  height: 21rem;
  overflow-y: auto;
}

.icon-apps {
  color: #0172b9 !important;
}

.title-apps {
  color: #0172b9 !important;
}

.add-apps {
  cursor: pointer;
}

.center-hr {
  text-align: center;
}
</style>