<template>
  <div>
    <v-tabs v-model="tab" grow style="box-shadow: none !important">
      <v-tab :key="tabExternal" @click="clickTab(tabExternal)" style="background-color: #f4f5fa">EXTERNAL</v-tab>
      <v-tab :key="tabInternal" @click="clickTab(tabInternal)" style="background-color: #f4f5fa">INTERNAL</v-tab>
    </v-tabs>

    <v-row class="ma-4">
      <v-spacer></v-spacer>
      <v-col cols="12" sm="4" md="3" lg="2" >
        <v-btn class="btn-submit" @click="addForm">Create FAQ</v-btn>
      </v-col>
    </v-row>

    <v-tabs-items v-model="tab" class="mt-4" style="width: 100%">
      <v-tab-item :key="tabExternal" style="width: 100%">
        <v-row style="background-color: #f4f5fa">
          <v-col cols="12" sm="6" md="4" lg="3">
            <div v-if="externalLoaded" class="faq-box">
              <v-list-item-group v-model="selectedExternalIdx" color="primary" mandatory>
                <v-list-item v-for="(cat, index) in pagedCatalogExternal" :key="cat.id" class="catalog-item" @click="selectCatalog(cat.id)">
                  <v-list-item-content><v-list-item-title>{{ cat.name }}</v-list-item-title></v-list-item-content>
                  <v-icon small>{{ icons.mdiChevronRight }}</v-icon>
                </v-list-item>
              </v-list-item-group>
              <div v-if="totalPageExternal > 1" class="pagination-wrap">
                <v-pagination v-model="pageExternal" :length="totalPageExternal" :total-visible="5" @input="onPageExternal" dense></v-pagination>
              </div>
            </div>
            <v-skeleton-loader v-else v-for="i in 5" :key="i" type="list-item"></v-skeleton-loader>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="9">
            <div v-if="externalLoaded" class="faq-box">
              <v-expansion-panels accordion flat>
                <v-expansion-panel v-for="(faq, i) in pagedFaqExternal" :key="faq.id || i">
                  <v-expansion-panel-header>
                    <div v-html="faq.question"></div>
                    <div style="text-align:end">
                      <v-menu v-if="faq.link !== 0" offset-y>
                        <template v-slot:activator="{ on }">
                          <v-btn @click.native.stop="" icon v-on="on"><v-icon>{{ icons.mdiDotsVertical }}</v-icon></v-btn>
                        </template>
                        <v-list>
                          <v-list-item @click="editForm(faq)"><v-list-item-title>Edit</v-list-item-title></v-list-item>
                          <v-list-item @click="deleteConfirm(faq.id)"><v-list-item-title>Delete</v-list-item-title></v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </v-expansion-panel-header>
                  <v-divider></v-divider>
                  <v-expansion-panel-content>
                    <div class="py-4"><div v-html="faq.answer"></div></div>
                    <v-row v-if="faq.document != null"><v-col align="center">
                      <v-btn class="btn-submit" @click="download(faq)">Download File</v-btn>
                    </v-col></v-row>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <div v-if="totalPageFaqExternal > 1" class="pagination-wrap">
                <v-pagination v-model="pageFaqExternal" :length="totalPageFaqExternal" :total-visible="5" dense></v-pagination>
              </div>
            </div>
            <v-skeleton-loader v-else v-for="i in 5" :key="i" type="list-item"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item :key="tabInternal" style="width: 100%">
        <v-row style="background-color: #f4f5fa">
          <v-col cols="12" sm="6" md="4" lg="3">
            <div v-if="internalLoaded" class="faq-box">
              <v-list-item-group v-model="selectedInternalIdx" color="primary" mandatory>
                <v-list-item v-for="(cat, index) in pagedCatalogInternal" :key="cat.id" class="catalog-item" @click="selectCatalog(cat.id)">
                  <v-list-item-content><v-list-item-title>{{ cat.name }}</v-list-item-title></v-list-item-content>
                  <v-icon small>{{ icons.mdiChevronRight }}</v-icon>
                </v-list-item>
              </v-list-item-group>
              <div v-if="totalPageInternal > 1" class="pagination-wrap">
                <v-pagination v-model="pageInternal" :length="totalPageInternal" :total-visible="5" @input="onPageInternal" dense></v-pagination>
              </div>
            </div>
            <v-skeleton-loader v-else v-for="i in 5" :key="i" type="list-item"></v-skeleton-loader>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="9">
            <div v-if="internalLoaded" class="faq-box">
              <v-expansion-panels accordion flat>
                <v-expansion-panel v-for="(faq, i) in pagedFaqInternal" :key="faq.id || i">
                  <v-expansion-panel-header>
                    <div v-html="faq.question"></div>
                    <div style="text-align:end">
                      <v-menu v-if="faq.link !== 0" offset-y>
                        <template v-slot:activator="{ on }">
                          <v-btn @click.native.stop="" icon v-on="on"><v-icon>{{ icons.mdiDotsVertical }}</v-icon></v-btn>
                        </template>
                        <v-list>
                          <v-list-item @click="editForm(faq)"><v-list-item-title>Edit</v-list-item-title></v-list-item>
                          <v-list-item @click="deleteConfirm(faq.id)"><v-list-item-title>Delete</v-list-item-title></v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </v-expansion-panel-header>
                  <v-divider></v-divider>
                  <v-expansion-panel-content>
                    <div class="py-4"><div v-html="faq.answer"></div></div>
                    <v-row v-if="faq.document != null"><v-col align="center">
                      <v-btn class="btn-submit" @click="download(faq)">Download File</v-btn>
                    </v-col></v-row>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <div v-if="totalPageFaqInternal > 1" class="pagination-wrap">
                <v-pagination v-model="pageFaqInternal" :length="totalPageFaqInternal" :total-visible="5" dense></v-pagination>
              </div>
            </div>
            <v-skeleton-loader v-else v-for="i in 5" :key="i" type="list-item"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs-items>

    <CreateFaq :open="openModal" :item="itemSelected" :domain="domain" @close="closeModal"></CreateFaq>
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
  components: { CreateFaq },
  data() {
    return {
      baseUrl: process.env.VUE_APP_PERTAGAS,
      openModal: false,
      tab: "", tabInternal: "INTERNAL", tabExternal: "EXTERNAL", domain: "EXTERNAL",
      icons: { mdiChevronRight, mdiDotsVertical },
      allCatalog: [], faqExternal: [], faqInternal: [],
      catalogExternal: [], catalogInternal: [],
      faqExternalByCatalog: [], faqInternalByCatalog: [],
      selectedExternalIdx: 0, selectedInternalIdx: 0,
      activeCatalogId: null, itemSelected: null,
      externalLoaded: false, internalLoaded: false,
      pageSize: 5,
      pageExternal: 1, pageInternal: 1,
      pageFaqExternal: 1, pageFaqInternal: 1,
    };
  },
  computed: {
    pagedCatalogExternal() { const s = (this.pageExternal-1)*this.pageSize; return this.catalogExternal.slice(s, s+this.pageSize); },
    pagedCatalogInternal() { const s = (this.pageInternal-1)*this.pageSize; return this.catalogInternal.slice(s, s+this.pageSize); },
    totalPageExternal() { return Math.ceil(this.catalogExternal.length/this.pageSize); },
    totalPageInternal() { return Math.ceil(this.catalogInternal.length/this.pageSize); },
    pagedFaqExternal() { const s = (this.pageFaqExternal-1)*this.pageSize; return this.faqExternalByCatalog.slice(s, s+this.pageSize); },
    pagedFaqInternal() { const s = (this.pageFaqInternal-1)*this.pageSize; return this.faqInternalByCatalog.slice(s, s+this.pageSize); },
    totalPageFaqExternal() { return Math.ceil(this.faqExternalByCatalog.length/this.pageSize); },
    totalPageFaqInternal() { return Math.ceil(this.faqInternalByCatalog.length/this.pageSize); },
  },
  created() { this.loadAll(); },
  methods: {
    async loadAll() {
      const [catRes, extRes, intRes] = await Promise.all([catalogService.getAllOptions(), faqService.getExternal(), faqService.getInternal()]);
      const catData = catRes.data.data;
      this.allCatalog = Array.isArray(catData)
        ? (catData[0]?.value ? catData.map(c => ({ id: c.value, name: c.label })) : catData)
        : (catData.content || []);
      this.faqExternal = extRes.data.data || [];
      this.faqInternal = intRes.data.data || [];
      this.buildCatalogLists();
      this.externalLoaded = true;
      this.internalLoaded = true;
    },
    buildCatalogLists() {
      const extIds = new Set(this.faqExternal.map(f => String(f.catalogId)));
      const intIds = new Set(this.faqInternal.map(f => String(f.catalogId)));
      this.catalogExternal = this.allCatalog.filter(c => extIds.has(String(c.id)));
      this.catalogInternal = this.allCatalog.filter(c => intIds.has(String(c.id)));
      if (this.domain === "EXTERNAL" && this.catalogExternal.length > 0) this.selectCatalog(this.catalogExternal[0].id);
      else if (this.domain === "INTERNAL" && this.catalogInternal.length > 0) this.selectCatalog(this.catalogInternal[0].id);
    },
    selectCatalog(catalogId) {
      this.activeCatalogId = catalogId;
      const id = String(catalogId);
      if (this.domain === "EXTERNAL") {
        this.faqExternalByCatalog = this.faqExternal.filter(f => String(f.catalogId) === id);
        this.selectedExternalIdx = this.pagedCatalogExternal.findIndex(c => String(c.id) === id);
        this.pageFaqExternal = 1;
      } else {
        this.faqInternalByCatalog = this.faqInternal.filter(f => String(f.catalogId) === id);
        this.selectedInternalIdx = this.pagedCatalogInternal.findIndex(c => String(c.id) === id);
        this.pageFaqInternal = 1;
      }
    },
    onPageExternal() { if (this.pagedCatalogExternal.length > 0) this.selectCatalog(this.pagedCatalogExternal[0].id); },
    onPageInternal() { if (this.pagedCatalogInternal.length > 0) this.selectCatalog(this.pagedCatalogInternal[0].id); },
    clickTab(tab) {
      this.domain = tab;
      this.$nextTick(() => {
        const list = tab === "EXTERNAL" ? this.catalogExternal : this.catalogInternal;
        if (list.length > 0) this.selectCatalog(list[0].id);
      });
    },
    addForm() { this.itemSelected = null; this.openModal = true; },
    editForm(item) { this.itemSelected = item; this.openModal = true; },
    async closeModal() {
      this.openModal = false;
      this.itemSelected = null;
      const [extRes, intRes] = await Promise.all([faqService.getExternal(), faqService.getInternal()]);
      this.faqExternal = extRes.data.data || [];
      this.faqInternal = intRes.data.data || [];
      const prevId = this.activeCatalogId;
      this.buildCatalogLists();
      if (prevId) {
        const list = this.domain === "EXTERNAL" ? this.catalogExternal : this.catalogInternal;
        if (list.find(c => String(c.id) === String(prevId))) this.selectCatalog(prevId);
      }
    },
    deleteConfirm(id) {
      Swal.fire({ icon: "warning", title: "Delete", text: "Are you sure you want to delete this data?", showCancelButton: true, showConfirmButton: true, allowEscapeKey: false, allowOutsideClick: false })
        .then(result => { if (result.isConfirmed) this.deleteFaq(id); });
    },
    async deleteFaq(id) {
      const res = await faqService.delete(id);
      if (res.data.status === 200) {
        this.faqExternal = this.faqExternal.filter(f => f.id !== id);
        this.faqInternal = this.faqInternal.filter(f => f.id !== id);
        this.buildCatalogLists();
        Swal.fire({ icon: "success", title: "Success", text: res.data.message, showConfirmButton: true });
      } else {
        Swal.fire({ icon: "error", title: "Failed", text: res.data.message, showConfirmButton: true });
      }
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