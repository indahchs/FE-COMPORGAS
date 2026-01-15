<template>
  <div class="catalog-container">
    <v-card v-if="isList" flat>
      <!-- Header Actions -->
      <v-card-text class="pa-2 pa-sm-3">
        <v-row class="ma-0">
          <v-spacer class="hidden-xs-only"></v-spacer>
          <v-col cols="12" sm="6" md="4" lg="3" class="pa-1">
            <v-btn class="btn-submit" @click="createCatalog" block depressed>
              <v-icon left small>mdi-plus</v-icon>
              Create Catalog
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Filters -->
      <v-card-text class="pa-2 pa-sm-3">
        <v-row class="ma-0">
          <v-col cols="12" sm="6" md="4" class="pa-1">
            <v-text-field
              dense
              clearable
              v-model="keyword"
              outlined
              :append-icon="icons.mdiMagnify"
              label="Search catalog"
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Data Table -->
      <v-card-text class="pa-0 pa-sm-2">
        <div class="table-wrapper">
          <v-data-table
            hide-default-footer
            :loading="myloadingvariable"
            :headers="tableHeaders"
            :items="items"
            @click:row="handleClick"
            :mobile-breakpoint="0"
            class="elevation-0 catalog-table"
            :footer-props="{
              'items-per-page-options': [5, 10, 25],
            }"
          >
            <template #[`item.logo`]="{ item }">
              <div class="logo-cell">
                <img
                  v-if="item.imageUrl !== null"
                  :src="baseUrl + item.imageUrl"
                  class="catalog-logo"
                  alt="Logo"
                />
                <span v-else class="text-caption grey--text">No logo</span>
              </div>
            </template>
            <template #[`item.slaDays`]="{ item }">
              <v-chip small outlined color="primary">
                {{ item.slaDays }} Days
              </v-chip>
            </template>
            <template #[`item.slaHours`]="{ item }">
              <v-chip small outlined color="success">
                {{ item.slaHours }} Hours
              </v-chip>
            </template>
            <template #[`item.aksi`]="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    v-bind="attrs"
                    v-on="on"
                    @click.stop="deleteConfirm(item.id)"
                    color="error"
                  >
                    <v-icon small>{{ icons.mdiTrashCanOutline }}</v-icon>
                  </v-btn>
                </template>
                <span>Delete</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper pa-2 pa-sm-3">
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

    <!-- Add/Edit Form -->
    <v-card v-else flat class="pa-2 pa-sm-4">
      <PageAddCatalog 
        :isEdit="isEdit" 
        :datas="datas" 
        @clicked="onClickChild" 
      />
    </v-card>

    <!-- Modals -->
    <HelpdeskFormModal
      :open="openModal"
      @close="openModal = false"
    ></HelpdeskFormModal>
    
    <CreateCatalog 
      :open="openModalCatalog" 
      @close="closeModal"
    ></CreateCatalog>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import { mdiChevronRight, mdiTrashCanOutline, mdiMagnify } from "@mdi/js";
import ItHelpDeskService from "../../../services/ithelpdesk/itHelpDeskServices";
import CreateCatalog from "./CreateCatalogFormModal.vue";
import HelpdeskFormModal from "./HelpdeskFormModal.vue";
import PageAddCatalog from "./PageAddCatalog.vue";

const getHelpDesk = ItHelpDeskService.build();

