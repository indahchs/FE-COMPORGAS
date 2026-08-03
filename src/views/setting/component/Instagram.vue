<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="8">
        <span class="title-page">News List</span>
      </v-col>
      <v-col cols="12" sm="6" md="8" lg="4" class="text-right">
        <v-btn color="primary" @click="openAddModal" :prepend-icon="icons.mdiPlus">
          Add News
        </v-btn>
      </v-col>
    </v-row>

    <v-card class="mt-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <v-text-field dense outlined v-model="keywords" :append-icon="icons.mdiMagnify" label="Search by Caption"
              clearable></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text>
        <v-data-table hide-default-footer style="width: 100%" :loading="myloadingvariable" :headers="headers"
          :items="items" :footer-props="{
            'items-per-page-options': [5, 10, 25, 50],
            'items-per-page-text': 'Items per page:',
            'show-current-page': true,
            'show-first-last-page': true,
          }">
          <template v-slot:item.caption="{ item }">
            <div style="max-width: 300px;">
              <span :title="item.caption">
                {{ item.caption ? item.caption.substring(0, 100) + (item.caption.length > 100 ? '...' : '')
                  : '-' }}
              </span>
            </div>
          </template>

          <template v-slot:item.mediaType="{ item }">
            <div v-if="item.mediaUrl" class="d-flex align-center">
              <v-img :src="getMediaUrl(item.mediaUrl)" max-width="50" max-height="50" class="rounded mr-2"
                @click="openMediaPreview(item)" style="cursor: pointer"></v-img>
              <div v-if="item.mediaType === 'VIDEO'" class="d-flex align-center">
                <v-icon class="ml-1">{{ icons.mdiPlay }}</v-icon>
                <span class="text-caption ml-1">Video</span>
              </div>
            </div>
            <span v-else class="text-grey">No Media</span>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip small :color="item.disabled ? 'error' : 'success'" dark>
              {{ item.disabled ? 'Disabled' : 'Enabled' }}
            </v-chip>
          </template>

          <template v-slot:item.createdAt="{ item }">
            {{ formatDateTime(item.timestamp) }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn icon small @click.stop="editItem(item)" :title="'Edit'">
              <v-icon>{{ icons.mdiPencil }}</v-icon>
            </v-btn>
            <v-btn icon small @click.stop="toggleStatus(item)" :title="item.disabled ? 'Enable' : 'Disable'"
              :color="item.disabled ? 'success' : 'warning'">
              <v-icon>{{ item.disabled ? icons.mdiCheckCircle : icons.mdiCancel }}</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <div class="ml-4" style="display: flex; justify-content: space-between; align-items: center">
          <div style="display: flex; align-items: center; gap: 16px">
            <span style="font-weight: 700">
              Total Data : {{ totalItems }}
            </span>
          </div>
          <v-pagination v-model="pages" :length="totalPage" @input="onPageChangeDetil"
            :total-visible="7"></v-pagination>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="formModal" max-width="900px" persistent>
      <v-card>
        <v-card-title class="headline">
          {{ isEdit ? 'Edit News' : 'Create News' }}
          <v-spacer></v-spacer>
          <v-btn icon @click="closeFormModal">
            <v-icon>{{ icons.mdiClose }}</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-textarea label="Caption *" v-model="formData.caption" :rules="captionRules" outlined required
                  placeholder="Enter Caption" rows="4"></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-file-input label="Image *" v-model="formData.imageFile" accept="image/*" outlined show-size
                  prepend-icon="" placeholder="Choose image file" :rules="imageFileRules" hint="Max. file size 5 MB"
                  persistent-hint @change="onFileChange">
                </v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveData" :loading="saving" :disabled="!formValid">
            Save News
          </v-btn>
          <v-btn color="grey" @click="closeFormModal">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="statusModal" max-width="400px" persistent>
      <v-card>
        <v-card-title class="headline">Confirm {{ itemToToggle?.disabled ? 'Enable' : 'Disable' }}</v-card-title>
        <v-card-text>
          Are you sure you want to {{ itemToToggle?.disabled ? 'enable' : 'disable' }} this news?
          <br><strong>{{ itemToToggle?.caption ? itemToToggle.caption.substring(0, 50) + '...' : '' }}</strong>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="itemToToggle?.disabled ? 'success' : 'warning'" @click="confirmToggleStatus"
            :loading="toggling">
            {{ itemToToggle?.disabled ? 'Enable' : 'Disable' }}
          </v-btn>
          <v-btn color="grey" @click="closeStatusModal">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="mediaPreviewDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ selectedMediaItem?.username || 'News Preview' }}</span>
          <v-btn icon @click="mediaPreviewDialog = false">
            <v-icon>{{ icons.mdiClose }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <div v-if="selectedMediaItem">
            <v-img v-if="selectedMediaItem.mediaType === 'IMAGE' || selectedMediaItem.mediaType === 'CAROUSEL_ALBUM'"
              :src="getMediaUrl(selectedMediaItem.mediaUrl)" max-height="500" contain></v-img>
            <video v-else-if="selectedMediaItem.mediaType === 'VIDEO'" :src="getMediaUrl(selectedMediaItem.mediaUrl)"
              controls style="width: 100%; max-height: 500px;">
              Your browser does not support the video tag.
            </video>
          </div>
        </v-card-text>
        <v-card-text v-if="selectedMediaItem">
          <div class="text-body-2 mb-2"><strong>Username:</strong> {{ selectedMediaItem.username }}</div>
          <div class="text-body-2 mb-2"><strong>Caption:</strong> {{ selectedMediaItem.caption }}</div>
          <div class="text-body-2 mb-2"><strong>Media Type:</strong> {{ selectedMediaItem.mediaType }}</div>
          <div class="text-body-2 mb-2" v-if="selectedMediaItem.permalink"><strong>Link:</strong>
            <a :href="selectedMediaItem.permalink" target="_blank">{{ selectedMediaItem.permalink }}</a>
          </div>
          <div class="text-body-2"><strong>Created At:</strong> {{ formatDateTime(selectedMediaItem.timestamp) }}</div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  mdiMagnify,
  mdiPencil,
  mdiPlus,
  mdiClose,
  mdiEye,
  mdiPlay,
  mdiCheckCircle,
  mdiCancel
} from "@mdi/js";
import BannerService from "@/services/banner-services/BannerService.js";

const service = BannerService.build();

export default {
  name: "News",
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      myloadingvariable: false,
      saving: false,
      toggling: false,
      formModal: false,
      statusModal: false,
      mediaPreviewDialog: false,
      isEdit: false,
      formValid: false,
      selectedItem: null,
      itemToToggle: null,
      selectedMediaItem: null,
      maxFileSize: 5 * 1024 * 1024,
      icons: {
        mdiMagnify,
        mdiPencil,
        mdiPlus,
        mdiClose,
        mdiEye,
        mdiPlay,
        mdiCheckCircle,
        mdiCancel,
      },
      headers: [
        { text: "Caption", value: "caption", sortable: true },
        { text: "Created Time", value: "createdAt", sortable: true },
        { text: "Created By", value: "username", sortable: true },
        { text: "Media", value: "mediaType", sortable: false, width: "100px" },
        { text: "Status", value: "status", sortable: true, width: "120px" },
        { text: "Actions", value: "actions", sortable: false, width: "150px" },
      ],
      items: [],
      keywords: "",
      formData: {
        id: null,
        caption: "",
        imageFile: null,
      },
      captionRules: [
        v => !!v || 'Caption is required',
        v => v.length <= 2000 || 'Maximum 2000 characters for caption',
      ],
      imageFileRules: [
        v => !this.isEdit ? (!!v || 'Image is required') : true,
        v => {
          if (!v) return !this.isEdit ? 'Image is required' : true;
          if (v.size > this.maxFileSize) {
            return `File size must not exceed ${this.formatFileSize(this.maxFileSize)}`;
          }
          return true;
        }
      ],
    };
  },

  created() {
    this.getPosts(1);
  },

  watch: {
    keywords() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.getPosts(1);
      }, 500);
    }
  },

  methods: {
    async getPosts(page) {
      this.myloadingvariable = true;

      try {
        const params = {
          page: page - 1,
          size: this.itemsPerpage,
          sort: 'timestamp,DESC'
        };

        if (this.keywords && this.keywords.trim()) {
          params.caption = this.keywords.trim();
        }

        const res = await service.getBannerPage(params);

        const data = res.data.data;
        this.items = data.content || [];
        this.totalPage = data.totalPages || 1;
        this.totalItems = data.totalElements || 0;
        this.pages = page;

      } catch (error) {
        console.error("Error loading posts:", error);
        this.$emit('show-snackbar', 'Error loading data', 'error');
        this.items = [];
        this.totalPage = 1;
        this.totalItems = 0;
      } finally {
        this.myloadingvariable = false;
      }
    },

    async onPageChangeDetil(value) {
      await this.getPosts(value);
    },

    openAddModal() {
      this.isEdit = false;
      this.resetForm();
      this.formModal = true;
    },

    editItem(item) {
      this.isEdit = true;
      this.selectedItem = item;
      this.formData = {
        id: item.id,
        caption: item.caption || "",
        imageFile: null,
      };
      this.formModal = true;
    },

    closeFormModal() {
      this.formModal = false;
      this.resetForm();
    },

    toggleStatus(item) {
      this.itemToToggle = item;
      this.statusModal = true;
    },

    closeStatusModal() {
      this.statusModal = false;
      this.itemToToggle = null;
    },

    resetForm() {
      this.formData = {
        id: null,
        caption: "",
        imageFile: null,
      };
      this.selectedItem = null;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    onFileChange(file) {
      if (!file) {
        return true;
      }

      if (file.size > this.maxFileSize) {
        this.$emit('show-snackbar',
          `File is too large. Maximum file size is ${this.formatFileSize(this.maxFileSize)}`,
          'error'
        );

        this.formData.imageFile = null;

        if (this.$refs.form) {
          this.$refs.form.validate();
        }

        return false;
      }

      return true;
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    async saveData() {
      if (!this.$refs.form.validate()) {
        return;
      }

      if (this.formData.imageFile && this.formData.imageFile.size > this.maxFileSize) {
        this.$emit('show-snackbar',
          `File is too large. Maximum file size is ${this.formatFileSize(this.maxFileSize)}`,
          'error'
        );
        return;
      }

      this.saving = true;

      try {
        const formData = new FormData();
        formData.append('caption', this.formData.caption);

        if (this.formData.imageFile) {
          formData.append('file', this.formData.imageFile);
        }

        if (this.isEdit && this.formData.id) {
          await service.updateBanner(this.formData.id, formData);
          this.$emit('show-snackbar', 'News updated successfully', 'success');
        } else {
          await service.createBanner(formData);
          this.$emit('show-snackbar', 'News added successfully', 'success');
        }

        this.closeFormModal();
        this.getPosts(1);

      } catch (error) {
        console.error("Error saving News:", error);
        this.$emit('show-snackbar', 'Error saving data', 'error');
      } finally {
        this.saving = false;
      }
    },

    async confirmToggleStatus() {
      if (!this.itemToToggle) return;

      this.toggling = true;

      try {
        if (this.itemToToggle.disabled) {
          await service.updateStatusEnable(this.itemToToggle.id);
          this.$emit('show-snackbar', 'News enabled successfully', 'success');
        } else {
          await service.updateStatusDisable(this.itemToToggle.id);
          this.$emit('show-snackbar', 'News disabled successfully', 'success');
        }

        this.closeStatusModal();
        await this.getPosts(this.pages);

      } catch (error) {
        console.error("Error toggling news status:", error);
        this.$emit('show-snackbar', 'Error changing status', 'error');
      } finally {
        this.toggling = false;
      }
    },

    openMediaPreview(item) {
      if (item.mediaUrl) {
        this.selectedMediaItem = item;
        this.mediaPreviewDialog = true;
      }
    },

    getMediaUrl(url) {
      const api = process.env.VUE_APP_PERTAGAS;
      return api + url;
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '-';
      return new Date(dateTime).toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
};
</script>

<style scoped>
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
}

.title-page {
  font-weight: bold;
  color: #101010;
  font-size: 24px;
}

.headline {
  font-size: 18px !important;
  font-weight: 600 !important;
}
</style>