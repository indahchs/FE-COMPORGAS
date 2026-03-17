<template>
  <div style="margin-top: -80px">
    <v-row>
      <v-col cols="12">
        <v-card class="pa-6">
          <v-row class="pb-2">
            <v-col cols="12" sm="6" md="4" lg="3">
              <div>
                <v-row class="ml-1 mt-2" align="center">
                  <img class="mr-1" src="../../assets/images/icons/icon_calendar_arrow_right.png" />
                  <div style="
                      font-size: 15px;
                      line-height: 22px;
                      font-weight: 600;
                      color: #101010;
                    ">
                    Upcoming Events
                  </div>
                </v-row>
                <v-row class="mt-4">
                  <v-col cols="12">
                    <div style="
                        font-size: 13px;
                        line-height: 18px;
                        font-weight: 400;
                        color: #9a9a9a;
                      ">
                      Don't miss these scheduled events
                    </div>
                  </v-col>
                </v-row>
                <v-row class="mt-2">
                  <v-col cols="12">
                    <div class="events-container">
                      <v-card v-for="(event, index) in eventData.slice(0, 8)" :key="index" class="pa-0 mb-2 event-card"
                      depressed elevation="0" :style="{ borderLeft: '4px solid ' + event.categoryEventColor }">
                        <v-row align="center" class="pa-0 ma-0" no-gutters>
                          <v-col cols="3" class="date-section">
                            <div :style="{ backgroundColor: event.categoryEventColor }" class="date-container">
                              <div class="date-number">
                                {{ getDate(event.eventDate) }}
                              </div>
                              <div class="date-month">
                                {{ getMonth(event.eventDate) }}
                              </div>
                            </div>
                          </v-col>
                          <v-col cols="9" class="content-section">
                            <div class="event-content">
                              <div class="event-title">
                                {{ event.name }}
                              </div>
                              <div class="event-details">
                                <div class="detail-item">
                                  <img class="detail-icon" src="../../assets/images/icons/icon_calendar_event.png" />
                                  <span class="detail-text">{{ event.startTime }}</span>
                                </div>
                                <div class="detail-item">
                                  <img class="detail-icon" src="../../assets/images/icons/icon_location_pin.png" />
                                  <span class="detail-text location-text">{{ event.location }}</span>
                                </div>
                              </div>
                            </div>
                          </v-col>
                        </v-row>
                      </v-card>
                      <div v-if="eventData.length > 5" class="text-center mt-2">
                        <v-btn small text color="primary" @click="listEvent">
                          View all events ({{ eventData.length }})
                        </v-btn>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="9">
              <div class="px-4">
                <v-row>
                  <v-col cols="12" class="pa-0">
                    <v-carousel v-if="dataImg.length > 0" cycle height="350" hide-delimiter-background
                      show-arrows-on-hover class="stretched-carousel">
                      <v-carousel-item v-for="(slide, i) in dataImg.slice(0, 3)" :key="i">
                        <img class="carousel-image" :src="baseUrl + slide" />
                      </v-carousel-item>
                    </v-carousel>
                    <v-col v-else
                      style="text-align: center; padding: 5%; height: 350px; display: flex; align-items: center; justify-content: center;"
                      cols="12">
                      <div>
                        <v-icon size="60">{{ icons.mdiCameraOff }}</v-icon><br />
                        <span>No Image</span>
                      </div>
                    </v-col>
                  </v-col>
                </v-row>
                <v-row class="mt-6 mb-4" align="center">
                  <img class="mr-1" src="../../assets/images/icons/icon_calendar_event.svg" />
                  <v-col>
                    <div style="
                        font-size: 15px;
                        line-height: 22px;
                        font-weight: 600;
                        color: #101010;
                      ">
                      Events
                    </div>
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-btn small depressed class="btn-blue mr-2" @click="openForm(null)">CREATE EVENT</v-btn>
                  <v-btn small depressed outlined class="btn-white" @click="listEvent">
                    {{ !isSecre ? "MY REQUESTS" : "APPROVALS" }}
                    <v-icon small>{{ icons.mdiChevronRight }}</v-icon>
                  </v-btn>
                </v-row>
                <v-row>
                  <full-calendar ref="fullCalendar" @event-selected="handleEventSelected"
                    :event-class-names="eventClassNames" :config="compactConfig" :events="events" />
                </v-row>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <EventFormModal :open="openModal" @clicked="closeModal"></EventFormModal>
    <EventCancelModalVue :open="openModalCancel" :datas="datas" @clicked="closeModalCancel"></EventCancelModalVue>
  </div>
</template>

<script>
import { mdiChevronRight, mdiCameraOff } from "@mdi/js";
import moment from "moment";
import EventFormModal from "./components/EventFormModal.vue";
import EventCancelModalVue from "./components/EventCancelModal.vue";
import EventServices from "../../services/events/eventsServices";

const getEvent = EventServices.build();

