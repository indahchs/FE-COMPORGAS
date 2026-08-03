<template>
  <div style="margin-top: -80px">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-row align="center">
              <v-col cols="12" sm="6" md="4" lg="2">
                <v-row align="center">
                  <img class="mx-2 my-2" src="../../assets/images/icons/icon_people_group.png" />
                  <div style="
                      font-size: 16px;
                      line-height: 24px;
                      font-weight: 600;
                      color: #101010;
                    ">
                    Meeting
                  </div>
                </v-row>
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="4">
                <v-row>
                  <v-col>
                    <v-autocomplete hide-details dense v-model="officeId" :items="rooms" outlined
                      label="Office"></v-autocomplete>
                  </v-col>
                  <v-col>
                    <v-autocomplete hide-details dense v-model="roomId" :items="roomsId" outlined
                      label="Room"></v-autocomplete>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" sm="6" md="4" lg="6" class="text-right">
                <v-row justify="end">
                  <v-btn depressed class="btn-blue mx-2" @click="openModal">BOOK ROOM
                  </v-btn>
                  <v-btn depressed class="btn-white mx-2" @click="goToBooking">{{ isSupported ? "APPROVAL MEETING" : "MY
                    BOOKING"
                    }}<v-icon right>
                      {{ icons.mdiChevronRight }}
                    </v-icon></v-btn>
                </v-row>
              </v-col>
            </v-row>
          </v-card-title>
          <v-divider class="mx-4 mb-4"></v-divider>
          <v-card-text v-if="isData">
            <v-row align="center" justify="center">
              <v-col class="text-center">
                <v-btn depressed color="#F7F8FA" fab large dark @click="prevWeek">
                  <v-icon color="#606060">{{ icons.mdiChevronLeft }}</v-icon>
                </v-btn>
              </v-col>
              <v-col v-for="(d, index) in datesOfWeek" :key="index">
                <div class="text-center">
                  <div style="
                      font-size: 14px;
                      line-height: 20px;
                      font-weight: 400;
                      color: #9a9a9a;
                    ">
                    {{ d.toLocaleString("default", { month: "short" }) }}
                  </div>
                  <div style="font-size: 32px; line-height: 40px; font-weight: 600" v-bind:style="d.getDay() == 6 || d.getDay() == 0
                      ? 'color: #EC323F;'
                      : 'color: #101010;'
                    ">
                    {{ d.getDate() }}
                  </div>
                  <div style="
                      font-size: 14px;
                      line-height: 20px;
                      font-weight: 400;
                      text-transform: uppercase;
                    " v-bind:style="d.getDay() == 6 || d.getDay() == 0
                        ? 'color: #EC323F;'
                        : 'color: #ADC43B;'
                      ">
                    {{ d.toLocaleDateString("default", { weekday: "short" }) }}
                  </div>
                </div>
              </v-col>
              <v-col class="text-center">
                <v-btn depressed color="#F7F8FA" fab large dark @click="nextWeek">
                  <v-icon color="#606060">{{ icons.mdiChevronRight }}</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row class="pt-0">
              <v-col cols="12" class="pt-0">
                <div style="margin-left: 150px; margin-right: 150px">
                  <full-calendar :config="config" :events="events" @event-selected="eventSelected" ref="calendar" />
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog" width="1000px" persistent>
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col>
              <div style="
                  font-size: 18px;
                  line-height: 28px;
                  font-weight: 600;
                  color: #000000;
                ">
                Book Room
              </div>
            </v-col>
            <v-col class="text-right">
              <v-btn icon class="rounded-circle" @click="closeModal(1)">
                <v-icon color="black">
                  {{ icons.mdiClose }}
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <label class="required">Meeting Title</label>
              <v-text-field placeholder="Meeting Title" v-model.trim="$v.titleMeeting.$model"
                :error-messages="getErrors('titleMeeting', $v.titleMeeting)" @blur="$v.titleMeeting.$touch()"
                outlined></v-text-field>
            </v-col>
            <v-col cols="6">
              <label class="required">Department</label>
              <v-autocomplete v-model.trim="$v.department.$model"
                :error-messages="getErrors('department', $v.department)" @blur="$v.department.$touch()"
                :items="departmentItem" outlined placeholder="Department"></v-autocomplete>
            </v-col>
            <v-col style="margin-top: -25px" cols="6">
              <label class="required">Start Date</label>
              <date-picker :format="dateFormat" v-model.trim="$v.meetingDate.$model"
                :error-messages="getErrors('meetingDate', $v.meetingDate)" :style="isYear
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                  " :disabled-date="disabledBeforeTodayAndAfterAWeek" placeholder="Start Date"
                class="datetime-picker"></date-picker>
              <div class="mt-1" v-if="isYear" style="color: red; font-weight: 400; font-size: 12px">
                Start Date is required
              </div>
            </v-col>
            <v-col style="margin-top: -25px" cols="6">
              <label class="required">End Date</label>
              <date-picker :format="dateFormat" :disabled="isStartDate" v-model.trim="$v.meetingEndDate.$model"
                :error-messages="getErrors('meetingEndDate', $v.meetingEndDate)" :style="isYear1
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                  " :disabled-date="disabledFromStartDate" placeholder="End Date" class="datetime-picker"></date-picker>
              <div class="mt-1" v-if="isYear1" style="color: red; font-weight: 400; font-size: 12px">
                End Date is required
              </div>
            </v-col>
            <v-col cols="6">
              <label class="required">Start Time</label>
              <timepicker ref="timepicker" close-on-complete :hour-range="[[7, 18]]" :style="isStart
                  ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                  : ''
                " v-model.trim="$v.startTime.$model" :error-messages="getErrors('startTime', $v.startTime)"
                placeholder="Start Time"></timepicker>
              <div class="mt-1" v-if="isStart" style="color: red; font-weight: 400; font-size: 12px">
                Start Time is required
              </div>
            </v-col>
            <v-col cols="6">
              <label class="required">End Time</label>
              <timepicker ref="timepicker1" :disabled="isStartTime" close-on-complete :hour-range="[[hStart, hEnd]]"
                v-model.trim="$v.endTime.$model" :error-messages="getErrors('endTime', $v.endTime)" :style="isEnd || isEquals
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                  " placeholder="End Time"></timepicker>
              <div class="mt-1" v-if="isEnd" style="color: red; font-weight: 400; font-size: 12px">
                End Time is required
              </div>
              <div class="mt-1" v-if="isEquals" style="color: red; font-weight: 400; font-size: 12px">
                End Time must be greater than Start Time
              </div>
            </v-col>
            <v-col cols="6">
              <label class="required">Office Location</label>
              <v-autocomplete v-model.trim="$v.officeIdAdd.$model"
                :error-messages="getErrors('officeIdAdd', $v.officeIdAdd)" @blur="$v.officeIdAdd.$touch()"
                :items="rooms" outlined placeholder="Office Location"></v-autocomplete>
            </v-col>
            <v-col cols="6">
              <label class="required">Meeting Room</label>
              <v-autocomplete v-model.trim="$v.roomIdAdd.$model" :error-messages="getErrors('roomIdAdd', $v.roomIdAdd)"
                @blur="$v.roomIdAdd.$touch()" :items="roomsId" :disabled="isOffice" outlined
                placeholder="Meeting Room"></v-autocomplete>
            </v-col>
            <v-col class="position-col" cols="6">
              <label class="required">Description</label>
              <v-text-field placeholder="Description" v-model.trim="$v.desc.$model"
                :error-messages="getErrors('desc', $v.desc)" @blur="$v.desc.$touch()" outlined></v-text-field>
            </v-col>
            <v-col class="position-col" cols="6">
              <label>Capacity</label>
              <v-text-field disabled placeholder="Capacity" v-model="capacity" outlined></v-text-field>
            </v-col>
            <v-col cols="12">
              <ol>
                <li>
                  You are allowed to book a total of 3 working days to be auto
                  approved. If your booking exceeds 3 working days, please
                  contact General Support for approval.
                </li>
                <li>
                  You are allowed to book room under 14 calendar days of the
                  current date to be auto approved. If your booking exceeds the
                  rule, please contact General Support for approval.
                </li>
              </ol>
            </v-col>
            <v-col cols="12">
              <v-btn block depressed class="btn-blue" @click="submitBook">BOOK ROOM
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="isDetail" width="400px"><v-card>
        <v-card-title> Detail </v-card-title>
        <v-card-text>
          <h4>Judul Meeting</h4>
          <span>
            {{ titleDetail }}
          </span>
        </v-card-text>
        <v-card-text>
          <h4>Waktu Meeting</h4>
          <span>
            {{ timeDetail }}
          </span>
        </v-card-text>
        <v-card-text>
          <h4>Room Meeting</h4>
          <span>
            {{ roomDetail }}
          </span>
        </v-card-text>
      </v-card>
    </v-dialog>
    <detail-meeting-modal :open="openModalMeeting" :addDatas="dataMeeting"
      @clicked="closeModalMeeting"></detail-meeting-modal>
  </div>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import Swal from "sweetalert2";
