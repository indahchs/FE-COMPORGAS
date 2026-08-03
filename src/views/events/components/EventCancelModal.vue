<template>
  <v-row justify="center">
    <v-dialog width="1000" v-model="isOpen" persistent>
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
                Event
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
            <v-col cols="6">
              <v-text-field
                readonly
                hide-details
                label="Event Name"
                v-model="nameEvent"
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                hide-details
                readonly
                v-model="eventCategory"
                :items="eventCategories"
                outlined
                label="Event Category"
              ></v-autocomplete>
            </v-col>
            <v-col cols="6">
              <label class="required">Start Time</label>
              <timepicker
                disabled
                v-model="startTime"
                placeholder="Start"
              ></timepicker>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="6">
              <label style="text-align: left" class="required">End Time</label>
              <timepicker
                disabled
                v-model="endTime"
                placeholder="End"
              ></timepicker>
            </v-col>

            <v-col cols="6">
              <v-text-field
                readonly
                hide-details
                v-model="location"
                label="Location"
                outlined
              ></v-text-field>
            </v-col>

            <v-col cols="6">
              <v-autocomplete
                readonly
                hide-details
                v-model="division"
                :items="optDivision"
                outlined
                label="Department"
              ></v-autocomplete>
            </v-col>
            <!-- <v-col cols="12">
              <label class="required">Pilih Tanggal</label>
              <date-picker
                v-model="date"
                :disabled-date="disabledBeforeTodayAndAfterAWeek"
                format="DD-MM-YYYY"
                placeholder="Pilih Tanggal"
                class="datetime-picker"
              ></date-picker>
            </v-col> -->

            <v-col cols="6">
              <v-textarea
                hide-details
                readonly
                label="Description"
                v-model="desc"
                outlined
              ></v-textarea>
            </v-col>

            <v-col cols="6">
              <label>Banner Event</label>
              <v-row style="margin: 0px" class="mb-5">
                <v-col
                  v-if="selectedFile1 === null"
                  style="text-align: center; border-style: dotted"
                  cols="12"
                  @click="onButtonClick"
                >
                  <v-icon size="50">
                    {{
                      isImage
                        ? icons.mdiCameraOff
                        : icons.mdiFileDocumentOutline
                    }} </v-icon
                  ><br />
                  <span class="font-subt">{{
                    isImage ? "No Image" : "Add File"
                  }}</span
                  ><br />
                  <!-- <span class="font-subt"
                    >Maksimal 1 file dan maksimal ukuran file 5 MB</span
                  > -->
                </v-col>
                <v-col v-else style="text-align: center" cols="12">
                  <img style="width: 100%; height: 200px" :src="imgUpload" />
                  <br /><span class="limit-text">{{ inputText }}</span>
                </v-col>
              </v-row>
            </v-col>

            <!-- <v-col cols="12">
              <v-btn block depressed class="btn-red" @click="submit"
                >CANCEL EVENT</v-btn
              >
            </v-col> -->
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import moment from "moment";
import Swal from "sweetalert2";
import { mdiClose, mdiCameraOff } from "@mdi/js";
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
      isImage: false,
      statusName: "",
      isStart: false,
      baseUrl: process.env.VUE_APP_PERTAGAS,
      imgUpload: null,
      selectedFile1: null,
      inputText: "",
      isSelecting: false,
      division: "",
      date: null,
      eventCategory: null,
      startTime: null,
      endTime: null,
      open1: false,
      open2: false,
      location: "",
      desc: "",
      eventCategories: [],
      optDivision: [],
      statusId: "",
      rejectionNote: "",
      requestBy: "",
      nameEvent: "",
      idEvent: "",
      icons: {
        mdiClose,
        mdiCameraOff,
      },
    };
  },
  props: {
    isEdit: Boolean,
    open: Boolean,
    datas: Object,
    statusDetail: String,
  },
  created() {},
  computed: {
    isOpen: {
      get() {
        const date = new Date();
        this.getOpt();
        this.getDivision();
        this.idEvent = this.datas.id;
        this.date = new Date(this.datas.date);
        this.startTime = this.datas.startTime;
        this.isStart =
          this.datas.startTime !== null || this.datas.startTime !== ""
            ? true
            : false;
        this.isImage = this.datas.imageUrl === null ? true : false;
        this.statusName = this.datas.statusName;
        this.rejectionNote = this.datas.approvalComments;
        this.requestBy = this.datas.createdBy;
        this.endTime = this.datas.endTime;
        this.desc = this.datas.description;
        this.nameEvent = this.datas.title;
        this.imgUpload = this.baseUrl + this.datas.imageUrl;
        this.selectedFile1 = this.datas.imageUrl;
        this.eventCategory = this.datas.categoryEventId;
        this.location = this.datas.location;
        this.division = this.datas.divisionId;
        this.statusId = this.datas.statusId;
        return this.open;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    disabledBeforeTodayAndAfterAWeek(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return date < today;
    },
    startClick() {},
    submit(id) {
      Swal.fire({
        icon: "warning",
        title: "Cancel",
        text: "Are you sure cancel this event?",
        showCancelButton: true,
        showConfirmButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.delete(id);
        } else {
          return false;
        }
      });
    },
    async delete() {
      const res = await postEvent.deleteEvent(this.idEvent);
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
            this.close();
          }
        });
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
      // this.inputText = "";
      // this.imgUpload = null;
      this.selectedFile1 = null;
      this.isSelecting = false;
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
        // this.uploadFile(this.selectedFile1);
      } else {
        this.errorPopup("Unsupported Image File");
      }

      // do something
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
        { once: true }
      );
      this.$refs.uploader.click();
    },
    close() {
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

.btn-red {
  background-color: #ec323f !important;
  color: white;
  text-transform: none;
}
::v-deep .vue__time-picker input.display-time {
  height: 4em !important;
  color: #525252;
}
.label-approved {
  width: 100%;
}
::v-deep .vue__time-picker input.display-time {
  width: 100%;
  height: 4em;
}
::v-deep .vue__time-picker {
  width: 100%;
}
</style>