export default {
  components: {
    HelpdeskFormModal,
    CreateCatalog,
    PageAddCatalog,
  },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      baseUrl: process.env.VUE_APP_PERTAGAS,
      isList: true,
      myloadingvariable: true,
      icons: {
        mdiMagnify,
        mdiTrashCanOutline,
        mdiChevronRight,
      },
      headers: [
        { text: "Catalog", value: "name" },
        { text: "Logo", value: "logo" },
        { text: "SLA Days", value: "slaDays" },
        { text: "SLA Hours", value: "slaHours" },
        { text: "Action", value: "aksi", sortable: false },
      ],
      items: [],
      isEdit: false,
      datas: {},
      keyword: null,
      officeData: "",
      locationOptions: [],
      openModalCatalog: false,
      openModal: false,
    };
  },
  computed: {
    tableHeaders() {
      if (this.$vuetify.breakpoint.xs) {
        return [
          { text: "Catalog", value: "name" },
          { text: "SLA", value: "slaDays" },
          { text: "Action", value: "aksi", sortable: false },
        ];
      }
      if (this.$vuetify.breakpoint.sm) {
        return [
          { text: "Catalog", value: "name" },
          { text: "Logo", value: "logo" },
          { text: "SLA Days", value: "slaDays" },
          { text: "Action", value: "aksi", sortable: false },
        ];
      }
      return this.headers;
    },
    paginationVisible() {
      if (this.$vuetify.breakpoint.xs) return 3;
      if (this.$vuetify.breakpoint.sm) return 5;
      return 7;
    }
  },
  created() {
    this.getHelpDesk(1);
    this.getLocations();
  },
  watch: {
    keyword() {
      this.getHelpDesk(1);
    },
  },
  methods: {
    async deleteConfirm(id) {
      Swal.fire({
        icon: "warning",
        title: "Delete",
        text: "Are you sure you want to delete this data?",
        showCancelButton: true,
        showConfirmButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.delete(id);
        }
      });
    },
    async delete(id) {
      const res = await getHelpDesk.deleteHelpDesk(id);
      if (res.data.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.message,
          showCancelButton: false,
          showConfirmButton: true,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((result) => {
          if (result) {
            this.getHelpDesk(1);
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res.data.message,
          showCancelButton: false,
          showConfirmButton: true,
          allowEscapeKey: false,
          allowOutsideClick: false,
        });
      }
    },
    onClickChild() {
      this.isList = true;
      this.getHelpDesk(1);
    },
    async getLocations() {
      const res = await getHelpDesk.getLocation();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.locationOptions = filter;
    },
    handleClick(x) {
      this.isEdit = true;
      this.datas = x;
      this.isList = false;
    },
    async getHelpDesk(x) {
      const param = {
        keyword: this.keyword,
        size: this.itemsPerpage,
        page: x - 1,
      };
      const res = await getHelpDesk.getHelpDeskPage(param);
      const data = res.data.data;
      this.items = data.content;
      this.totalPage =
        res.data.data.totalElements > 10
          ? Math.ceil(res.data.data.totalElements / 10)
          : 1;
      this.totalItems = res.data.data.totalElements;
      this.myloadingvariable = false;
    },
    async onPageChangeDetil(value) {
      await this.getHelpDesk(value);
    },
    createCatalog() {
      this.openModalCatalog = true;
    },
    closeModal() {
      this.items = [];
      this.openModalCatalog = false;
      this.getHelpDesk(1);
    },
  },
};
</script>

<style scoped>
.catalog-container {
  width: 100%;
}

.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  text-transform: none;
}

.table-wrapper {
  overflow-x: auto;
  width: 100%;
}

.catalog-table >>> tbody tr {
  cursor: pointer;
}

.catalog-table >>> tbody tr:hover {
  background-color: #f5f5f5 !important;
}

.logo-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.catalog-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border-top: 1px solid #e0e0e0;
}

.total-data-text {
  font-weight: 600;
  font-size: 13px;
}

/* Tablet */
@media (max-width: 960px) {
  .catalog-logo {
    width: 32px;
    height: 32px;
  }

  ::v-deep .v-data-table th,
  ::v-deep .v-data-table td {
    font-size: 13px;
    padding: 0 8px !important;
  }
}

/* Mobile */
@media (max-width: 600px) {
  .logo-cell {
    min-height: 40px;
  }

  .catalog-logo {
    width: 28px;
    height: 28px;
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

  ::v-deep .v-chip {
    font-size: 10px !important;
    height: 20px !important;
  }
}
</style>