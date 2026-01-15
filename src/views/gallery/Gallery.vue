<template>
  <div style="margin-top: -80px">
    <v-container fluid class="pa-6 grey lighten-4" style="min-height: 100vh;">
      <v-card class="pa-6" rounded="lg" elevation="1">
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card flat color="transparent">
              <v-card-text class="d-flex align-center justify-space-between pa-0">
                <div class="d-flex align-center">
                  <v-icon class="mr-1">{{ icons.mdiCamera }}</v-icon>
                  <h1 class="text-h4 primary--text font-weight-medium">Gallery</h1>
                </div>
                <div class="d-flex align-center">
                  <div class="d-flex align-center mr-3">
                    <v-text-field v-model="searchText" :placeholder="getSearchPlaceholder" outlined dense hide-details
                      class="mr-2" style="min-width: 60%;" @keyup.enter="performSearch" :loading="searching">
                      <template v-slot:append>
                        <v-icon @click="performSearch" class="search-icon">{{ icons.mdiMagnify }}</v-icon>
                      </template>
                    </v-text-field>
                    <v-select v-model="selectedArea" :items="areaOptions" item-text="text" item-value="value"
                      label="Filter by Area" outlined dense hide-details class="mr-2 area-select-fixed-new"
                      style="min-width: 150px;" :prepend-inner-icon="icons.mdiMapMarker" :loading="isLoadingDivisions"
                      :disabled="isLoadingDivisions">

                      <template v-slot:selection="{ item }">
                        <span class="font-weight-medium text-truncate-new" :title="item.text">
                          {{ item.text }}
                        </span>
                      </template>

                      <template v-slot:prepend-item v-if="isLoadingDivisions">
                        <v-list-item>
                          <v-list-item-content>
                            <div class="d-flex align-center">
                              <v-progress-circular size="16" indeterminate class="mr-2"></v-progress-circular>
                              <span class="text-caption">Memuat area...</span>
                            </div>
                          </v-list-item-content>
                        </v-list-item>
                        <v-divider></v-divider>
                      </template>

                      <template v-slot:no-data v-if="!isLoadingDivisions && areaOptions.length <= 1">
                        <v-list-item>
                          <v-list-item-content>
                            <span class="text-caption grey--text">Tidak ada area tersedia</span>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-select>
                    <v-btn color="grey" outlined depressed class="text-capitalize mr-2" @click="clearSearch"
                      v-if="searchText || isFiltered">
                      <v-icon class="mr-1">{{ icons.mdiClose }}</v-icon>
                      Clear
                    </v-btn>
                  </div>
                  <v-btn v-if="canCreateFolder" color="primary" depressed class="text-capitalize mr-2"
                    @click="openCreateFolderDialog">
                    <v-icon class="mr-1">{{ icons.mdiFolderPlus }}</v-icon>
                    FOLDER
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="isFiltered && !loading" class="mb-3">
          <v-col cols="12">
            <v-chip color="primary" outlined class="mr-2">
              <v-icon left small>{{ icons.mdiInformation }}</v-icon>
              {{ getSearchResultsText }}
            </v-chip>
          </v-col>
        </v-row>

        <v-row v-if="loading" class="justify-center">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <div class="mt-3">Loading gallery...</div>
          </v-col>
        </v-row>

        <v-row v-else-if="error" class="justify-center">
          <v-col cols="12" class="text-center">
            <v-alert type="error" outlined>
              {{ error }}
            </v-alert>
            <v-btn color="primary" @click="fetchGalleryData" class="mt-3">
              <v-icon class="mr-1">{{ icons.mdiRefresh }}</v-icon>
              Retry
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col v-for="(item, index) in displayedItems" :key="index" cols="12" sm="6" md="4" lg="2" xl="2">
            <v-card hover class="elevation-2 folder-card" rounded="lg" @click="openFolderPhotos(item)">
              <v-img :src="item.image" height="200" cover>
                <v-btn v-if="canDeleteFolder" icon small @click.stop="confirmDeleteFolder(item)" class="delete-btn"
                  color="white" elevation="2">
                  <v-icon color="red">{{ icons.mdiDelete }}</v-icon>
                </v-btn>
              </v-img>
              <v-card-text class="pa-3">
                <div class="text-subtitle-2 font-weight-bold folder-name mb-1">{{ item.title }}</div>
                <div class="text-caption photo-count mb-1" v-if="item.photoCount">
                  <v-icon small class="mr-1">{{ icons.mdiImageMultiple }}</v-icon>{{ item.photoCount }} foto
                </div>
                <div class="text-caption folder-meta mb-1" v-if="item.location">
                  <v-icon small class="mr-1">{{ icons.mdiMapMarker }}</v-icon>{{ item.location }}
                </div>
                <div class="text-caption folder-meta" v-if="item.creator">
                  <v-icon small class="mr-1">{{ icons.mdiAccount }}</v-icon>{{ item.creator }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="!loading && !error && displayedItems.length === 0" class="justify-center">
          <v-col cols="12" class="text-center">
            <v-icon size="64" color="grey">{{ icons.mdiImageOff }}</v-icon>
            <div class="mt-3 grey--text">
              {{ isFiltered ? 'No results found for your search' : 'No gallery items found' }}
            </div>
            <v-btn color="grey" outlined class="mt-3" @click="clearSearch" v-if="isFiltered">
              <v-icon class="mr-1">{{ icons.mdiClose }}</v-icon>
              Clear Search
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-if="!loading && !error && pagination.totalPages > 1" class="justify-center mt-4">
          <v-col cols="12">
            <v-pagination v-model="currentPage" :length="pagination.totalPages" :total-visible="7" @input="onPageChange"
              circle></v-pagination>
          </v-col>
        </v-row>
      </v-card>

      <v-dialog v-model="createFolderDialog" max-width="500" @click:outside="closeCreateFolderDialog">
        <v-card>
          <v-card-title>Create New Folder</v-card-title>
          <v-card-text>
            <v-form ref="folderForm" v-model="folderFormValid">
              <v-text-field v-model="newFolder.folderName" label="Folder Name"
                :rules="[v => !!v || 'Folder name is required']" outlined required></v-text-field>

              <v-select v-model="newFolder.officeLocationId" :items="locationOptions" item-text="text"
                item-value="value" label="Office Location" :rules="[v => !!v || 'Office location is required']" outlined
                required :prepend-inner-icon="icons.mdiMapMarker" :loading="isLoadingDivisions"
                :disabled="isLoadingDivisions">
                <template v-slot:selection="{ item }">
                  <span class="font-weight-medium">{{ item.text }}</span>
                </template>

                <template v-slot:prepend-item v-if="isLoadingDivisions">
                  <v-list-item>
                    <v-list-item-content>
                      <div class="d-flex align-center">
                        <v-progress-circular size="16" indeterminate class="mr-2"></v-progress-circular>
                        <span class="text-caption">Memuat lokasi...</span>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                </template>

                <template v-slot:no-data v-if="!isLoadingDivisions && locationOptions.length === 0">
                  <v-list-item>
                    <v-list-item-content>
                      <span class="text-caption grey--text">Tidak ada lokasi tersedia</span>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeCreateFolderDialog">Cancel</v-btn>
            <v-btn color="primary" @click="createFolder" :loading="creatingFolder" :disabled="!folderFormValid">
              Create
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="deleteFolderDialog" max-width="500">
        <v-card>
          <v-card-title class="headline red--text">Delete Folder</v-card-title>
          <v-card-text>
            Are you sure you want to delete the folder "<strong>{{ folderToDelete?.title }}</strong>"?
            This action will also delete all photos in this folder and cannot be undone.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="deleteFolderDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="deleteFolder" :loading="deletingFolder">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="successSnackbar" color="success" timeout="3000">
        {{ successMessage }}
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="successSnackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>

      <v-snackbar v-model="errorSnackbar" color="error" timeout="5000">
        {{ errorMessage }}
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="errorSnackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { mdiCamera, mdiFolderPlus, mdiClose, mdiRefresh, mdiImageOff, mdiUpload, mdiDelete, mdiCheck, mdiMagnify, mdiInformation, mdiMapMarker, mdiAccount, mdiImageMultiple } from '@mdi/js'
import GalleryService from '@/services/gallery/GalleryServices'
import OfficeLocationService from '@/services/management/office/officeLocationServices'

const officeLocationService = OfficeLocationService.build()

export default {
  name: 'Gallery',
  data() {
    return {
      icons: {
        mdiCamera,
        mdiFolderPlus,
        mdiClose,
        mdiRefresh,
        mdiImageOff,
        mdiUpload,
        mdiDelete,
        mdiCheck,
        mdiMagnify,
        mdiInformation,
        mdiMapMarker,
        mdiAccount,
        mdiImageMultiple
      },
      selectedArea: 'all',
      areaOptions: [
        { text: 'Semua Area', value: 'all', id: null }
      ],
      isLoadingDivisions: false,
      divisionsLoaded: false,
      searchText: '',
      searching: false,
      isFiltered: false,
      originalGalleryItems: [],
      filteredGalleryItems: [],

      loading: false,
      error: null,
      galleryItems: [],
      api: process.env.VUE_APP_PERTAGAS,
      pagination: {
        page: 0,
        size: 20,
        totalPages: 1,
        totalElements: 0
      },
      currentPage: 1,
      createFolderDialog: false,
      folderFormValid: false,
      newFolder: {
        folderName: '',
        officeLocationId: null
      },
      creatingFolder: false,
      deleteFolderDialog: false,
      folderToDelete: null,
      deletingFolder: false,
      successSnackbar: false,
      successMessage: '',
      errorSnackbar: false,
      errorMessage: ''
    }
  },
  computed: {
    getSearchPlaceholder() {
      return 'Cari berdasarkan judul folder...'
    },

    displayedItems() {
      return this.isFiltered ? this.filteredGalleryItems : this.galleryItems
    },

    getSearchResultsText() {
      const count = this.filteredGalleryItems.length
      return `Ditemukan ${count} hasil untuk "${this.searchText}"`
    },

    selectedAreaText() {
      const area = this.areaOptions.find(opt => opt.value === this.selectedArea);
      return area ? area.text : 'Semua Area';
    },

    locationOptions() {
      return this.areaOptions.filter(option => option.value !== 'all')
    },

    userRole() {
      const data = JSON.parse(localStorage.getItem("dataUser"));
      return data ? data.roleId : null;
    },

    canCreateFolder() {
      return ['IT', 'IT_LEAD', 'SUPER', 'SEKRETARIS'].includes(this.userRole);
    },

    canDeleteFolder() {
      return ['SUPER', 'SEKRETARIS'].includes(this.userRole);
    }
  },
  watch: {
    selectedArea: {
      handler(newValue, oldValue) {
        if (newValue !== oldValue && this.areaOptions.length > 1) {
          this.$nextTick(() => {
            this.handleAreaChange();
          });
        }
      },
      immediate: false
    }
  },
  async created() {
    await this.fetchDivisions()
    await this.fetchGalleryData()
  },
  methods: {
    async fetchDivisions() {
      if (this.divisionsLoaded) return;

      this.isLoadingDivisions = true;

      try {
        const response = await officeLocationService.getOptions();

        if (response.data && response.data.success && response.data.data) {
          const divisionOptions = response.data.data.map(division => ({
            text: division.label,
            value: division.value,
            id: division.value
          }));

          this.areaOptions = [
            { text: 'Semua Area', value: 'all', id: null },
            ...divisionOptions
          ];

          this.divisionsLoaded = true;
        } else {
          console.warn('Unexpected division API response structure:', response);
        }
      } catch (error) {
        console.error('Error fetching divisions:', error);
        this.$toast?.error?.('Gagal memuat data area');
      } finally {
        this.isLoadingDivisions = false;
      }
    },

    async handleAreaChange() {
      if (!this.areaOptions || this.areaOptions.length === 0) {
        return;
      }
      const selectedDivisionId = this.getSelectedDivisionId();
      await this.fetchGalleryData(selectedDivisionId);
    },

    getSelectedDivisionId() {
      if (this.selectedArea === 'all') {
        return null;
      }

      if (!this.areaOptions || !Array.isArray(this.areaOptions)) {
        return null;
      }

      const selectedAreaOption = this.areaOptions.find(option =>
        option && option.value === this.selectedArea
      );

      return selectedAreaOption ? selectedAreaOption.id : null;
    },

    async fetchGalleryData(divisionId = null) {
      this.loading = true
      this.error = null

      try {
        const params = {
          page: this.pagination.page,
          size: this.pagination.size
        }

        if (divisionId) {
          params.officeLocationId = divisionId
        }

        const response = await GalleryService.getFolders(params)
        this.galleryItems = this.transformApiData(response.data)
        this.originalGalleryItems = [...this.galleryItems]

        if (response.data && response.data.data) {
          this.pagination.totalPages = response.data.data.totalPages
          this.pagination.totalElements = response.data.data.totalElements
          this.currentPage = this.pagination.page + 1
        }

      } catch (error) {
        console.error('Error fetching gallery data:', error)
        this.error = 'Failed to load gallery data. Please try again.'
      } finally {
        this.loading = false
      }
    },

    transformApiData(apiData) {
      if (apiData && apiData.data && apiData.data.content && Array.isArray(apiData.data.content)) {
        return apiData.data.content.map(folder => ({
          title: folder.folderName || 'Untitled',
          image: this.getImageUrl(folder.thumbnailPath),
          category: 'Gallery',
          id: folder.id,
          photoCount: folder.photoCount || 0,
          thumbnailPath: folder.thumbnailPath,
          location: folder.officeLocationName || 'Unknown Location',
          creator: folder.createdBy || folder.creator || 'Unknown Creator',
          createdDate: folder.createdDate || new Date().toISOString(),
          area: this.mapFolderToArea(folder)
        }))
      } else {
        console.warn('Unexpected API response structure:', apiData)
        return []
      }
    },

    mapFolderToArea(folder) {
      if (folder.officeLocationName) {
        return folder.officeLocationName.toLowerCase();
      }
      if (folder.divisionName) {
        return folder.divisionName.toLowerCase();
      }
      if (folder.area) {
        return folder.area.toLowerCase();
      }
      return 'all';
    },

    getImageUrl(thumbnailPath) {
      return this.api + "gallery/" + thumbnailPath
    },

    async performSearch() {
      if (!this.searchText.trim()) {
        this.clearSearch()
        return
      }

      this.searching = true

      try {
        await this.filterItemsLocally()

        this.isFiltered = true
        this.currentPage = 1

      } catch (error) {
        console.error('Error performing search:', error)
        this.showError('Failed to perform search. Please try again.')
      } finally {
        this.searching = false
      }
    },

    filterItemsLocally() {
      return new Promise((resolve) => {
        const searchTerm = this.searchText.toLowerCase().trim()

        this.filteredGalleryItems = this.originalGalleryItems.filter(item => {
          return item.title.toLowerCase().includes(searchTerm)
        })
        setTimeout(resolve, 300)
      })
    },

    clearSearch() {
      this.searchText = ''
      this.isFiltered = false
      this.filteredGalleryItems = []
      this.currentPage = 1
      const selectedDivisionId = this.getSelectedDivisionId()
      this.fetchGalleryData(selectedDivisionId)
    },

    onPageChange(page) {
      this.pagination.page = page - 1
      if (this.isFiltered) {
        this.performSearch()
      } else {
        const selectedDivisionId = this.getSelectedDivisionId()
        this.fetchGalleryData(selectedDivisionId)
      }
    },

    openFolderPhotos(folder) {
      this.$router.push({
        name: 'FolderDetail',
        params: {
          id: folder.id,
          folder: folder
        }
      })
    },

    openCreateFolderDialog() {
      this.errorSnackbar = false
      this.errorMessage = ''

      this.createFolderDialog = true
      this.newFolder = {
        folderName: '',
        officeLocationId: null
      }

      this.$nextTick(() => {
        if (this.$refs.folderForm) {
          this.$refs.folderForm.resetValidation()
        }
      })
    },

    closeCreateFolderDialog() {
      this.createFolderDialog = false
      this.errorSnackbar = false
      this.errorMessage = ''

      this.newFolder = {
        folderName: '',
        officeLocationId: null
      }
    },

    async findLatestFolder(folderName) {
      try {
        const params = {
          page: 0,
          size: 50,
          sort: 'id,desc'
        }

        const response = await GalleryService.getFolders(params)
        const latestItems = this.transformApiData(response.data)

        let targetFolder = latestItems.find(folder =>
          folder.title.toLowerCase() === folderName.toLowerCase()
        )

        if (!targetFolder && latestItems.length > 0) {
          targetFolder = latestItems[0]
        }

        return targetFolder
      } catch (error) {
        console.error('Error finding latest folder:', error)
        return null
      }
    },

    redirectToFolderDetail(folder) {
      if (folder && folder.id) {
        this.$router.push({
          name: 'FolderDetail',
          params: {
            id: folder.id,
            folder: folder
          }
        })
      }
    },

    async createFolder() {
      if (!this.$refs.folderForm.validate()) return

      this.creatingFolder = true
      this.errorSnackbar = false
      this.errorMessage = ''

      try {
        const folderData = {
          folderName: this.newFolder.folderName,
          officeLocationId: this.newFolder.officeLocationId
        }

        const response = await GalleryService.createFolder(folderData)
        this.showSuccess('Folder created successfully')
        this.createFolderDialog = false

        if (response.data && response.data.data) {
          const newFolderId = response.data.data

          this.$router.push({
            name: 'FolderDetail',
            params: {
              id: newFolderId,
              folder: {
                id: newFolderId,
                title: this.newFolder.folderName
              }
            }
          })
        } else {
          const selectedDivisionId = this.getSelectedDivisionId()
          await this.fetchGalleryData(selectedDivisionId)
          console.warn('Could not get folder ID from response')
        }

      } catch (error) {
        console.error('Error creating folder:', error)
        this.showError('Failed to create folder')
        const selectedDivisionId = this.getSelectedDivisionId()
        await this.fetchGalleryData(selectedDivisionId)
      } finally {
        this.creatingFolder = false
      }
    },

    async confirmDeleteFolder(folder) {
      this.folderToDelete = folder
      this.deleteFolderDialog = true
    },

    async deleteFolder() {
      if (!this.folderToDelete) return

      this.deletingFolder = true

      try {
        await GalleryService.deleteFolder(this.folderToDelete.id)
        this.showSuccess('Folder deleted successfully')
        this.deleteFolderDialog = false

        const selectedDivisionId = this.getSelectedDivisionId()
        await this.fetchGalleryData(selectedDivisionId)
        if (this.isFiltered) {
          await this.performSearch()
        }
      } catch (error) {
        console.error('Error deleting folder:', error)
        this.showError('Failed to delete folder')
      } finally {
        this.deletingFolder = false
      }
    },

    showSuccess(message) {
      this.successMessage = message
      this.successSnackbar = true
    },

    showError(message) {
      this.errorMessage = message
      this.errorSnackbar = true
    }
  }
}
</script>

<style scoped>
.folder-card {
  position: relative;
  cursor: pointer;
}

.folder-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}

