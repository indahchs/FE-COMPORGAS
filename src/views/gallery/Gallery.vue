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
            <v-btn-toggle v-model="viewMode" mandatory dense class="d-flex">
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
              dense outlined clearable hide-details
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
              item-text="text" item-value="value"
              label="Area" outlined dense hide-details
            />
          </v-col>
        </v-row>

        <!-- GRID VIEW -->
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
                    <v-icon :style="{ color: isFavorite(item.id) ? '#FDD835 !important' : '#9E9E9E !important' }">
                      {{ isFavorite(item.id) ? icons.mdiStar : icons.mdiStarOutline }}
                    </v-icon>
                  </v-btn>
                  <div class="action-btn-group">
                    <v-btn v-if="canEditFolder" icon small @click.stop="openEditFolderDialog(item)" class="action-btn edit-btn">
                      <v-icon style="color: #1976D2 !important">{{ icons.mdiPencil }}</v-icon>
                    </v-btn>
                    <v-btn v-if="canDeleteFolder" icon small @click.stop="confirmDeleteFolder(item)" class="action-btn delete-btn-icon">
                      <v-icon style="color: #F44336 !important">{{ icons.mdiDelete }}</v-icon>
                    </v-btn>
                  </div>
                </v-img>
                <v-card-text class="pa-3 card-content-fixed">
                  <div class="folder-name text-subtitle-2 font-weight-bold mb-1" :title="item.title">{{ item.title }}</div>
                  <div class="text-caption folder-meta mb-1" v-if="item.photoCount !== undefined"><v-icon small class="mr-1">{{ icons.mdiImageMultiple }}</v-icon>{{ item.photoCount }} photos</div>
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

          <!-- Pagination Grid -->
          <v-row v-if="!loading && !error && pagination.totalElements > 0" class="mt-4">
            <v-col cols="12" class="d-flex justify-center align-center flex-column">
              <div class="text-caption grey--text mb-2">
                Showing {{ ((currentPage - 1) * pagination.size) + 1 }} - {{ Math.min(currentPage * pagination.size, pagination.totalElements) }} of {{ pagination.totalElements }} folders
              </div>
              <v-pagination v-model="currentPage" :length="pagination.totalPages" :total-visible="$vuetify.breakpoint.xs ? 5 : 7" @input="onPageChange" circle />
            </v-col>
          </v-row>
        </div>

        <!-- FAVORITES VIEW -->
        <div v-if="viewMode === 'favorites'">
          <v-row v-if="loadingFav" class="justify-center">
            <v-col cols="12" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
              <div class="mt-3">Loading favorites...</div>
            </v-col>
          </v-row>

          <template v-else>
            <v-row v-if="favoriteFolders.length > 0">
              <v-col v-for="item in pagedFavoriteFolders" :key="'fav-' + item.id" cols="12" sm="6" md="4" lg="3">
                <v-card hover class="folder-card" @click="openFolderPhotos(item)">
                  <v-img :src="item.image" height="200" cover>
                    <v-btn icon small @click.stop="toggleFavorite(item)" class="favorite-btn">
                      <v-icon style="color: #FDD835 !important">{{ icons.mdiStar }}</v-icon>
                    </v-btn>
                    <div class="action-btn-group">
                      <v-btn v-if="canEditFolder" icon small @click.stop="openEditFolderDialog(item)" class="action-btn edit-btn">
                        <v-icon style="color: #1976D2 !important">{{ icons.mdiPencil }}</v-icon>
                      </v-btn>
                      <v-btn v-if="canDeleteFolder" icon small @click.stop="confirmDeleteFolder(item)" class="action-btn delete-btn-icon">
                        <v-icon style="color: #F44336 !important">{{ icons.mdiDelete }}</v-icon>
                      </v-btn>
                    </div>
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

            <!-- Pagination Favorites -->
            <v-row v-if="favoriteFolders.length > 0" class="mt-4">
              <v-col cols="12" class="d-flex justify-center align-center flex-column">
                <div class="text-caption grey--text mb-2">
                  Showing {{ favoriteFolders.length === 0 ? 0 : ((favoritePage - 1) * localPageSize) + 1 }} - {{ Math.min(favoritePage * localPageSize, favoriteFolders.length) }} of {{ favoriteFolders.length }} folders
                </div>
                <v-pagination v-model="favoritePage" :length="favoriteTotalPages" :total-visible="$vuetify.breakpoint.xs ? 5 : 7" circle />
              </v-col>
            </v-row>
          </template>
        </div>

        <!-- RECENT VIEW -->
        <div v-if="viewMode === 'recent'">
          <v-row v-if="recentFolders.length > 0">
            <v-col v-for="item in pagedRecentFolders" :key="'rec-' + item.id" cols="12" sm="6" md="4" lg="3">
              <v-card hover class="folder-card" @click="openFolderPhotos(item)">
                <v-img :src="item.image" height="200" cover>
                  <v-chip small color="white" class="viewed-time-chip">
                    <v-icon small left color="black">{{ icons.mdiClockOutline }}</v-icon>
                    <span style="color:black">{{ formatViewedTime(item.viewedAt) }}</span>
                  </v-chip>
                  <v-btn icon small @click.stop="toggleFavorite(item)" class="favorite-btn">
                    <v-icon :style="{ color: isFavorite(item.id) ? '#FDD835 !important' : '#9E9E9E !important' }">
                      {{ isFavorite(item.id) ? icons.mdiStar : icons.mdiStarOutline }}
                    </v-icon>
                  </v-btn>
                  <div class="action-btn-group">
                    <v-btn v-if="canEditFolder" icon small @click.stop="openEditFolderDialog(item)" class="action-btn edit-btn">
                      <v-icon style="color: #1976D2 !important">{{ icons.mdiPencil }}</v-icon>
                    </v-btn>
                    <v-btn icon small @click.stop="removeFromRecent(item)" class="action-btn delete-btn-icon">
                      <v-icon color="grey">{{ icons.mdiClose }}</v-icon>
                    </v-btn>
                  </div>
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

          <!-- Pagination Recent -->
          <v-row v-if="recentFolders.length > 0" class="mt-4">
            <v-col cols="12" class="d-flex justify-center align-center flex-column">
              <div class="text-caption grey--text mb-2">
                Showing {{ recentFolders.length === 0 ? 0 : ((recentPage - 1) * localPageSize) + 1 }} - {{ Math.min(recentPage * localPageSize, recentFolders.length) }} of {{ recentFolders.length }} folders
              </div>
              <v-pagination v-model="recentPage" :length="recentTotalPages" :total-visible="$vuetify.breakpoint.xs ? 5 : 7" circle />
            </v-col>
          </v-row>

          <v-row v-if="recentFolders.length > 0" class="mt-2">
            <v-col cols="12" class="text-center">
              <v-btn color="error" outlined @click="confirmClearHistory">
                <v-icon left>{{ icons.mdiDelete }}</v-icon>Clear History
              </v-btn>
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

      <!-- Edit Folder Dialog -->
      <v-dialog v-model="editFolderDialog" max-width="500" :fullscreen="$vuetify.breakpoint.xsOnly">
        <v-card>
          <v-card-title>Edit Folder</v-card-title>
          <v-card-text>
            <v-form ref="editFolderForm" v-model="editFolderFormValid">
              <v-text-field v-model="editFolder.folderName" label="Folder Name" :rules="[v => !!v || 'Required']" outlined required></v-text-field>
              <v-select v-model="editFolder.officeLocationId" :items="locationOptions" item-text="text" item-value="value" label="Location" :rules="[v => !!v || 'Required']" outlined required></v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeEditFolderDialog">Cancel</v-btn>
            <v-btn color="primary" @click="submitEditFolder" :loading="editingFolder">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import { mdiCamera, mdiFolderPlus, mdiClose, mdiRefresh, mdiImageOff, mdiDelete, mdiMagnify, mdiMapMarker, mdiAccount, mdiImageMultiple, mdiViewGrid, mdiFolder, mdiStar, mdiStarOutline, mdiHistory, mdiClockOutline, mdiPencil } from '@mdi/js'
