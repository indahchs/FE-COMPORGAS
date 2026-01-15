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
              <label class="required">Quote</label>
              <quill-editor
                class="editor mb-5"
                ref="myTextEditor"
                :style="
                  isName
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                "
                v-model.trim="$v.name.$model"
                :error-messages="getErrors('name', $v.name)"
                @blur="$v.name.$touch()"
                :options="editorOption"
              />
              <!-- <v-textarea
                v-model.trim="$v.name.$model"
                :error-messages="getErrors('name', $v.name)"
                @blur="$v.name.$touch()"
                outlined
                placeholder="Input Quote"
              ></v-textarea> -->

              <div
                class="mb-4"
                v-if="isName"
                style="color: red; font-weight: 400; font-size: 12px"
              >
                Quote is required
              </div>
            </v-col>
            <v-col cols="6" style="margin-top: -25px">
              <label class="required">Start Date</label>
              <date-picker
                :format="dateFormat"
                v-model.trim="$v.startDate.$model"
                :error-messages="getErrors('startDate', $v.startDate)"
                :disabled-date="disabledBeforeTodayAndAfterAWeek"
                readonly
                :style="
                  isYear
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                "
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
            <v-col cols="6" style="margin-top: -25px">
              <label class="required">End Date</label>
              <date-picker
                :disabled="isStartDate"
                :format="dateFormat1"
                placeholder="End Date"
                :style="
                  isYear1
                    ? 'color: red !important; border: 2px solid red; border-radius: 6px;'
                    : ''
                "
                v-model.trim="$v.endDate.$model"
                :error-messages="getErrors('endDate', $v.endDate)"
                :disabled-date="disabledFromStartDate"
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
            <v-col cols="12">
              <label class="required">Person</label>
              <v-text-field
                v-model.trim="$v.namePeople.$model"
                :error-messages="getErrors('namePeople', $v.namePeople)"
                @blur="$v.namePeople.$touch()"
                outlined
                placeholder="Person Name"
              ></v-text-field>
            </v-col>
            <v-col cols="12" style="margin-top: -25px">
              <label class="required">Title</label>
              <v-text-field
                v-model.trim="$v.titlePeople.$model"
                :error-messages="getErrors('titlePeople', $v.titlePeople)"
                @blur="$v.titlePeople.$touch()"
                outlined
                placeholder="Person Title"
              ></v-text-field>
            </v-col>
            <v-col cols="12" style="margin-top: -25px">
              <label>Attachment</label>
              <v-row style="margin: 0px" class="mb-5 mt-4">
                <v-col
                  v-if="selectedFile1 === null"
                  style="text-align: center; border-style: dotted"
                  cols="12"
                  @click="onButtonClick"
                >
                  <v-icon size="50"> {{ icons.mdiFileDocumentOutline }} </v-icon
                  ><br />
                  <span class="font-subt">Choose Image</span><br />
                  <span class="font-subt">Max file size 5 MB</span><br />
                </v-col>
                <v-col
                  v-else
                  class="mb-12"
                  style="text-align: center"
                  cols="12"
                >
                  <button style="float: right" id="x" @click="deleteImage()">
                    X</button
                  ><br />
                  <img style="width: 100%; height: 200px" :src="imgUpload" />
                  <br /><span class="limit-text">{{
                    selectedFile1.fileName || inputText
                  }}</span>
                </v-col>
                <input
                  ref="uploader"
                  class="d-none"
                  type="file"
                  accept="image/*"
                  @change="onFileChanged"
                />
                <div
                  class="mt-1"
                  v-if="isPict"
                  style="color: red; font-weight: 400; font-size: 12px"
                >
                  Image is required
                </div>
              </v-row>
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
import { quillEditor } from "vue-quill-editor";

import Swal from "sweetalert2";
import QuoteService from "../../../services/management/quote/quoteServices";

const service = QuoteService.build();

export default {
  components: { DatePicker, quillEditor },
  data() {
    return {
      editorOption: {
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ["clean"],
            ["link", "image", "video"],
          ],
          syntax: {
            highlight: (text) => hljs.highlightAuto(text).value,
          },
        },
      },
      isStartDate: true,
      baseUrl: process.env.VUE_APP_PERTAGAS,
      isPict: false,
      title: "Create Quote",
      loading: false,
      imgUpload: null,
      selectedFile1: null,
      dateFormat: "DD-MM-YYYY",
      dateFormat1: "DD-MM-YYYY",
      inputText: "",
      isSelecting: false,
      id: "",
      name: "",
      startDate: null,
      endDate: null,
      namePeople: "",
      titlePeople: "",
      isName: false,
      isYear: false,
      isYear1: false,
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
  watch: {
    startDate() {
      this.isStartDate = this.startDate === null ? true : false;
      this.endDate = this.startDate !== null ? this.endDate : null;
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
          this.isName = !!model.$error;
          !model.required && errors.push("Quote text is required.");
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
        this.title = "Edit Quote";
        this.id = this.item.id;
        this.name = this.item.name;
        this.startDate = new Date(this.item.startDate);
        this.endDate = new Date(this.item.endDate);
        this.namePeople = this.item.namePeople;
        this.titlePeople = this.item.titlePeople;
        this.imgUpload = this.baseUrl + this.item.imageUrl;
        this.selectedFile1 = this.item.imageUrl;
        this.isYear = false;
        this.isYear1 = false;
        this.isName = false;
      } else {
        this.isName = false;
        this.title = "Create Quote";
        this.id = "";
        this.name = "";
        this.startDate = "";
        this.endDate = "";
        this.namePeople = "";
        this.titlePeople = "";
        this.isYear = false;
        this.isYear1 = false;
        this.$v.$reset();
        this.form = {};
      }
    },
    async submit() {
      this.$v.$touch();
      if (
        !this.$v.name.$invalid &&
        !this.$v.startDate.$invalid &&
        !this.$v.endDate.$invalid &&
        !this.$v.namePeople.$invalid &&
        !this.$v.titlePeople.$invalid
      ) {
        this.loading = true;
        const param = {
          id: this.id,
          name: this.name,
          startDate: moment(this.startDate).format("YYYY-MM-DD"),
          endDate: moment(this.endDate).format("YYYY-MM-DD"),
          namePeople: this.namePeople,
          titlePeople: this.titlePeople,
        };
        const res =
          this.item == null
            ? await service.add(param)
            : await service.update(param);

        const resData = res.data;
        if (resData.status === 200) {
          if (this.selectedFile1 !== null) {
            this.uploadFile(res.data.data.id);
          } else {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: resData.message,
              showCancelButton: false,
              showConfirmButton: true,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((result) => {
              if (result) {
                this.close();
                this.loading = false;
              }
            });
          }
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
      if (this.selectedFile === null || this.selectedFile == undefined) {
        const api = "quote/banner/";
        hitAPI.post(`${api}${id}`).then((res) => {
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
      } else {
        const par = new FormData();
        par.append("file", this.selectedFile1);
        const api = "quote/banner/";
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
      }
    },
    close() {
      this.id = "";
      this.name = "";
      this.startDate = null;
      this.endDate = null;
      this.namePeople = "";
      this.titlePeople = "";
      this.imgUpload = null;
      this.selectedFile1 = null;
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
