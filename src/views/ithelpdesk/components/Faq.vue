<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3">
        <div v-if="catalogLoaded" class="faq-box">
          <v-list-item-group v-model="selectedIdx" color="primary" mandatory>
            <v-list-item
              v-for="(cat, index) in pagedCatalog"
              :key="cat.id"
              class="catalog-item"
              @click="detailPage(cat.id)"
            >
              <v-list-item-content><v-list-item-title>{{ cat.name }}</v-list-item-title></v-list-item-content>
              <v-icon small>{{ icons.mdiChevronRight }}</v-icon>
            </v-list-item>
          </v-list-item-group>
          <div v-if="totalPageCatalog > 1" class="pagination-wrap">
            <v-pagination v-model="pageCatalog" :length="totalPageCatalog" :total-visible="5" dense></v-pagination>
          </div>
        </div>
        <v-skeleton-loader v-else v-for="i in 5" :key="i" type="list-item"></v-skeleton-loader>
      </v-col>

      <v-col cols="12" sm="6" md="4" lg="9">
        <div v-if="externalLoaded" class="faq-box">
          <v-expansion-panels accordion flat>
            <v-expansion-panel v-for="(item, i) in pagedFaq" :key="item.id || i">
              <v-expansion-panel-header v-if="item.question">
                  <div v-html="item.question"></div>
                </v-expansion-panel-header>
                <v-divider></v-divider>
                <v-expansion-panel-content>
                  <div class="py-6 px-2"><div v-html="item.answer"></div></div>
                  <v-row v-if="item.document != null"><v-col align="center">
                    <v-btn class="btn-submit" @click="download(item)">Download File</v-btn>
                  </v-col></v-row>
                </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <div v-if="totalPageFaq > 1" class="pagination-wrap">
            <v-pagination v-model="pageFaq" :length="totalPageFaq" :total-visible="5" dense></v-pagination>
          </div>
        </div>
        <v-skeleton-loader v-else v-for="i in 5" :key="i" type="list-item"></v-skeleton-loader>
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
      icons: { mdiChevronRight },
      catalog: [], catalogFiltered: [], faqExternal: [], faqByCatalog: [],
      selectedIdx: 0,
      catalogLoaded: false, externalLoaded: false,
      pageSize: 5,
      pageCatalog: 1, pageFaq: 1,
    };
  },
  computed: {
    pagedCatalog() { const s = (this.pageCatalog-1)*this.pageSize; return this.catalogFiltered.slice(s, s+this.pageSize); },
    totalPageCatalog() { return Math.ceil(this.catalogFiltered.length/this.pageSize); },
    pagedFaq() { const s = (this.pageFaq-1)*this.pageSize; return this.faqByCatalog.slice(s, s+this.pageSize); },
    totalPageFaq() { return Math.ceil(this.faqByCatalog.length/this.pageSize); },
  },
  created() { this.getCatalog(); },
  methods: {
    async getCatalog() {
      this.catalogLoaded = false;
      const res = await catalogService.getAllOptions();
      const catData = res.data.data;
      this.catalog = Array.isArray(catData)
        ? (catData[0]?.value ? catData.map(c => ({ id: c.value, name: c.label })) : catData)
        : (catData.content || []);
      this.catalogLoaded = true;
      this.getExternalFaq();
    },
    async getExternalFaq() {
      this.externalLoaded = false;
      const res = await faqService.getExternal();
      this.faqExternal = res.data.data || [];
      const ids = new Set(this.faqExternal.map(f => String(f.catalogId)));
      this.catalogFiltered = this.catalog.filter(c => ids.has(String(c.id)));
      this.externalLoaded = true;
      if (this.catalogFiltered.length > 0) this.detailPage(this.catalogFiltered[0].id);
    },
    detailPage(id) {
      this.pageFaq = 1;
      this.selectedIdx = this.pagedCatalog.findIndex(c => String(c.id) === String(id));
      this.faqByCatalog = this.faqExternal.filter(f => String(f.catalogId) === String(id));
    },
    download(faq) {
      const a = document.createElement("a");
      a.href = this.baseUrl + faq.fileUrl;
      a.setAttribute("target", "_blank");
      a.download = faq.document.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(a);
    },
  },
};
</script>

<style scoped>
.btn-submit { color: white !important; background-color: #0172b9 !important; }

.faq-box {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.catalog-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 8px 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  border-top: 1px solid #e0e0e0;
}
</style>