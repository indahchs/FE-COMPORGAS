<template>
  <div style="margin-top: -5rem">
    <v-container fluid class="pa-6 grey lighten-4" style="min-height: 100vh;">
      <v-card class="pa-6" rounded="lg" elevation="1">
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card flat color="transparent">
              <v-card-text class="d-flex align-center justify-space-between pa-0">
                <div class="d-flex align-center">
                  <v-btn icon @click="goBack" class="mr-2">
                    <v-icon>{{ icons.mdiArrowLeft }}</v-icon>
                  </v-btn>
                  <v-icon class="mr-2">{{ icons.mdiFolder }}</v-icon>
                  <h1 class="text-h4 primary--text font-weight-medium">
                    {{ folderDetail.title || folderDetail.folderName || 'Folder' }}
                    <span class="text-h6 grey--text font-weight-regular ml-2"
                      v-if="folderDetail.photoCount !== undefined">
                      ({{ folderDetail.photoCount }} foto)
                    </span>
                  </h1>
                </div>
                <div class="d-flex align-center">
                  <v-btn color="primary" depressed class="text-capitalize mr-3" @click="downloadAllPhotos"
                    :disabled="folderPhotos.length === 0 || downloadingAll" :loading="downloadingAll">
                    <v-icon class="mr-1">{{ icons.mdiDownloadMultiple }}</v-icon>
                    Download All
                  </v-btn>

                  <v-btn v-if="canUploadPhoto" color="primary" depressed class="text-capitalize"
                    @click="openUploadDialog">
                    <v-icon class="mr-1">{{ icons.mdiUpload }}</v-icon>
                    Add Photos
                  </v-btn>

                  <v-tooltip bottom v-else>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn color="grey" depressed class="text-capitalize" disabled v-bind="attrs" v-on="on">
                        <v-icon class="mr-1">{{ icons.mdiUpload }}</v-icon>
                        Add Photos
                      </v-btn>
                    </template>
                    <span>Anda tidak memiliki izin untuk upload foto</span>
                  </v-tooltip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-dialog v-model="downloadProgressDialog" max-width="600" persistent>
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">{{ icons.mdiDownloadMultiple }}</v-icon>
              Downloading All Photos
              <v-spacer></v-spacer>
              <v-btn icon small @click="closeDownloadDialog" v-if="!downloadingAll">
                <v-icon>{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div class="text-body-2 mb-3">
                <strong>Progress: {{ downloadProgress.current }} / {{ downloadProgress.total }}</strong>
              </div>

              <v-progress-linear v-model="downloadProgress.percentage" color="success" height="12"
                class="mb-3"></v-progress-linear>

              <div v-if="downloadProgress.currentPhoto" class="text-caption grey--text mb-3">
                Currently downloading: {{ downloadProgress.currentPhoto.photoName ||
                  downloadProgress.currentPhoto.filename }}
              </div>

              <div class="download-files-list" style="max-height: 15.625rem; overflow-y: auto;">
                <div v-for="(item, index) in downloadProgress.files" :key="index" class="d-flex align-center mb-2 pa-2"
                  :class="getDownloadStatusClass(item.status)">
                  <v-icon small :color="getDownloadStatusColor(item.status)" class="mr-2">
                    {{ getDownloadStatusIcon(item.status) }}
                  </v-icon>
                  <div class="flex-grow-1">
                    <div class="text-caption">{{ item.name }}</div>
                  </div>
                  <div class="text-caption" :class="getDownloadStatusColor(item.status) + '--text'">
                    {{ getDownloadStatusText(item.status) }}
                  </div>
                </div>
              </div>

              <div v-if="downloadProgress.completed > 0 || downloadProgress.failed > 0" class="mt-3">
                <v-chip small color="success" class="mr-2" v-if="downloadProgress.completed > 0">
                  <v-icon small left>{{ icons.mdiCheck }}</v-icon>
                  {{ downloadProgress.completed }} Success
                </v-chip>
                <v-chip small color="error" v-if="downloadProgress.failed > 0">
                  <v-icon small left>{{ icons.mdiClose }}</v-icon>
                  {{ downloadProgress.failed }} Failed
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>

        <v-row v-if="loading" class="justify-center">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <div class="mt-3">Loading folder...</div>
          </v-col>
        </v-row>

        <v-row v-else-if="error" class="justify-center">
          <v-col cols="12" class="text-center">
            <v-alert type="error" outlined>
              {{ error }}
            </v-alert>
            <v-btn color="primary" @click="fetchFolderPhotos" class="mt-3">
              <v-icon class="mr-1">{{ icons.mdiRefresh }}</v-icon>
              Retry
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-else-if="folderPhotos.length > 0">
          <v-col v-for="photo in folderPhotos" :key="photo.id" cols="6" sm="4" md="3" lg="2">
            <v-card hover class="photo-card" @click="openImagePreview(photo)">
              <v-img :src="getPhotoUrl(photo)" height="150" cover>
                <v-card-actions v-if="canDeletePhoto" class="pa-1" style="position: absolute; top: 0; right: 0;">
                  <v-btn icon x-small @click.stop="confirmDeletePhoto(photo)" class="delete-btn">
                    <v-icon color="red" small>{{ icons.mdiDelete }}</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-img>
              <v-card-subtitle class="pa-2 text-caption">
                {{ photo.generatedFileName }}
              </v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-else class="justify-center">
          <v-col cols="12" class="text-center">
            <v-icon size="64" color="grey">{{ icons.mdiImageOff }}</v-icon>
            <div class="mt-3 grey--text">No photos in this folder</div>
            <v-btn v-if="canUploadPhoto" color="primary" class="mt-3" @click="openUploadDialog">
              <v-icon class="mr-1">{{ icons.mdiUpload }}</v-icon>
              Upload Photos
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <v-dialog v-model="imagePreviewDialog" max-width="800" @keydown.left="showPreviousPhoto"
        @keydown.right="showNextPhoto">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ selectedPhoto?.photoName || selectedPhoto?.filename || 'Photo Preview' }}</span>
            <div class="d-flex align-center">
              <v-btn icon @click="showPreviousPhoto" :disabled="!hasPreviousPhoto" class="mr-1">
                <v-icon>{{ icons.mdiChevronLeft }}</v-icon>
              </v-btn>
              <v-btn icon @click="showNextPhoto" :disabled="!hasNextPhoto" class="mr-1">
                <v-icon>{{ icons.mdiChevronRight }}</v-icon>
              </v-btn>
              <v-btn icon @click="downloadPhoto" :disabled="downloadingPhoto" class="mr-2">
                <v-icon>{{ downloadingPhoto ? icons.mdiLoading : icons.mdiDownload }}</v-icon>
              </v-btn>
              <v-btn icon @click="imagePreviewDialog = false">
                <v-icon>{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text class="pa-0 position-relative">
            <v-img v-if="selectedPhoto" :src="getPhotoUrl(selectedPhoto)" max-height="500" contain
              @click="handleImageClick">
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </v-row>
              </template>

              <v-btn v-if="hasPreviousPhoto" icon large @click.stop="showPreviousPhoto"
                class="navigation-arrow navigation-arrow--left"
                :class="{ 'navigation-arrow--disabled': !hasPreviousPhoto }">
                <v-icon large color="white">{{ icons.mdiChevronLeft }}</v-icon>
              </v-btn>

              <v-btn v-if="hasNextPhoto" icon large @click.stop="showNextPhoto"
                class="navigation-arrow navigation-arrow--right"
                :class="{ 'navigation-arrow--disabled': !hasNextPhoto }">
                <v-icon large color="white">{{ icons.mdiChevronRight }}</v-icon>
              </v-btn>
            </v-img>

            <div class="photo-counter">
              {{ currentPhotoIndex + 1 }} / {{ folderPhotos.length }}
            </div>
          </v-card-text>
          <v-card-text v-if="selectedPhoto">
            <div class="text-body-2"><strong>Activity Date:</strong> {{ formatDate(selectedPhoto.activityDate) || 'N/A'
            }}
            </div>
            <div class="text-body-2"><strong>File Name:</strong> {{ selectedPhoto.photoName || selectedPhoto.filename ||
              'N/A'
            }}</div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="downloadPhoto" :loading="downloadingPhoto">
              <v-icon class="mr-1">{{ icons.mdiDownload }}</v-icon>
              Download
            </v-btn>
            <v-btn text @click="imagePreviewDialog = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="uploadDialog" max-width="600" @click:outside="closeUploadDialog" persistent>
        <v-card>
          <v-card-title>Upload Photos to {{ folderDetail.title || folderDetail.folderName || 'Folder' }}</v-card-title>
          <v-card-text>
            <v-form ref="uploadForm" v-model="uploadFormValid">
              <v-text-field v-model="uploadData.activityDate" label="Activity Date" type="date" outlined
                :rules="[v => !!v || 'Activity date is required']" required></v-text-field>

              <v-file-input v-model="selectedFiles" label="Select Photos" multiple accept="image/*" outlined
                prepend-icon="" :prepend-inner-icon="icons.mdiCamera" show-size
                :rules="[v => (v && v.length > 0) || 'Please select at least one photo']"></v-file-input>

              <div v-if="uploading" class="mt-4">
                <v-divider class="mb-3"></v-divider>
                <div class="text-body-2 mb-2">
                  <strong>Upload Progress: {{ uploadProgress.current }} / {{ uploadProgress.total }}</strong>
                </div>

                <v-progress-linear v-model="uploadProgress.percentage" color="primary" height="8"
                  class="mb-3"></v-progress-linear>

                <div v-if="uploadProgress.currentFile" class="text-caption grey--text mb-2">
                  Currently uploading: {{ uploadProgress.currentFile.name }}
                </div>

                <div class="upload-files-list" style="max-height: 12.5rem; overflow-y: auto;">
                  <div v-for="(file, index) in uploadProgress.files" :key="index" class="d-flex align-center mb-2 pa-2"
                    :class="getFileUploadStatusClass(file.status)">
                    <v-icon small :color="getFileUploadStatusColor(file.status)" class="mr-2">
                      {{ getFileUploadStatusIcon(file.status) }}
                    </v-icon>
                    <div class="flex-grow-1">
                      <div class="text-caption">{{ file.name }}</div>
                      <div class="text-caption grey--text">{{ formatFileSize(file.size) }}</div>
                    </div>
                    <div class="text-caption" :class="getFileUploadStatusColor(file.status) + '--text'">
                      {{ getFileUploadStatusText(file.status) }}
                    </div>
                  </div>
                </div>

                <div v-if="uploadProgress.completed > 0 || uploadProgress.failed > 0" class="mt-3">
                  <v-chip small color="success" class="mr-2" v-if="uploadProgress.completed > 0">
                    <v-icon small left>{{ icons.mdiCheck }}</v-icon>
                    {{ uploadProgress.completed }} Success
                  </v-chip>
                  <v-chip small color="error" v-if="uploadProgress.failed > 0">
                    <v-icon small left>{{ icons.mdiClose }}</v-icon>
                    {{ uploadProgress.failed }} Failed
                  </v-chip>
                </div>
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeUploadDialog" :disabled="uploading">Cancel</v-btn>
            <v-btn color="primary" @click="uploadPhotos" :loading="uploading" :disabled="!uploadFormValid || uploading">
              <span v-if="!uploading">Upload {{ selectedFiles.length }} Photo(s)</span>
              <span v-else>Uploading... ({{ uploadProgress.current }}/{{ uploadProgress.total }})</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="uploadCompletedDialog" max-width="400">
        <v-card>
          <v-card-text class="pt-6">
            <v-alert :type="uploadCompletedType" prominent>
              <div class="text-h6">{{ uploadCompletedType === 'success' ? 'Upload Berhasil!' : 'Upload Gagal!' }}</div>
              <div class="mt-2">{{ uploadCompletedMessage }}</div>
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="closeUploadCompletedDialog">
              OK
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="deletePhotoDialog" max-width="500">
        <v-card>
          <v-card-title class="headline red--text">Delete Photo</v-card-title>
          <v-card-text>
            Are you sure you want to delete this photo? This action cannot be undone.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="deletePhotoDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="deletePhoto" :loading="deletingPhoto">
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
import {
  mdiArrowLeft,
  mdiFolder,
  mdiUpload,
  mdiCamera,
  mdiImageOff,
  mdiClose,
  mdiRefresh,
  mdiDelete,
  mdiCheck,
  mdiLoading,
  mdiAlertCircle,
  mdiDownload,
  mdiDownloadMultiple,
  mdiChevronLeft,
  mdiChevronRight
} from '@mdi/js'
import GalleryService from '@/services/gallery/GalleryServices'

export default {
  name: 'FolderDetail',
  data() {
    return {
      icons: {
        mdiArrowLeft,
        mdiFolder,
        mdiUpload,
        mdiCamera,
        mdiImageOff,
        mdiClose,
        mdiRefresh,
        mdiDelete,
        mdiCheck,
        mdiLoading,
        mdiAlertCircle,
        mdiDownload,
        mdiDownloadMultiple,
        mdiChevronLeft,
        mdiChevronRight
      },
      loading: false,
      error: null,
      folderDetail: {},
      folderPhotos: [],
      api: process.env.VUE_APP_PERTAGAS,
      imagePreviewDialog: false,
      selectedPhoto: null,
      downloadingPhoto: false,
      downloadingAll: false,
      downloadProgressDialog: false,
      downloadProgress: {
        current: 0,
        total: 0,
        percentage: 0,
        completed: 0,
        failed: 0,
        currentPhoto: null,
        files: []
      },
      downloadCancelled: false,
      uploadDialog: false,
      uploadFormValid: false,
      uploadData: {
        activityDate: new Date().toISOString().substr(0, 10)
      },
      selectedFiles: [],
      uploading: false,
      uploadProgress: {
        current: 0,
        total: 0,
        percentage: 0,
        completed: 0,
        failed: 0,
        currentFile: null,
        files: []
      },
      deletePhotoDialog: false,
      photoToDelete: null,
      deletingPhoto: false,
      uploadCompletedDialog: false,
      uploadCompletedMessage: '',
      uploadCompletedType: 'success',
      successSnackbar: false,
      successMessage: '',
      errorSnackbar: false,
      errorMessage: '',
      currentPhotoIndex: -1
    }
  },
  computed: {
    folderId() {
      return this.$route.params.id
    },

    folderFromRoute() {
      return this.$route.params.folder || JSON.parse(localStorage.getItem(`folder_${this.folderId}`) || '{}')
    },

    userRole() {
      const data = JSON.parse(localStorage.getItem("dataUser"));
      return data ? data.roleId : null;
    },

    canUploadPhoto() {
      return ['IT', 'IT_LEAD', 'SUPER', 'SEKRETARIS'].includes(this.userRole);
    },

    canDeletePhoto() {
      return ['SUPER', 'SEKRETARIS'].includes(this.userRole);
    },

    hasPreviousPhoto() {
      return this.currentPhotoIndex > 0;
    },

    hasNextPhoto() {
      return this.currentPhotoIndex < this.folderPhotos.length - 1;
    }
  },

  async created() {
    if (this.$route.params.folder) {
      this.folderDetail = this.$route.params.folder
      localStorage.setItem(`folder_${this.folderId}`, JSON.stringify(this.$route.params.folder))
    } else if (this.folderFromRoute.id) {
      this.folderDetail = this.folderFromRoute
    } else {
      this.folderDetail = {
        id: this.folderId,
        title: 'Gallery Folder',
        folderName: 'Gallery Folder',
        photoCount: 0
      }
    }

    await this.fetchFolderPhotos()
  },
  watch: {
    '$route.params.id': {
      handler(newId) {
        if (newId) {
          this.fetchFolderDetail()
        }
      },
      immediate: true
    },

    imagePreviewDialog(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.setupKeyboardNavigation();
        });
      } else {
        this.removeKeyboardNavigation();
      }
    }
  },
  methods: {
    async fetchFolderDetail() {
      this.loading = true
      this.error = null

      try {
        const photosResponse = await GalleryService.getFolderPhotos(this.folderId)
        if (photosResponse.data && photosResponse.data.data) {
          if (photosResponse.data.data.content) {
            this.folderPhotos = photosResponse.data.data.content.map(photo => ({
              ...photo,
              generatedFileName: photo.generatedFileName || null
            }))
          } else if (Array.isArray(photosResponse.data.data)) {
            this.folderPhotos = photosResponse.data.data.map(photo => ({
              ...photo,
              generatedFileName: photo.generatedFileName || null
            }))
          } else {
            this.folderPhotos = []
          }
          if (photosResponse.data.data.folder) {
            this.folderDetail = photosResponse.data.data.folder
          }
        }
        if (!this.folderDetail.id) {
          try {
            let folderResponse
            if (GalleryService.getFolderDetailAlternative) {
              folderResponse = await GalleryService.getFolderDetailAlternative(this.folderId)
            } else if (GalleryService.getFolderDetail) {
              folderResponse = await GalleryService.getFolderDetail(this.folderId)
            } else {
              const foldersResponse = await GalleryService.getFolders({ page: 0, size: 1000 })
              if (foldersResponse.data?.data?.content) {
                const folder = foldersResponse.data.data.content.find(f =>
                  f.id.toString() === this.folderId.toString()
                )
                if (folder) {
                  folderResponse = { data: { data: folder } }
                }
              }
            }

            if (folderResponse?.data?.data) {
              this.folderDetail = {
                ...folderResponse.data.data,
                photoCount: this.folderPhotos.length
              }
            }
          } catch (folderError) {
            console.warn('Could not fetch folder details:', folderError)
          }
        }
        if (!this.folderDetail.id) {
          this.folderDetail = {
            id: this.folderId,
            folderName: `Folder ${this.folderId}`,
            photoCount: this.folderPhotos.length
          }
        }
        this.folderDetail.photoCount = this.folderPhotos.length

      } catch (error) {
        console.error('Error fetching folder data:', error)
        if (error.response) {
          switch (error.response.status) {
            case 404:
              this.error = 'Folder not found. It may have been deleted.'
              setTimeout(() => this.$router.push('/gallery'), 3000)
              break
            case 403:
              this.error = 'You do not have permission to access this folder.'
              break
            case 500:
              this.error = 'Server error. Please try again later.'
              break
            default:
              this.error = 'Failed to load folder. Please try again.'
          }
        } else if (error.message) {
          this.error = error.message
        } else {
          this.error = 'Network error. Please check your connection.'
        }
      } finally {
        this.loading = false
      }
    },

    async fetchFolderPhotos() {
      await this.fetchFolderDetail()
    },

    goBack() {
      this.$router.push('/gallery')
    },

    getPhotoUrl(photo) {
      return this.api + "gallery/" + photo.filePath
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('id-ID')
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    openImagePreview(photo) {
      this.selectedPhoto = photo
      this.imagePreviewDialog = true
    },

    async downloadPhoto() {
      if (!this.selectedPhoto) return

      this.downloadingPhoto = true

      try {
        const photoUrl = this.getPhotoUrl(this.selectedPhoto)
        const fileName = this.selectedPhoto.generatedFileName || this.selectedPhoto.photoName || this.selectedPhoto.filename || 'photo'
        const response = await fetch(photoUrl)

        if (!response.ok) throw new Error('Failed to fetch photo')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = fileName

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        this.showSuccess('Photo downloaded successfully!')

      } catch (error) {
        console.error('Error downloading photo:', error)
        this.showError('Failed to download photo. Please try again.')
      } finally {
        this.downloadingPhoto = false
      }
    },

    async downloadAllPhotos() {
      if (this.folderPhotos.length === 0) {
        this.showError('No photos to download')
        return
      }

      this.downloadingAll = true
      this.downloadCancelled = false
      this.initializeDownloadProgress()
      this.downloadProgressDialog = true

      const failedDownloads = []
      const successfulDownloads = []

      try {
        const JSZip = (await import('jszip')).default

        const zip = new JSZip()
        const folderName = this.sanitizeFileName(this.folderDetail.title || this.folderDetail.folderName || 'Photos')

        for (let i = 0; i < this.folderPhotos.length; i++) {
          if (this.downloadCancelled) break

          const photo = this.folderPhotos[i]
          this.downloadProgress.currentPhoto = photo
          this.downloadProgress.files[i].status = 'downloading'

          try {
            const photoUrl = this.getPhotoUrl(photo)
            const response = await fetch(photoUrl)

            if (!response.ok) throw new Error(`Failed to fetch ${photo.photoName || photo.filename}`)

            const blob = await response.blob()

            const originalFileName = photo.generatedFileName || photo.photoName || photo.filename || `photo_${i + 1}`
            const fileExtension = this.getFileExtension(blob.type, originalFileName)
            const baseFileName = this.sanitizeFileName(this.removeExtension(originalFileName))
            const fullFileName = `${baseFileName}${fileExtension}`

            zip.file(`${folderName}/${fullFileName}`, blob)

            this.downloadProgress.files[i].status = 'completed'
            this.downloadProgress.completed++
            successfulDownloads.push(fullFileName)
          } catch (error) {
            console.error(`Error downloading ${photo.photoName || photo.filename}:`, error)
            this.downloadProgress.files[i].status = 'failed'
            this.downloadProgress.failed++
            failedDownloads.push({
              name: photo.photoName || photo.filename,
              error: error.message
            })
          }

          this.downloadProgress.current = i + 1
          this.updateDownloadProgress()

          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (!this.downloadCancelled && successfulDownloads.length > 0) {
          const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
          })

          const properZipBlob = new Blob([zipBlob], { type: 'application/zip' })
          const url = window.URL.createObjectURL(properZipBlob)

          const link = document.createElement('a')
          link.href = url
          link.download = `${folderName}.zip`
          link.style.display = 'none'

          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          setTimeout(() => {
            window.URL.revokeObjectURL(url)
          }, 1000)

          if (failedDownloads.length === 0) {
            this.showSuccess(`All ${successfulDownloads.length} photos downloaded successfully as ${folderName}.zip!`)
          } else {
            this.showSuccess(`${successfulDownloads.length} photos downloaded successfully, ${failedDownloads.length} failed. Check ${folderName}.zip in your downloads.`)
          }
        } else if (this.downloadCancelled) {
          this.showError('Download cancelled by user')
        } else if (successfulDownloads.length === 0 && failedDownloads.length > 0) {
          this.showError('All downloads failed. Please check your connection and try again.')
        }

      } catch (error) {
        console.error('Error in bulk download process:', error)
        this.showError('Failed to create download package: ' + error.message)
      } finally {
        this.downloadingAll = false
        this.downloadProgress.currentPhoto = null
        this.downloadCancelled = false

        this.$forceUpdate()
      }
    },

    initializeDownloadProgress() {
      this.downloadProgress = {
        current: 0,
        total: this.folderPhotos.length,
        percentage: 0,
        completed: 0,
        failed: 0,
        currentPhoto: null,
        files: this.folderPhotos.map(photo => ({
          name: photo.photoName || photo.filename || 'Unknown',
          status: 'pending'
        }))
      }
    },

    updateDownloadProgress() {
      const total = this.downloadProgress.total
      const current = this.downloadProgress.current
      this.downloadProgress.percentage = total > 0 ? Math.round((current / total) * 100) : 0
    },

    closeDownloadDialog() {
      this.downloadProgressDialog = false
      this.downloadingAll = false
      this.downloadCancelled = false
      this.downloadProgress.currentPhoto = null

      this.downloadProgress = {
        current: 0,
        total: 0,
        percentage: 0,
        completed: 0,
        failed: 0,
        currentPhoto: null,
        files: []
      }
    },

    cancelDownload() {
      if (this.downloadingAll && this.downloadProgress.completed + this.downloadProgress.failed < this.downloadProgress.total) {
        this.downloadCancelled = true
        this.downloadingAll = false
        this.showError('Download cancelled')
      }

      this.closeDownloadDialog()
    },

    sanitizeFileName(fileName) {
      return fileName.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_').substring(0, 100)
    },

    getFileExtension(mimeType, originalFileName) {
      if (originalFileName && originalFileName.includes('.')) {
        const extension = originalFileName.split('.').pop().toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'].includes(extension)) {
          return '.' + extension
        }
      }

      const mimeToExtension = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/bmp': '.bmp',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
        'image/tiff': '.tiff',
        'image/tif': '.tiff'
      }

      return mimeToExtension[mimeType] || '.jpg'
    },

    removeExtension(fileName) {
      if (!fileName || !fileName.includes('.')) return fileName
      return fileName.substring(0, fileName.lastIndexOf('.'))
    },

    getDownloadStatusClass(status) {
      switch (status) {
        case 'downloading':
          return 'blue lighten-5'
        case 'completed':
          return 'green lighten-5'
        case 'failed':
          return 'red lighten-5'
        default:
          return 'grey lighten-4'
      }
    },

    getDownloadStatusColor(status) {
      switch (status) {
        case 'downloading':
          return 'blue'
        case 'completed':
          return 'green'
        case 'failed':
          return 'red'
        default:
          return 'grey'
      }
    },

    getDownloadStatusIcon(status) {
      switch (status) {
        case 'downloading':
          return this.icons.mdiLoading
        case 'completed':
          return this.icons.mdiCheck
        case 'failed':
          return this.icons.mdiAlertCircle
        default:
          return this.icons.mdiDownload
      }
    },

    getDownloadStatusText(status) {
      switch (status) {
        case 'downloading':
          return 'Downloading...'
        case 'completed':
          return 'Completed'
        case 'failed':
          return 'Failed'
        default:
          return 'Pending'
      }
    },

    openUploadDialog() {
      this.errorSnackbar = false
      this.errorMessage = ''

      this.uploadDialog = true
      this.resetUploadForm()

      this.$nextTick(() => {
        if (this.$refs.uploadForm) {
          this.$refs.uploadForm.resetValidation()
        }
      })
    },

    closeUploadDialog() {
      if (this.uploading) {
        return
      }

      this.uploadDialog = false
      this.errorSnackbar = false
      this.errorMessage = ''

      this.resetUploadForm()
      this.resetUploadProgress()
    },

    resetUploadForm() {
      this.uploadData = {
        activityDate: new Date().toISOString().substr(0, 10)
      }
      this.selectedFiles = []
    },

    resetUploadProgress() {
      this.uploadProgress = {
        current: 0,
        total: 0,
        percentage: 0,
        completed: 0,
        failed: 0,
        currentFile: null,
        files: []
      }
    },

    initializeUploadProgress() {
      this.uploadProgress = {
        current: 0,
        total: this.selectedFiles.length,
        percentage: 0,
        completed: 0,
        failed: 0,
        currentFile: null,
        files: this.selectedFiles.map(file => ({
          name: file.name,
          size: file.size,
          status: 'pending'
        }))
      }
    },

    updateUploadProgress() {
      const total = this.uploadProgress.total
      const current = this.uploadProgress.current
      this.uploadProgress.percentage = total > 0 ? Math.round((current / total) * 100) : 0
    },

    getFileUploadStatusClass(status) {
      switch (status) {
        case 'uploading':
          return 'blue lighten-5'
        case 'completed':
          return 'green lighten-5'
        case 'failed':
          return 'red lighten-5'
        default:
          return 'grey lighten-4'
      }
    },

    getFileUploadStatusColor(status) {
      switch (status) {
        case 'uploading':
          return 'blue'
        case 'completed':
          return 'green'
        case 'failed':
          return 'red'
        default:
          return 'grey'
      }
    },

    getFileUploadStatusIcon(status) {
      switch (status) {
        case 'uploading':
          return this.icons.mdiLoading
        case 'completed':
          return this.icons.mdiCheck
        case 'failed':
          return this.icons.mdiAlertCircle
        default:
          return this.icons.mdiCamera
      }
    },

    getFileUploadStatusText(status) {
      switch (status) {
        case 'uploading':
          return 'Uploading...'
        case 'completed':
          return 'Completed'
        case 'failed':
          return 'Failed'
        default:
          return 'Pending'
      }
    },

    async uploadPhotos() {
      if (!this.$refs.uploadForm.validate()) return

      this.uploading = true
      this.errorSnackbar = false
      this.errorMessage = ''

      this.initializeUploadProgress()

      const failedUploads = []
      const successfulUploads = []

      try {
        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]

          this.uploadProgress.currentFile = file
          this.uploadProgress.files[i].status = 'uploading'

          try {
            const formData = new FormData()
            formData.append('photoName', file.name || 'Untitled Photo')
            formData.append('activityDate', this.uploadData.activityDate)
            formData.append('folderId', this.folderId)
            formData.append('file', file)

            await GalleryService.uploadPhoto(formData)

            this.uploadProgress.files[i].status = 'completed'
            this.uploadProgress.completed++
            successfulUploads.push(file.name)
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error)

            this.uploadProgress.files[i].status = 'failed'
            this.uploadProgress.failed++
            failedUploads.push({
              name: file.name,
              error: error.message || 'Unknown error'
            })
          }

          this.uploadProgress.current = i + 1
          this.updateUploadProgress()

          await new Promise(resolve => setTimeout(resolve, 200))
        }

        if (successfulUploads.length > 0) {
          this.uploadCompletedMessage = `${successfulUploads.length} foto berhasil diupload!`
          this.uploadCompletedType = 'success'
          this.uploadCompletedDialog = true
        }

        if (failedUploads.length > 0) {
          const errorMsg = `${failedUploads.length} foto gagal diupload: ${failedUploads.map(f => f.name).join(', ')}`
          this.uploadCompletedMessage = errorMsg
          this.uploadCompletedType = 'error'
          this.uploadCompletedDialog = true
        }

      } catch (error) {
        console.error('Error in upload process:', error)
        this.showError('Upload process failed')
      } finally {
        this.uploading = false
        this.uploadProgress.currentFile = null
      }
    },

    confirmDeletePhoto(photo) {
      this.photoToDelete = photo
      this.deletePhotoDialog = true
    },

    async deletePhoto() {
      if (!this.photoToDelete) return

      this.deletingPhoto = true

      try {
        await GalleryService.deletePhoto(this.photoToDelete.id)
        this.showSuccess('Photo deleted successfully')
        this.deletePhotoDialog = false
        const photoIndex = this.folderPhotos.findIndex(photo => photo.id === this.photoToDelete.id)
        if (photoIndex !== -1) {
          this.folderPhotos.splice(photoIndex, 1)
          this.folderDetail.photoCount = this.folderPhotos.length
        }

      } catch (error) {
        console.error('Error deleting photo:', error)
        this.showError('Failed to delete photo')
      } finally {
        this.deletingPhoto = false
      }
    },

    closeUploadCompletedDialog() {
      this.uploadCompletedDialog = false
      if (this.uploadCompletedType === 'success') {
        this.uploadDialog = false
        window.location.reload()
      }
    },

    showSuccess(message) {
      this.successMessage = message
      this.successSnackbar = true
    },

    showError(message) {
      this.errorMessage = message
      this.errorSnackbar = true
    },

    openImagePreview(photo) {
      this.selectedPhoto = photo;
      this.currentPhotoIndex = this.folderPhotos.findIndex(p => p.id === photo.id);
      this.imagePreviewDialog = true;
    },

    showPreviousPhoto() {
      if (this.hasPreviousPhoto) {
        this.currentPhotoIndex--;
        this.selectedPhoto = this.folderPhotos[this.currentPhotoIndex];
        this.downloadingPhoto = false;
      }
    },

    showNextPhoto() {
      if (this.hasNextPhoto) {
        this.currentPhotoIndex++;
        this.selectedPhoto = this.folderPhotos[this.currentPhotoIndex];
        this.downloadingPhoto = false;
      }
    },

    handleImageClick(event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const width = rect.width;

      if (clickX < width / 3) {
        this.showPreviousPhoto();
      } else if (clickX > (width / 3) * 2) {
        this.showNextPhoto();
      }
    },

    setupKeyboardNavigation() {
      document.addEventListener('keydown', this.handleKeydown);
    },

    removeKeyboardNavigation() {
      document.removeEventListener('keydown', this.handleKeydown);
    },

    handleKeydown(event) {
      if (!this.imagePreviewDialog) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          this.showPreviousPhoto();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.showNextPhoto();
          break;
        case 'Escape':
          this.imagePreviewDialog = false;
          break;
      }
    }
  },

  beforeDestroy() {
    this.removeKeyboardNavigation();
  }
}
</script>

