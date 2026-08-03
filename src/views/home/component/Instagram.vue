<template>
  <div class="instagram-container">
    <div v-if="loadingInstagram" class="d-flex justify-center align-center text-center loading-container">
      <div>
        <v-progress-circular color="primary" indeterminate size="40"></v-progress-circular>
        <p class="text-body-2 grey--text mt-3">Memuat konten Instagram...</p>
      </div>
    </div>

    <div v-else-if="instagramContent.length > 0" class="instagram-carousel-wrapper">
      <button v-if="canScrollLeft" @click="scrollLeft" class="carousel-nav carousel-nav-left"
        :class="{ 'nav-visible': canScrollLeft }">
        <v-icon color="white">{{ mdiChevronLeft }}</v-icon>
      </button>

      <button v-if="canScrollRight" @click="scrollRight" class="carousel-nav carousel-nav-right"
        :class="{ 'nav-visible': canScrollRight }">
        <v-icon color="white">{{ mdiChevronRight }}</v-icon>
      </button>

      <div ref="carouselContainer" class="instagram-carousel" @scroll="handleScroll">
        <div class="carousel-track" :style="{ width: trackWidth + 'px' }">
          <div v-for="(post, index) in instagramContent" :key="`ig-${post.id}`" class="instagram-post"
            @click="openInstagramDetail(post)">
            <div class="instagram-image-container">
              <img :src="getImageUrl(post)" :alt="post.caption || 'Instagram post'" class="instagram-image"
                @error="(e) => onImageError(e, post)" loading="lazy" />

              <div v-if="post.mediaType === 'VIDEO'" class="video-overlay">
                <v-icon color="white" size="48">mdi-play-circle</v-icon>
              </div>

              <div v-if="post.mediaType === 'CAROUSEL_ALBUM'" class="carousel-indicator">
                <v-icon color="white" size="20">mdi-image-multiple</v-icon>
              </div>
            </div>
            <div class="instagram-caption">
              <p class="text-body-2 mb-1">{{ truncateCaption(post.caption, 80) }}</p>
              <small class="grey--text">{{ formatInstagramDate(post.timestamp) }}</small>
            </div>
          </div>
        </div>
      </div>

      <div class="carousel-dots" v-if="instagramContent.length > visibleItems">
        <button v-for="(dot, index) in totalPages" :key="index" @click="goToPage(index)" class="dot"
          :class="{ active: currentPage === index }"></button>
      </div>
    </div>

    <div v-else class="d-flex justify-center align-center text-center empty-container">
      <div>
        <v-icon class="mr-1" color="grey" size="24">{{ mdiInstagram }}</v-icon>
        <p class="text-h6 grey--text mt-3">Tidak ada konten Instagram tersedia</p>
      </div>
    </div>

    <v-dialog v-model="showInstagramModal" max-width="800px" content-class="instagram-modal">
      <v-card v-if="selectedInstagramPost" class="instagram-modal-card">
        <v-card-text class="pa-0 modal-content">
          <div class="modal-image-wrapper">
            <video v-if="selectedInstagramPost.mediaType === 'VIDEO'" :src="getVideoUrl(selectedInstagramPost)"
              class="modal-video" controls playsinline @error="onVideoError">
              <source :src="getVideoUrl(selectedInstagramPost)" type="video/mp4">
              Browser Anda tidak mendukung video player.
            </video>

            <img v-else :src="getImageUrl(selectedInstagramPost)"
              :alt="selectedInstagramPost.caption || 'Instagram post'" class="modal-image" />
          </div>
          <div class="modal-info pa-4">
            <div class="instagram-modal-header mb-2">
              <div class="d-flex align-center">
                <v-avatar size="32" class="mr-3">
                  <v-icon>{{ mdiAccount }}</v-icon>
                </v-avatar>
                <div>
                  <p class="font-weight-bold mb-0">{{ selectedInstagramPost.username || 'Username' }}</p>
                  <small class="grey--text">{{ formatInstagramDate(selectedInstagramPost.timestamp) }}</small>
                </div>
              </div>
            </div>
            <p class="instagram-modal-caption mb-2">{{ selectedInstagramPost.caption }}</p>
            <div class="d-flex justify-space-between align-center mt-3">
              <v-btn v-if="selectedInstagramPost.permalink" :href="selectedInstagramPost.permalink" target="_blank"
                color="grey" text small>
                Lihat di Instagram
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="closeInstagramModal" small>Close</v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BannerService from "@/services/banner-services/BannerService.js";
import moment from "moment";
import { mdiInstagram, mdiAccount, mdiChevronLeft, mdiChevronRight } from '@mdi/js';

