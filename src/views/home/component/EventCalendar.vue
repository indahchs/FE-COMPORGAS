<template>
  <v-card class="event-calendar-card">
    <v-card-title class="pa-4 calendar-header-fixed" style="background: white">
      <div class="calendar-title-row">
        <div class="calendar-title-text text-h5 font-weight-bold primary--text">
          {{ currentMonthYear }}
        </div>

        <div class="calendar-title-select">
          <v-select v-model="selectedArea" :items="areaOptions" item-text="text" item-value="value" dense outlined
            hide-details class="area-select-fixed-new" :prepend-inner-icon="mdiMapMarker" :loading="isLoadingDivisions"
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
                    <span class="text-caption">Memuat divisi...</span>
                  </div>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
            </template>

            <template v-slot:no-data v-if="!isLoadingDivisions && areaOptions.length <= 1">
              <v-list-item>
                <v-list-item-content>
                  <span class="text-caption grey--text">Tidak ada divisi tersedia</span>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-select>
        </div>
      </div>
    </v-card-title>

    <div class="pa-2 d-flex justify-space-between align-center" style="background-color: #f5f5f5">
      <v-btn icon small @click="previousMonth">
        <v-icon size="20">{{ mdiChevronLeft }}</v-icon>
      </v-btn>
      <v-btn text small @click="goToToday">Today</v-btn>
      <v-btn icon small @click="nextMonth">
        <v-icon size="20">{{ mdiChevronRight }}</v-icon>
      </v-btn>
    </div>

    <div class="calendar-container" style="flex: 1; overflow: hidden">
      <div class="calendar-header d-flex">
        <div v-for="day in dayHeaders" :key="day" class="calendar-day-header text-center pa-1"
          style="flex: 1; font-size: 12px; font-weight: 600; color: #666">
          {{ day }}
        </div>
      </div>

      <div class="calendar-body" style="flex: 1; overflow-y: auto">
        <div v-for="week in calendarWeeks" :key="week.id" class="d-flex" style="height: 3.2rem">
          <div v-for="day in week.days" :key="day.date" class="calendar-day position-relative"
            style="flex: 1; border: 1px solid #e0e0e0; cursor: pointer" :class="{
              'calendar-day-today': day.isToday,
              'calendar-day-other-month': day.isOtherMonth,
              'calendar-day-has-event': day.hasEvent,
              'calendar-day-selected': day.isSelected
            }" @click="selectDateAndShowEvents(day)">
            <div class="pa-1">
              <div class="text-caption text-center" :class="day.isOtherMonth ? 'grey--text text--lighten-2' : ''">
                {{ day.day }}
              </div>
              <div v-if="day.hasEvent" class="event-indicator primary"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="upcoming-events-blue-section">
      <div class="text-center mb-4">
        <h2 class="upcoming-events-title" style="color: white !important;">Upcoming Event</h2>
      </div>

      <div v-if="isLoadingUpcomingEvents" class="text-center py-4">
        <v-progress-circular color="white" indeterminate size="24"></v-progress-circular>
        <div class="no-events-message mt-2">Memuat event...</div>
      </div>

      <div v-else-if="filteredUpcomingEvents.length > 0" class="upcoming-events-list">
        <div v-for="event in filteredUpcomingEvents" :key="event.id" class="upcoming-event-item"
          @click="detailEvent(event)">

          <div class="event-date-box" :style="{ background: event.categoryEventColorBg }">
            <div class="event-date-number">
              {{ getEventDay(event.eventDate) }}
            </div>
            <div class="event-date-month">
              {{ getEventMonth(event.eventDate).toUpperCase() }}
            </div>
          </div>

          <div class="event-details-section">
            <div class="event-title">
              {{ event.name }}
            </div>
            <div class="event-info-line">
              <span class="info-label">Time</span>
              <span class="info-separator">:</span>
              <span class="info-value">{{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}</span>
            </div>
            <div class="event-info-line">
              <span class="info-label">Location</span>
              <span class="info-separator">:</span>
              <span class="info-value">{{ event.location }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-4">
        <div class="no-events-message">
          Tidak ada event mendatang di {{ selectedAreaText }}
        </div>
      </div>
    </div>

    <v-dialog v-model="showDateEventsModal" max-width="600px">
      <v-card>
        <v-card-title class="headline primary white--text">
          <v-icon class="mr-2" color="white" size="20">{{ mdiCalendar }}</v-icon>
          Events pada {{ formatSelectedDate }}
        </v-card-title>

        <v-card-text class="pa-4">
          <div v-if="selectedDateEvents.length > 0">
            <div v-for="event in selectedDateEvents" :key="event.id" class="event-card mb-3 pa-3 rounded"
              style="border: 1px solid #e0e0e0; cursor: pointer" @click="detailEventFromDate(event)">
              <div class="d-flex align-center">
                <v-chip :color="event.categoryEventColor" :text-color="getContrastColor(event.categoryEventColor)" small
                  class="mr-3">
                  {{ event.categoryEventName || event.category }}
                </v-chip>
                <div class="flex-grow-1">
                  <div class="text-subtitle-1 font-weight-bold">{{ event.name }}</div>
                  <div class="text-body-2 grey--text d-flex align-center flex-wrap">
                    <div class="d-flex align-center mr-3">
                      <v-icon class="mr-1" color="grey" size="14">{{ mdiClock }}</v-icon>
                      {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
                    </div>
                    <div class="d-flex align-center">
                      <v-icon class="mr-1" color="grey" size="14">{{ mdiMapMarker }}</v-icon>
                      {{ event.location }}
                    </div>
                  </div>
                  <div class="text-body-2 mt-1">{{ event.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <v-icon color="grey" size="48">{{ mdiCalendarBlank }}</v-icon>
            <div class="text-h6 grey--text mt-3">Tidak ada event pada tanggal ini</div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showDateEventsModal = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import moment from "moment";
import EventService from "@/services/events/eventsServices";
import OfficeLocationService from "@/services/management/office/officeLocationServices";

import {
  mdiMapMarker,
  mdiChevronLeft,
  mdiChevronRight,
  mdiCalendar,
  mdiClock,
  mdiCalendarBlank
} from '@mdi/js';

const eventService = EventService.build();
const officeLocationService = OfficeLocationService.build();

export default {
  name: 'EventCalendar',
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      mdiMapMarker,
      mdiChevronLeft,
      mdiChevronRight,
      mdiCalendar,
      mdiClock,
      mdiCalendarBlank,
      currentDate: new Date(),
      selectedDate: null,
      selectedArea: 'all',
      areaOptions: [
        { text: 'Semua Area', value: 'all', id: null }
      ],
      dayHeaders: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      showDateEventsModal: false,
      selectedDateEvents: [],
      selectedDateForModal: null,
      upcomingEventsFromApi: [],
      isLoadingUpcomingEvents: false,
      errorLoadingEvents: null,
      isLoadingDivisions: false,
      divisionsLoaded: false,
      calendarEvents: [],
      isLoadingCalendarEvents: false,
    };
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? 'dark' : 'light';
    },
    primaryColor() {
      return this.$vuetify.theme.themes[this.theme].primary;
    },
    currentMonthYear() {
      return moment(this.currentDate).format('MMMM YYYY');
    },
    calendarWeeks() {
      const startOfMonth = moment(this.currentDate).startOf('month');
      const endOfMonth = moment(this.currentDate).endOf('month');
      const startOfCalendar = startOfMonth.clone().startOf('week');
      const endOfCalendar = endOfMonth.clone().endOf('week');

      const weeks = [];
      let current = startOfCalendar.clone();
      let weekId = 0;

      while (current.isSameOrBefore(endOfCalendar)) {
        const week = { id: weekId++, days: [] };
        for (let i = 0; i < 7; i++) {
          const dayEvents = this.getEventsForDate(current);
          week.days.push({
            date: current.format('YYYY-MM-DD'),
            day: current.date(),
            isToday: current.isSame(moment(), 'day'),
            isOtherMonth: !current.isSame(this.currentDate, 'month'),
            isSelected: this.selectedDate && current.isSame(this.selectedDate, 'day'),
            hasEvent: dayEvents.length > 0,
            events: dayEvents
          });
          current.add(1, 'day');
        }
        weeks.push(week);
      }
      return weeks;
    },
    upcomingEvents() {
      const today = moment();
      return this.upcomingEventsFromApi
        .filter(event => moment(event.eventDate).isSameOrAfter(today, 'day'))
        .sort((a, b) => moment(a.eventDate).diff(moment(b.eventDate)));
    },
    filteredUpcomingEvents() {
      return this.upcomingEvents;
    },
    filteredEvents() {
      const allEvents = [...this.events, ...this.calendarEvents];

      if (this.selectedArea === 'all') {
        return allEvents;
      }

      return allEvents.filter(event => {
        const eventOfficeLocationId = event.officeLocationId;
        const selectedId = String(this.selectedArea);
        const eventId = eventOfficeLocationId ? String(eventOfficeLocationId) : null;

        return eventId === selectedId;
      });
    },
    selectedAreaText() {
      const area = this.areaOptions.find(opt => opt.value === this.selectedArea);
      return area ? area.text : 'Semua Area';
    },
    formatSelectedDate() {
      return this.selectedDateForModal ? moment(this.selectedDateForModal).format('DD MMMM YYYY') : '';
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
    },
    currentDate: {
      handler(newDate, oldDate) {
        if (newDate && (!oldDate ||
          moment(newDate).month() !== moment(oldDate).month() ||
          moment(newDate).year() !== moment(oldDate).year())) {
          this.fetchCalendarEvents();
        }
      },
      immediate: false
    }
  },
  created() {
    this.selectedDate = moment();
    this.fetchDivisions().then(() => {
      if (this.divisionsLoaded) {
        Promise.all([
          this.fetchCalendarEvents(),
          this.fetchUpcomingEvents()
        ]);
      }
    });
  },
  methods: {
    async handleAreaChange() {
      if (!this.areaOptions || this.areaOptions.length === 0) {
        return;
      }
      const selectedDivisionId = this.getSelectedDivisionId();

      await Promise.all([
        this.fetchCalendarEvents(null, null, selectedDivisionId),
        this.fetchUpcomingEvents(selectedDivisionId)
      ]);
    },

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
        this.$toast?.error?.('Gagal memuat data divisi');
      } finally {
        this.isLoadingDivisions = false;
      }
    },

    async fetchUpcomingEvents(divisionId = null) {
      this.isLoadingUpcomingEvents = true;
      this.errorLoadingEvents = null;

      try {
        const response = await eventService.getEventsUpcoming(divisionId);

        let events = [];

        if (response?.data?.success && response.data.data) {
          events = response.data.data;
        } else if (response?.data && Array.isArray(response.data)) {
          events = response.data;
        } else if (response && Array.isArray(response)) {
          events = response;
        }

        this.upcomingEventsFromApi = events.map(event => ({
          ...event,
          category: event.categoryEventName,
          area: this.mapEventToDivision(event)
        }));

      } catch (error) {
        this.upcomingEventsFromApi = [];
        this.$toast?.error?.('Gagal memuat event mendatang');
      } finally {
        this.isLoadingUpcomingEvents = false;
      }
    },

    async fetchCalendarEvents(month = null, year = null, divisionId = null) {
      this.isLoadingCalendarEvents = true;

      try {
        const currentMonth = month || moment(this.currentDate).month() + 1;
        const currentYear = year || moment(this.currentDate).year();

        const response = await eventService.getEventsHome(currentMonth, currentYear, divisionId);

        let events = [];

        if (response?.data?.success && response.data.data) {
          events = response.data.data;
        } else if (response?.data && Array.isArray(response.data)) {
          events = response.data;
        } else if (response && Array.isArray(response)) {
          events = response;
        }

        this.calendarEvents = events.map(event => ({
          ...event,
          category: event.categoryEventName,
          area: this.mapEventToDivision(event)
        }));

      } catch (error) {
        this.calendarEvents = [];
        console.error('Error fetching calendar events:', error);
        this.$toast?.error?.('Gagal memuat events calendar');
      } finally {
        this.isLoadingCalendarEvents = false;
      }
    },

    mapEventToDivision(event) {
      if (event.divisionName) {
        return event.divisionName.toLowerCase();
      }
      if (event.division) {
        return event.division.toLowerCase();
      }
      if (event.area) {
        return event.area.toLowerCase();
      }
      return 'all';
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

    async refreshUpcomingEvents() {
      const selectedDivisionId = this.getSelectedDivisionId();
      await this.fetchUpcomingEvents(selectedDivisionId);
    },

    async refreshDivisions() {
      this.divisionsLoaded = false;
      await this.fetchDivisions();
    },

    previousMonth() {
      this.currentDate = moment(this.currentDate).subtract(1, 'month').toDate();
    },

    nextMonth() {
      this.currentDate = moment(this.currentDate).add(1, 'month').toDate();
    },

    goToToday() {
      this.currentDate = new Date();
      this.selectedDate = moment();
    },

    selectDate(day) {
      this.selectedDate = moment(day.date);
    },

    selectDateAndShowEvents(day) {
      this.selectDate(day);
      const eventsForDate = this.getEventsForDate(moment(day.date));
      this.selectedDateEvents = eventsForDate;
      this.selectedDateForModal = day.date;
      this.showDateEventsModal = true;
    },

    getEventsForDate(date) {
      return this.filteredEvents.filter(event => moment(event.eventDate).isSame(date, 'day'));
    },

    detailEvent(item) {
      this.$emit('event-detail', item);
    },

    detailEventFromDate(event) {
      this.showDateEventsModal = false;
      this.detailEvent(event);
    },

    getEventDay(date) {
      return moment(date).format("DD");
    },

    getEventMonth(date) {
      return moment(date).format("MMM");
    },

    formatTime(timeString) {
      if (!timeString) return '';

      if (timeString.includes('WIB')) {
        return timeString;
      }

      return `${timeString} WIB`;
    },

    getContrastColor(hexColor) {
      if (!hexColor) return 'black';

      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? 'black' : 'white';
    },

    darkenColor(hex, amount) {
      if (!hex) return '#1976D2';

      const num = parseInt(hex.replace("#", ""), 16);
      const amt = Math.round(2.55 * amount);
      const R = (num >> 16) - amt;
      const G = (num >> 8 & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;

      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
  }
};
</script>

<style scoped>
.calendar-header-fixed {
  position: relative;
  z-index: 8;
}

.calendar-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  flex-wrap: nowrap;
}

.calendar-title-text {
  font-weight: 700;
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.primary-border-left {
  border-left: 4px solid var(--v-primary-base) !important;
}

.calendar-title-select {
  flex: 0 0 auto;
  width: 180px;
  min-width: 140px;
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

.event-calendar-card {
  display: flex;
  flex-direction: column;
}

.calendar-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.calendar-header {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.calendar-day-header {
  padding: 8px 4px;
  text-align: center;
  font-weight: 600;
  color: #666;
  font-size: 12px;
}

.calendar-body {
  flex: 1;
  overflow-y: auto;
}

.calendar-day {
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-height: 50px;
}

.calendar-day:hover {
  background-color: #f5f5f5;
}

.calendar-day-other-month {
  background-color: #fafafa;
}

.calendar-day-has-event {
  background-color: #CBDCEB;
}

.calendar-day-today {
  background-color: #e3f2fd !important;
  border: 2px solid #2196F3 !important;
  font-weight: bold;
}

.calendar-day-today .text-caption {
  color: #1976D2 !important;
  font-weight: bold;
}

.calendar-day-selected {
  background-color: #2196F3 !important;
  border: 2px solid #1976D2 !important;
  color: white !important;
}

.calendar-day-selected .text-caption {
  color: white !important;
  font-weight: bold;
}

.calendar-day-selected:hover {
  background-color: #1976D2 !important;
}

.event-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.event-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.upcoming-events-blue-section {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.upcoming-events-title {
  color: white !important;
  font-size: 22px;
  font-weight: bold;
  font-style: italic;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.upcoming-events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 160px;
  overflow-y: auto;
  padding-right: 4px;
}

.upcoming-events-list::-webkit-scrollbar {
  width: 6px;
}

.upcoming-events-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.upcoming-events-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.upcoming-events-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.upcoming-event-item {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
}

.upcoming-event-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.event-date-box {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  min-width: 48px;
  margin-right: 12px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
}

.event-date-number {
  font-size: 22px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 1px;
}

.event-date-month {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.event-details-section {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.2;
}

.event-info-line {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  font-size: 12px;
  line-height: 1.3;
}

.event-info-line:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: #666;
  min-width: 35px;
  flex-shrink: 0;
}

.info-separator {
  margin: 0 6px 0 2px;
  color: #666;
}

.info-value {
  color: #555;
  flex: 1;
}

.no-events-message {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

@media (max-width: 600px) {
  .calendar-title-select {
    width: 140px;
    min-width: 120px;
  }

  .text-truncate-new {
    max-width: 80px;
  }

  .calendar-title-text {
    font-size: 1.2rem !important;
  }

  .upcoming-events-title {
    font-size: 20px !important;
  }

  .upcoming-events-list {
    max-height: 160px;
  }

  .event-date-box {
    min-width: 44px;
    padding: 6px;
    margin-right: 10px;
  }

  .event-date-number {
    font-size: 20px;
  }

  .event-title {
    font-size: 13px;
  }

  .event-info-line {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .calendar-title-row {
    gap: 8px;
  }

  .calendar-title-select {
    width: 120px;
    min-width: 100px;
  }

  .text-truncate-new {
    max-width: 70px;
  }

  .calendar-title-text {
    font-size: 1.1rem !important;
  }

  .upcoming-events-title {
    font-size: 18px !important;
  }

  .upcoming-events-list {
    max-height: 160px;
  }

  .event-date-box {
    min-width: 40px;
    padding: 6px;
    margin-right: 8px;
  }

  .event-date-number {
    font-size: 18px;
  }

  .event-date-month {
    font-size: 9px;
  }

  .event-title {
    font-size: 12px;
  }

  .event-info-line {
    font-size: 10px;
  }

  .info-label {
    min-width: 30px;
  }
}

@media (max-width: 400px) {
  .calendar-title-select {
    width: 110px;
    min-width: 90px;
  }

  .text-truncate-new {
    max-width: 60px;
  }

  .calendar-title-text {
    font-size: 1rem !important;
  }
}
</style>