.folder-card .v-card__text {
  padding: 12px !important;
}

.folder-name {
  color: #212121;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: justify;
  text-justify: inter-word;
  font-size: 0.95rem;
}

.photo-count {
  color: #666;
  display: flex;
  align-items: center;
  text-align: left;
}

.folder-meta {
  color: #757575;
  display: flex;
  align-items: center;
  text-align: left;
}

.v-img {
  cursor: pointer;
  position: relative;
}

.delete-btn {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  z-index: 2 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
}

.delete-btn:hover {
  background: rgba(255, 255, 255, 1) !important;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
}

.delete-btn .v-icon {
  color: #d32f2f !important;
  font-size: 18px !important;
}

.delete-btn:hover .v-icon {
  color: #b71c1c !important;
}

.search-icon {
  cursor: pointer;
  color: #1976d2;
}

.search-icon:hover {
  color: #1565c0;
}

:deep(.area-select-fixed-new .v-input__control) {
  background-color: #f5f5f5 !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
  min-height: 40px !important;
}

:deep(.area-select-fixed-new .v-input__slot) {
  color: #333 !important;
}

:deep(.area-select-fixed-new .v-label),
:deep(.area-select-fixed-new input),
:deep(.area-select-fixed-new .v-select__selections) {
  color: #333 !important;
}