const serviceBanner = BannerService.build();

export default {
  name: 'InstagramComponent',
  data() {
    return {
      mdiInstagram,
      mdiAccount,
      mdiChevronLeft,
      mdiChevronRight,
      instagramContent: [],
      loadingInstagram: false,
      showInstagramModal: false,
      selectedInstagramPost: null,
      currentPage: 0,
      visibleItems: 3,
      itemWidth: 340,
      canScrollLeft: false,
      canScrollRight: true,
      imageLoadErrors: new Set()
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.instagramContent.length / this.visibleItems);
    },
    trackWidth() {
      return this.instagramContent.length * this.itemWidth;
    },
    fallbackImages() {
      try {
        return [
          require('@/assets/images/ig/IG-1.jpg'),
          require('@/assets/images/ig/IG-2.jpg'),
          require('@/assets/images/ig/IG-3.jpg')
        ];
      } catch (error) {
        console.error('Failed to load fallback images:', error);
        return [];
      }
    }
  },
  async mounted() {
    await this.fetchInstagramData();
    this.updateVisibleItems();
    window.addEventListener('resize', this.updateVisibleItems);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateVisibleItems);
  },
  methods: {
    async fetchInstagramData() {
      try {
        this.loadingInstagram = true;
        const response = await serviceBanner.getBannerHome(false, {});

        const { success, data: instagramData } = response.data;

        this.instagramContent = success && Array.isArray(instagramData)
          ? instagramData
            .filter(item => !item.disabled)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((item, index) => {
              const fallbackIndex = index % this.fallbackImages.length;
              return {
                id: item.id,
                mediaUrl: item.mediaUrl,
                mediaType: item.mediaType,
                caption: item.caption,
                timestamp: item.timestamp,
                username: item.username,
                permalink: item.permalink,
                thumbnailUrl: item.thumbnailUrl,
                fallbackIndex: fallbackIndex,
                loadError: false
              };
            })
          : [];

        this.$nextTick(() => {
          this.updateScrollButtons();
        });
      } catch (error) {
        console.error('Error fetching Instagram data:', error);
        this.instagramContent = [];
      } finally {
        this.loadingInstagram = false;
      }
    },

    updateVisibleItems() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 480) {
        this.visibleItems = 1;
        this.itemWidth = screenWidth - 40;
      } else if (screenWidth < 768) {
        this.visibleItems = 2;
        this.itemWidth = 300;
      } else {
        this.visibleItems = 3;
        this.itemWidth = 340;
      }
      this.$nextTick(() => {
        this.updateScrollButtons();
      });
    },

    scrollLeft() {
      const container = this.$refs.carouselContainer;
      const scrollAmount = this.itemWidth * this.visibleItems;
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    },

    scrollRight() {
      const container = this.$refs.carouselContainer;
      const scrollAmount = this.itemWidth * this.visibleItems;
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    },

    goToPage(pageIndex) {
      const container = this.$refs.carouselContainer;
      const scrollAmount = pageIndex * this.itemWidth * this.visibleItems;
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
      this.currentPage = pageIndex;
    },

    handleScroll() {
      this.updateScrollButtons();
      this.updateCurrentPage();
    },

    updateScrollButtons() {
      const container = this.$refs.carouselContainer;
      if (!container) return;

      this.canScrollLeft = container.scrollLeft > 0;
      this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 1);
    },

    updateCurrentPage() {
      const container = this.$refs.carouselContainer;
      if (!container) return;

      const scrollLeft = container.scrollLeft;
      const pageWidth = this.itemWidth * this.visibleItems;
      this.currentPage = Math.round(scrollLeft / pageWidth);
    },

    openInstagramDetail(post) {
      this.selectedInstagramPost = post;
      this.showInstagramModal = true;
    },

    closeInstagramModal() {
      this.showInstagramModal = false;

      if (this.selectedInstagramPost && this.selectedInstagramPost.mediaType === 'VIDEO') {
        this.$nextTick(() => {
          const videoElements = document.querySelectorAll('.modal-video');
          videoElements.forEach(video => {
            if (!video.paused) {
              video.pause();
            }
          });
        });
      }

      this.selectedInstagramPost = null;
    },

    truncateCaption(caption, maxLength = 100) {
      if (!caption) return '';
      return caption.length > maxLength
        ? caption.substring(0, maxLength) + '...'
        : caption;
    },

    formatInstagramDate(timestamp) {
      if (!timestamp) return '';
      return moment(timestamp).fromNow();
    },

    getImageUrl(post) {
      if (!post) return '';

      if (post.loadError && this.fallbackImages.length > 0) {
        return this.fallbackImages[post.fallbackIndex];
      }

      if (post.mediaType === 'VIDEO' && post.thumbnailUrl) {
        return post.thumbnailUrl;
      }

      if (post.mediaType === 'CAROUSEL_ALBUM' && post.mediaUrl) {
        return post.mediaUrl;
      }

      if (post.mediaUrl) {
        if (post.mediaUrl.startsWith('http://') || post.mediaUrl.startsWith('https://')) {
          return post.mediaUrl;
        }
        const api = process.env.VUE_APP_PERTAGAS || '';
        return api + post.mediaUrl;
      }

      if (this.fallbackImages.length > 0) {
        return this.fallbackImages[post.fallbackIndex];
      }

      return '';
    },

    getVideoUrl(post) {
      if (!post || post.mediaType !== 'VIDEO') return '';

      if (post.mediaUrl && (post.mediaUrl.startsWith('http://') || post.mediaUrl.startsWith('https://'))) {
        return post.mediaUrl;
      }

      const api = process.env.VUE_APP_PERTAGAS || '';
      return api + (post.mediaUrl || '');
    },

    onImageError(event, post) {
      const imageUrl = event.target.src;

      if (this.imageLoadErrors.has(post.id)) {
        console.error('Failed to load fallback image for post:', post.id);
        return;
      }

      console.warn('Failed to load Instagram image:', imageUrl);

      post.loadError = true;
      this.imageLoadErrors.add(post.id);

      if (this.fallbackImages.length > 0) {
        event.target.src = this.fallbackImages[post.fallbackIndex];
      }

      event.target.onerror = null;
    },

    onVideoError(event) {
      console.error('Failed to load video:', event.target.src);
    }
  }
};
</script>