export default {
  components: { EventFormModal, EventCancelModalVue },

  data() {
    return {
      openModalCancel: false,
      datas: {},
      dataImg: [],
      icons: { mdiChevronRight, mdiCameraOff },
      eventId: null,
      openModal: false,
      eventBanner: "",
      baseUrl: process.env.VUE_APP_PERTAGAS,
      events: [],
      isSecre: false,
      config: {
        selectable: true,
        defaultView: "month",
        disableDragging: true,
        editable: false,
        height: 450,
        header: {
          left: "title",
          center: "",
          right: "prev,next",
        },
        eventRender: function (event, element) { }
      },
      eventData: []
    };
  },

  computed: {
    compactConfig() {
      return {
        ...this.config,
        height: 450
      };
    }
  },

  created() {
    this.getEvent();
    this.getEventUpComing();
  },

  methods: {
    async getEventUpComing() {
      try {
        const res = await getEvent.getEventsUpcoming();
        const data = res.data.data;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = data
          .filter(event => {
            const eventDate = new Date(event.eventDate);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() >= today.getTime();
          })
          .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
          .slice(0, 10);

        const imageUrls = upcomingEvents
          .map(event => event.imageUrl)
          .filter(url => url !== null);

        this.dataImg = imageUrls;
        this.eventData = upcomingEvents;
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
      }
    },

    handleEventSelected(info) {
      if (info.isHoliday === undefined) {
        this.datas = info;
        this.openModalCancel = true;
      }
    },

    eventClassNames({ event }) { },

    listEvent() {
      this.$router.push({ name: "events-request" });
    },

    getDate(date) {
      return moment(date).format("DD");
    },

    getMonth(date) {
      return moment(date).format("MMM");
    },

    getTime(time) {
      return moment(time).format("hh:mm");
    },

    async getEvent() {
      try {
        const role = JSON.parse(localStorage.getItem("dataUser"));
        this.isSecre = role.roleId === "SEKRETARIS";

        const res = await getEvent.getEvents();
        const events = res.data.data.event;
        const holidays = res.data.data.holiday;

        const processedEvents = events.map(event => ({
          ...event,
          title: event.name,
          start: moment(event.eventDate).format("YYYY-MM-DD"),
          textColor: "white",
          color: event.categoryEventColor
        }));

        const processedHolidays = holidays.map(holiday => ({
          ...holiday,
          title: holiday.name,
          start: moment(holiday.theDate).format("YYYY-MM-DD"),
          textColor: "white",
          color: "red",
          isHoliday: true
        }));

        this.events = [...processedEvents, ...processedHolidays];
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    },

    openForm(id) {
      this.openModal = true;
    },

    closeModal() {
      this.openModal = false;
      this.refreshData();
    },

    closeModalCancel() {
      this.openModalCancel = false;
      this.refreshData();
    },

    refreshData() {
      this.datas = {};
      this.eventData = [];
      this.events = [];
      this.eventBanner = "";
      this.getEvent();
      this.getEventUpComing();
    }
  }
};
</script>

<style scoped>
.stretched-carousel {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 350px;
  object-fit: fill;
  display: block;
}

::v-deep .stretched-carousel .v-carousel__item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.events-container {
  max-height: none;
  overflow: visible;
}

.event-card {
  border: 1px solid #dfdfdf;
  border-radius: 6px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.event-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.date-section {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-container {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  padding: 12px;
  text-align: center;
  width: 100%;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 3px;
  border-radius: 4px;
}

.date-number {
  font-size: 22px;
  line-height: 26px;
  font-weight: 600;
  color: #ffffff;
}

.date-month {
  font-size: 11px;
  line-height: 14px;
  font-weight: 400;
  color: #ffffff;
  margin-top: 2px;
}

.content-section {
  min-height: 60px;
  display: flex;
  align-items: center;
}

.event-content {
  padding: 8px 12px;
  width: 100%;
}

.event-title {
  font-size: 14px;
  line-height: 18px;
  font-weight: 600;
  color: #000000ff;
  margin-bottom: 6px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-item {
  display: flex;
  align-items: center;
  min-height: 16px;
}

.detail-icon {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  flex-shrink: 0;
}

.detail-text {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: #030303ff;
}

.location-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: calc(100% - 20px);
}

@media (max-width: 600px) {
  .date-number {
    font-size: 20px;
    line-height: 24px;
  }

  .date-month {
    font-size: 10px;
  }

  .event-title {
    font-size: 13px;
  }

  .detail-text {
    font-size: 11px;
  }

  .events-container {
    max-height: none;
    overflow: visible;
  }
}

.btn-blue {
  background-color: rgb(1, 114, 185) !important;
  color: white;
  text-transform: none;
  font-size: 12px;
}

.btn-white {
  color: rgb(1, 114, 185) !important;
  text-transform: none;
  font-size: 12px;
}

::v-deep .fc-view-container {
  height: auto !important;
}

::v-deep .fc-scroller {
  height: auto !important;
  overflow: visible !important;
}

::v-deep .fc-day-grid {
  height: auto !important;
}

::v-deep .fc-row {
  min-height: 50px !important;
}

::v-deep .fc-content-skeleton table {
  height: auto !important;
}

::v-deep .fc-body {
  overflow: visible !important;
}

::v-deep .fc-month-view .fc-scroller {
  overflow: visible !important;
}

::v-deep .v-application a {
  color: #ffffff !important;
}

::v-deep fc-event .fc-content {
  color: #ffffff !important;
}

::v-deep fc-title {
  color: #ffffff !important;
}

::v-deep .v-data-table>.v-data-table__wrapper>table>tbody>tr>th,
.v-data-table>.v-data-table__wrapper>table>thead>tr>th,
.v-data-table>.v-data-table__wrapper>table>tfoot>tr>th {
  font-size: 14px !important;
}

::v-deep .fc-sat {
  color: red !important;
  background-color: #fff8f8 !important;
  border-color: #ddd !important;
}

::v-deep .fc-sun {
  background-color: #fff8f8 !important;
  border-color: #ddd !important;
  color: red !important;
}

::v-deep .fc-day .fc-widget-content .fc-sun .fc-past {
  background-color: red !important;
}

::v-deep .fc-unthemed .fc-content,
.fc-unthemed .fc-divider,
.fc-unthemed .fc-list-heading td,
.fc-unthemed .fc-list-view,
.fc-unthemed .fc-popover,
.fc-unthemed .fc-row,
.fc-unthemed tbody,
.fc-unthemed td,
.fc-unthemed th,
.fc-unthemed thead {
  border-color: #ddd !important;
}
</style>