<style scoped>
.photo-card {
  position: relative;
  transition: transform 0.2s ease-in-out;
}

.photo-card:hover {
  transform: translateY(-0.125rem);
}

.delete-btn {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(.25rem);
  box-shadow: 0 .125rem .5rem rgba(0, 0, 0, 0.3) !important;
  border: .0625rem solid rgba(255, 255, 255, 0.8) !important;
}

.delete-btn:hover {
  background: rgba(255, 255, 255, 1) !important;
  transform: scale(1.1);
  box-shadow: 0 .25rem .75rem rgba(0, 0, 0, 0.4) !important;
}

.upload-files-list,
.download-files-list {
  border: .0625rem solid #e0e0e0;
  border-radius: .25rem;
  background-color: #fafafa;
}

.upload-files-list .d-flex,
.download-files-list .d-flex {
  border-radius: .25rem;
  transition: all 0.2s ease;
}

.upload-files-list .d-flex:hover,
.download-files-list .d-flex:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.upload-files-list .v-icon.mdi-loading,
.download-files-list .v-icon.mdi-loading {
  animation: spin 1s linear infinite;
}

.navigation-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(4px);
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  transition: all 0.3s ease;
  z-index: 10;
}

.navigation-arrow:hover {
  background: rgba(0, 0, 0, 0.7) !important;
  border-color: rgba(255, 255, 255, 0.8) !important;
  transform: translateY(-50%) scale(1.1);
}

.navigation-arrow--left {
  left: 16px;
}

.navigation-arrow--right {
  right: 16px;
}

.navigation-arrow--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.photo-counter {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 5;
}

.position-relative {
  position: relative;
}

@media (max-width: 768px) {
  .navigation-arrow {
    width: 44px;
    height: 44px;
  }

  .v-img {
    cursor: pointer;
  }

  .navigation-arrow--left::before {
    content: '';
    position: absolute;
    left: -20px;
    top: -20px;
    width: 60px;
    height: 80px;
  }

  .navigation-arrow--right::before {
    content: '';
    position: absolute;
    right: -20px;
    top: -20px;
    width: 60px;
    height: 80px;
  }
}
</style>