import moment from "moment";
import { mdiChevronLeft, mdiChevronRight, mdiClose } from "@mdi/js";

import DatePicker from "vue2-datepicker";
import Timepicker from "vue2-timepicker";
import "vue2-datepicker/index.css";
import "vue2-timepicker/dist/VueTimepicker.css";
import DetailMeetingModal from "./component/DetailMeetingModal.vue";

import MeetingRoomService from "@/services/management/meeting_room/meetingRoomServices";
const getMeeting = MeetingRoomService.build();
export default {
  components: { DatePicker, Timepicker, DetailMeetingModal },
  data() {
    return {
      capacity: "",
      openModalMeeting: false,
      dataMeeting: {},
      isStartTime: true,
      isSupported: false,
      isYear: false,
      dateFormat: "DD-MM-YYYY",
      isStart: false,
      isStartDate: true,
      isEnd: false,
      titleDetail: "",
      timeDetail: "",
      roomDetail: "",
      desc: "",
      isDetail: false,
      open1: false,
      open2: false,
      officeId: null,
      isOffice: false,
      hStart: "",
      hEnd: "",
      department: "",
      departmentItem: [],
      currentStartDate: null,
      currentEndDate: null,
      datesOfWeek: [],

      titleMeeting: "",
      offices: [],
      roomId: null,
      rooms: [],
      startTime: null,
      endTime: null,
      officeIdAdd: "",
      roomIdAdd: "",
      meetingDate: null,
      meetingEndDate: null,
      isYear1: false,
      roomsId: [],
      isData: false,

      icons: {
        mdiChevronLeft,
        mdiChevronRight,
        mdiClose,
      },

      isEquals: false,
      isNext: false,
      events: [],
      config: {
        //plugins: [ dayGridPlugin ],
        //initialView: 'dayGridMonth',
        //defaultView: 'month',
        disableDragging: true,
        editable: false,
        selectable: false,
        height: "auto",
        firstDay: 1,
        minTime: "07:00",
        maxTime: "23:59",
        businessHours: {
          start: "07:00",
          end: "23:59",
        },
        slotLabelFormat: "HH:mm",
        columnHeader: false,
        allDaySlot: false,
        header: {
          left: "",
          center: "",
          right: "",
        },
        eventRender: function (event, element) { },
      },
      dataRoom: [],
      dialog: false,
    };
  },
  validations: {
    meetingDate: {
      required,
    },
    meetingEndDate: {
      required,
    },
    officeIdAdd: {
      required,
    },
    roomIdAdd: {
      required,
    },
    startTime: {
      required,
    },
    department: {
      required,
    },
    endTime: {
      required,
    },
    titleMeeting: {
      required,
    },
    desc: {
      required,
    },
  },
  mounted() {
    // this.getCurrentWeek(this.$refs.calendar.fireMethod("getDate"));
  },
  created() {
    this.getOptMeeting();
    this.getOptLocation();
    this.getDepartment();
  },
  watch: {
    meetingDate() {
      this.isStartDate = this.meetingDate === null ? true : false;
      this.endDate = this.meetingDate !== null ? this.endDate : null;
    },
    startTime() {
      const hh = this.startTime;
      if (hh !== null) {
        this.hStart = Number(hh.HH);
        this.hEnd = 23;
        this.isStartTime = this.startTime.HH === "" ? true : false;
        if (this.startTime.mm === "") {
          if (this.$refs.timepicker1 !== undefined) {
            this.$refs.timepicker1.hour = "";
            this.$refs.timepicker1.minute = "";
          }
          this.endDate = null;
        }
      }
    },
    endTime() {
      if (this.startTime !== null) {
        const st = this.startTime.HH + this.startTime.mm;
        const et = this.endTime.HH + this.endTime.mm;
        this.isEquals = st >= et ? true : false;
      }
    },
    officeId() {
      // this.officeId
      this.roomId = this.officeId === null ? "" : this.roomId;
      this.getRoomById(1);
    },
    async officeIdAdd() {
      // this.officeIdAdd
      this.capacity = "";
      // this.roomsId = this.officeId !== this.officeIdAdd ? [] : this.roomsId;
      this.roomIdAdd = this.officeId !== this.officeIdAdd ? "" : this.roomIdAdd;
      this.roomIdAdd = this.officeIdAdd === "" ? "" : this.roomIdAdd;
      this.getRoomById(0);
    },
    roomIdAdd() {
      // this.getMeeting(0);
      if (this.officeIdAdd !== "") {
        const id = this.roomIdAdd;
        const data = this.dataRoom;
        const filter = data.filter((value) => value.id == id);
        this.capacity = filter[0].capacity;
      }
    },
    roomId() {
      this.getMeeting(1);
    },
  },
  methods: {
    disabledFromStartDate(date) {
      const today = new Date(this.meetingDate);
      today.setHours(0, 0, 0, 0);
      return date <= today - 1;
    },
    async getDepartment() {
      const res = await getMeeting.getDivision();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.departmentItem = filter;
    },
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "titleMeeting":
          !model.required && errors.push("Meeting Title is required.");
          break;
        case "desc":
          !model.required && errors.push("Description is required.");
          break;
        case "department":
          !model.required && errors.push("Department is required.");
          break;
        case "meetingDate":
          this.isYear = !!model.$error;
          !model.required && errors.push("Date is required");
          break;
        case "meetingEndDate":
          this.isYear1 = !!model.$error;
          !model.required && errors.push("Date is required");
          break;
        case "startTime":
          const obj = model.$model;
          const keys = obj !== null ? Object.values(obj) : "";
          if (obj === null || obj === "") {
            this.isStart = true;
          } else if (keys[0] === "") {
            this.isStart = true;
          } else {
            if (obj !== null || obj !== "") {
              if (obj.mm === "") {
                this.isStart = true;
              } else {
                this.isStart = false;
              }
            }
          }
          // this.isStart = model.$model === null ? true : false;
          !model.required && errors.push("Start Time is required");
          break;
        case "endTime":
          const obj1 = model.$model;
          const keys1 = obj1 !== null ? Object.values(obj1) : "";
          if (obj1 === null || obj1 === "") {
            this.isEnd = true;
          } else if (keys1[0] === "") {
            this.isEnd = true;
          } else {
            if (obj1 !== null || obj1 !== "") {
              if (obj1.mm === "") {
                this.isEnd = true;
              } else {
                this.isEnd = false;
              }
            }
          }
          !model.required && errors.push("End Time is required");
          break;
        case "officeIdAdd":
          !model.required && errors.push("Office Location is required");
          break;
        case "roomIdAdd":
          !model.required && errors.push("Meeting Room is required");
          break;
        default:
          break;
      }

      return errors;
    },
    eventSelected(event) {
      if (event.isHoliday === undefined) {
        this.titleDetail = event.title;
        this.timeDetail =
          moment(event.start).format("DD-MM-YYYY HH:mm") +
          " - " +
          moment(event.end).format("DD-MM-YYYY HH:mm");
        this.roomDetail = event.description;
        // this.isDetail = true;
        this.dataMeeting = event;
        this.openModalMeeting = true;
      }
    },
    closeModalMeeting() {
      this.openModalMeeting = false;
      this.dataMeeting = {};
    },
    handleChange(value, type) {
      if (type === "second") {
        this.open1 = false;
      }
    },
    handleChange2(value, type) {
      if (type === "second") {
        this.open2 = false;
      }
    },
    disabledHours(hour) {
      // Your logic to disable certain hours
      // Example: Disable hours from 0 to 5 and from 20 to 23
      return hour < 6 || hour >= 20;
    },
    disabledBeforeTodayAndAfterAWeek(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return date < today;
    },
    async getOptMeeting() {
      const res = await getMeeting.getOptions();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.offices = filter;
    },
    async getOptLocation() {
      const role = JSON.parse(localStorage.getItem("dataUser"));
      this.isSupported = role.roleId === "GS" ? true : false;
      const res = await getMeeting.getLocation();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.rooms = filter;
    },
    async getRoomById(x) {
      if (x !== "0") {
        const id = this.officeIdAdd === "" ? this.officeId : this.officeIdAdd;
        const res = await getMeeting.getRoomById(id);
        const data = res.data.data;
        const filter = data.map((project) => ({
          value: project.id,
          text: project.name,
        }));
        this.dataRoom = data;
        this.roomsId = filter;
      }
    },
    async submitBook() {
      this.$v.$touch();
      if (
        !this.$v.titleMeeting.$invalid &&
        !this.$v.meetingDate.$invalid &&
        !this.$v.startTime.$invalid &&
        !this.$v.endTime.$invalid &&
        !this.$v.officeIdAdd.$invalid &&
        !this.$v.roomIdAdd.$invalid &&
        !this.$v.department.$invalid &&
        !this.$v.desc.$invalid &&
        !this.$v.meetingEndDate.$invalid
      ) {
        if (!this.isStart && !this.isEnd) {
          const param = {
            meetingRoomId: this.roomIdAdd,
            title: this.titleMeeting,
            divisionId: this.department,
            description: this.desc,
            startDate: moment(this.meetingDate).format("YYYY-MM-DD"),
            endDate: moment(this.meetingEndDate).format("YYYY-MM-DD"),
            startTime: this.startTime.HH + ":" + this.startTime.mm,
            endTime: this.endTime.HH + ":" + this.endTime.mm,
          };
          const res = await getMeeting.bookMeeting(param);
          if (res.data.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: res.data.message,
              buttons: {
                cancel: false,
                confirm: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No",
              },
              closeOnEsc: false,
              closeOnClickOutside: false,
            }).then((result) => {
              if (result) {
                this.loading = false;
                this.closeModal(0);
              }
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed",
              text:
                res.data.errors !== null
                  ? res.data.errors[0].message
                  : res.data.message,
              buttons: {
                cancel: false,
                confirm: true,
              },
              closeOnEsc: false,
              closeOnClickOutside: false,
            }).then((result) => {
              if (result) {
                this.loading = false;
                // this.closeModal(0);s
              }
            });
          }
        }
      }
    },
    async getMeeting(x) {
      if (x !== 0) {
        const dateWeek = this.datesOfWeek;
        const today = new Date();
        let sevenDaysLater = new Date(
          today.getTime() + 4 * 24 * 60 * 60 * 1000
        );
        let threeDaysBefore = new Date(
          today.getTime() - 4 * 24 * 60 * 60 * 1000
        );
        const param = {
          meetingRoomId: this.roomId,
          startDate: this.isNext
            ? moment(this.datesOfWeek[0]).format("YYYY-MM-DD")
            : moment(threeDaysBefore).format("YYYY-MM-DD"),
          endDate: this.isNext
            ? moment(this.datesOfWeek[6]).format("YYYY-MM-DD")
            : moment(sevenDaysLater).format("YYYY-MM-DD"),
          size: 999999999,
        };
        const res = await getMeeting.getMeeting(param);
        const data = res.data.data.meeting;
        const holiday = res.data.data.holiday;

        const newHoliday = holiday.map((obj) => {
          return {
            isHoliday: true,
            start: moment(`${obj.theDate}`).format("YYYY-MM-DD") + " 07:00",
            end: moment(`${obj.theDate}`).format("YYYY-MM-DD") + " 23:59",
            title: `${obj.name}`,
            textColor: "white",
            color: "red",
            description: `${obj.roomName}`,
            datas: obj,
          };
        });
        const newArray = data.map((obj) => {
          return {
            start: moment(`${obj.meetingDate} ${obj.startTime}`).format(
              "YYYY-MM-DD HH:mm"
            ),
            end: moment(`${obj.meetingDate} ${obj.endTime}`).format(
              "YYYY-MM-DD HH:mm"
            ),
            title: `${obj.title}`,
            textColor: obj.meetingColor,
            color: obj.meetingColorBg,
            description: `${obj.roomName}`,
            datas: obj,
          };
        });
        this.events = newArray.concat(newHoliday);
        this.isData = true;
        this.isNext = false;
        setTimeout(() => {
          this.getCurrentWeek(this.$refs.calendar.fireMethod("getDate"));
        }, 100);
      }
    },
    prevWeek() {
      this.isNext = true;
      this.$refs.calendar.fireMethod("prev");
      this.getCurrentWeek(this.$refs.calendar.fireMethod("getDate"));
    },
    nextWeek() {
      // this.getMeeting();
      this.isNext = true;
      this.$refs.calendar.fireMethod("next");
      this.getCurrentWeek(this.$refs.calendar.fireMethod("getDate"));
    },
    getCurrentWeek(currentDate) {
      Date.prototype.GetMondayOfWeek = function () {
        return new Date(
          this.setDate(
            this.getDate() - this.getDay() + (this.getDay() == 0 ? -6 : 1)
          )
        );
      };
      Date.prototype.GetTuesdayOfWeek = function () {
        return new Date(this.setDate(this.getDate() - this.getDay() + 2));
      };
      Date.prototype.GetWednesdayOfWeek = function () {
        return new Date(this.setDate(this.getDate() - this.getDay() + 3));
      };
      Date.prototype.GetThursdayOfWeek = function () {
        return new Date(this.setDate(this.getDate() - this.getDay() + 4));
      };
      Date.prototype.GetFridayOfWeek = function () {
        return new Date(this.setDate(this.getDate() - this.getDay() + 5));
      };
      Date.prototype.GetSaturdayOfWeek = function () {
        return new Date(this.setDate(this.getDate() - this.getDay() + 6));
      };
      Date.prototype.GetSundayOfWeek = function () {
        return new Date(this.setDate(this.getDate() - this.getDay() + 7));
      };

      var today = new Date(currentDate);

      this.datesOfWeek = [];

      this.datesOfWeek.push(today.GetMondayOfWeek());
      this.datesOfWeek.push(today.GetTuesdayOfWeek());
      this.datesOfWeek.push(today.GetWednesdayOfWeek());
      this.datesOfWeek.push(today.GetThursdayOfWeek());
      this.datesOfWeek.push(today.GetFridayOfWeek());
      this.datesOfWeek.push(today.GetSaturdayOfWeek());
      this.datesOfWeek.push(today.GetSundayOfWeek());
      if (this.isNext) {
        this.getMeeting(1);
        this.isNext = false;
      }
    },
    openModal() {
      this.isStart = false;
      this.isEnd = false;
      this.isYear = false;
      this.isYear1 = false;
      this.dialog = true;
      this.isEquals = false;
      this.officeIdAdd = this.officeId !== null ? this.officeId : "";
      this.roomIdAdd = this.roomId !== null ? this.roomId : "";
      this.$v.$reset();
    },
    closeModal(x) {
      // this.startTime
      if (this.startTime !== null && typeof this.startTime !== "string") {
        // this.startTime.HH = "";
        // this.startTime.mm = "";
        // this.endTime.HH = "";
        // this.endTime.mm = "";
        this.titleMeeting = "";
        this.meetingDate = null;
        this.meetingEndDate = null;
        this.officeIdAdd = "";
        this.roomIdAdd = "";
        this.department = "";
        this.desc = "";
        this.isYear = false;
        this.isYear1 = false;
        this.isStart = false;
        this.isEnd = false;
        this.isEquals = false;
        this.$v.$reset();
      } else {
        this.startTime = null;
        this.endTime = null;
        this.titleMeeting = "";
        this.meetingDate = null;
        this.meetingEndDate = null;
        this.officeIdAdd = "";
        this.roomIdAdd = "";
        this.department = "";
        this.desc = "";
        this.isYear = false;
        this.isYear1 = false;
        this.isStart = false;
        this.isEnd = false;
        this.isEquals = false;
        this.$v.$reset();
      }
      if (this.$refs.timepicker !== undefined) {
        this.$refs.timepicker.hour = "";
        this.$refs.timepicker.minute = "";
      }
      if (this.$refs.timepicker1 !== undefined) {
        this.$refs.timepicker1.hour = "";
        this.$refs.timepicker1.minute = "";
      }
      if (x !== 1) {
        this.getMeeting();
      }
      this.dialog = false;
    },
    goToBooking() {
      this.$router.push("meeting-booking");
    },
  },
};
</script>

<style scoped>
.btn-blue {
  background-color: rgb(1, 114, 185) !important;
  color: white;
  text-transform: none;
}

.btn-white {
  background-color: white;
  color: rgb(1, 114, 185) !important;
  text-transform: none;
  border: 1px solid rgb(1, 114, 185) !important;
}

.datetime-picker {
  width: 100%;
}

::v-deep .vue__time-picker input.display-time {
  height: 4em !important;
  color: #525252;
}

::v-deep .mx-input {
  height: 56px !important;
}

.required:after {
  content: " *";
  color: red;
}

.position-col {
  margin-top: -20px;
}

::v-deep .vue__time-picker {
  width: 100%;
}

::v-deep .vue__time-picker input.display-time {
  height: 4em !important;
  color: #525252;
  width: 100%;
}
</style>
