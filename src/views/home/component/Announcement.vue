<template>
  <div>
    <div v-if="loadingAnnouncements" class="d-flex justify-center align-center text-center loading-container">
      <div>
        <v-progress-circular color="primary" indeterminate size="40"></v-progress-circular>
        <p class="text-body-2 grey--text mt-3">Memuat pengumuman...</p>
      </div>
    </div>

    <v-carousel v-else-if="announcements.length > 0" v-model="carousel" :height="carouselHeight" show-arrows-on-hover
      hide-delimiter-background hide-delimiters cycle interval="5000" class="fullsize-carousel"
      :key="`carousel-${announcements.length}`">
      <v-carousel-item v-for="(announcement, index) in announcements" :key="`item-${announcement.id}`"
        style="cursor: pointer" @click="openAnnouncementDetail(announcement)">
        <div class="announcement-slide-fullsize">
          <img :src="getImageUrl(announcement.url)" class="announcement-image-fullsize" alt="Announcement" />

          <div v-if="announcement.title || announcement.description" class="announcement-caption-fullsize">
            <div class="caption-overlay-fullsize">
              <p class="text-subtitle-1 white--text mb-1 font-weight-bold">
                {{ announcement.title || 'Tidak ada judul' }}
              </p>
              <p class="text-body-2 white--text opacity-90 mb-2">
                {{ truncateCaption(announcement.description, 150) }}
              </p>
              <small class="white--text opacity-90">{{ formatInstagramDate(announcement.createdAt) }}</small>
            </div>
          </div>
        </div>
      </v-carousel-item>
    </v-carousel>

    <div v-else class="d-flex justify-center align-center text-center empty-container">
      <div>
        <v-icon color="grey" size="48">{{ mdiBullhorn }}</v-icon>
        <p class="text-h6 grey--text mt-3">Belum ada pengumuman</p>
      </div>
    </div>

    <v-dialog v-model="showAnnouncementModal" max-width="1000px" content-class="announcement-modal-dialog">
      <v-card class="announcement-modal-card" v-if="selectedAnnouncement">
        <v-card-text class="pa-0">
          <div class="announcement-modal-image-container">
            <img :src="getImageUrl(selectedAnnouncement.url)" class="announcement-modal-image" />
          </div>
          <div class="pa-4">
            <h3 class="modal-title">{{ selectedAnnouncement.title || 'Tidak ada judul' }}</h3>
            <p class="announcement-modal-caption">{{ selectedAnnouncement.description || 'Tidak ada deskripsi' }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 announcement-modal-actions">
          <div class="announcement-modal-meta">
            <div class="meta-item">
              <v-icon class="mr-1" color="#888" size="16">{{ mdiCalendar }}</v-icon>
              <span>{{ formatDateTime(selectedAnnouncement.createdAt) }}</span>
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeAnnouncementModal">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AnnouncementService from "@/services/announcement-services/AnnouncementService.js";
import moment from "moment";
import { mdiBullhorn, mdiCalendar } from '@mdi/js';

export default {
  name: 'AnnouncementComponent',
  data() {
    return {
      mdiBullhorn,
      mdiCalendar,
      announcements: [],
      loadingAnnouncements: true,
      carousel: 0,
      showAnnouncementModal: false,
      selectedAnnouncement: null,
      announcementService: new AnnouncementService(),
      carouselHeight: 500
    };
  },
  async mounted() {
    await this.fetchAnnouncementData();
    this.updateCarouselHeight();
    window.addEventListener('resize', this.updateCarouselHeight);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateCarouselHeight);
  },
  methods: {
    updateCarouselHeight() {
      this.$nextTick(() => {
        if (this.$el && typeof this.$el.querySelector === 'function') {
          const carouselElement = this.$el.querySelector('.fullsize-carousel');
          if (carouselElement) {
            const actualWidth = carouselElement.offsetWidth;
            this.carouselHeight = Math.round(actualWidth * 9 / 16);
            return;
          }
        }
        const width = window.innerWidth;
        this.carouselHeight = Math.round(width * 9 / 16);
      });
    },

    async fetchAnnouncementData() {
      try {
        this.loadingAnnouncements = true;
        const response = await this.announcementService.getAnnouncementHome();

        if (response.data && response.data.data) {
          this.announcements = response.data.data;
        } else {
          console.error('Failed to fetch announcements:', response.message);
          this.announcements = [];
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
        this.announcements = [];
      } finally {
        this.loadingAnnouncements = false;
      }
    },

    openAnnouncementDetail(announcement) {
      this.selectedAnnouncement = announcement;
      this.showAnnouncementModal = true;
    },

    closeAnnouncementModal() {
      this.showAnnouncementModal = false;
      this.selectedAnnouncement = null;
    },

    truncateCaption(caption, maxLength = 100) {
      if (!caption) return '';
      return caption.length > maxLength
        ? caption.substring(0, maxLength) + '...'
        : caption;
    },

    formatDateTime(timestamp) {
      if (!timestamp) return '-';
      return moment(timestamp).format("DD MMM YYYY, HH:mm");
    },

    formatInstagramDate(timestamp) {
      if (!timestamp) return '';
      return moment(timestamp).fromNow();
    },

    getImageUrl(url) {
      if (!url) return '';
      const api = process.env.VUE_APP_PERTAGAS;
      return api + url;
    }
  }
};
</script>

<style scoped>
.loading-container,
.empty-container {
  min-height: 21.875rem;
}

.fullsize-carousel {
  width: 100%;
  position: relative;
  border-radius: 0 !important;
}

.fullsize-carousel .v-carousel__item {
  width: 100%;
  height: 100% !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.announcement-slide-fullsize {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

.announcement-image-fullsize {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
  display: block;
}

.announcement-slide-fullsize:hover .announcement-image-fullsize {
  transform: scale(1.02);
}

.announcement-caption-fullsize {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 2.5rem 1.5rem 1.25rem;
  z-index: 2;
}

.caption-overlay-fullsize {
  max-width: 100%;
}

.opacity-90 {
  opacity: 0.9;
}

.v-carousel {
  overflow: hidden;
  border-radius: 0;
}

.v-carousel__item {
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fullsize-carousel>>>.v-carousel__controls {
  background: transparent;
}

.fullsize-carousel>>>.v-btn--icon {
  background-color: rgba(0, 0, 0, 0.5) !important;
}

.fullsize-carousel>>>.v-btn--icon:hover {
  background-color: rgba(0, 0, 0, 0.7) !important;
}

.announcement-modal-dialog {
  overflow: hidden;
}

.announcement-modal-card {
  overflow: hidden;
  max-width: 100%;
}

.announcement-modal-image-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.announcement-modal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.announcement-modal-caption {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: #666;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.announcement-modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #f0f0f0;
}

.announcement-modal-meta {
  margin: 0;
  padding: 0;
  border-top: none;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #888;
  font-size: .875rem;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .announcement-modal-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .announcement-modal-actions .v-spacer {
    display: none;
  }

  .announcement-modal-actions .v-btn {
    align-self: flex-end;
  }
}

@media (max-width: 85.375rem) {
  .announcement-caption-fullsize {
    padding: 2.1875rem 1.25rem 1.125rem;
  }
}

@media (max-width: 48rem) {
  .announcement-caption-fullsize {
    padding: 1.25rem 1rem .75rem;
  }

  .text-subtitle-1 {
    font-size: .875rem !important;
  }
}

@media (max-width: 30rem) {
  .announcement-caption-fullsize {
    padding: .9375rem .75rem .625rem;
  }
}
</style>