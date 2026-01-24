<template>
  <div style="margin-top: -80px">
    <v-container fluid class="pa-4 pa-md-6 grey lighten-4" style="min-height: 100vh;">
      <v-card class="pa-4 pa-md-6" rounded="lg" elevation="1">
        <!-- Header Section -->
        <v-row class="mb-4 mb-md-6">
          <v-col cols="12">
            <v-card flat color="transparent">
              <v-card-text class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between pa-0">
                <div class="d-flex align-center mb-3 mb-sm-0">
                  <v-icon class="mr-2">{{ icons.mdiCamera }}</v-icon>
                  <h1 class="text-h5 text-md-h4 primary--text font-weight-medium">Gallery</h1>
                </div>
                <div class="d-flex align-center flex-wrap">
                  <v-btn
                    v-if="canCreateFolder"
                    color="primary"
                    depressed
                    class="text-capitalize"
                    small
                    @click="openCreateFolderDialog"
                  >
                    <v-icon small class="mr-1">{{ icons.mdiFolderPlus }}</v-icon>
                    New Folder
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- View Mode Toggle & Filters -->
        <v-row class="mb-4" align="center">
          <!-- View Mode Toggle -->
          <v-col cols="12" md="4" lg="3">
            <v-btn-toggle v-model="viewMode" mandatory rounded dense class="d-flex">
              <v-btn value="grid" small class="flex-grow-1">
                <v-icon small class="mr-1">{{ icons.mdiViewGrid }}</v-icon>
                <span class="d-none d-sm-inline">Grid</span>
              </v-btn>
              <v-btn value="favorites" small class="flex-grow-1">
                <v-icon small class="mr-1">{{ icons.mdiStar }}</v-icon>
                <span class="d-none d-sm-inline">Favorites</span>
              </v-btn>
              <v-btn value="recent" small class="flex-grow-1">
                <v-icon small class="mr-1">{{ icons.mdiHistory }}</v-icon>
                <span class="d-none d-sm-inline">Recent</span>
              </v-btn>
            </v-btn-toggle>
          </v-col>

          <!-- Search -->
          <v-col cols="12" :md="showClear ? 4 : 5" :lg="showClear ? 5 : 6" v-if="viewMode === 'grid'">
            <v-text-field
              v-model="searchText"
              placeholder="Search folders..."
              outlined
              dense
              hide-details
              @keyup.enter="performSearch"
            >
              <template v-slot:append>
                <v-icon @click="performSearch">{{ icons.mdiMagnify }}</v-icon>
              </template>
            </v-text-field>
          </v-col>

          <!-- Filter -->
          <v-col cols="12" :md="showClear ? 2 : 3" :lg="showClear ? 2 : 3" v-if="viewMode === 'grid'">
            <v-select
              v-model="selectedArea"
              :items="areaOptions"
              item-text="text"
              item-value="value"
              label="Area"
              outlined
              dense
              hide-details
            />
          </v-col>

          <!-- Clear Button -->
          <v-col cols="12" md="2" v-if="viewMode === 'grid' && showClear">
            <v-btn outlined block small @click="clearSearch">
              <v-icon small class="mr-1">{{ icons.mdiClose }}</v-icon>
              Clear
            </v-btn>
          </v-col>
        </v-row>

        <!-- Quick Stats Row -->
        <v-row class="mb-4" v-if="viewMode !== 'grid'">
          <v-col cols="6" sm="6" md="3">
            <v-card outlined>
              <v-card-text class="d-flex align-center pa-3">
                <v-icon :large="$vuetify.breakpoint.mdAndUp" color="primary" class="mr-2 mr-md-3">{{ icons.mdiFolder }}</v-icon>
                <div>
                  <div class="text-h6 text-md-h5 font-weight-bold">{{ totalFolders }}</div>
                  <div class="text-caption grey--text">Total Folders</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" sm="6" md="3">
            <v-card outlined>
              <v-card-text class="d-flex align-center pa-3">
                <v-icon :large="$vuetify.breakpoint.mdAndUp" color="warning" class="mr-2 mr-md-3">{{ icons.mdiStar }}</v-icon>
                <div>
                  <div class="text-h6 text-md-h5 font-weight-bold">{{ favoriteFolders.length }}</div>
                  <div class="text-caption grey--text">Favorites</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" sm="6" md="3">
            <v-card outlined>
              <v-card-text class="d-flex align-center pa-3">
                <v-icon :large="$vuetify.breakpoint.mdAndUp" style="color: #a11497;" class="mr-2 mr-md-3">{{ icons.mdiHistory }}</v-icon>
                <div>
                  <div class="text-h6 text-md-h5 font-weight-bold">{{ recentFolders.length }}</div>
                  <div class="text-caption grey--text">Recent Viewed</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" sm="6" md="3">
            <v-card outlined>
              <v-card-text class="d-flex align-center pa-3">
                <v-icon :large="$vuetify.breakpoint.mdAndUp" color="info" class="mr-2 mr-md-3">{{ icons.mdiImageMultiple }}</v-icon>
                <div>
                  <div class="text-h6 text-md-h5 font-weight-bold">{{ totalPhotos }}</div>
                  <div class="text-caption grey--text">Total Photos</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Favorites View -->
        <div v-if="viewMode === 'favorites' && !loading">
          <v-row v-if="favoriteFolders.length > 0">
            <v-col
              v-for="(item, index) in favoriteFolders"
              :key="index"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card hover class="folder-card" @click="openFolderPhotos(item)">
                <v-img :src="item.image" height="200" cover>
                  <v-btn
                    icon
                    small
                    @click.stop="toggleFavorite(item)"
                    class="favorite-btn"
                    color="yellow"
                  >
                    <v-icon>{{ icons.mdiStar }}</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="canDeleteFolder"
                    icon
                    small
                    @click.stop="confirmDeleteFolder(item)"
                    class="delete-btn"
                  >
                    <v-icon color="red">{{ icons.mdiDelete }}</v-icon>
                  </v-btn>
                </v-img>
                <v-card-text class="pa-3 card-content-fixed">
                  <div class="text-subtitle-2 font-weight-bold folder-name mb-1">
                    {{ item.title }}
                  </div>
                  <div class="text-caption photo-count mb-1">
                    <v-icon small class="mr-1">{{ icons.mdiImageMultiple }}</v-icon>
                    {{ item.photoCount }} photos
                  </div>
                  <div class="text-caption folder-meta mb-1">
                    <v-icon small class="mr-1">{{ icons.mdiMapMarker }}</v-icon>
                    {{ item.location }}
                  </div>
                  <div class="text-caption folder-meta">
                    <v-icon small class="mr-1">{{ icons.mdiAccount }}</v-icon>
                    {{ item.creator }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-else>
            <v-col cols="12" class="text-center py-8">
              <v-icon size="64">{{ icons.mdiStarOutline }}</v-icon>
              <div class="mt-3 grey--text text-h6">No Favorite Folders Yet</div>
              <div class="text-caption grey--text">Click the star icon on folders to add them to favorites</div>
              <v-btn color="primary" class="mt-4" @click="viewMode = 'grid'">
                Browse Folders
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Recent Viewed -->
        <div v-if="viewMode === 'recent' && !loading">
          <v-row v-if="recentFolders.length > 0">
            <v-col
              v-for="(item, index) in recentFolders"
              :key="index"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card hover class="folder-card" @click="openFolderPhotos(item)">
                <v-img :src="item.image" height="200" cover>
                  <v-chip
                    small
                    color="white"
                    class="viewed-time-chip"
                  >
                    <v-icon small left color="black">{{ icons.mdiClockOutline }}</v-icon>
                    <span style="color: black;">{{ formatViewedTime(item.viewedAt) }}</span>
                  </v-chip>
                  <v-btn
                    icon
                    small
                    @click.stop="toggleFavorite(item)"
                    class="favorite-btn"
                    :color="isFavorite(item.id) ? 'yellow' : 'white'"
                  >
                    <v-icon>
                      {{ isFavorite(item.id) ? icons.mdiStar : icons.mdiStarOutline }}
                    </v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    small
                    @click.stop="removeFromRecent(item)"
                    class="delete-btn"
                  >
                    <v-icon color="grey">{{ icons.mdiClose }}</v-icon>
                  </v-btn>
                </v-img>
                <v-card-text class="pa-3 card-content-fixed">
                  <div class="text-subtitle-2 font-weight-bold folder-name mb-1">
                    {{ item.title }}
                  </div>
                  <div class="text-caption photo-count mb-1">
                    <v-icon small class="mr-1">{{ icons.mdiImageMultiple }}</v-icon>
                    {{ item.photoCount }} photos
                  </div>
                  <div class="text-caption folder-meta mb-1">
                    <v-icon small class="mr-1">{{ icons.mdiMapMarker }}</v-icon>
                    {{ item.location }}
                  </div>
                  <div class="text-caption folder-meta">
                    <v-icon small class="mr-1">{{ icons.mdiAccount }}</v-icon>
                    {{ item.creator }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-else>
            <v-col cols="12" class="text-center py-8">
              <v-icon size="64" color="grey">{{ icons.mdiHistory }}</v-icon>
              <div class="mt-3 grey--text text-h6">No Recent Activity</div>
              <div class="text-caption grey--text">Your recently viewed folders will appear here</div>
              <v-btn color="primary" class="mt-4" @click="viewMode = 'grid'">
                Browse Folders
              </v-btn>
            </v-col>
          </v-row>

          <v-row v-if="recentFolders.length > 0" class="mt-4">
            <v-col cols="12" class="text-center">
              <v-btn color="error" outlined @click="clearRecentHistory">
                <v-icon left>{{ icons.mdiDelete }}</v-icon>
                Clear History
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Grid View (Main) -->
        <div v-if="viewMode === 'grid'">
          <v-row v-if="loading" class="justify-center">
            <v-col cols="12" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <div class="mt-3">Loading gallery...</div>
            </v-col>
          </v-row>

          <v-row v-else-if="error" class="justify-center">
            <v-col cols="12" class="text-center py-8">
              <v-alert type="error" outlined>{{ error }}</v-alert>
              <v-btn color="primary" @click="fetchGalleryData" class="mt-3">
                <v-icon class="mr-1">{{ icons.mdiRefresh }}</v-icon>
                Retry
              </v-btn>
            </v-col>
          </v-row>

          <v-row v-else>
            <v-col
              v-for="(item, index) in displayedItems"
              :key="index"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card hover class="folder-card" @click="openFolderPhotos(item)">
                <v-img :src="item.image" height="200" cover>
                  <v-btn
                    icon
                    small
                    @click.stop="toggleFavorite(item)"
                    class="favorite-btn"
                    :color="isFavorite(item.id) ? 'yellow' : 'white'"
                  >
                    <v-icon>
                      {{ isFavorite(item.id) ? icons.mdiStar : icons.mdiStarOutline }}
                    </v-icon>
                  </v-btn>
                  <v-btn
                    v-if="canDeleteFolder"
                    icon
                    small
                    @click.stop="confirmDeleteFolder(item)"
                    class="delete-btn"
                  >
                    <v-icon color="red">{{ icons.mdiDelete }}</v-icon>
                  </v-btn>
                </v-img>
                <v-card-text class="pa-3 card-content-fixed">
                  <div class="text-subtitle-2 font-weight-bold folder-name mb-2" :title="item.title">
                    {{ item.title }}
                  </div>
                  <div class="text-caption photo-count mb-2" v-if="item.photoCount">
                    <v-icon small class="mr-1">{{ icons.mdiImageMultiple }}</v-icon>
                    {{ item.photoCount }} photos
                  </div>
                  <div class="text-caption folder-meta mb-2" v-if="item.location" :title="item.location">
                    <v-icon small class="mr-1 flex-shrink-0">{{ icons.mdiMapMarker }}</v-icon>
                    <span class="meta-text">{{ item.location }}</span>
                  </div>
                  <div class="text-caption folder-meta" v-if="item.creator" :title="item.creator">
                    <v-icon small class="mr-1 flex-shrink-0">{{ icons.mdiAccount }}</v-icon>
                    <span class="meta-text">{{ item.creator }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-if="!loading && !error && displayedItems.length === 0">
            <v-col cols="12" class="text-center py-8">
              <v-icon size="64" color="grey">{{ icons.mdiImageOff }}</v-icon>
              <div class="mt-3 grey--text">No folders found</div>
            </v-col>
          </v-row>

          <!-- Pagination -->
          <v-row v-if="!loading && !error && displayedItems.length > 0" class="mt-4">
            <v-col cols="12" class="d-flex justify-center align-center flex-column">
              <div class="text-caption grey--text mb-2">
                Showing {{ ((currentPage - 1) * pagination.size) + 1 }} - {{ Math.min(currentPage * pagination.size, pagination.totalElements) }} of {{ pagination.totalElements }} folders
              </div>
              <v-pagination
                v-model="currentPage"
                :length="pagination.totalPages"
                :total-visible="$vuetify.breakpoint.xs ? 5 : 7"
                @input="onPageChange"
                circle
              ></v-pagination>
            </v-col>
          </v-row>
        </div>
      </v-card>

      <!-- Create Folder Dialog -->
      <v-dialog v-model="createFolderDialog" max-width="500" :fullscreen="$vuetify.breakpoint.xsOnly">
        <v-card>
          <v-card-title class="text-h6">Create New Folder</v-card-title>
          <v-card-text>
            <v-form ref="folderForm" v-model="folderFormValid">
              <v-text-field
                v-model="newFolder.folderName"
                label="Folder Name"
                :rules="[v => !!v || 'Required']"
                outlined
                required
              ></v-text-field>
              <v-select
                v-model="newFolder.officeLocationId"
                :items="locationOptions"
                item-text="text"
                item-value="value"
                label="Location"
                :rules="[v => !!v || 'Required']"
                outlined
                required
              ></v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeCreateFolderDialog">Cancel</v-btn>
            <v-btn color="primary" @click="createFolder" :loading="creatingFolder">
              Create
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation -->
      <v-dialog v-model="deleteFolderDialog" max-width="500" :fullscreen="$vuetify.breakpoint.xsOnly">
        <v-card>
          <v-card-title class="red--text text-h6">Delete Folder</v-card-title>
          <v-card-text>
            Are you sure you want to delete "<strong>{{ folderToDelete?.title }}</strong>"?
            This will delete all photos in the folder.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="deleteFolderDialog = false">Cancel</v-btn>
            <v-btn color="red" @click="deleteFolder" :loading="deletingFolder">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbars -->
      <v-snackbar v-model="successSnackbar" color="success" timeout="3000" :bottom="true">
        {{ successMessage }}
      </v-snackbar>
      <v-snackbar v-model="errorSnackbar" color="error" timeout="5000" :bottom="true">
        {{ errorMessage }}
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import {
  mdiCamera,
  mdiFolderPlus,
  mdiClose,
  mdiRefresh,
  mdiImageOff,
  mdiDelete,
  mdiMagnify,
  mdiMapMarker,
  mdiAccount,
  mdiImageMultiple,
  mdiViewGrid,
  mdiFolder,
  mdiStar,
  mdiStarOutline,
  mdiHistory,
  mdiClockOutline
} from '@mdi/js'
import GalleryService from '@/services/gallery/GalleryServices'
import OfficeLocationService from '@/services/management/office/officeLocationServices'
import moment from 'moment'

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
        mdiDelete,
        mdiMagnify,
        mdiMapMarker,
        mdiAccount,
        mdiImageMultiple,
        mdiViewGrid,
        mdiFolder,
        mdiStar,
        mdiStarOutline,
        mdiHistory,
        mdiClockOutline
      },
      
      viewMode: 'grid', // 'grid', 'favorites', 'recent'
      
      selectedArea: 'all',
      areaOptions: [{ text: 'Semua Area', value: 'all', id: null }],
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
        size: 8,
        totalPages: 1,
        totalElements: 0
      },
      currentPage: 1,
      
      // Favorites & Recent
      favoriteIds: [],
      recentViewedItems: [],
      
      // Dialogs
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
      
      // Notifications
      successSnackbar: false,
      successMessage: '',
      errorSnackbar: false,
      errorMessage: ''
    }
  },
  
  computed: {
    displayedItems() {
      return this.isFiltered ? this.filteredGalleryItems : this.galleryItems
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
    },
    
    // Favorites
    favoriteFolders() {
      return this.originalGalleryItems.filter(item => this.favoriteIds.includes(item.id))
    },
    
    // Recent
    recentFolders() {
      const uniqueRecent = []
      const seenIds = new Set()
      
      for (const item of this.recentViewedItems) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id)
          uniqueRecent.push(item)
        }
      }
      
      return uniqueRecent.slice(0, 9)
    },
    
    // Stats
    totalFolders() {
      return this.originalGalleryItems.length
    },
    
    totalPhotos() {
      return this.originalGalleryItems.reduce((sum, item) => sum + (item.photoCount || 0), 0)
    },

    showClear() {
      return this.searchText || this.isFiltered;
    },
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
    this.loadFavorites()
    this.loadRecentViewed()
    await this.fetchDivisions()
    await this.fetchGalleryData()
  },
  
  methods: {
    // Favorites Management
    loadFavorites() {
      const stored = localStorage.getItem('galleryFavorites')
      this.favoriteIds = stored ? JSON.parse(stored) : []
    },
    
    saveFavorites() {
      localStorage.setItem('galleryFavorites', JSON.stringify(this.favoriteIds))
    },
    
    isFavorite(folderId) {
      return this.favoriteIds.includes(folderId)
    },
    
    toggleFavorite(folder) {
      const index = this.favoriteIds.indexOf(folder.id)
      if (index > -1) {
        this.favoriteIds.splice(index, 1)
        this.showSuccess('Removed from favorites')
      } else {
        this.favoriteIds.push(folder.id)
        this.showSuccess('Added to favorites')
      }
      this.saveFavorites()
    },
    
    // Recent Viewed Management
    loadRecentViewed() {
      const stored = localStorage.getItem('galleryRecent')
      this.recentViewedItems = stored ? JSON.parse(stored) : []
    },
    
    saveRecentViewed() {
      localStorage.setItem('galleryRecent', JSON.stringify(this.recentViewedItems))
    },
    
    addToRecent(folder) {
      const existing = this.recentViewedItems.findIndex(item => item.id === folder.id)
      if (existing > -1) {
        this.recentViewedItems.splice(existing, 1)
      }
      
      this.recentViewedItems.unshift({
        ...folder,
        viewedAt: new Date().toISOString()
      })
      
      this.recentViewedItems = this.recentViewedItems.slice(0, 8)
      this.saveRecentViewed()
    },
    
    removeFromRecent(folder) {
      const index = this.recentViewedItems.findIndex(item => item.id === folder.id)
      if (index > -1) {
        this.recentViewedItems.splice(index, 1)
        this.saveRecentViewed()
        this.showSuccess('Removed from recent')
      }
    },
    
    clearRecentHistory() {
      this.$confirm('Clear all recent history?').then(() => {
        this.recentViewedItems = []
        this.saveRecentViewed()
        this.showSuccess('Recent history cleared')
      }).catch(() => {})
    },
    
    formatViewedTime(dateString) {
      return moment(dateString).fromNow()
    },
    
    // API Methods
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
        }
      } catch (error) {
        console.error('Error fetching divisions:', error);
      } finally {
        this.isLoadingDivisions = false;
      }
    },

    async handleAreaChange() {
      if (!this.areaOptions || this.areaOptions.length === 0) return;
      this.currentPage = 1;
      this.pagination.page = 0;
      const selectedDivisionId = this.getSelectedDivisionId();
      await this.fetchGalleryData(selectedDivisionId);
    },

    getSelectedDivisionId() {
      if (this.selectedArea === 'all') return null;
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
          createdDate: folder.createdDate || new Date().toISOString()
        }))
      }
      return []
    },

    getImageUrl(thumbnailPath) {
      return this.api + "g/gallery/thumbnails/" + thumbnailPath
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
      this.selectedArea = 'all'
      this.currentPage = 1
      this.pagination.page = 0
      this.fetchGalleryData()
    },

    onPageChange(page) {
      this.pagination.page = page - 1
      const selectedDivisionId = this.getSelectedDivisionId()
      this.fetchGalleryData(selectedDivisionId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    openFolderPhotos(folder) {
      this.addToRecent(folder)
      this.$router.push({
        name: 'FolderDetail',
        params: {
          id: folder.id,
          folder: folder
        }
      })
    },

    openCreateFolderDialog() {
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
      this.newFolder = {
        folderName: '',
        officeLocationId: null
      }
    },

    async createFolder() {
      if (!this.$refs.folderForm.validate()) return
      this.creatingFolder = true
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
        }
      } catch (error) {
        console.error('Error creating folder:', error)
        this.showError('Failed to create folder')
      } finally {
        this.creatingFolder = false
      }
    },

    confirmDeleteFolder(folder) {
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
        
        // Remove from favorites if exists
        const favIndex = this.favoriteIds.indexOf(this.folderToDelete.id)
        if (favIndex > -1) {
          this.favoriteIds.splice(favIndex, 1)
          this.saveFavorites()
        }
        
        // Remove from recent if exists
        const recentIndex = this.recentViewedItems.findIndex(item => item.id === this.folderToDelete.id)
        if (recentIndex > -1) {
          this.recentViewedItems.splice(recentIndex, 1)
          this.saveRecentViewed()
        }
        
        const selectedDivisionId = this.getSelectedDivisionId()
        await this.fetchGalleryData(selectedDivisionId)
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
  cursor: pointer;
  height: 100%;
}

.folder-card:hover {
  transform: translateY(-4px);
}

.card-content-fixed {
  padding: 12px;
  min-height: 140px;
  max-height: 140px;
}

.folder-name {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 8px;
}

.photo-count,
.folder-meta {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.875rem;
}

.meta-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
}

.viewed-time-chip {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 2;
}
</style>