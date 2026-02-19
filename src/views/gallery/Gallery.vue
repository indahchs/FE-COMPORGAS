<template>
  <div style="margin-top: -80px">
    <v-container fluid class="pa-4 pa-md-6 grey lighten-4" style="min-height: 100vh;">
      <v-card class="pa-4 pa-md-6" rounded="lg" elevation="1">

        <!-- Header -->
        <v-row class="mb-4 mb-md-6">
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between flex-wrap">
              <div class="d-flex align-center mb-2 mb-sm-0">
                <v-icon class="mr-2">{{ icons.mdiCamera }}</v-icon>
                <h1 class="text-h5 text-md-h4 primary--text font-weight-medium">Gallery</h1>
              </div>
              <v-btn v-if="canCreateFolder" color="primary" depressed small class="text-capitalize" @click="openCreateFolderDialog">
                <v-icon small class="mr-1">{{ icons.mdiFolderPlus }}</v-icon>New Folder
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Tabs & Filters -->
        <v-row class="mb-4" align="center">
          <v-col cols="12" sm="5" md="3" lg="3">
            <v-btn-toggle v-model="viewMode" mandatory  dense class="d-flex">
              <v-btn value="grid" big class="flex-grow-1">
                <v-icon small class="mr-1">{{ icons.mdiViewGrid }}</v-icon>
                <span class="d-none d-sm-inline">Grid</span>
              </v-btn>
              <v-btn value="favorites" big class="flex-grow-1">
                <v-icon small class="mr-1">{{ icons.mdiStar }}</v-icon>
                <span class="d-none d-sm-inline">Fav</span>
              </v-btn>
              <v-btn value="recent" big class="flex-grow-1">
                <v-icon small class="mr-1">{{ icons.mdiHistory }}</v-icon>
                <span class="d-none d-sm-inline">Recent</span>
              </v-btn>
            </v-btn-toggle>
          </v-col>

          <v-col cols="12" sm="4" md="6" lg="6">
            <v-text-field
              v-model="searchText"
              dense
              outlined
              clearable
              hide-details
              label="Search folders..."
              :append-icon="icons.mdiMagnify"
              @click:append="performSearch"
              @keyup.enter="performSearch"
              @click:clear="clearSearch"
            />
          </v-col>

          <v-col cols="12" sm="3" md="3" lg="3">
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
        </v-row>

        <!-- Favorites View -->
        <div v-if="viewMode === 'favorites' && !loading">
          <v-row v-if="favoriteFolders.length > 0">
            <v-col v-for="item in favoriteFolders" :key="'fav-' + item.id" cols="12" sm="6" md="4" lg="3">
              <v-card hover class="folder-card" @click="openFolderPhotos(item)">
                <v-img :src="item.image" height="200" cover>
                  <v-btn icon small @click.stop="toggleFavorite(item)" class="favorite-btn">
                    <v-icon color="yellow darken-1">{{ icons.mdiStar }}</v-icon>
                  </v-btn>
                  <v-btn v-if="canDeleteFolder" icon small @click.stop="confirmDeleteFolder(item)" class="delete-btn">
                    <v-icon color="red">{{ icons.mdiDelete }}</v-icon>
                  </v-btn>
                </v-img>
                <v-card-text class="pa-3 card-content-fixed">
                  <div class="folder-name text-subtitle-2 font-weight-bold mb-1">{{ item.title }}</div>
                  <div class="text-caption folder-meta mb-1"><v-icon small class="mr-1">{{ icons.mdiImageMultiple }}</v-icon>{{ item.photoCount }} photos</div>
                  <div class="text-caption folder-meta mb-1"><v-icon small class="mr-1">{{ icons.mdiMapMarker }}</v-icon><span class="meta-text">{{ item.location }}</span></div>
                  <div class="text-caption folder-meta"><v-icon small class="mr-1">{{ icons.mdiAccount }}</v-icon><span class="meta-text">{{ item.creator }}</span></div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col cols="12" class="text-center py-8">
              <v-icon size="64" color="grey">{{ icons.mdiStarOutline }}</v-icon>
              <div class="mt-3 grey--text text-h6">No Favorite Folders Yet</div>
              <div class="text-caption grey--text">Click the star icon on folders to add them to favorites</div>
              <v-btn color="primary" class="mt-4" @click="viewMode = 'grid'">Browse Folders</v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Recent View -->
        <div v-if="viewMode === 'recent' && !loading">
          <v-row v-if="recentFolders.length > 0">
            <v-col v-for="item in recentFolders" :key="'rec-' + item.id" cols="12" sm="6" md="4" lg="3">
              <v-card hover class="folder-card" @click="openFolderPhotos(item)">
                <v-img :src="item.image" height="200" cover>
                  <v-chip small color="white" class="viewed-time-chip">
                    <v-icon small left color="black">{{ icons.mdiClockOutline }}</v-icon>
                    <span style="color:black">{{ formatViewedTime(item.viewedAt) }}</span>
                  </v-chip>
                  <v-btn icon small @click.stop="toggleFavorite(item)" class="favorite-btn">
                    <v-icon :color="isFavorite(item.id) ? 'yellow darken-1' : 'grey'">
                      {{ isFavorite(item.id) ? icons.mdiStar : icons.mdiStarOutline }}
                    </v-icon>
                  </v-btn>
                  <v-btn icon small @click.stop="removeFromRecent(item)" class="delete-btn">
                    <v-icon color="grey">{{ icons.mdiClose }}</v-icon>
                  </v-btn>
                </v-img>
                <v-card-text class="pa-3 card-content-fixed">
                  <div class="folder-name text-subtitle-2 font-weight-bold mb-1">{{ item.title }}</div>
                  <div class="text-caption folder-meta mb-1"><v-icon small class="mr-1">{{ icons.mdiImageMultiple }}</v-icon>{{ item.photoCount }} photos</div>
                  <div class="text-caption folder-meta mb-1"><v-icon small class="mr-1">{{ icons.mdiMapMarker }}</v-icon><span class="meta-text">{{ item.location }}</span></div>
                  <div class="text-caption folder-meta"><v-icon small class="mr-1">{{ icons.mdiAccount }}</v-icon><span class="meta-text">{{ item.creator }}</span></div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col cols="12" class="text-center py-8">
              <v-icon size="64" color="grey">{{ icons.mdiHistory }}</v-icon>
              <div class="mt-3 grey--text text-h6">No Recent Activity</div>
              <div class="text-caption grey--text">Your recently viewed folders will appear here</div>
              <v-btn color="primary" class="mt-4" @click="viewMode = 'grid'">Browse Folders</v-btn>
            </v-col>
          </v-row>
          <v-row v-if="recentFolders.length > 0" class="mt-4">
            <v-col cols="12" class="text-center">
              <v-btn color="error" outlined @click="confirmClearHistory">
                <v-icon left>{{ icons.mdiDelete }}</v-icon>Clear History
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Grid View -->
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
                <v-icon class="mr-1">{{ icons.mdiRefresh }}</v-icon>Retry
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col v-for="item in displayedItems" :key="'grid-' + item.id" cols="12" sm="6" md="4" lg="3">
              <v-card hover class="folder-card" @click="openFolderPhotos(item)">
                <v-img :src="item.image" height="200" cover>
                  <v-btn icon small @click.stop="toggleFavorite(item)" class="favorite-btn">
                    <v-icon :color="isFavorite(item.id) ? 'yellow darken-1' : 'grey'">
                      {{ isFavorite(item.id) ? icons.mdiStar : icons.mdiStarOutline }}
                    </v-icon>
                  </v-btn>
                  <v-btn v-if="canDeleteFolder" icon small @click.stop="confirmDeleteFolder(item)" class="delete-btn">
                    <v-icon color="red">{{ icons.mdiDelete }}</v-icon>
                  </v-btn>
                </v-img>
                <v-card-text class="pa-3 card-content-fixed">
                  <div class="folder-name text-subtitle-2 font-weight-bold mb-1" :title="item.title">{{ item.title }}</div>
                  <div class="text-caption folder-meta mb-1" v-if="item.photoCount"><v-icon small class="mr-1">{{ icons.mdiImageMultiple }}</v-icon>{{ item.photoCount }} photos</div>
                  <div class="text-caption folder-meta mb-1" v-if="item.location" :title="item.location"><v-icon small class="mr-1 flex-shrink-0">{{ icons.mdiMapMarker }}</v-icon><span class="meta-text">{{ item.location }}</span></div>
                  <div class="text-caption folder-meta" v-if="item.creator" :title="item.creator"><v-icon small class="mr-1 flex-shrink-0">{{ icons.mdiAccount }}</v-icon><span class="meta-text">{{ item.creator }}</span></div>
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

          <v-row v-if="!loading && !error && displayedItems.length > 0" class="mt-4">
            <v-col cols="12" class="d-flex justify-center align-center flex-column">
              <div class="text-caption grey--text mb-2">
                Showing {{ ((currentPage - 1) * pagination.size) + 1 }} - {{ Math.min(currentPage * pagination.size, pagination.totalElements) }} of {{ pagination.totalElements }} folders
              </div>
              <v-pagination v-model="currentPage" :length="pagination.totalPages" :total-visible="$vuetify.breakpoint.xs ? 5 : 7" @input="onPageChange" circle></v-pagination>
            </v-col>
          </v-row>
        </div>
      </v-card>

      <!-- Create Folder Dialog -->
      <v-dialog v-model="createFolderDialog" max-width="500" :fullscreen="$vuetify.breakpoint.xsOnly">
        <v-card>
          <v-card-title>Create New Folder</v-card-title>
          <v-card-text>
            <v-form ref="folderForm" v-model="folderFormValid">
              <v-text-field v-model="newFolder.folderName" label="Folder Name" :rules="[v => !!v || 'Required']" outlined required></v-text-field>
              <v-select v-model="newFolder.officeLocationId" :items="locationOptions" item-text="text" item-value="value" label="Location" :rules="[v => !!v || 'Required']" outlined required></v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeCreateFolderDialog">Cancel</v-btn>
            <v-btn color="primary" @click="createFolder" :loading="creatingFolder">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Folder Dialog -->
      <v-dialog v-model="deleteFolderDialog" max-width="500" :fullscreen="$vuetify.breakpoint.xsOnly">
        <v-card>
          <v-card-title class="red--text">Delete Folder</v-card-title>
          <v-card-text>Are you sure you want to delete "<strong>{{ folderToDelete ? folderToDelete.title : '' }}</strong>"? This will delete all photos in the folder.</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="deleteFolderDialog = false">Cancel</v-btn>
            <v-btn color="red" @click="deleteFolder" :loading="deletingFolder">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Clear History Dialog -->
      <v-dialog v-model="clearHistoryDialog" max-width="400" :fullscreen="$vuetify.breakpoint.xsOnly">
        <v-card>
          <v-card-title class="flex-wrap text-h6">Clear Recent History</v-card-title>
          <v-card-text>Are you sure you want to clear all recent history? This action cannot be undone.</v-card-text>
          <v-card-actions class="pa-4 flex-wrap">
            <v-spacer></v-spacer>
            <v-btn text @click="clearHistoryDialog = false" class="mb-2">Cancel</v-btn>
            <v-btn color="error" @click="clearRecentHistory" class="mb-2 ml-2">Clear History</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="successSnackbar" color="success" timeout="3000" bottom>{{ successMessage }}</v-snackbar>
      <v-snackbar v-model="errorSnackbar" color="error" timeout="5000" bottom>{{ errorMessage }}</v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { mdiCamera, mdiFolderPlus, mdiClose, mdiRefresh, mdiImageOff, mdiDelete, mdiMagnify, mdiMapMarker, mdiAccount, mdiImageMultiple, mdiViewGrid, mdiFolder, mdiStar, mdiStarOutline, mdiHistory, mdiClockOutline } from '@mdi/js'
