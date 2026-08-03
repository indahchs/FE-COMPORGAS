<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" width="1000px" persistent>
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col cols="8">
              <div
                style="
                  font-size: 18px;
                  line-height: 28px;
                  font-weight: 600;
                  color: #000000;
                "
              >
                Detail Book Room
              </div>
            </v-col>
            <v-col cols="4" class="text-right">
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
            <v-col v-if="!isEdit" cols="12">
              <v-chip
                v-if="statusId === 'REJECTED'"
                class="label-approved"
                color="#EC323F"
                label
              >
                {{ statusId }} by Admin
                <v-icon class="icon-pos" color="white" end>{{
                  icons.mdiCheck
                }}</v-icon>
              </v-chip>
              <v-chip
                v-if="statusId === 'APPROVED'"
                class="label-approved"
                color="#ADC43B"
                label
              >
                {{ statusId }} by Admin
                <v-icon class="icon-pos" color="white" end>{{
                  icons.mdiCheck
                }}</v-icon>
              </v-chip>
            </v-col>
            <v-col v-if="!isEdit && statusId === 'REJECTED'" cols="12">
              <v-text-field
                disabled
                v-model="rejectionNote"
                outlined
                hide-details
                label="Note"
              ></v-text-field>
            </v-col>
            <v-col v-if="!isEdit" cols="12">
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
                disabled
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
                v-model.trim="$v.department.$model"
                :error-messages="getErrors('department', $v.department)"
                @blur="$v.department.$touch()"
                :items="departmentItem"
                outlined
                disabled
                placeholder="Department"
              ></v-autocomplete>
            </v-col>
            <v-col style="margin-top: -25px" cols="6">
              <label class="required">Date</label>
              <date-picker
                :format="dateFormat"
                v-model.trim="$v.meetingDate.$model"
                :error-messages="getErrors('meetingDate', $v.meetingDate)"
                :style="
                  isYear
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                "
                :disabled-date="disabledBeforeTodayAndAfterAWeek"
                disabled
                placeholder="Tanggal"
                class="datetime-picker"
              ></date-picker>
              <div
                class="mt-1"
                v-if="isYear"
                style="color: red; font-weight: 400; font-size: 12px"
              >
                Date is required
              </div>
            </v-col>
            <v-col class="position-col" cols="6">
              <label class="required">Meeting Room</label>
              <v-autocomplete
                v-model.trim="$v.roomIdAdd.$model"
                :error-messages="getErrors('roomIdAdd', $v.roomIdAdd)"
                @blur="$v.roomIdAdd.$touch()"
                :items="rooms"
                disabled
                outlined
                placeholder="Meeting Room"
              ></v-autocomplete>
            </v-col>
            <v-col style="margin-top: -20px" cols="6">
              <label class="required">Start</label>
              <timepicker
                disabled
                close-on-complete
                v-model.trim="$v.startTime.$model"
                placeholder="Start"
              ></timepicker>
              <div
                class="mt-1"
                v-if="isStart"
                style="color: red; font-weight: 400; font-size: 12px"
              >
                Start Time is required
              </div>
            </v-col>
            <v-col cols="6" style="margin-top: -20px">
              <label class="required">End</label>
              <timepicker
                :disabled="!isEdit"
                close-on-complete
                v-model.trim="$v.endTime.$model"
                placeholder="End"
              ></timepicker>
              <div
                class="mt-1"
                v-if="isEnd"
                style="color: red; font-weight: 400; font-size: 12px"
              >
                End Time is required
              </div>
            </v-col>
            <v-col cols="6">
              <label class="required">Office Location</label>
              <v-autocomplete
                v-model.trim="$v.officeIdAdd.$model"
                :error-messages="getErrors('officeIdAdd', $v.officeIdAdd)"
                @blur="$v.officeIdAdd.$touch()"
                :items="offices"
                disabled
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
                disabled
                outlined
                placeholder="Meeting Room"
              ></v-autocomplete>
            </v-col>
            <v-col class="position-col" cols="6">
              <label class="required">Description</label>
              <v-text-field
                disabled
                placeholder="Description"
                v-model="desc"
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
      isYear: false,
      isStart: false,
      isEnd: false,
      hasError: true,
      statusId: "",
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
      titleMeeting: "",
      offices: [],
      rooms: [],
      desc: "",
      capacity: "",
      startTime: null,
      endTime: null,
      officeIdAdd: "",
      roomIdAdd: "",
      meetingDate: null,
      rejectionNote: "",
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
          if (this.addDatas.datas !== undefined) {
            this.meetingDate = new Date(this.addDatas.datas.meetingDate);
            this.officeIdAdd = this.addDatas.datas.officeId;
            this.roomIdAdd = this.addDatas.datas.roomId;
            this.startTime = this.addDatas.datas.startTime;
            this.endTime = this.addDatas.datas.endTime;
            this.titleMeeting = this.addDatas.datas.title;
            this.department = this.addDatas.datas.divisionId;
            this.rejectionNote = this.addDatas.datas.rejectionNote;
            this.requestBy = this.addDatas.datas.userName;
            this.statusId = this.addDatas.datas.statusId;
            this.desc = this.addDatas.datas.description;
            this.capacity = this.addDatas.datas.capacity;
          }
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
        this.getOptMeeting();
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
    startTime() {
      if (this.startTime !== null || this.startTime !== undefined) {
        const hh = this.startTime;
        this.hStart = Number(hh.HH) + 1;
        this.hEnd = 23;
      }
    },
  },
  methods: {
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
            this.isStart = false;
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
            this.isEnd = false;
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
    async getOptMeeting() {
      const res = await getMeeting.getOptions();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
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
        !this.$v.roomIdAdd.$invalid
      ) {
        const param = {
          meetingRoomId: this.roomIdAdd,
          title: this.titleMeeting,
          divisionId: this.department,
          meetingDate: moment(this.meetingDate).format("YYYY-MM-DD"),
          startTime: moment(this.startTime).format("hh:mm:ss"),
          endTime: moment(this.endTime).format("hh:mm:ss"),
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
              this.closeModal();
            }
          });
        }
      }
    },
    closeModal() {
      this.meetingDate = null;
      this.officeIdAdd = "";
      this.roomIdAdd = "";
      this.startTime = null;
      this.endTime = null;
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
