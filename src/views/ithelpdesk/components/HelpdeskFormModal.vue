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
                New Request
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
          <form @submit.prevent="submit">
            <v-row>
              <v-col cols="6">
                <label class="required">Service</label>
                <v-select
                  :items="catalogItems"
                  v-model.trim="$v.service.$model"
                  :readonly="isTicket"
                  :error-messages="getErrors('service', $v.service)"
                  @blur="$v.service.$touch()"
                  outlined
                  placeholder="Service"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <label class="required">Location</label>
                <v-select
                  :items="locationOptions"
                  v-model.trim="$v.lokasi.$model"
                  :error-messages="getErrors('lokasi', $v.lokasi)"
                  @blur="$v.lokasi.$touch()"
                  outlined
                  placeholder="Location"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <label class="required">Title</label>
                <v-text-field
                  v-model.trim="$v.judul.$model"
                  :error-messages="getErrors('judul', $v.judul)"
                  @blur="$v.judul.$touch()"
                  outlined
                  placeholder="Title"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <label class="required">Description</label>
                <v-textarea
                  v-model.trim="$v.desc.$model"
                  :error-messages="getErrors('desc', $v.desc)"
                  @blur="$v.desc.$touch()"
                  outlined
                  placeholder="Description"
                ></v-textarea>
              </v-col>
              <!--<v-col cols="12">
                <label v-if="isNotes" class="required">Note</label>
                <v-text-field v-if="isNotes" v-model="catalogNote" outlined disabled placeholder="Note"></v-text-field>
              </v-col>-->
              <v-col cols="12">
                <label class="required">Upload File</label>
                <div v-if="isNotes" class="mt-4 font-weight-bold">
                  Note: {{ catalogNote }}
                </div>
                <v-row style="margin: 0px" class="mb-5 mt-4">
                  <v-col
                    v-if="selectedFile1 === null"
                    style="text-align: center; border-style: dotted"
                    :style="
                      isPict ? 'color: red !important; border-color:red; ' : ''
                    "
                    cols="12"
                    @click="onButtonClick"
                  >
                    <v-icon size="50">
                      {{ icons.mdiFileDocumentOutline }} </v-icon
                    ><br />
                    <span class="font-subt"
                      >Add JPG, JPEG, PNG, PDF, ZIP File</span
                    ><br />
                    <span class="font-subt">Max 1 file and max size 5 MB</span>
                  </v-col>
                  <v-col v-else class="mb-12" cols="12">
                    <div style="text-align: right">
                      <v-icon id="x" @click="deleteImage()">{{
                        icons.mdiClose
                      }}</v-icon>
                    </div>
                    <div style="text-align: center">
                      <img
                        v-if="
                          selectedFile1 != null &&
                          (selectedFile1.type === 'image/png' ||
                            selectedFile1.type === 'image/jpeg' ||
                            selectedFile1.type === 'image/jpg')
                        "
                        style="width: 100%; height: 200px; object-fit: contain"
                        :src="imgUpload"
                      />
                      <div
                        v-if="
                          selectedFile1 != null &&
                          (selectedFile1.type !== 'image/png' ||
                            selectedFile1.type !== 'image/jpeg' ||
                            selectedFile1.type !== 'image/jpg')
                        "
                        class="py-4"
                      >
                        {{ selectedFile1.name }}
                      </div>
                    </div>
                  </v-col>
                  <input
                    ref="uploader"
                    class="d-none"
                    type="file"
                    accept="image/*, .pdf, .zip, .doc, .docx, .xls, .xlsx, .ppt, .pptx"
                    @change="onFileChanged"
                  />
                  <div
                    class="mt-1"
                    v-if="isPict"
                    style="color: red; font-weight: 400; font-size: 12px"
                  >
                    File is required
                  </div>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn class="btn-submit" @click="submit" :loading="loading">
                  Create Request
                </v-btn>
              </v-col>
            </v-row>
          </form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import { mdiClose, mdiFileDocumentOutline } from "@mdi/js";
