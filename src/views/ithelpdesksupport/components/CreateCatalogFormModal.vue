<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" width="400" persistent>
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
                Create Catalog
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
            <label class="required">Catalog</label>
            <v-text-field
              dense
              v-model.trim="$v.service.$model"
              :error-messages="getErrors('service', $v.service)"
              @blur="$v.service.$touch()"
              outlined
              placeholder="Catalog"
            ></v-text-field>
            <!-- <label class="required">Office Location</label>
            <v-select
              dense
              v-model.trim="$v.location.$model"
              :error-messages="getErrors('location', $v.location)"
              @blur="$v.location.$touch()"
              :items="locationData"
              outlined
              placeholder="Office Location"
            ></v-select> -->
            <label class="required">SLA Days</label>
            <v-text-field
              dense
              type="number"
              min="0"
              v-model.trim="$v.slaHari.$model"
              :error-messages="getErrors('slaHari', $v.slaHari)"
              @blur="$v.slaHari.$touch()"
              outlined
              placeholder="SLA Days"
            ></v-text-field>
            <label class="required">SLA Hours</label>
            <v-text-field
              dense
              type="number"
              min="0"
              v-model.trim="$v.slaJam.$model"
              :error-messages="getErrors('slaJam', $v.slaJam)"
              @blur="$v.slaJam.$touch()"
              outlined
              placeholder="SLA Hours"
            ></v-text-field>
            <label class="required">Upload File</label>
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
                <v-icon size="50"> {{ icons.mdiFileDocumentOutline }} </v-icon
                ><br />
                <span class="font-subt">Add File</span><br />
                <span class="font-subt">Max 1 file dan max size 5 MB</span
                ><br />
                <span class="font-subt">Resolution 80 x 80 px</span>
              </v-col>
              <v-col v-else class="mb-12" style="text-align: center" cols="12">
                <button style="float: right" id="x" @click="deleteImage()">
                  X</button
                ><br />
                <img style="width: 100%; height: 200px; object-fit: contain;" :src="imgUpload" />
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
                Logo is required
              </div>
            </v-row>
            <label class="required">Note</label>
            <v-textarea
              v-model.trim="$v.note.$model"
              :error-messages="getErrors('note', $v.note)"
              @blur="$v.note.$touch()"
              outlined
              placeholder="Write your note here"
            >
            </v-textarea>

            <br />
            <v-btn :loading="loading" class="btn-submit" @click="submit">
              Create Catalog
            </v-btn>
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
import { hitAPI } from "@/services/upload/uploadServices";
import ItHelpDeskService from "../../../services/ithelpdesk/itHelpDeskServices";

const getHelpDesk = ItHelpDeskService.build();
export default {
  data() {
    return {
      loading: false,
      slaHari: "",
      slaJam: "",
      location: "",
      note: "",
      locationData: [],
      isPict: false,
      judul: "",
      service: "",
      lokasi: "",
      pic: "",
      desc: "",
      imgUpload: null,
      selectedFile1: null,
      inputText: "",
      isSelecting: false,
      eventCategory: null,
      eventCategories: ["Event 1", "Event 2"],
      isSelecting: false,
      icons: {
        mdiFileDocumentOutline,
        mdiClose,
      },
    };
  },
  validations: {
    slaHari: {
      required,
    },
    slaJam: {
      required,
    },
    service: {
      required,
    },
    location: {
      required,
    },
    note: {
      required,
    },
  },
  props: {
    open: Boolean,
    datas: Object,
    statusDetail: String,
  },
  created() {},
  computed: {
    isOpen: {
      get() {
        this.getLocations();
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
  },
  methods: {
    async getLocations() {
      const res = await getHelpDesk.getLocation();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.locationData = filter;
    },
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "slaHari":
          !model.required && errors.push("SLA Days is required.");
          break;
        case "slaJam":
          !model.required && errors.push("SLA Hour is required");
          break;
        case "service":
          !model.required && errors.push("Catalog is required");
          break;
        case "location":
          !model.required && errors.push("Location is required");
          break;
        case "note":
          !model.required && errors.push("Note is required");
          break;
        default:
          break;
      }

      return errors;
    },
    async uploadFile(id, x) {
      const par = new FormData();

      par.append("file", this.selectedFile1);
      const api = "ithelpdesk/catalog/document/";
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
    async submit() {
      this.$v.$touch();
      if (this.selectedFile1 === null) {
        this.isPict = true;
      } else {
        this.isPict = false;
        if (
          !this.$v.slaHari.$invalid &&
          !this.$v.slaJam.$invalid &&
          // !this.$v.location.$invalid &&
          !this.$v.service.$invalid &&
          !this.$v.note.$invalid
        ) {
          this.loading = true;
          const param = {
            // officeLocationId: this.location,
            name: this.service,
            slaDays: this.slaHari,
            slaHours: this.slaJam,
            note: this.note,
          };
          const res = await getHelpDesk.postHelpDesk(param);
          if (res.data.status === 200) {
            this.uploadFile(res.data.data.id);
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
                this.close();
              }
            });
          }
        }
      }
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
    close() {
      this.service = "";
      this.slaHari = "";
      this.slaJam = "";
      this.note = "";
      this.isPict = false;
      this.selectedFile1 = null;
      this.imgUpload = null;
      this.$v.$reset();
      this.$emit("close");
    },
  },
};
</script>
<style scope>
.required:after {
  content: " *";
  color: red;
}
#x {
  background: rgb(197, 194, 194);
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 15px;
}
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
}
</style>
