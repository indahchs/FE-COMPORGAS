<template>
  <div class="faq-container">
    <!-- Tabs -->
    <v-tabs v-model="tab" grow class="faq-tabs">
      <v-tab :key="tabExternal" @click="clickTab(tabExternal)">
        EXTERNAL
      </v-tab>
      <v-tab :key="tabInternal" @click="clickTab(tabInternal)">
        INTERNAL
      </v-tab>
    </v-tabs>

    <!-- Action Button -->
    <v-card flat class="action-card mt-2">
      <v-card-text class="pa-2 pa-sm-3">
        <v-row class="ma-0">
          <v-spacer></v-spacer>
          <v-col cols="12" sm="6" md="4" lg="3" class="pa-1">
            <v-btn class="btn-submit" @click="addForm" block depressed>
              <v-icon left small>mdi-plus</v-icon>
              Create FAQ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Content Tabs -->
    <v-tabs-items v-model="tab" class="mt-2">
      <!-- External Tab -->
      <v-tab-item :key="tabExternal">
        <v-row class="ma-0 content-row">
          <!-- Sidebar Catalog List -->
          <v-col cols="12" md="4" lg="3" class="sidebar-col pa-1 pa-sm-2">
            <v-card outlined class="catalog-sidebar">
              <v-list v-if="catalogLoaded" dense class="pa-0">
                <v-list-item-group v-model="item" color="primary" mandatory>
                  <v-list-item
                    v-for="(catalog, index) in catalog"
                    :key="catalog.id"
                    @click="detailPage(catalog.id)"
                    class="catalog-item"
                  >
                    <v-list-item-content>
                      <v-list-item-title class="text-body-2">
                        {{ index + 1 }}. {{ catalog.name }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-icon small>{{ icons.mdiChevronRight }}</v-icon>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
              <div v-else class="pa-2">
                <v-skeleton-loader
                  v-for="index in 10"
                  :key="index"
                  type="list-item"
                  class="mb-1"
                ></v-skeleton-loader>
              </div>
            </v-card>
          </v-col>

          <!-- FAQ Content -->
          <v-col cols="12" md="8" lg="9" class="content-col pa-1 pa-sm-2">
            <v-card outlined>
              <v-expansion-panels v-if="externalLoaded" accordion>
                <v-expansion-panel
                  v-for="(faq, index) in faqExternalByCatalog"
                  :key="index"
                >
                  <v-expansion-panel-header class="faq-header">
                    <div class="faq-question" v-html="faq.question"></div>
                    <template v-slot:actions>
                      <v-menu v-if="faq.link !== 0" offset-y>
                        <template v-slot:activator="{ on }">
                          <v-btn @click.native.stop="" icon small v-on="on">
                            <v-icon small>{{ icons.mdiDotsVertical }}</v-icon>
                          </v-btn>
                        </template>
                        <v-list dense>
                          <v-list-item @click="editForm(faq)">
                            <v-list-item-icon class="mr-2">
                              <v-icon small>mdi-pencil</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Edit</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="deleteConfirm(faq.id)">
                            <v-list-item-icon class="mr-2">
                              <v-icon small>mdi-delete</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Delete</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <v-icon>mdi-chevron-down</v-icon>
                    </template>
                  </v-expansion-panel-header>
                  <v-divider></v-divider>
                  <v-expansion-panel-content>
                    <div class="faq-answer pa-3" v-html="faq.answer"></div>
                    <div v-if="faq.document != null" class="text-center pa-2">
                      <v-btn
                        class="btn-submit"
                        @click="download(faq)"
                        small
                      >
                        <v-icon left small>mdi-download</v-icon>
                        Download File
                      </v-btn>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <div v-else class="pa-3">
                <v-skeleton-loader
                  v-for="index in 5"
                  :key="index"
                  type="article"
                  class="mb-2"
                ></v-skeleton-loader>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>

      <!-- Internal Tab -->
      <v-tab-item :key="tabInternal">
        <v-row class="ma-0 content-row">
          <!-- Sidebar Catalog List -->
          <v-col cols="12" md="4" lg="3" class="sidebar-col pa-1 pa-sm-2">
            <v-card outlined class="catalog-sidebar">
              <v-list v-if="catalogLoaded" dense class="pa-0">
                <v-list-item-group v-model="items" color="primary">
                  <v-list-item
                    v-for="(catalog, index) in catalogInt"
                    :key="index"
                    @click="detailPage(catalog.id)"
                    class="catalog-item"
                  >
                    <v-list-item-content>
                      <v-list-item-title class="text-body-2">
                        {{ index + 1 }}. {{ catalog.name }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-icon small>{{ icons.mdiChevronRight }}</v-icon>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
              <div v-else class="pa-2">
                <v-skeleton-loader
                  v-for="index in 10"
                  :key="index"
                  type="list-item"
                  class="mb-1"
                ></v-skeleton-loader>
              </div>
            </v-card>
          </v-col>

          <!-- FAQ Content -->
          <v-col cols="12" md="8" lg="9" class="content-col pa-1 pa-sm-2">
            <v-card outlined>
              <v-expansion-panels v-if="internalLoaded" accordion>
                <v-expansion-panel
                  v-for="(faq, index) in faqInternalByCatalog"
                  :key="index"
                >
                  <v-expansion-panel-header class="faq-header">
                    <div class="faq-question" v-html="faq.question"></div>
                    <template v-slot:actions>
                      <v-menu v-if="faq.link !== 0" offset-y>
                        <template v-slot:activator="{ on }">
                          <v-btn @click.native.stop="" icon small v-on="on">
                            <v-icon small>{{ icons.mdiDotsVertical }}</v-icon>
                          </v-btn>
                        </template>
                        <v-list dense>
                          <v-list-item @click="editForm(faq)">
                            <v-list-item-icon class="mr-2">
                              <v-icon small>mdi-pencil</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Edit</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="deleteConfirm(faq.id)">
                            <v-list-item-icon class="mr-2">
                              <v-icon small>mdi-delete</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Delete</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <v-icon>mdi-chevron-down</v-icon>
                    </template>
                  </v-expansion-panel-header>
                  <v-divider></v-divider>
                  <v-expansion-panel-content>
                    <div class="faq-answer pa-3" v-html="faq.answer"></div>
                    <div v-if="faq.document != null" class="text-center pa-2">
                      <v-btn
                        class="btn-submit"
                        @click="download(faq)"
                        small
                      >
                        <v-icon left small>mdi-download</v-icon>
                        Download File
                      </v-btn>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <div v-else class="pa-3">
                <v-skeleton-loader
                  v-for="index in 5"
                  :key="index"
                  type="article"
                  class="mb-2"
                ></v-skeleton-loader>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs-items>

    <!-- Modal -->
    <CreateFaq
      :open="openModal"
      :item="itemSelected"
      :domain="domain"
      @close="closeModal"
    ></CreateFaq>
  </div>
</template>

<script>
import { mdiChevronRight, mdiDotsVertical } from "@mdi/js";
import Swal from "sweetalert2";
import FaqService from "../../../services/faq/faqServices";
import CatalogService from "../../../services/catalog/catalogServices";
import CreateFaq from "./CreateFaqFormModal.vue";

const faqService = FaqService.build();
const catalogService = CatalogService.build();

export default {
  components: {
    CreateFaq,
  },
  data() {
    return {
      baseUrl: process.env.VUE_APP_PERTAGAS,
      openModal: false,
      tab: "",
      tabInternal: "INTERNAL",
      tabExternal: "EXTERNAL",
      icons: {
        mdiChevronRight,
        mdiDotsVertical,
      },
      catalog: [],
      catalogInt: [],
      faqInternal: [],
      faqExternal: [],
      faqInternalByCatalog: [],
      faqExternalByCatalog: [],
      item: 0,
      items: 0,
      itemSelected: null,
      domain: "EXTERNAL",
      catalogLoaded: false,
      externalLoaded: false,
      internalLoaded: false,
    };
  },
  created() {
    this.getCatalog();
  },
  methods: {
    addForm() {
      this.itemSelected = null;
      this.openModal = true;
    },
    editForm(item) {
      this.itemSelected = item;
      this.openModal = true;
    },
    deleteConfirm(id) {
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
      const res = await faqService.delete(id);
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
            this.getCatalog();
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
    closeModal() {
      this.openModal = false;
      this.itemSelected = null;
      this.catalog = [];
      this.catalogInt = [];
      this.faqInternal = [];
      this.faqExternal = [];
      this.getCatalog();
    },
    async getCatalog() {
      this.catalogLoaded = false;
      const res = await catalogService.getAll();
      const data = res.data.data.content;
      this.catalog = data;
      this.catalogInt = data;
      if (this.catalog) {
        this.catalogLoaded = true;
        this.getExternalFaq();
        this.getInternalFaq();
      }
    },
    async getInternalFaq() {
      this.internalLoaded = false;
      const res = await faqService.getInternal();
      const data = res.data.data;
      this.faqInternal = data;
      if (this.faqInternal) {
        this.internalLoaded = true;
        this.detailPage(this.catalogInt[0].id);
      }
    },
    async getExternalFaq() {
      this.externalLoaded = false;
      const res = await faqService.getExternal();
      const data = res.data.data;
      this.faqExternal = data;
      if (this.faqExternal) {
        this.externalLoaded = true;
        this.detailPage(this.catalog[0].id);
      }
    },

    download(faq) {
      var docUrl = document.createElement("a");
      docUrl.href = this.baseUrl + faq.fileUrl;
      docUrl.setAttribute("open", faq.document.file_name);
      docUrl.setAttribute("target", "_blank");
      docUrl.download = true;
      document.body.appendChild(docUrl);
      docUrl.click();
      window.URL.revokeObjectURL(docUrl);
    },

    detailPage(x) {
      if (this.domain == "EXTERNAL") {
        this.faqExternalByCatalog = this.faqExternal.filter(
          (a) => a.catalogId === x
        );
      } else if (this.domain == "INTERNAL") {
        this.faqInternalByCatalog = this.faqInternal.filter(
          (a) => a.catalogId === x
        );
      }
    },

    clickTab(tab) {
      this.domain = tab;
    },
  },
};
</script>

<style scoped>
.faq-container {
  width: 100%;
}

.faq-tabs {
  box-shadow: none !important;
  border-radius: 8px;
  overflow: hidden;
}

.faq-tabs ::v-deep .v-tab {
  background-color: #f4f5fa;
  text-transform: none;
  font-weight: 500;
}

.action-card {
  border-radius: 8px;
}

.content-row {
  background-color: #f4f5fa;
  border-radius: 8px;
  min-height: 400px;
}

.sidebar-col {
  background-color: #f4f5fa;
}

.catalog-sidebar {
  background-color: white;
  border-radius: 8px;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.catalog-item {
  border-bottom: 1px solid #e0e0e0;
  min-height: 48px;
}

.catalog-item:last-child {
  border-bottom: none;
}

.content-col {
  background-color: #f4f5fa;
}

.faq-header {
  min-height: 56px;
}

.faq-question {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  padding-right: 12px;
}

.faq-answer {
  font-size: 14px;
  line-height: 1.6;
}

.faq-answer ::v-deep p {
  margin-bottom: 8px;
}

.faq-answer ::v-deep ul,
.faq-answer ::v-deep ol {
  margin-left: 20px;
  margin-bottom: 8px;
}

.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  text-transform: none;
}

/* Scrollbar */
.catalog-sidebar::-webkit-scrollbar {
  width: 6px;
}

.catalog-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.catalog-sidebar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.catalog-sidebar::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Mobile Styles */
@media (max-width: 960px) {
  .sidebar-col {
    order: 2;
  }

  .content-col {
    order: 1;
  }

  .catalog-sidebar {
    max-height: 300px;
  }

  .faq-question {
    font-size: 13px;
  }

  .faq-answer {
    font-size: 13px;
  }
}

@media (max-width: 600px) {
  .faq-header {
    min-height: 48px;
    padding: 8px 12px;
  }

  .faq-question {
    font-size: 12px;
  }

  .faq-answer {
    font-size: 12px;
    padding: 12px !important;
  }

  .catalog-item {
    min-height: 40px;
    padding: 4px 12px;
  }

  .catalog-item ::v-deep .v-list-item__title {
    font-size: 13px;
  }

  .catalog-sidebar {
    max-height: 250px;
  }
}
</style>