import Swal from "sweetalert2";
import ItHelpDeskService from "@/services/ithelpdesk/itHelpDeskServices";
import { hitAPI } from "@/services/upload/uploadServices";
const getService = ItHelpDeskService.build();
export default {
  data() {
    return {
      loading: false,
      isTicket: false,
      isNotes: false,
      judul: "",
      service: "",
      lokasi: "",
      pic: "",
      desc: "",
      imgUpload: null,
      selectedFile1: null,
      inputText: "",
      isPict: false,
      isSelecting: false,
      eventCategory: null,
      eventCategories: ["Event 1", "Event 2"],
      isSelecting: false,
      catalog: [],
      catalogItems: [],
      catalogNote: "",
      locationOptions: [],
      icons: {
        mdiFileDocumentOutline,
        mdiClose,
      },
      idReq: "",
    };
  },
  validations: {
    judul: {
      required,
    },
    service: {
      required,
    },
    lokasi: {
      required,
    },
    pic: {
      required,
    },
    desc: {
      required,
    },
  },
  props: {
    open: Boolean,
    datas: Object,
    statusDetail: String,
  },
  mounted() {
    this.getCatalog();
    this.getLocations();
  },
  computed: {
    isOpen: {
      get() {
        const data = this.datas;
        this.isTicket = JSON.stringify(data) !== "{}" ? true : false;
        if (JSON.stringify(data) !== "{}") {
          this.service = data.id;
          this.isNotes = true;
          this.onChangeCatalog();
        }

        this.isPict = false;

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
    selectedFile1() {
      this.isPict = this.selectedFile1 !== null ? false : true;
    },
    service() {
      this.isNotes = true;
      this.onChangeCatalog();
    },
  },
  methods: {
    onChangeCatalog() {
      let selected = this.catalog.find((x) => x.id === this.service);
      if (selected != null) {
        this.catalogNote = selected.note;
      }
    },
    async getCatalog() {
      const res = await getService.getHelpDesk();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.catalog = data;
      this.catalogItems = filter;
    },
    async getLocations() {
      const res = await getService.getLocation();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.locationOptions = filter;
    },
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "judul":
          !model.required && errors.push("Title is required.");
          break;
        case "service":
          !model.required && errors.push("Service is required");
          break;
        case "lokasi":
          !model.required && errors.push("Location is required");
          break;
        case "pic":
          !model.required && errors.push("PIC is required");
          break;
        case "desc":
          !model.required && errors.push("Description is required");
          break;
        default:
          break;
      }

      return errors;
    },
    async submit() {
      this.loading = true;
      this.$v.$touch();
      if (this.selectedFile1 === null) {
        this.isPict = true;
      } else {
        this.isPict = false;
        if (
          !this.$v.service.$invalid &&
          !this.$v.judul.$invalid &&
          !this.$v.lokasi.$invalid &&
          !this.$v.desc.$invalid
        ) {
          const paramTicket = {
            title: this.judul,
            officeId: this.lokasi,
            catalogId: this.service,
          };
          const res = await getService.postTicket(paramTicket);
          console.log("🚀 ~ submit ~ res:", res)
          const status = res.data.status;
          if (status === 200) {
            const resData = res.data.data;
            const paramChat = {
              content: this.desc,
              ticketId: resData.id,
            };
            this.idReq = res.data.data.id;
            const resChat = await getService.postChat(paramChat);
            const statuschat = resChat.data.status;
            if (statuschat === 200) {
              this.uploadFile(resChat.data.data.id);
            } else {
              this.errorPopup(resChat.data.message);
              this.close();
            }
          } else {
            this.errorPopup(res.data.message);
            this.close();
          }
        }
      }
      this.loading = false;
    },
    async uploadFile(id, x) {
      const par = new FormData();

      par.append("file", this.selectedFile1);
      const api = "ticket-chat/document/";
      hitAPI.post(`${api}${id}`, par).then((res) => {
        if (res.data.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: res.data.message,
            buttons: {
              cancel: false,
              confirm: true,
              //confirmButtonText: "Yes",
              //cancelButtonText: "No",
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
        e.target.files[0].type === "image/jpg" ||
        e.target.files[0].type === "application/pdf" ||
        e.target.files[0].type === "application/zip" ||
        e.target.files[0].type === "application/x-zip-compressed" ||
        e.target.files[0].type === "application/msword" ||
        e.target.files[0].type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        e.target.files[0].type === "application/vnd.ms-excel" ||
        e.target.files[0].type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        e.target.files[0].type === "application/vnd.ms-powerpoint" ||
        e.target.files[0].type ===
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ) {
        this.imgUpload = URL.createObjectURL(e.target.files[0]);
        this.selectedFile1 = e.target.files[0];
        this.inputText = e.target.files[0].name;
      } else {
        this.errorPopup("Unsupported File Type");
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
    close() {
      this.$v.$reset();
      this.$refs.uploader.value = "";
      this.selectedFile1 = null;
      this.imgUpload = null;
      this.service = "";
      this.judul = "";
      this.lokasi = "";
      this.desc = "";
      this.isPict = false;
      this.catalogNote = "";
      this.$emit("close", this.idReq);
    },
  },
};
</script>
<style scope>
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
}

.required:after {
  content: " *";
  color: red;
}
</style>