<style scoped>
.instagram-container {
  padding: 20px;
  min-height: 400px;
}

.loading-container,
.empty-container {
  min-height: 350px;
}

.instagram-carousel-wrapper {
  position: relative;
  max-width: 100%;
}

.instagram-carousel {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 10px 0;
}

.instagram-carousel::-webkit-scrollbar {
  display: none;
}

.carousel-track {
  display: flex;
  gap: 20px;
  padding: 0 10px;
}

.instagram-post {
  flex: 0 0 320px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.instagram-post:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.instagram-image-container {
  position: relative;
  width: 100%;
  height: 25rem;
  overflow: hidden;
  background: #f0f0f0;
}

.instagram-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.instagram-post:hover .instagram-image {
  transform: scale(1.05);
}

.video-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.instagram-post:hover .video-overlay {
  opacity: 1;
}

.carousel-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.instagram-caption {
  padding: 15px;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  opacity: 0;
}

.carousel-nav.nav-visible {
  opacity: 1;
}

.carousel-nav:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.carousel-nav-left {
  left: -20px;
}

.carousel-nav-right {
  right: -20px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: #ddd;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
}

.dot.active {
  background: #1976d2;
  transform: scale(1.3);
}

.dot:hover {
  background: #1976d2;
}

.instagram-modal-caption {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.instagram-modal-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.instagram-modal-card {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-content {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.modal-image-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  max-height: 65vh;
  overflow: hidden;
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 65vh;
}

.modal-video {
  width: 100%;
  height: 100%;
  max-height: 65vh;
  object-fit: contain;
  background: #000;
}

.modal-info {
  flex-shrink: 0;
  max-height: 25vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .instagram-container {
    padding: 15px;
  }

  .instagram-post {
    flex: 0 0 240px;
  }

  .carousel-nav-left {
    left: -15px;
  }

  .carousel-nav-right {
    right: -15px;
  }

  .instagram-image-container {
    height: 20rem;
  }
}

@media (max-width: 480px) {
  .instagram-post {
    flex: 0 0 calc(100vw - 80px);
  }

  .instagram-image-container {
    height: 18rem;
  }

  .instagram-caption {
    padding: 10px;
  }

  .carousel-nav {
    width: 35px;
    height: 35px;
  }

  .carousel-nav-left {
    left: -10px;
  }

  .carousel-nav-right {
    right: -10px;
  }

  .carousel-track {
    gap: 15px;
    padding: 0 5px;
  }
}

@media (min-width: 769px) {
  .instagram-carousel-wrapper:hover .carousel-nav.nav-visible {
    opacity: 1;
  }
}
</style>