import GalleryService from '@/services/gallery/GalleryServices'
import OfficeLocationService from '@/services/management/office/officeLocationServices'
import moment from 'moment'

const officeLocationService = OfficeLocationService.build()

export default {
  name: 'Gallery',
  data() {
    return {
      icons: { mdiCamera, mdiFolderPlus, mdiClose, mdiRefresh, mdiImageOff, mdiDelete, mdiMagnify, mdiMapMarker, mdiAccount, mdiImageMultiple, mdiViewGrid, mdiFolder, mdiStar, mdiStarOutline, mdiHistory, mdiClockOutline, mdiPencil },
      viewMode: 'grid',
      selectedArea: 'all',
      areaOptions: [{ text: 'Semua Area', value: 'all', id: null }],
      divisionsLoaded: false,
      searchText: '',
      isFiltered: false,
      allGalleryItems: [],
      filteredGalleryItems: [],
      loading: false,
      loadingFav: false,
      error: null,
      galleryItems: [],
      api: process.env.VUE_APP_PERTAGAS,

      // Server-side pagination (grid)
      pagination: { page: 0, size: 8, totalPages: 1, totalElements: 0 },
      currentPage: 1,

      // Client-side pagination (favorites & recent)
      localPageSize: 8,
      favoritePage: 1,
      recentPage: 1,

      favoriteIds: [],
      recentViewedItems: [],

      // Create
      createFolderDialog: false,
      folderFormValid: false,
      newFolder: { folderName: '', officeLocationId: null },
      creatingFolder: false,

      // Edit
      editFolderDialog: false,
      editFolderFormValid: false,
      editFolder: { id: null, folderName: '', officeLocationId: null },
      editingFolder: false,

      // Delete
      folderToDelete: null,
      deletingFolder: false,
    }
  },
  computed: {
    displayedItems() { return this.isFiltered ? this.filteredGalleryItems : this.galleryItems },
    locationOptions() { return this.areaOptions.filter(o => o.value !== 'all') },
    userRole() {
      const data = JSON.parse(localStorage.getItem('dataUser'))
      return data ? data.roleId : null
    },
    canCreateFolder() { return ['IT', 'IT_LEAD', 'SUPER'].includes(this.userRole) },
    canEditFolder()   { return ['IT', 'IT_LEAD', 'SUPER'].includes(this.userRole) },
    canDeleteFolder() { return ['SUPER'].includes(this.userRole) },

    // Favorites
    favoriteFolders() {
      return this.favoriteIds
        .map(id => this.allGalleryItems.find(item => item.id === id) || this.recentViewedItems.find(item => item.id === id))
        .filter(Boolean)
    },
    favoriteTotalPages() { return Math.max(1, Math.ceil(this.favoriteFolders.length / this.localPageSize)) },
    pagedFavoriteFolders() {
      const start = (this.favoritePage - 1) * this.localPageSize
      return this.favoriteFolders.slice(start, start + this.localPageSize)
    },

    // Recent
    recentFolders() {
      const seen = new Set()
      return this.recentViewedItems.filter(item => !seen.has(item.id) && seen.add(item.id))
    },
    recentTotalPages() { return Math.max(1, Math.ceil(this.recentFolders.length / this.localPageSize)) },
    pagedRecentFolders() {
      const start = (this.recentPage - 1) * this.localPageSize
      return this.recentFolders.slice(start, start + this.localPageSize)
    },
  },
  watch: {
    selectedArea(newVal, oldVal) {
      if (newVal !== oldVal && this.areaOptions.length > 1) {
        this.$nextTick(() => this.handleAreaChange())
      }
    },
    viewMode(val) {
      this.favoritePage = 1
      this.recentPage   = 1
      if (val === 'favorites' && this.favoriteIds.length > 0) {
        this.ensureAllFavoritesLoaded()
      }
    },
    favoriteFolders(val) {
      if (this.favoritePage > Math.max(1, Math.ceil(val.length / this.localPageSize))) this.favoritePage = 1
    },
    recentFolders(val) {
      if (this.recentPage > Math.max(1, Math.ceil(val.length / this.localPageSize))) this.recentPage = 1
    },
  },
  async created() {
    this.loadFavorites()
    this.loadRecentViewed()
    await this.fetchDivisions()
    await this.fetchGalleryData()
  },
  methods: {
    // Favorites
    loadFavorites() { this.favoriteIds = JSON.parse(localStorage.getItem('galleryFavorites') || '[]') },
    saveFavorites() { localStorage.setItem('galleryFavorites', JSON.stringify(this.favoriteIds)) },
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
    async ensureAllFavoritesLoaded() {
      const missingIds = this.favoriteIds.filter(id => !this.allGalleryItems.find(i => i.id === id))
      if (missingIds.length === 0) return
      this.loadingFav = true
      try {
        let page = 0
        const size = 100
        let totalPages = 1
        do {
          const params = { page, size }
          const divId = this.getSelectedDivisionId()
          if (divId) params.officeLocationId = divId
          const res = await GalleryService.getFolders(params)
          const items = this.transformApiData(res.data)
          items.forEach(item => {
            if (!this.allGalleryItems.find(i => i.id === item.id)) this.allGalleryItems.push(item)
          })
          totalPages = res.data?.data?.totalPages || 1
          page++
          const stillMissing = this.favoriteIds.filter(id => !this.allGalleryItems.find(i => i.id === id))
          if (stillMissing.length === 0) break
        } while (page < totalPages)
      } catch (e) {
        console.error('Failed to load favorite folders:', e)
      } finally {
        this.loadingFav = false
      }
    },

    // Recent
    loadRecentViewed() { this.recentViewedItems = JSON.parse(localStorage.getItem('galleryRecent') || '[]') },
    saveRecentViewed() { localStorage.setItem('galleryRecent', JSON.stringify(this.recentViewedItems)) },
    addToRecent(folder) {
      const filtered = this.recentViewedItems.filter(i => i.id !== folder.id)
      this.recentViewedItems = [{ ...folder, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 50)
      this.saveRecentViewed()
    },
    removeFromRecent(folder) {
      this.recentViewedItems = this.recentViewedItems.filter(i => i.id !== folder.id)
      this.saveRecentViewed()
      this.showSuccess('Removed from recent')
    },
    confirmClearHistory() {
      Swal.fire({
        icon: 'warning', title: 'Delete',
        text: 'Are you sure you want to clear all recent history?',
        showCancelButton: true, confirmButtonText: 'Yes', cancelButtonText: 'No',
        closeOnEsc: false, closeOnClickOutside: false,
      }).then(result => {
        if (result.isConfirmed) {
          this.recentViewedItems = []
          this.recentPage = 1
          this.saveRecentViewed()
          this.showSuccess('Recent history cleared')
        }
      })
    },
    formatViewedTime(date) { return moment(date).fromNow() },

    // API
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
        const items = this.transformApiData(res.data)
        this.galleryItems = items
        items.forEach(item => {
          if (!this.allGalleryItems.find(i => i.id === item.id)) this.allGalleryItems.push(item)
        })
        if (res.data?.data) {
          this.pagination.totalPages    = res.data.data.totalPages
          this.pagination.totalElements = res.data.data.totalElements
          this.currentPage              = this.pagination.page + 1
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
      this.filteredGalleryItems = this.allGalleryItems.filter(i => i.title.toLowerCase().includes(term))
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

    // Create
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
        this.createFolderDialog = false
        Swal.fire({ icon: 'success', title: 'Success', text: 'Folder created successfully', confirmButtonText: 'OK' })
        const newId = res.data?.data
        newId
          ? this.$router.push({ name: 'FolderDetail', params: { id: newId, folder: { id: newId, title: this.newFolder.folderName } } })
          : await this.fetchGalleryData(this.getSelectedDivisionId())
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to create folder', confirmButtonText: 'OK' })
      } finally {
        this.creatingFolder = false
      }
    },

    // Edit
    openEditFolderDialog(folder) {
      // Cari officeLocationId dari areaOptions berdasarkan nama lokasi
      const matchedArea = this.areaOptions.find(o => o.text === folder.location)
      this.editFolder = {
        id: folder.id,
        folderName: folder.title,
        officeLocationId: matchedArea ? matchedArea.value : null,
      }
      this.editFolderDialog = true
      this.$nextTick(() => this.$refs.editFolderForm?.resetValidation())
    },
    closeEditFolderDialog() {
      this.editFolderDialog = false
      this.editFolder = { id: null, folderName: '', officeLocationId: null }
    },
    async submitEditFolder() {
      if (!this.$refs.editFolderForm.validate()) return
      this.editingFolder = true
      try {
        await GalleryService.updateFolder(this.editFolder.id, {
          folderName: this.editFolder.folderName,
          officeLocationId: this.editFolder.officeLocationId,
        })
        this.editFolderDialog = false

        // Update data di semua state lokal supaya langsung refresh tanpa reload penuh
        const updatedLocation = this.areaOptions.find(o => o.value === this.editFolder.officeLocationId)?.text || ''
        const patch = { title: this.editFolder.folderName, location: updatedLocation }
        const patchItem = item => item.id === this.editFolder.id ? { ...item, ...patch } : item
        this.allGalleryItems    = this.allGalleryItems.map(patchItem)
        this.galleryItems       = this.galleryItems.map(patchItem)
        this.recentViewedItems  = this.recentViewedItems.map(patchItem)

        Swal.fire({ icon: 'success', title: 'Success', text: 'Folder updated successfully', confirmButtonText: 'OK' })
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to update folder', confirmButtonText: 'OK' })
      } finally {
        this.editingFolder = false
      }
    },

    // Delete
    confirmDeleteFolder(folder) {
      Swal.fire({
        icon: 'warning', title: 'Delete',
        text: `Are you sure you want to delete "${folder.title}"? This will delete all photos in the folder.`,
        showCancelButton: true, confirmButtonText: 'Yes', cancelButtonText: 'No',
      }).then(result => {
        if (result.isConfirmed) {
          this.folderToDelete = folder
          this.deleteFolder()
        }
      })
    },
    async deleteFolder() {
      if (!this.folderToDelete) return
      this.deletingFolder = true
      try {
        await GalleryService.deleteFolder(this.folderToDelete.id)
        const id = this.folderToDelete.id
        this.allGalleryItems = this.allGalleryItems.filter(i => i.id !== id)
        if (this.isFavorite(id)) {
          this.favoriteIds = this.favoriteIds.filter(fId => fId !== id)
          this.saveFavorites()
        }
        this.recentViewedItems = this.recentViewedItems.filter(i => i.id !== id)
        this.saveRecentViewed()
        this.folderToDelete = null
        await this.fetchGalleryData(this.getSelectedDivisionId())
        Swal.fire({ icon: 'success', title: 'Success', text: 'Folder deleted successfully', confirmButtonText: 'OK' })
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to delete folder', confirmButtonText: 'OK' })
      } finally {
        this.deletingFolder = false
      }
    },

    showSuccess(msg) { Swal.fire({ icon: 'success', title: 'Success', text: msg, confirmButtonText: 'OK' }) },
    showError(msg)   { Swal.fire({ icon: 'error',   title: 'Failed',  text: msg, confirmButtonText: 'OK' }) },
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

.action-btn-group {
  position: absolute; top: 8px; right: 8px;
  z-index: 2; display: flex; gap: 4px;
}
.action-btn {
  background: rgba(255, 255, 255, 0.9) !important;
}

.viewed-time-chip { position: absolute; bottom: 8px; left: 8px; z-index: 2; }
</style>