import GalleryService from '@/services/gallery/GalleryServices'
import OfficeLocationService from '@/services/management/office/officeLocationServices'
import moment from 'moment'

const officeLocationService = OfficeLocationService.build()

export default {
  name: 'Gallery',
  data() {
    return {
      icons: { mdiCamera, mdiFolderPlus, mdiClose, mdiRefresh, mdiImageOff, mdiDelete, mdiMagnify, mdiMapMarker, mdiAccount, mdiImageMultiple, mdiViewGrid, mdiFolder, mdiStar, mdiStarOutline, mdiHistory, mdiClockOutline },
      viewMode: 'grid',
      selectedArea: 'all',
      areaOptions: [{ text: 'Semua Area', value: 'all', id: null }],
      divisionsLoaded: false,
      searchText: '',
      isFiltered: false,
      originalGalleryItems: [],
      filteredGalleryItems: [],
      loading: false,
      error: null,
      galleryItems: [],
      api: process.env.VUE_APP_PERTAGAS,
      pagination: { page: 0, size: 8, totalPages: 1, totalElements: 0 },
      currentPage: 1,
      totalPhotosCount: 0,
      favoriteIds: [],
      recentViewedItems: [],
      createFolderDialog: false,
      folderFormValid: false,
      newFolder: { folderName: '', officeLocationId: null },
      creatingFolder: false,
      deleteFolderDialog: false,
      folderToDelete: null,
      deletingFolder: false,
      clearHistoryDialog: false,
      successSnackbar: false, successMessage: '',
      errorSnackbar: false,   errorMessage: ''
    }
  },
  computed: {
    displayedItems() { return this.isFiltered ? this.filteredGalleryItems : this.galleryItems },
    locationOptions() { return this.areaOptions.filter(o => o.value !== 'all') },
    userRole() {
      const data = JSON.parse(localStorage.getItem('dataUser'))
      return data ? data.roleId : null
    },
    canCreateFolder() { return ['IT', 'IT_LEAD', 'SUPER', 'SEKRETARIS'].includes(this.userRole) },
    canDeleteFolder()  { return ['SUPER', 'SEKRETARIS'].includes(this.userRole) },
    favoriteFolders() {
      return this.favoriteIds
        .map(id => this.originalGalleryItems.find(item => item.id === id))
        .filter(Boolean)
    },
    recentFolders() {
      const seen = new Set()
      return this.recentViewedItems
        .filter(item => !seen.has(item.id) && seen.add(item.id))
        .slice(0, 9)
    }
  },
  watch: {
    selectedArea(newVal, oldVal) {
      if (newVal !== oldVal && this.areaOptions.length > 1) {
        this.$nextTick(() => this.handleAreaChange())
      }
    }
  },
  async created() {
    this.loadFavorites()
    this.loadRecentViewed()
    await this.fetchDivisions()
    await this.fetchGalleryData()
  },
  methods: {
    // ── Favorites ──────────────────────────────────────────────────────────────
    loadFavorites() {
      this.favoriteIds = JSON.parse(localStorage.getItem('galleryFavorites') || '[]')
    },
    saveFavorites() {
      localStorage.setItem('galleryFavorites', JSON.stringify(this.favoriteIds))
    },
    isFavorite(id) { return this.favoriteIds.includes(id) },
    toggleFavorite(folder) {
      if (this.isFavorite(folder.id)) {
        this.favoriteIds = this.favoriteIds.filter(id => id !== folder.id)
        this.showSuccess('Removed from favorites')
      } else {
        this.favoriteIds = [...this.favoriteIds, folder.id]
        this.showSuccess('Added to favorites')
      }
      this.saveFavorites()
    },

    // ── Recent ─────────────────────────────────────────────────────────────────
    loadRecentViewed() {
      this.recentViewedItems = JSON.parse(localStorage.getItem('galleryRecent') || '[]')
    },
    saveRecentViewed() {
      localStorage.setItem('galleryRecent', JSON.stringify(this.recentViewedItems))
    },
    addToRecent(folder) {
      const filtered = this.recentViewedItems.filter(i => i.id !== folder.id)
      this.recentViewedItems = [{ ...folder, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 8)
      this.saveRecentViewed()
    },
    removeFromRecent(folder) {
      this.recentViewedItems = this.recentViewedItems.filter(i => i.id !== folder.id)
      this.saveRecentViewed()
      this.showSuccess('Removed from recent')
    },
    confirmClearHistory() { this.clearHistoryDialog = true },
    clearRecentHistory() {
      this.recentViewedItems = []
      this.saveRecentViewed()
      this.clearHistoryDialog = false
      this.showSuccess('Recent history cleared')
    },
    formatViewedTime(date) { return moment(date).fromNow() },

    // ── API ────────────────────────────────────────────────────────────────────
    async fetchDivisions() {
      if (this.divisionsLoaded) return
      try {
        const res = await officeLocationService.getOptions()
        if (res.data?.success && res.data?.data) {
          this.areaOptions = [
            { text: 'Semua Area', value: 'all', id: null },
            ...res.data.data.map(d => ({ text: d.label, value: d.value, id: d.value }))
          ]
          this.divisionsLoaded = true
        }
      } catch (e) { console.error(e) }
    },
    getSelectedDivisionId() {
      if (this.selectedArea === 'all') return null
      return this.areaOptions.find(o => o.value === this.selectedArea)?.id || null
    },
    async handleAreaChange() {
      this.currentPage = 1
      this.pagination.page = 0
      await this.fetchGalleryData(this.getSelectedDivisionId())
    },
    async fetchGalleryData(divisionId = null) {
      this.loading = true
      this.error = null
      try {
        const params = { page: this.pagination.page, size: this.pagination.size }
        if (divisionId) params.officeLocationId = divisionId
        const res = await GalleryService.getFolders(params)
        this.galleryItems = this.transformApiData(res.data)
        this.originalGalleryItems = [...this.galleryItems]
        if (res.data?.data) {
          this.pagination.totalPages    = res.data.data.totalPages
          this.pagination.totalElements = res.data.data.totalElements
          this.currentPage              = this.pagination.page + 1
          this.totalPhotosCount         = res.data.data.totalPhotoCount ?? res.data.totalPhotoCount ?? null
        }
      } catch (e) {
        console.error(e)
        this.error = 'Failed to load gallery data. Please try again.'
      } finally {
        this.loading = false
      }
    },
    transformApiData(apiData) {
      const content = apiData?.data?.content
      if (!Array.isArray(content)) return []
      return content.map(f => ({
        id:            f.id,
        title:         f.folderName || 'Untitled',
        image:         this.api + 'g/gallery/thumbnails/' + f.thumbnailPath,
        photoCount:    f.photoCount || 0,
        thumbnailPath: f.thumbnailPath,
        location:      f.officeLocationName || 'Unknown Location',
        creator:       f.createdBy || f.creator || 'Unknown Creator',
        createdDate:   f.createdDate || new Date().toISOString()
      }))
    },
    async performSearch() {
      if (!this.searchText || !this.searchText.trim()) return this.clearSearch()
      const term = this.searchText.toLowerCase().trim()
      this.filteredGalleryItems = this.originalGalleryItems.filter(i => i.title.toLowerCase().includes(term))
      this.isFiltered  = true
      this.currentPage = 1
    },
    clearSearch() {
      this.searchText           = ''
      this.isFiltered           = false
      this.filteredGalleryItems = []
      this.currentPage          = 1
      this.pagination.page      = 0
      this.fetchGalleryData(this.getSelectedDivisionId())
    },
    onPageChange(page) {
      this.pagination.page = page - 1
      this.fetchGalleryData(this.getSelectedDivisionId())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    openFolderPhotos(folder) {
      this.addToRecent(folder)
      this.$router.push({ name: 'FolderDetail', params: { id: folder.id, folder } })
    },
    openCreateFolderDialog() {
      this.newFolder = { folderName: '', officeLocationId: null }
      this.createFolderDialog = true
      this.$nextTick(() => this.$refs.folderForm?.resetValidation())
    },
    closeCreateFolderDialog() {
      this.createFolderDialog = false
      this.newFolder = { folderName: '', officeLocationId: null }
    },
    async createFolder() {
      if (!this.$refs.folderForm.validate()) return
      this.creatingFolder = true
      try {
        const res = await GalleryService.createFolder(this.newFolder)
        this.showSuccess('Folder created successfully')
        this.createFolderDialog = false
        const newId = res.data?.data
        newId
          ? this.$router.push({ name: 'FolderDetail', params: { id: newId, folder: { id: newId, title: this.newFolder.folderName } } })
          : await this.fetchGalleryData(this.getSelectedDivisionId())
      } catch (e) { this.showError('Failed to create folder') }
      finally { this.creatingFolder = false }
    },
    confirmDeleteFolder(folder) { this.folderToDelete = folder; this.deleteFolderDialog = true },
    async deleteFolder() {
      if (!this.folderToDelete) return
      this.deletingFolder = true
      try {
        await GalleryService.deleteFolder(this.folderToDelete.id)
        this.showSuccess('Folder deleted successfully')
        this.deleteFolderDialog = false
        const id = this.folderToDelete.id
        if (this.isFavorite(id)) {
          this.favoriteIds = this.favoriteIds.filter(fId => fId !== id)
          this.saveFavorites()
        }
        this.recentViewedItems = this.recentViewedItems.filter(i => i.id !== id)
        this.saveRecentViewed()
        await this.fetchGalleryData(this.getSelectedDivisionId())
      } catch (e) { this.showError('Failed to delete folder') }
      finally { this.deletingFolder = false }
    },
    showSuccess(msg) { this.successMessage = msg; this.successSnackbar = true },
    showError(msg)   { this.errorMessage   = msg; this.errorSnackbar   = true }
  }
}
</script>

<style scoped>
.folder-card { cursor: pointer; height: 100%; transition: transform 0.2s; }
.folder-card:hover { transform: translateY(-4px); }
.card-content-fixed { min-height: 140px; max-height: 140px; }
.folder-name {
  overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical;
}
.folder-meta { display: flex; align-items: center; }
.meta-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.favorite-btn {
  position: absolute; top: 8px; left: 8px; z-index: 2;
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1.5px solid #bdbdbd !important;
  border-radius: 50%;
}
.delete-btn {
  position: absolute; top: 8px; right: 8px; z-index: 2;
  background: rgba(255, 255, 255, 0.9) !important;
}
.viewed-time-chip { position: absolute; bottom: 8px; left: 8px; z-index: 2; }
</style>