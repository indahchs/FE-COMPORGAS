<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" width="400" persistent>
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col cols="12" sm="6" md="4" lg="9">
              <div
                style="
                  font-size: 18px;
                  line-height: 28px;
                  font-weight: 600;
                  color: #000000;
                "
              >
                {{ title }}
              </div>
            </v-col>
            <v-col class="text-right" cols="12" sm="6" md="4" lg="3">
              <v-btn style="color: #606060" icon dark @click="close">
                <v-icon>{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <label class="required">Title</label>
              <v-text-field
                v-model.trim="$v.name.$model"
                :error-messages="getErrors('name', $v.name)"
                @blur="$v.name.$touch()"
                outlined
                placeholder="Input Title"
              ></v-text-field>
            </v-col>
            <v-col cols="12" style="margin-top: -25px">
              <label class="required">Date</label>
              <date-picker
                :format="dateFormat"
                placeholder="Date"
                v-model.trim="$v.startDate.$model"
                :error-messages="getErrors('startDate', $v.startDate)"
                :disabled-date="disabledBeforeTodayAndAfterAWeek"
                class="datetime-picker"
                :style="
                  isYear
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                "
              ></date-picker>
              <div
                class="mt-1"
                v-if="isYear"
                style="color: red; font-weight: 400; font-size: 12px"
              >
                Date is required
              </div>
            </v-col>
            <br />
            <v-btn class="btn-submit" @click="submit" @loading="loading">
              SAVE
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import moment from "moment";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import { hitAPI } from "@/services/upload/uploadServices";
import { required } from "vuelidate/lib/validators";
import { mdiClose, mdiFileDocumentOutline } from "@mdi/js";
import Swal from "sweetalert2";
import MasterHolidayService from "../../../services/management/master_holiday/masterHolidayServices";

const service = MasterHolidayService.build();

export default {
  components: { DatePicker },
  data() {
    return {
      isStartDate: true,
      title: "Create Holiday",
      loading: false,
      imgUpload: null,
      selectedFile1: null,
      inputText: "",
      isSelecting: false,
      id: "",
      name: "",
      startDate: null,
      endDate: null,
      namePeople: "",
      isYear: false,
      isYear1: false,
      isPict: false,
      titlePeople: "",
      dateFormat: "DD-MM-YYYY",
      dateFormat1: "DD-MM-YYYY",
      baseUrl: process.env.VUE_APP_PERTAGAS,
      icons: {
        mdiFileDocumentOutline,
        mdiClose,
      },
    };
  },
  validations: {
    name: {
      required,
    },
    startDate: {
      required,
    },
    endDate: {
      required,
    },
    namePeople: {
      required,
    },
    titlePeople: {
      required,
    },
  },
  props: {
    open: Boolean,
    item: Object,
    statusDetail: String,
  },
  watch: {
    selectedFile1() {
      this.isPict = this.selectedFile1 !== null ? false : true;
    },
    startDate() {
      this.isStartDate = this.startDate === null ? true : false;
      this.endDate = this.startDate !== null ? this.endDate : null;
    },
  },
  computed: {
    isOpen: {
      get() {
        this.edit();
        return this.open;
      },
      set(value) {
        if (!value) {
          this.item = null;
          this.form = {};
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    disabledFromStartDate(date) {
      const today = new Date(this.startDate);
      today.setHours(0, 0, 0, 0);
      return date <= today - 1;
    },
    disabledBeforeTodayAndAfterAWeek(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return date < today;
    },
    deleteImage() {
      this.$refs.uploader.value = "";
      this.inputText = "";
      this.imgUpload = null;
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
        title: "Error!",
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

      // do something
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
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "name":
          !model.required && errors.push("Title is required.");
          break;
        case "startDate":
          this.isYear = !!model.$error;
          !model.required && errors.push("Start date is required");
          break;
        case "endDate":
          this.isYear1 = !!model.$error;
          !model.required && errors.push("End date is required");
          break;
        case "namePeople":
          !model.required && errors.push("Person Name is required");
          break;
        case "titlePeople":
          !model.required && errors.push("Person Title is required");
          break;
        default:
          break;
      }

      return errors;
    },
    edit() {
      if (this.item != null) {
        this.isPict = false;
        this.isYear = false;
        this.isYear1 = false;
        this.title = "Edit Master Holiday";
        this.id = this.item.id;
        this.name = this.item.name;
        this.startDate = new Date(this.item.theDate);
        this.endDate = new Date(this.item.endDate);
        this.selectedFile1 = this.baseUrl + this.item.imageUrl;
        this.imgUpload = this.baseUrl + this.item.imageUrl;
      } else {
        this.title = "Create Master Holiday";
        this.id = "";
        this.isPict = false;
        this.isYear = false;
        this.isYear1 = false;
        this.name = "";
        this.startDate = "";
        this.endDate = "";
        this.namePeople = "";
        this.titlePeople = "";
        this.$v.$reset();
        this.form = {};
      }
    },
    async submit() {
      this.$v.$touch();
      if (!this.$v.name.$invalid && !this.$v.startDate.$invalid) {
        this.loading = true;
        const param = {
          id: this.id,
          name: this.name,
          theDate: moment(this.startDate).format("YYYY-MM-DD"),
        };
        const res =
          this.item == null
            ? await service.add(param)
            : await service.update(param);
        const resData = res.data;
        if (resData.status === 200) {
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
            text: resData.message,
            showCancelButton: false,
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((result) => {
            if (result) {
              this.loading = false;
            }
          });
        }
      }
    },
    async uploadFile(id, x) {
      const par = new FormData();

      par.append("file", this.selectedFile1);
      const api = "special-date/banner/";
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
    close() {
      this.id = "";
      this.name = "";
      this.startDate = null;
      this.endDate = null;
      this.namePeople = "";
      this.titlePeople = "";
      // this.deleteImage();
      this.$v.$reset();
      this.$emit("close");
    },
  },
};
</script>
<style scoped>
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
}

.required:after {
  content: " *";
  color: red;
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
#x {
  background: rgb(197, 194, 194);
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 15px;
}
</style>
