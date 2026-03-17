<template>
  <v-row justify="center">
    <v-dialog width="1000" v-model="isOpen" persistent>
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
                Create Event
              </div>
            </v-col>
            <v-col class="text-right">
              <v-btn style="color: #606060" icon dark @click="close">
                <v-icon>{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <label class="required">Event Name</label>
              <v-text-field v-model.trim="$v.nameEvent.$model" :error-messages="getErrors('nameEvent', $v.nameEvent)"
                @blur="$v.nameEvent.$touch()" placeholder="Event Name" outlined></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col style="margin-top: -25px" cols="6">
              <label class="required">Event Category</label>
              <v-autocomplete v-model.trim="$v.eventCategory.$model"
                :error-messages="getErrors('eventCategory', $v.eventCategory)" @blur="$v.eventCategory.$touch()"
                :items="eventCategories" outlined placeholder="Event Category"></v-autocomplete>
            </v-col>
            <v-col style="margin-top: -25px" cols="6">
              <label class="required">Department</label>
              <v-autocomplete v-model.trim="$v.division.$model" :error-messages="getErrors('division', $v.division)"
                @blur="$v.division.$touch()" :items="optDivision" outlined placeholder="Department"></v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col style="margin-top: -25px" cols="6">
              <label class="required">Location</label>
              <v-text-field v-model.trim="$v.location.$model" :error-messages="getErrors('location', $v.location)"
                @blur="$v.location.$touch()" placeholder="Location" outlined></v-text-field>
            </v-col>
            <v-col style="margin-top: -25px" cols="6">
              <label class="required">Office Location</label>
              <v-autocomplete v-model.trim="$v.officeLocation.$model"
                :error-messages="getErrors('officeLocation', $v.officeLocation)" @blur="$v.officeLocation.$touch()"
                :items="optLocation" outlined placeholder="Office Location"></v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col style="margin-top: -25px" cols="6">
              <label class="required">Start Date</label>
              <date-picker v-model.trim="$v.date.$model" :format="dateFormat"
                :error-messages="getErrors('date', $v.date)" :style="isYear
                  ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                  : ''
                  " :disabled-date="disabledBeforeTodayAndAfterAWeek" format="DD-MM-YYYY" placeholder="Start Date"
                class="datetime-picker"></date-picker>
              <div class="mt-1" v-if="isYear" style="color: red; font-weight: 400; font-size: 12px">
                Start Date is required
              </div>
            </v-col>
            <v-col style="margin-top: -25px" cols="6">
              <label class="required">End Date</label>
              <date-picker v-model.trim="$v.endDate.$model" :format="dateFormat"
                :error-messages="getErrors('endDate', $v.endDate)" :disabled="isStartDate" :style="isYear1
                  ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                  : ''
                  " :disabled-date="disabledFromStartDate" format="DD-MM-YYYY" placeholder="End Date"
                class="datetime-picker"></date-picker>
              <div class="mt-1" v-if="isYear1" style="color: red; font-weight: 400; font-size: 12px">
                End Date is required
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <label class="required">Start Time</label>
              <timepicker ref="timepicker" close-on-complete :style="isStart
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
              <timepicker ref="timepicker1" :disabled="isStartTime" :hour-range="[[hStart, hEnd]]" close-on-complete
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
          </v-row>
          <v-row>
            <v-col style="margin-top: 5px" class="position-col" cols="6">
              <label class="required mb-4">Description</label>
              <v-textarea class="mt-4" v-model.trim="$v.desc.$model" :error-messages="getErrors('desc', $v.desc)"
                @blur="$v.desc.$touch()" placeholder="Description" outlined></v-textarea>
            </v-col>
            <v-col style="margin-top: 5px" class="position-col" cols="6">
              <label>Event Banner</label>
              <v-row style="margin: 0px" class="mb-5 mt-4">
                <v-col v-if="selectedFile1 === null" style="text-align: center; border-style: dotted" :style="isPict ? 'color: red !important; border-color:red; ' : ''
                  " cols="12" @click="onButtonClick">
                  <v-icon size="35"> {{ icons.mdiFileDocumentOutline }} </v-icon><br />
                  <span class="font-subt">Add File</span><br />
                  <span class="font-subt">Max 1 file and max size 5 MB</span><br />
                  <span class="font-subt">Resolution 1315 x 451 px</span>
                </v-col>
                <v-col v-else class="mb-12" style="text-align: center" cols="12">
                  <button style="float: right" id="x" @click="deleteImage()">
                    X</button><br />
                  <img style="width: 100%; height: 100%" :src="imgUpload" />
                  <br /><span class="limit-text">{{ inputText }}</span>
                </v-col>
                <input ref="uploader" class="d-none" type="file" accept="image/*" @change="onFileChanged" />
                <div class="mt-1" v-if="isPict" style="color: red; font-weight: 400; font-size: 12px">
                  Banner is required
                </div>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-btn block depressed class="btn-blue" @click="submit">CREATE EVENT</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import moment from "moment";
import Swal from "sweetalert2";
import { required } from "vuelidate/lib/validators";
import { mdiClose, mdiFileDocumentOutline } from "@mdi/js";
import DatePicker from "vue2-datepicker";
import Timepicker from "vue2-timepicker";
import "vue2-datepicker/index.css";
import "vue2-timepicker/dist/VueTimepicker.css";
import EventService from "@/services/events/eventsServices";
import { hitAPI } from "@/services/upload/uploadServices";
const postEvent = EventService.build();
export default {
  components: { DatePicker, Timepicker },
  data() {
    return {
      isStartDate: true,
      isStartTime: true,
      isPict: false,
      isYear: false,
      isStart: false,
      isEnd: false,
      imgUpload: null,
      dateFormat: "DD-MM-YYYY",
      selectedFile1: null,
      inputText: "",
      isSelecting: false,
      division: "",
      date: null,
      eventCategory: null,
      endDate: null,
      isYear1: false,
      startTime: null,
      endTime: null,
      open1: false,
      open2: false,
      location: "",
      officeLocation: "",
      desc: "",
      eventCategories: [],
      optDivision: [],
      optLocation: [],
      nameEvent: "",
      hStart: "",
      isEquals: false,
      hEnd: "",
      icons: {
        mdiClose,
        mdiFileDocumentOutline,
      },
    };
  },
  validations: {
    date: {
      required,
    },
    endDate: {
      required,
    },
    startTime: {
      required,
    },
    endTime: {
      required,
    },
    desc: {
      required,
    },
    nameEvent: {
      required,
    },
    eventCategory: {
      required,
    },
    location: {
      required,
    },
    officeLocation: {
      required,
    },
    division: {
      required,
    },
    selectedFile1: {
      required,
    },
  },
  props: {
    open: Boolean,
    datas: Object,
    statusDetail: String,
  },
  created() { },
  computed: {
    isOpen: {
      get() {
        this.$v.$reset();
        this.isEquals = false;
        this.isEnd = false;
        this.isStart = false;
        this.isYear = false;
        this.isYear1 = false;
        this.startTime = null;
        this.endTime = null;
        this.getOpt();
        this.getDivision();
        this.getLocation();
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
    date() {
      this.isStartDate = this.date === null ? true : false;
      this.endDate = this.date !== null ? this.endDate : null;
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
  },
  methods: {
    disabledFromStartDate(date) {
      const today = new Date(this.date);
      today.setHours(0, 0, 0, 0);
      return date <= today - 1;
    },
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "desc":
          !model.required && errors.push("Description is required.");
          break;
        case "date":
          this.isYear = !!model.$error;
          !model.required && errors.push("Periode is required");
          break;
        case "endDate":
          this.isYear1 = !!model.$error;
          !model.required && errors.push("Periode is required");
          break;
        case "startTime":
          const obj = model.$model;
          const keys = obj !== null ? Object.values(obj) : "";
          if (obj === null) {
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
          !model.required && errors.push("Start Time is required");
          break;
        case "endTime":
          const obj1 = model.$model;
          const keys1 = obj1 !== null ? Object.values(obj1) : "";
          if (obj1 === null) {
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
        case "nameEvent":
          !model.required && errors.push("Event Name is required");
          break;
        case "eventCategory":
          !model.required && errors.push("Event Category is required");
          break;
        case "location":
          !model.required && errors.push("Location is required");
          break;
        case "officeLocation":
          !model.required && errors.push("Office Location is required");
          break;
        case "division":
          !model.required && errors.push("Department is required");
          break;
        default:
          break;
      }

      return errors;
    },
    disabledBeforeTodayAndAfterAWeek(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return date < today;
    },
    async submit() {
      this.$v.$touch();
      if (
        !this.$v.desc.$invalid &&
        !this.$v.date.$invalid &&
        !this.$v.startTime.$invalid &&
        !this.$v.endTime.$invalid &&
        !this.$v.nameEvent.$invalid &&
        !this.$v.eventCategory.$invalid &&
        !this.$v.location.$invalid &&
        !this.$v.officeLocation.$invalid &&
        !this.$v.endDate.$invalid &&
        !this.$v.division.$invalid
      ) {
        if (!this.isStart && !this.isEnd) {
          const param = {
            categoryEventId: this.eventCategory,
            name: this.nameEvent,
            divisionId: this.division,
            description: this.desc,
            endDate: moment(this.endDate).format("YYYY-MM-DD"),
            startDate: moment(this.date).format("YYYY-MM-DD"),
            startTime: this.startTime.HH + ":" + this.startTime.mm,
            endTime: this.endTime.HH + ":" + this.endTime.mm,
            location: this.location,
            officeLocationId: this.officeLocation,
          };

          const res = await postEvent.postEvents(param);
          if (!res) return;

          if (res.data.status === 200) {
            this.uploadFile(res.data.data.id);
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed",
              text: res.data.errors !== null
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
    async getOpt() {
      const res = await postEvent.getEventsOpt();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.eventCategories = filter;
    },
    async getDivision() {
      const res = await postEvent.getEventsDivision();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.optDivision = filter;
    },
    async getLocation() {
      const res = await postEvent.getEventsLocation();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.optLocation = filter;
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
    deleteImage() {
      this.$refs.uploader.value = "";
      this.selectedFile1 = null;
      this.isSelecting = false;
      this.$refs.uploader.value = "";
    },
    successPopup(val) {
      Swal.fire({
        title: "Success",
        text: val,
        icon: "success",
        button: false,
        timer: 2000,
      });
    },
    errorPopup(val) {
      Swal.fire({
        title: "Failed",
        text: val,
        icon: "error",
        button: false,
        timer: 2000,
      });
    },
    onFileChanged(e) {
      this.selectedFile = e.target.files[0];
      this.inputText = e.target.files[0].name;
      if (e.target.files[0].size > 5000000) {
        this.errorPopup("File upload exceeds the 5MB limit!");
      } else if (
        e.target.files[0].type === "image/png" ||
        e.target.files[0].type === "image/jpeg" ||
        e.target.files[0].type === "image/jpg"
      ) {
        this.imgUpload = URL.createObjectURL(e.target.files[0]);
        this.selectedFile1 = e.target.files[0];
        this.inputText = e.target.files[0].name;
      } else {
        this.errorPopup("Unsupported Image File");
      }
    },
    async uploadFile(id, x) {
      const par = new FormData();

      par.append("file", this.selectedFile1);
      const api = "event/banner/";
      hitAPI.post(`${api}${id}`, par).then((res) => {
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
              this.close();
            }
          });
        } else {
          this.errorPopup(res.data.message);
        }
      });
    },
    onButtonClick(x) {
      this.idBtn = x;
      this.isSelecting = true;
      window.addEventListener(
        "focus",
        () => {
          this.isSelecting = false;
        },
        { once: false }
      );
      this.$refs.uploader.click();
    },
    close() {
      this.date = "";
      if (this.startTime !== null && typeof this.startTime !== "string") {
        this.startTime = null;
        this.endTime = null;
      } else {
        this.startTime = null;
        this.endTime = null;
      }
      this.desc = "";
      this.nameEvent = "";
      this.selectedFile1 = null;
      this.imgUpload = null;
      this.eventCategory = "";
      this.location = "";
      this.officeLocation = "";
      this.division = "";
      this.date = null;
      this.endDate = null;
      this.isEnd = false;
      this.isStart = false;
      this.isYear = false;
      if (this.$refs.timepicker !== undefined) {
        this.$refs.timepicker.hour = "";
        this.$refs.timepicker.minute = "";
      }
      if (this.$refs.timepicker1 !== undefined) {
        this.$refs.timepicker1.hour = "";
        this.$refs.timepicker1.minute = "";
      }
      this.$v.$reset();
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

::v-deep .mx-input input::placeholder {
  color: red !important;
}

.btn-blue {
  background-color: rgb(1, 114, 185) !important;
  color: white;
  text-transform: none;
}

.required:after {
  content: " *";
  color: red;
}

::v-deep .vue__time-picker {
  width: 100%;
}

#x {
  background: rgb(197, 194, 194);
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 15px;
}

::v-deep .vue__time-picker input.display-time {
  width: 100%;
  height: 4em;
  color: #525252;
}

.position-col {
  margin-top: -20px;
}
</style>