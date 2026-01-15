<template>
  <div style="margin-top: -80px">
    <div class="scaled">
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="pa-4 news-header">
              <v-row align="center" no-gutters>
                <v-icon class="mr-2" color="black" size="24">
                  {{ currentView === 'news' ? mdiNewspaper :
                    currentView === 'instagram' ? mdiInstagram : mdiBullhorn }}
                </v-icon>
                <div class="text-h6 font-weight-bold">
                  {{ currentView === 'news' ? 'News' :
                    currentView === 'instagram' ? 'Instagram' : 'Broadcast' }}
                </div>
                <v-spacer></v-spacer>

                <div class="view-tabs">
                  <v-btn icon @click="setView('news')" class="tab-btn"
                    :color="currentView === 'news' ? 'primary' : 'grey'" small>
                    <v-icon size="20">{{ mdiNewspaper }}</v-icon>
                  </v-btn>
                  <v-btn icon @click="setView('announcement')" class="tab-btn"
                    :color="currentView === 'announcement' ? 'primary' : 'grey'" small>
                    <v-icon size="20">{{ mdiBullhorn }}</v-icon>
                  </v-btn>
                  <v-btn icon @click="setView('instagram')" class="tab-btn"
                    :color="currentView === 'instagram' ? 'primary' : 'grey'" small>
                    <v-icon size="20">{{ mdiInstagram }}</v-icon>
                  </v-btn>
                </div>
              </v-row>
            </v-card-title>

            <v-card-text class="carousel-container">
              <transition name="view-transition" mode="out-in">
                <News v-if="currentView === 'news'" key="news" />
              </transition>

              <transition name="view-transition" mode="out-in">
                <Instagram v-if="currentView === 'instagram'" key="instagram" />
              </transition>

              <transition name="view-transition" mode="out-in">
                <Announcement v-if="currentView === 'announcement'" key="announcement" />
              </transition>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <EventCalendar @event-detail="handleEventDetail" />
        </v-col>
      </v-row>

      <EventModal :open="openModalEvent" :datas="dataEvent" @clicked="closeModalEvent"></EventModal>
    </div>
  </div>
</template>

<script>
import EventModal from "./component/EventModal.vue";
import EventCalendar from "./component/EventCalendar.vue";
import News from "./component/News.vue";
import Instagram from "./component/Instagram.vue";
import Announcement from "./component/Announcement.vue";

import {
  mdiNewspaper,
  mdiInstagram,
  mdiBullhorn
} from '@mdi/js';

export default {
  components: {
    EventModal,
    EventCalendar,
    News,
    Instagram,
    Announcement
  },
  data() {
    return {
      mdiNewspaper,
      mdiInstagram,
      mdiBullhorn,
      currentView: 'news',
      openModalEvent: false,
      dataEvent: {}
    };
  },
  methods: {
    setView(view) {
      this.currentView = view;
    },

    handleEventDetail(event) {
      this.dataEvent = event;
      this.openModalEvent = true;
    },

    closeModalEvent() {
      this.openModalEvent = false;
      this.dataEvent = {};
    }
  }
};
</script>

<style scoped>
.scaled {
  zoom: 1;
}

.news-header {
  background: white;
  margin-bottom: 0;
}

.view-transition-enter-active,
.view-transition-leave-active {
  transition: all 0.3s ease;
}

.view-transition-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.view-transition-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.view-tabs {
  display: flex;
  gap: 8px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.tab-btn {
  transition: all 0.3s ease;
  border-radius: 6px !important;
}

.tab-btn:hover {
  transform: scale(1.05);
  background-color: #e3f2fd !important;
}

.tab-btn .v-btn__content {
  opacity: 0.7;
}

.tab-btn.primary--text .v-btn__content {
  opacity: 1;
}

.carousel-container {
  min-height: 400px;
  background-color: #f5f5f5;
  padding: 0 !important;
}

@media (max-width: 768px) {
  .view-tabs {
    gap: 4px;
    padding: 2px;
  }

  .tab-btn {
    min-width: 32px !important;
    width: 32px !important;
    height: 32px !important;
  }
}
</style>