:deep(.area-select-fixed-new .v-input__icon--prepend-inner),
:deep(.area-select-fixed-new .v-input__append-inner .v-icon) {
  color: #666 !important;
}

:deep(.area-select-fixed-new .v-select__selection) {
  color: #333 !important;
}

:deep(.area-select-fixed-new.v-input--is-focused .v-input__control) {
  border-color: var(--v-primary-base) !important;
}

:deep(.area-select-fixed-new.v-input--is-focused .v-label) {
  color: var(--v-primary-base) !important;
}

.text-truncate-new {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100px;
  color: #333 !important;
}

@media (max-width: 1264px) {
  .d-flex.align-center {
    flex-wrap: wrap;
  }

  .d-flex.align-center>div:first-child {
    margin-bottom: 8px;
    width: 100%;
  }
}

@media (max-width: 960px) {
  .delete-btn {
    top: 4px !important;
    right: 4px !important;
  }

  .d-flex.align-center>div {
    flex-direction: column;
    align-items: stretch !important;
  }

  .mr-2 {
    margin-bottom: 8px !important;
    margin-right: 0 !important;
  }

  .text-truncate-new {
    max-width: 80px;
  }
}

@media (max-width: 600px) {
  .text-field {
    min-width: 100% !important;
  }

  .v-select {
    min-width: 100% !important;
  }

  .text-truncate-new {
    max-width: 70px;
  }
}
</style>