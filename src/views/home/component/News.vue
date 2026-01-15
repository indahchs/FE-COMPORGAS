<template>
  <div>
    <div v-if="loadingBanners" class="d-flex justify-center align-center text-center loading-container">
      <div>
        <v-progress-circular color="primary" indeterminate size="40"></v-progress-circular>
        <p class="text-body-2 grey--text mt-3">Memuat banner...</p>
      </div>
    </div>

    <v-carousel v-else-if="carouselImages.length > 0" v-model="carousel" :height="carouselHeight" show-arrows-on-hover
      hide-delimiter-background hide-delimiters cycle interval="5000" class="fullsize-carousel"
      :key="`carousel-${carouselImages.length}`">
      <v-carousel-item v-for="(banner, index) in carouselImages" :key="`item-${banner.id}`" style="cursor: pointer"
        @click="openBannerDetail(banner)">
        <div class="news-slide-fullsize">
          <img :src="getImageUrl(banner.mediaUrl)" class="news-image-fullsize" @load="onImageLoad" @error="onImageError"
            alt="Banner" />

          <div v-if="banner.caption" class="banner-caption-fullsize">
            <div class="caption-overlay-fullsize">
              <p class="text-subtitle-1 white--text mb-1 font-weight-bold">
                {{ truncateCaption(banner.caption, 150) }}
              </p>
              <small class="white--text opacity-90">{{ formatDate(banner.timestamp) }}</small>
            </div>
          </div>
        </div>
      </v-carousel-item>
    </v-carousel>

    <div v-else class="d-flex justify-center align-center text-center empty-container">
      <div>
        <v-icon class="mr-1" color="grey" size="24">{{ mdiCalendarBlank }}</v-icon>
        <p class="text-h6 grey--text mt-3">Tidak ada banner tersedia</p>
      </div>
    </div>

    <v-dialog v-model="showBannerModal" max-width="1000px" content-class="banner-modal-dialog">
      <v-card class="banner-modal-card" v-if="selectedBanner">
        <v-card-text class="pa-0">
          <div class="banner-modal-image-container">
            <img :src="getImageUrl(selectedBanner.mediaUrl)" class="banner-modal-image" />
          </div>
          <div class="pa-4">
            <p class="banner-modal-caption">{{ selectedBanner.caption }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 banner-modal-actions">
          <div class="banner-modal-meta">
            <div class="meta-item">
              <v-icon class="mr-1" color="#888" size="16">{{ mdiCalendar }}</v-icon>
              <span>{{ formatDateTime(selectedBanner.timestamp) }}</span>
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeBannerModal">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BannerService from "@/services/banner-services/BannerService.js";
import moment from "moment";
import { mdiCalendar, mdiCalendarBlank } from '@mdi/js';

const serviceBanner = BannerService.build();

export default {
  name: 'NewsComponent',
  data() {
    return {
      mdiCalendar,
      mdiCalendarBlank,
      carouselImages: [],
      loadingBanners: true,
      carousel: 0,
      showBannerModal: false,
      selectedBanner: null,
      carouselKey: 0,
      carouselHeight: 500
    };
  },
  async mounted() {
    await this.fetchBannerData();
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
    async fetchBannerData() {
      try {
        this.loadingBanners = true;
        const response = await serviceBanner.getBannerHome(true, {});

        const { success, data: bannerData } = response.data;

        this.carouselImages = success && Array.isArray(bannerData)
          ? bannerData
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(item => ({
              id: item.id,
              mediaUrl: item.mediaUrl,
              caption: item.caption,
              timestamp: item.timestamp,
              username: item.username,
              permalink: item.permalink
            }))
          : [];

        this.$nextTick(() => {
          this.carouselKey += 1;
        });
      } catch (error) {
        console.error('Error fetching banner data:', error);
        this.carouselImages = [];
      } finally {
        this.loadingBanners = false;
      }
    },

    openBannerDetail(banner) {
      this.selectedBanner = banner;
      this.showBannerModal = true;
    },

    closeBannerModal() {
      this.showBannerModal = false;
      this.selectedBanner = null;
    },

    truncateCaption(caption, maxLength = 100) {
      if (!caption) return '';
      return caption.length > maxLength
        ? caption.substring(0, maxLength) + '...'
        : caption;
    },

    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },

    formatDateTime(timestamp) {
      if (!timestamp) return '-';
      return moment(timestamp).format("DD MMM YYYY, HH:mm");
    },

    getImageUrl(url) {
      if (!url) return '';
      const api = process.env.VUE_APP_PERTAGAS;
      return api + url;
    },

    onImageLoad(event) {
      console.log('Image loaded successfully');
    },

    onImageError(event) {
      console.error('Failed to load image:', event.target.src);
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

.news-slide-fullsize {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

.news-image-fullsize {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
  display: block;
}

.news-slide-fullsize:hover .news-image-fullsize {
  transform: scale(1.02);
}

.banner-caption-fullsize {
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

.banner-modal-dialog {
  overflow: hidden;
}

.banner-modal-card {
  overflow: hidden;
  max-width: 100%;
}

.banner-modal-image-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.banner-modal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.banner-modal-caption {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: #666;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.banner-modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #f0f0f0;
}

.banner-modal-meta {
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
  .banner-modal-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .banner-modal-actions .v-spacer {
    display: none;
  }

  .banner-modal-actions .v-btn {
    align-self: flex-end;
  }
}

@media (max-width: 85.375rem) {
  .banner-caption-fullsize {
    padding: 2.1875rem 1.25rem 1.125rem;
  }
}

@media (max-width: 48rem) {
  .banner-caption-fullsize {
    padding: 1.25rem 1rem .75rem;
  }

  .text-subtitle-1 {
    font-size: .875rem !important;
  }
}

@media (max-width: 30rem) {
  .banner-caption-fullsize {
    padding: .9375rem .75rem .625rem;
  }
}
</style>