<template>
  <div>
    <v-tabs v-model="tab" grow style="box-shadow: none !important">
      <v-tab
        :key="tabExternal"
        @click="clickTab(tabExternal)"
        style="background-color: #f4f5fa"
      >
        EXTERNAL
      </v-tab>
      <v-tab
        :key="tabInternal"
        @click="clickTab(tabInternal)"
        style="background-color: #f4f5fa"
      >
        INTERNAL
      </v-tab>
    </v-tabs>

    <v-row class="ma-4">
      <v-spacer></v-spacer>
      <v-col cols="2">
        <v-btn class="btn-submit" @click="addForm"> Create FAQ </v-btn>
      </v-col>
    </v-row>

    <v-tabs-items v-model="tab" class="mt-4" style="width: 100%">
      <v-tab-item :key="tabExternal" style="width: 100%">
        <v-row style="background-color: #f4f5fa">
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-list v-if="catalogLoaded" style="background-color: #f4f5fa">
              <v-list-item-group v-model="item" color="primary" mandatory>
                <v-list-item
                  style="border-bottom: 1px solid #dfdfdf"
                  @click="detailPage(item.id)"
                  v-for="(item, index) in catalog"
                  :key="item.id"
                >
                  <!-- Text Content -->
                  <v-list-item-content>
                    <v-list-item-title
                      >{{ index + 1 }}.&nbsp;&nbsp;&nbsp;{{ item.name }}
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-icon>{{ icons.mdiChevronRight }}</v-icon>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            <div v-else>
              <v-skeleton-loader
                v-for="index in 10"
                :key="index"
                style="width: 100%"
                type="list-item"
              ></v-skeleton-loader>
            </div>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="9">
            <v-expansion-panels v-if="externalLoaded">
              <v-expansion-panel
                v-for="(item, index) in faqExternalByCatalog"
                :key="index"
              >
                <v-expansion-panel-header>
                  <!-- {{ index + 1 }}.&nbsp;&nbsp;&nbsp; -->
                  <div v-html="item.question"></div>
                  <div style="text-align: end">
                    <v-menu v-if="item.link !== 0" offset-y>
                      <template v-slot:activator="{ on }">
                        <v-btn @click.native.stop="" icon v-on="on">
                          <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
                        </v-btn>
                      </template>

                      <v-list>
                        <v-list-item @click="editForm(item)">
                          <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteConfirm(item.id)">
                          <v-list-item-title>Delete</v-list-item-title>
                        </v-list-item>
                        <!-- Add more menu items as needed -->
                      </v-list>
                    </v-menu>
                  </div>
                </v-expansion-panel-header>
                <v-divider></v-divider>
                <v-expansion-panel-content>
                  <div class="py-4">
                    <div v-html="item.answer"></div>
                    <!-- {{ item.answer }} -->
                  </div>
                  <div>
                    <v-row>
                      <v-col align="center" justify="center">
                        <v-btn
                          v-if="item.document != null"
                          class="btn-submit"
                          @click="download(item)"
                        >
                          Download File
                        </v-btn>
                      </v-col>
                    </v-row>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <div v-else>
              <v-skeleton-loader
                v-for="index in 10"
                :key="index"
                style="width: 100%"
                type="list-item"
              ></v-skeleton-loader>
            </div>
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item :key="tabInternal" style="width: 100%">
        <v-row>
          <v-col
            style="background-color: #f4f5fa"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-list v-if="catalogLoaded" style="background-color: #f4f5fa">
              <v-list-item-group v-model="items" color="primary">
                <v-list-item
                  style="border-bottom: 1px solid #dfdfdf"
                  @click="detailPage(item.id)"
                  v-for="(item, index) in catalogInt"
                  :key="index"
                >
                  <!-- Text Content -->
                  <v-list-item-content>
                    <v-list-item-title
                      >{{ index + 1 }}.&nbsp;&nbsp;&nbsp;{{ item.name }}
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-icon>{{ icons.mdiChevronRight }}</v-icon>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            <div v-else>
              <v-skeleton-loader
                v-for="index in 10"
                :key="index"
                style="width: 100%"
                type="list-item"
              ></v-skeleton-loader>
            </div>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
            lg="9"
            style="background-color: #f4f5fa"
          >
            <v-expansion-panels v-if="internalLoaded">
              <v-expansion-panel
                v-for="(item, index) in faqInternalByCatalog"
                :key="index"
              >
                <v-expansion-panel-header
                  >
                  <!-- {{ index + 1 }}. -->
                  <!-- &nbsp;&nbsp;&nbsp; -->
                  <div v-html="item.question"></div>
                  <div style="text-align: end">
                    <v-menu v-if="item.link !== 0" offset-y>
                      <template v-slot:activator="{ on }">
                        <v-btn @click.native.stop="" icon v-on="on">
                          <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
                        </v-btn>
                      </template>

                      <v-list>
                        <v-list-item @click="editForm(item)">
                          <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteConfirm(item.id)">
                          <v-list-item-title>Delete</v-list-item-title>
                        </v-list-item>
                        <!-- Add more menu items as needed -->
                      </v-list>
                    </v-menu>
                  </div>
                </v-expansion-panel-header>
                <v-divider></v-divider>
                <v-expansion-panel-content>
                  <div class="py-4">
                    <div v-html="item.answer"></div>
                    <!-- {{ item.answer }} -->
                  </div>
                  <div>
                    <v-row>
                      <v-col align="center" justify="center">
                        <v-btn
                          v-if="item.document != null"
                          class="btn-submit"
                          @click="download(item)"
                        >
                          Download File
                        </v-btn>
                      </v-col>
                    </v-row>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <div v-else>
              <v-skeleton-loader
                v-for="index in 10"
                :key="index"
                style="width: 100%"
                type="list-item"
              ></v-skeleton-loader>
            </div>
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs-items>

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
      tabs: ["Eksternal", "Internal"],
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
        } else {
          return false;
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
            this.loading = false;
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
        }).then((result) => {
          if (result) {
            this.loading = false;
          }
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
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
}
</style>
