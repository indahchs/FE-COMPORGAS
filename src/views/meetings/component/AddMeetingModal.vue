<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" width="1000px" persistent>
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col>
              <div
                style="
                  font-size: 18px;
                  line-height: 28px;
                  font-weight: 600;
                  color: #000000;
                "
              >
                Book Room
              </div>
            </v-col>
            <v-col class="text-right">
              <v-btn icon class="rounded-circle" @click="closeModal">
                <v-icon color="black">
                  {{ icons.mdiClose }}
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-if="!isEdit"
              :cols="
                rejectionNote === null || statusId !== 'REJECTED' ? '6' : '12'
              "
            >
              <v-chip
                v-if="statusId === 'REJECTED'"
                class="label-approved"
                color="#EC323F"
                label
              >
                {{ statusName }} by {{ approved }}
                <v-icon class="icon-pos" color="white" end>{{
                  icons.mdiCheck
                }}</v-icon>
              </v-chip>
              <v-chip
                v-if="statusId === 'CANCELED'"
                class="label-approved"
                color="#EC323F"
                label
              >
                {{ statusName }} by {{ cancelBy }}
                <v-icon class="icon-pos" color="white" end>{{
                  icons.mdiCheck
                }}</v-icon>
              </v-chip>
              <v-chip
                v-if="statusId === 'SUBMITTED'"
                class="label-approved"
                color="#9A9A9A"
                label
              >
                {{ statusName }}
                <v-icon class="icon-pos" color="white" end>{{
                  icons.mdiCheck
                }}</v-icon>
              </v-chip>
              <v-chip
                v-if="statusId === 'APPROVED'"
                class="label-approved"
                color="#0172B9"
                label
              >
                {{ statusName }} by {{ approved }}
                <v-icon class="icon-pos" color="white" end>{{
                  icons.mdiCheck
                }}</v-icon>
              </v-chip>
              <v-chip
                v-if="statusId === 'DONE'"
                class="label-approved"
                color="#ADC43B"
                label
              >
                {{ statusName }}
                <v-icon class="icon-pos" color="white" end>{{
                  icons.mdiCheck
                }}</v-icon>
              </v-chip>
            </v-col>
            <v-col v-if="!isEdit && statusId === 'REJECTED'" cols="6">
              <v-text-field
                readonly
                v-model="rejectionNote"
                outlined
                hide-details
                label="Note"
              ></v-text-field>
            </v-col>
            <v-col v-if="!isEdit" cols="6">
              <v-text-field
                label="Request By"
                disabled
                v-model="requestBy"
                outlined
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <label class="required">Meeting Title</label>
              <v-text-field
                :disabled="!isEdit"
                placeholder="Meeting Title"
                v-model.trim="$v.titleMeeting.$model"
                :error-messages="getErrors('titleMeeting', $v.titleMeeting)"
                @blur="$v.titleMeeting.$touch()"
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <label class="required">Department</label>
              <v-autocomplete
                :disabled="!isEdit"
                v-model.trim="$v.department.$model"
                :error-messages="getErrors('department', $v.department)"
                @blur="$v.department.$touch()"
                :items="departmentItem"
                outlined
                placeholder="Department"
              ></v-autocomplete>
            </v-col>
            <v-col style="margin-top: -25px" cols="6">
              <label class="required">Start Date</label>
              <date-picker
                v-model.trim="$v.meetingDate.$model"
                :format="dateFormat"
                :error-messages="getErrors('meetingDate', $v.meetingDate)"
                :style="
                  isYear
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                "
                :disabled-date="disabledBeforeTodayAndAfterAWeek"
                :disabled="!isEdit"
                placeholder="Start Date"
                class="datetime-picker"
              ></date-picker>
              <div
                class="mt-1"
                v-if="isYear"
                style="color: red; font-weight: 400; font-size: 12px"
              >
                Start Date is required
              </div>
            </v-col>
            <v-col style="margin-top: -25px" cols="6">
              <label class="required">End Date</label>
              <date-picker
                v-model.trim="$v.endDate.$model"
                :format="dateFormat"
                :error-messages="getErrors('endDate', $v.endDate)"
                :style="
                  isYear1
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                "
                :disabled-date="disabledFromStartDate"
                :disabled="!isEdit || isStartDate"
                placeholder="End Date"
                class="datetime-picker"
              ></date-picker>
              <div
                class="mt-1"
                v-if="isYear1"
                style="color: red; font-weight: 400; font-size: 12px"
              >
                End Date is required
              </div>
            </v-col>
            <v-col cols="6">
              <label class="required">Start Time</label>
              <timepicker
                ref="timepicker"
                close-on-complete
                :hour-range="[[7, 18]]"
                :style="
                  isStart
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                "
                :disabled="!isEdit"
                v-model.trim="$v.startTime.$model"
                :error-messages="getErrors('startTime', $v.startTime)"
                placeholder="Start Time"
              ></timepicker>
              <div
                class="mt-1"
                v-if="isStart"
                style="color: red; font-weight: 400; font-size: 12px"
              >
                Start Time is required
              </div>
            </v-col>
            <v-col cols="6">
              <label class="required">End Time</label>
              <timepicker
                ref="timepicker1"
                :disabled="!isEdit || isStartTime"
                close-on-complete
                :hour-range="[[hStart, hEnd]]"
                v-model.trim="$v.endTime.$model"
                :error-messages="getErrors('endTime', $v.endTime)"
                :style="
                  isEnd || isEquals
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                "
                placeholder="End Time"
              ></timepicker>
              <div
                class="mt-1"
                v-if="isEnd"
                style="color: red; font-weight: 400; font-size: 12px"
              >
                End Time is required
              </div>
              <div
                class="mt-1"
                v-if="isEquals"
                style="color: red; font-weight: 400; font-size: 12px"
              >
                End Time must be greater than Start Time
              </div>
            </v-col>
            <v-col cols="6">
              <label class="required">Office Location</label>
              <v-autocomplete
                v-model.trim="$v.officeIdAdd.$model"
                :error-messages="getErrors('officeIdAdd', $v.officeIdAdd)"
                @blur="$v.officeIdAdd.$touch()"
                :items="offices"
                :disabled="!isEdit"
                outlined
                placeholder="Office Location"
              ></v-autocomplete>
            </v-col>
            <v-col cols="6">
              <label class="required">Meeting Room</label>
              <v-autocomplete
                v-model.trim="$v.roomIdAdd.$model"
                :error-messages="getErrors('roomIdAdd', $v.roomIdAdd)"
                @blur="$v.roomIdAdd.$touch()"
                :items="rooms"
                :disabled="!isEdit"
                outlined
                placeholder="Meeting Room"
              ></v-autocomplete>
            </v-col>
            <v-col class="position-col" cols="6">
              <label class="required">Description</label>
              <v-text-field
                :disabled="!isEdit"
                placeholder="Description"
                v-model.trim="$v.desc.$model"
                :error-messages="getErrors('desc', $v.desc)"
                @blur="$v.desc.$touch()"
                outlined
              ></v-text-field>
            </v-col>
            <v-col class="position-col" cols="6">
              <label>Capacity</label>
              <v-text-field
                disabled
                placeholder="Capacity"
                v-model="capacity"
                outlined
              ></v-text-field>
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
            <v-col v-if="isEdit" cols="12">
              <v-btn block depressed class="btn-blue" @click="submitBook"
                >BOOK ROOM
              </v-btn>
            </v-col>
            <v-col v-else cols="12">
              <v-btn
                v-if="isCancel"
                block
                depressed
                class="btn-red"
                @click="cancelBook"
                >CANCEL BOOK
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import Swal from "sweetalert2";
import moment from "moment";
import { mdiChevronLeft, mdiChevronRight, mdiClose, mdiCheck } from "@mdi/js";

