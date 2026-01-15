<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="8">
        <span class="title-page">Broadcast List</span>
      </v-col>
      <v-col cols="12" sm="6" md="8" lg="4" class="text-right">
        <v-btn color="primary" @click="openAddModal" :prepend-icon="icons.mdiPlus">
          Add Broadcast
        </v-btn>
      </v-col>
    </v-row>

    <v-card class="mt-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <v-text-field dense outlined v-model="keywords" :append-icon="icons.mdiMagnify" label="Search by Title"
              clearable></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text>
        <v-data-table hide-default-footer style="width: 100%" :loading="myloadingvariable" :headers="headers"
          :items="items">
          <template v-slot:item.description="{ item }">
            <div style="max-width: 300px;">
              <span :title="item.description">
                {{ item.description ? item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '')
                  : '-' }}
              </span>
            </div>
          </template>

          <template v-slot:item.mediaType="{ item }">
            <div v-if="item.url" class="d-flex align-center">
              <v-img :src="getImageUrl(item.url)" max-width="50" max-height="50" class="rounded mr-2"
                @click="openImagePreview(item)" style="cursor: pointer"></v-img>
            </div>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip small :color="item.disabled ? 'error' : 'success'" dark>
              {{ item.disabled ? 'Disabled' : 'Enabled' }}
            </v-chip>
          </template>

          <template v-slot:item.createdAt="{ item }">
            {{ formatDateTime(item.createdAt) }}
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
          {{ isEdit ? 'Edit Broadcast' : 'Create Broadcast' }}
          <v-spacer></v-spacer>
          <v-btn icon @click="closeFormModal">
            <v-icon>{{ icons.mdiClose }}</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field label="Broadcast Title *" v-model="formData.title" :rules="titleRules" outlined required
                  placeholder="Enter Broadcast Title"></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea label="Description *" v-model="formData.description" :rules="descriptionRules" outlined
                  required placeholder="Enter Broadcast Description" rows="4"></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-file-input label="Attachment" v-model="formData.imageFile" :rules="fileRules" accept="image/*"
                  outlined show-size prepend-icon="" placeholder="Choose image" hint="Max. file size 5 MB"
                  persistent-hint @change="onFileChange">
                </v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveData" :loading="saving" :disabled="!formValid">
            Save Broadcast
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
          Are you sure you want to {{ itemToToggle?.disabled ? 'enable' : 'disable' }} this broadcast?
          <br><strong>{{ itemToToggle?.title }}</strong>
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

    <v-dialog v-model="imagePreviewDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ selectedImageItem?.title || 'Image Preview' }}</span>
          <v-btn icon @click="imagePreviewDialog = false">
            <v-icon>{{ icons.mdiClose }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-img v-if="selectedImageItem" :src="getImageUrl(selectedImageItem.url)" max-height="500" contain></v-img>
        </v-card-text>
        <v-card-text v-if="selectedImageItem">
          <div class="text-body-2 mb-2"><strong>Title:</strong> {{ selectedImageItem.title }}</div>
          <div class="text-body-2 mb-2"><strong>Description:</strong> {{ selectedImageItem.description }}</div>
          <div class="text-body-2 mb-2"><strong>Created By:</strong> {{ selectedImageItem.createdBy }}</div>
          <div class="text-body-2"><strong>Created At:</strong> {{ formatDateTime(selectedImageItem.createdAt) }}</div>
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
  mdiCheckCircle,
  mdiCancel
} from "@mdi/js";
import AnnouncementService from "@/services/announcement-services/AnnouncementService.js";

const service = AnnouncementService.build();

