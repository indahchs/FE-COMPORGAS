<template>
  <div style="margin-top: -5rem">
    <!-- Toggle View & Filter Section -->
    <v-row class="mb-4">
      <v-col cols="12" :md="canViewAnalytics ? 8 : 12">
        <v-card flat outlined>
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="6" :md="canViewAnalytics ? 4 : 6">
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
          md="3"
        >
          <v-card
            :class="stat.class"
            class="stat-card"
            hover
            @click="filterByCategory(stat.category)"
            style="cursor: pointer"
          >
            <v-card-text>
              <v-icon large style="color: white">{{ stat.icon }}</v-icon>
              <div class="white--text mt-2 text-subtitle-2">{{ stat.title }}</div>
              <div class="text-h4 font-weight-bold white--text mt-2">
                {{ stat.value }}
              </div>
              <div class="caption white--text mt-1">
                {{ calculatePercentage(stat.value) }}% of total
              </div>
              <v-progress-linear
                :value="calculatePercentage(stat.value)"
                color="white"
                height="4"
                class="mt-2"
              ></v-progress-linear>
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
              :items="flattenedApps"
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
                <v-btn
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
      
      // New features
      viewMode: "grid", // 'grid' or 'analytics'
      searchQuery: "",
      selectedCategory: null,
      sortBy: "name",
      
      // User role
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
      },
      businessApps: [],
      
      sortOptions: [
        { text: "Name (A-Z)", value: "name" },
        { text: "Name (Z-A)", value: "name_desc" },
        { text: "Category", value: "category" },
      ],
      
      tableHeaders: [
        { text: "Image", value: "imageUrl", sortable: false },
        { text: "Name", value: "name" },
        { text: "Category", value: "category" },
        { text: "Description", value: "description" },
        { text: "Link", value: "link", sortable: false },
      ],
      
      // Chart options
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
    // Check if user can view analytics
    canViewAnalytics() {
      return this.userRole === "SUPER" || this.userRole === "IT_LEAD";
    },
    
    // Flatten all apps for table view
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
    
    // Filter apps based on search and category
    filteredBusinessApps() {
      let filtered = [...this.businessApps];
      
      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(item => item.name === this.selectedCategory);
      }
      
      // Filter by search
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
      
      // Sort
      if (this.sortBy === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.sortBy === "name_desc") {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
      }
      
      return filtered;
    },
    
    // Category options for filter
    categoryOptions() {
      return this.businessApps.map(item => ({
        text: item.name,
        value: item.name,
      }));
    },
    
    // Stats for analytics cards
    appStats() {
      const stats = [];
      
      // Total apps
      const totalApps = this.flattenedApps.length;
      stats.push({
        title: "Total Applications",
        value: totalApps,
        icon: this.icons.mdiDotsGrid,
        class: "stat-total",
        category: null,
      });
      
      // Apps per category (top 3)
      const categoryCounts = {};
      this.businessApps.forEach(category => {
        if (category.apps) {
          categoryCounts[category.name] = category.apps.length;
        }
      });
      
      const sortedCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      const colors = ["stat-primary", "stat-secondary", "stat-success"];
      sortedCategories.forEach(([name, count], index) => {
        stats.push({
          title: name,
          value: count,
          icon: this.icons.mdiDotsGrid,
          class: colors[index],
          category: name,
        });
      });
      
      return stats;
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
      // Update pie chart
      const categoryData = {};
      this.businessApps.forEach(category => {
        if (category.apps) {
          categoryData[category.name] = category.apps.length;
        }
      });
      
      this.pieChartOptions.labels = Object.keys(categoryData);
      this.pieChartSeries = Object.values(categoryData);
      
      // Update bar chart
      this.barChartOptions.xaxis.categories = Object.keys(categoryData);
      this.barChartSeries[0].data = Object.values(categoryData);
    },
    
    calculatePercentage(value) {
      const total = this.flattenedApps.length;
      if (total === 0) return 0;
      return ((value / total) * 100).toFixed(1);
    },
    
    filterByCategory(category) {
      if (category) {
        this.selectedCategory = category;
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
      const headers = ["Name", "Category", "Description", "Link"];
      const csvData = this.flattenedApps.map(app => [
        app.name,
        app.category,
        app.description || "",
        app.link || "",
      ]);
      
      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "business_applications.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    
    // Original methods
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
      const res = await getApps.getAppsBsns();
      const data = res.data.data;
      this.businessApps = data;
    },
  },
};
</script>

<style scoped>
.stat-card {
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-total {
  background: linear-gradient(135deg, #0172b9, #69b1df);
  color: white;
}

.stat-primary {
  background: linear-gradient(135deg, #a11497, #c554bb);
  color: white;
}

.stat-secondary {
  background: linear-gradient(135deg, #adc43b, #c2dc57);
  color: white;
}

.stat-success {
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