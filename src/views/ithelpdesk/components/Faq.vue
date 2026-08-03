<template>
  <div>
    <v-row>
      <v-col style="background-color: #f4f5fa" cols="12" sm="6" md="4" lg="3">
        <v-list v-if="catalogLoaded" style="background-color: #f4f5fa">
          <v-list-item-group v-model="item" color="primary">
            <v-list-item
              style="border-bottom: 1px solid #dfdfdf"
              @click="detailPage(item.id)"
              v-for="(item, index) in catalog"
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
      <v-col cols="12" sm="6" md="4" lg="9" style="background-color: #f4f5fa">
        <v-expansion-panels v-if="externalLoaded">
          <v-expansion-panel
            v-for="(item, index) in faqExternalByCatalog"
            :key="index"
          >
            <v-expansion-panel-header>
              <!-- {{ index + 1 }}. -->
              &nbsp;&nbsp;&nbsp;
              <!-- {{
            item.question
          }} -->
              <div v-html="item.question"></div>
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
  </div>
</template>
<script>
import { mdiChevronRight } from "@mdi/js";
import FaqService from "../../../services/faq/faqServices";
import CatalogService from "../../../services/catalog/catalogServices";

const faqService = FaqService.build();
const catalogService = CatalogService.build();

export default {
  data() {
    return {
      baseUrl: process.env.VUE_APP_PERTAGAS,
      isIT: false,
      myloadingvariable: true,
      openModal: false,
      icons: {
        mdiChevronRight,
      },
      catalog: [],
      faqExternal: [],
      faqExternalByCatalog: [],
      item: 0,
      itemSelected: null,
      catalogLoaded: false,
      externalLoaded: false,
    };
  },
  created() {
    this.getCatalog();
  },
  methods: {
    async getCatalog() {
      this.catalogLoaded = false;
      const res = await catalogService.getAll();
      const data = res.data.data.content;
      this.catalog = data;
      this.detailPage(this.catalog[0].id);
      if (this.catalog) {
        this.catalogLoaded = true;
        this.getExternalFaq();
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

    detailPage(x) {
      this.faqExternalByCatalog = this.faqExternal.filter((a) => {
        return a.catalogId === x;
      });
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
  },
};
</script>
<style scoped>
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
}
</style>