export default {
  name: "AnnouncementList",
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
      imagePreviewDialog: false,
      isEdit: false,
      formValid: false,
      selectedItem: null,
      itemToToggle: null,
      selectedImageItem: null,
      maxFileSize: 5 * 1024 * 1024,

      icons: {
        mdiMagnify,
        mdiPencil,
        mdiPlus,
        mdiClose,
        mdiCheckCircle,
        mdiCancel,
      },

      headers: [
        { text: "Broadcast Title", value: "title", sortable: true },
        { text: "Description", value: "description", sortable: false },
        { text: "Created Time", value: "createdAt", sortable: true },
        { text: "Created By", value: "createdBy", sortable: true },
        { text: "Media", value: "mediaType", sortable: false, width: "100px" },
        { text: "Status", value: "status", sortable: true, width: "120px" },
        { text: "Actions", value: "actions", sortable: false, width: "120px" },
      ],

      items: [],
      keywords: "",

      formData: {
        title: "",
        description: "",
        imageFile: null,
      },

      titleRules: [
        v => !!v || 'Title is required',
        v => v.length <= 200 || 'Maximum 200 characters for title',
      ],
      descriptionRules: [
        v => !!v || 'Description is required',
        v => v.length <= 200 || 'Maximum 200 characters for description',
      ],
      fileRules: [
        v => {
          if (!v) return true;
          if (v.size > this.maxFileSize) {
            return `File size must not exceed ${this.formatFileSize(this.maxFileSize)}`;
          }
          return true;
        }
      ],
    };
  },

  created() {
    this.getAnnouncements(1);
  },

  watch: {
    keywords() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.getAnnouncements(1);
      }, 500);
    }
  },

  methods: {
    async getAnnouncements(page) {
      this.myloadingvariable = true;

      try {
        const params = {
          page: page - 1,
          size: this.itemsPerpage,
          sort: 'approvedDateTime,DESC'
        };

        if (this.keywords && this.keywords.trim()) {
          params.title = this.keywords.trim();
        }

        const res = await service.getAnnouncementPage(params);
        const data = res.data.data;

        this.items = data.content || [];
        this.totalPage = data.totalPages || 1;
        this.totalItems = data.totalElements || 0;
        this.pages = page;

      } catch (error) {
        console.error("Error loading announcements:", error);
        this.$emit('show-snackbar', 'Error loading data', 'error');
        this.items = [];
        this.totalPage = 1;
        this.totalItems = 0;
      } finally {
        this.myloadingvariable = false;
      }
    },

    async onPageChangeDetil(value) {
      await this.getAnnouncements(value);
    },

    changePageSize() {
      this.getAnnouncements(1);
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
        title: item.title || "",
        description: item.description || "",
        imageFile: null
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
        title: "",
        description: "",
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
      if (!this.$refs.form.validate()) return;

      if (this.formData.imageFile && this.formData.imageFile.size > this.maxFileSize) {
        this.$emit('show-snackbar',
          `File is too large. Maximum file size is ${this.formatFileSize(this.maxFileSize)}`,
          'error'
        );
        return;
      }

      this.saving = true;

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('title', this.formData.title);
        formDataToSend.append('description', this.formData.description);

        if (this.formData.imageFile) {
          formDataToSend.append('file', this.formData.imageFile);
        }

        if (this.isEdit && this.selectedItem) {
          await service.updateAnnouncement(this.selectedItem.id, formDataToSend);
          this.$emit('show-snackbar', 'Broadcast updated successfully', 'success');
        } else {
          await service.createAnnouncement(formDataToSend);
          this.$emit('show-snackbar', 'Broadcast added successfully', 'success');
        }

        this.closeFormModal();
        this.getAnnouncements(1);

      } catch (error) {
        console.error("Error saving announcement:", error);
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
          this.$emit('show-snackbar', 'Broadcast enabled successfully', 'success');
        } else {
          await service.updateStatusDisable(this.itemToToggle.id);
          this.$emit('show-snackbar', 'Broadcast disabled successfully', 'success');
        }

        this.closeStatusModal();

        await this.getAnnouncements(this.pages);

      } catch (error) {
        console.error("Error toggling announcement status:", error);
        this.$emit('show-snackbar', 'Error changing status', 'error');
      } finally {
        this.toggling = false;
      }
    },

    openImagePreview(item) {
      if (item.url) {
        this.selectedImageItem = item;
        this.imagePreviewDialog = true;
      }
    },

    getImageUrl(url) {
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