import DatePicker from "vue2-datepicker";
import Timepicker from "vue2-timepicker";
import "vue2-datepicker/index.css";
import "vue2-timepicker/dist/VueTimepicker.css";
import MeetingRoomService from "@/services/management/meeting_room/meetingRoomServices";
const getMeeting = MeetingRoomService.build();
export default {
  components: { DatePicker, Timepicker },
  data() {
    return {
      capacity: "",
      isStartTime: true,
      isYear: false,
      isStart: false,
      isEnd: false,
      hasError: true,
      statusId: "",
      statusName: "",
      dateFormat: "DD-MM-YYYY",
      department: "",
      departmentItem: [],
      roomId: null,
      requestBy: "",
      currentStartDate: null,
      currentEndDate: null,
      datesOfWeek: [],
      hStart: "",
      hEnd: "",
      isStartDate: true,
      titleMeeting: "",
      offices: [],
      rooms: [],
      startTime: null,
      endTime: null,
      officeIdAdd: "",
      roomIdAdd: "",
      meetingDate: null,
      endDate: null,
      isYear1: false,
      approved: "",
      cancelBy: "",
      rejectionNote: "",
      mStart: "",
      mEnd: "",
      desc: "",
      id: "",
      isCancel: false,
      dataRoom: [],
      isEquals: false,
      icons: {
        mdiChevronLeft,
        mdiChevronRight,
        mdiClose,
        mdiCheck,
      },

      dialog: false,
    };
  },
  validations: {
    meetingDate: {
      required,
    },
    endDate: {
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
    endTime: {
      required,
    },
    titleMeeting: {
      required,
    },
    department: {
      required,
    },
    desc: {
      required,
    },
  },
  props: {
    isEdit: Boolean,
    open: Boolean,
    addDatas: Object,
    statusDetail: String,
  },
  computed: {
    isOpen: {
      get() {
        this.$v.$reset();
        if (!this.isEdit) {
          this.meetingDate = new Date(this.addDatas.startDate);
          const startDate = new Date(this.addDatas.startDate);
          this.endDate = new Date(this.addDatas.endDate);
          this.id = this.addDatas.id;
          this.officeIdAdd = this.addDatas.officeId;
          this.roomIdAdd = this.addDatas.roomId;
          this.startTime = this.addDatas.startTime;
          this.endTime = this.addDatas.endTime;
          this.titleMeeting = this.addDatas.title;
          this.approved = this.addDatas.approveBy;
          this.cancelBy = this.addDatas.cancelBy;
          this.desc =
            this.addDatas.description !== null
              ? this.addDatas.description
              : "-";
          this.department = this.addDatas.divisionId;
          this.rejectionNote = this.addDatas.rejectionNote;
          this.requestBy = this.addDatas.userName;
          this.statusId = this.addDatas.statusId;
          this.isCancel = this.addDatas.needCancel;
          this.statusName = this.addDatas.statusName;
          this.capacity = this.addDatas.capacity;
          this.getOptMeeting();
        } else {
          this.meetingDate = null;
          this.officeIdAdd = "";
          this.roomIdAdd = "";
          this.startTime = null;
          this.endTime = null;
          this.titleMeeting = "";
          this.rejectionNote = "";
          this.requestBy = "";
          this.statusId = "";
        }
        // this.getOptMeeting();
        this.getOptLocation();
        this.getDepartment();
        return this.open;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
        }
      },
    },
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
          this.endTime = null;
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
    officeIdAdd() {
      if (this.isEdit) {
        this.capacity = "";
        this.roomIdAdd = this.officeIdAdd === "" ? "" : this.roomIdAdd;
        this.getOptMeeting();
      }
    },
    roomIdAdd() {
      if (this.isEdit) {
        const id = this.roomIdAdd;
        const data = this.dataRoom;
        const filter = data.filter((value) => value.id == id);
        this.capacity = filter[0].capacity;
      }
    },
  },
  methods: {
    disabledFromStartDate(date) {
      const today = new Date(this.meetingDate);
      today.setHours(0, 0, 0, 0);
      return date <= today - 1;
    },
    async cancelBook() {
      const res = await getMeeting.deleteMeeting(this.id);
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
            this.closeModal();
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
            this.closeModal();
          }
        });
      }
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
        case "meetingDate":
          this.isYear = !!model.$error;
          !model.required && errors.push("Start Date is required");
          break;
        case "endDate":
          this.isYear1 = !!model.$error;
          !model.required && errors.push("End Date is required");
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
        case "desc":
          !model.required && errors.push("Description is required");
          break;
        case "department":
          !model.required && errors.push("Department is required");
          break;
        default:
          break;
      }

      return errors;
    },
    async getOptMeeting() {
      const id = this.officeIdAdd;
      const res = await getMeeting.getRoomById(id);
      const data = res.data.data;
      this.dataRoom = data;
      const filter = data.map((project) => ({
        value: project.id,
        text: project.name,
      }));
      this.rooms = filter;
    },
    async getOptLocation() {
      const res = await getMeeting.getLocation();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.offices = filter;
    },
    disabledBeforeTodayAndAfterAWeek(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return date < today;
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
        !this.$v.desc.$invalid &&
        !this.$v.department.$invalid &&
        !this.$v.endDate.$invalid
      ) {
        if (!this.isStart && !this.isEnd) {
          const param = {
            meetingRoomId: this.roomIdAdd,
            title: this.titleMeeting,
            description: this.desc,
            divisionId: this.department,
            startDate: moment(this.meetingDate).format("YYYY-MM-DD"),
            endDate: moment(this.endDate).format("YYYY-MM-DD"),
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
                this.closeModal();
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
              }
            });
          }
        }
      }
    },
    closeModal() {
      this.meetingDate = null;
      this.officeIdAdd = "";
      this.roomIdAdd = "";
      if (this.startTime !== null && typeof this.startTime !== "string") {
        this.startTime = null;
        this.endTime = null;
      } else {
        this.startTime = null;
        this.endTime = null;
      }
      if (this.$refs.timepicker !== undefined) {
        this.$refs.timepicker.hour = "";
        this.$refs.timepicker.minute = "";
      }
      if (this.$refs.timepicker1 !== undefined) {
        this.$refs.timepicker1.hour = "";
        this.$refs.timepicker1.minute = "";
      }
      this.department = "";
      this.titleMeeting = "";
      this.rejectionNote = "";
      this.requestBy = "";
      this.statusId = "";
      this.$emit("clicked");
    },
  },
};
</script>
<style scoped>
.datetime-picker {
  width: 100%;
}
::v-deep .mx-input {
  height: 56px !important;
}
.label-approved {
  width: 100%;
}
.icon-pos {
  float: right;
}
.btn-blue {
  background-color: rgb(1, 114, 185) !important;
  color: white;
  text-transform: none;
}
.btn-red {
  background-color: red !important;
  color: white;
  text-transform: none;
}
::v-deep .v-chip .v-chip__content {
  display: block !important;
  width: 100% !important;
  margin-top: 10px;
}
::v-deep .vue__time-picker input.display-time {
  height: 4em !important;
  color: #525252;
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
