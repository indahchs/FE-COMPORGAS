<template>
  <v-row justify="center">
    <v-dialog width="450" v-model="isOpen" persistent>
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
                Reject Book Event
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
            <v-col cols="12" style="color: #000000">
              Are you sure rejected this booking?
            </v-col>
            <v-col cols="12">
              <v-textarea
                hide-details
                label="Note"
                v-model="desc"
                outlined
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-btn block depressed class="btn-blue" @click="submit"
                >Reject Book Event</v-btn
              >
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
import { mdiClose } from "@mdi/js";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import EventService from "@/services/events/eventsServices";
import { hitAPI } from "@/services/upload/uploadServices";
const postEvent = EventService.build();
export default {
  components: { DatePicker },
  data() {
    return {
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
      id: "",
      eventCategories: [],
      optDivision: [],
      nameEvent: "",
      icons: {
        mdiClose,
      },
    };
  },
  props: {
    open: Boolean,
    datasReject: Object,
    statusDetail: String,
  },
  created() {},
  computed: {
    isOpen: {
      get() {
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
    async submit() {
      const param = {
        approvalComments: this.desc,
      };
      const res = await postEvent.rejectEvents(this.datasReject.id, param);
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
      this.date = "";
      this.startTime = "";
      this.endTime = "";
      this.desc = "";
      this.nameEvent = "";
      this.selectedFile1 = null;
      this.imgUpload = null;
      this.eventCategory = "";
      this.location = "";
      this.division = "";
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

.btn-blue {
  background-color: #ec323f !important;
  color: white;
  text-transform: none;
}
</style>
