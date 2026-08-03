<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" persistent width="1000">
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col cols="9">
              <div style="
                  font-size: 18px;
                  line-height: 28px;
                  font-weight: 600;
                  color: #000000;
                ">
                {{ titleHead }} Application
              </div>
            </v-col>
            <v-col cols="3" class="text-right">
              <v-btn style="color: #606060" icon dark @click="close">
                <v-icon>{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <label class="required">Application Name</label>
              <v-text-field v-model.trim="$v.appsName.$model" :error-messages="getErrors('appsName', $v.appsName)"
                @blur="$v.appsName.$touch()" outlined placeholder="Application Name"></v-text-field>
            </v-col>
            <v-col cols="6">
              <label class="required">{{
                !isBsns
                  ? "Application Link"
                  : "Application Link"
              }}</label>
              <v-text-field v-model.trim="$v.link.$model" :error-messages="getErrors('link', $v.link)"
                @blur="$v.link.$touch()" outlined :placeholder="!isBsns ? 'http://' : 'http://'"></v-text-field>
            </v-col>
            <v-col cols="6">
              <label v-if="isBsns" :class="{ required: !isDivisionDisabled }">Department</label>
              <v-select v-if="isBsns" :disabled="isDivisionDisabled" :items="dataDivision" v-model="idDivision" outlined
                :required="!isDivisionDisabled" placeholder="Department">
              </v-select>
            </v-col>
            <v-col cols="6">
              <label v-if="isBsns" class="required">Position</label>
              <v-text-field v-if="isBsns" v-model.trim="$v.position.$model"
                :error-messages="getErrors('position', $v.position)" @blur="$v.position.$touch()" outlined
                @paste="onPaste" @keypress="allowOnlyDashDotNumber" placeholder="Position"></v-text-field>
            </v-col>
            <v-col cols="6">
              <label>Description</label>
              <v-textarea v-model="desc" outlined placeholder="Description"></v-textarea>
            </v-col>
            <v-col cols="6">
              <label class="required">Icon/Logo</label>
              <v-row style="margin: 0px" class="mb-5">
                <v-col v-if="selectedFile1 === null" style="text-align: center; border-style: dotted" :style="isPict ? 'color: red !important; border-color:red; ' : ''
                  " cols="12" @click="onButtonClick">
                  <v-icon size="50"> {{ icons.mdiFileDocumentOutline }} </v-icon><br />
                  <span class="font-subt">Add Icon/Logo</span><br />
                  <span class="font-subt">Max 1 file and max 1 MB</span><br />
                  <span class="font-subt">Resolution 80 x 80 px</span>
                </v-col>
                <v-col v-else class="mb-12" style="text-align: center" cols="12">
                  <button style="float: right" id="x" @click="deleteImage()">
                    X</button><br />
                  <img style="width: 100px; height: 100px" :src="imgUpload" />
                  <br /><span class="limit-text">{{ inputText }}</span>
                </v-col>
                <input ref="uploader" class="d-none" type="file" accept="image/*" @change="onFileChanged" />

                <!-- Error message untuk icon required -->
                <div class="mt-1" v-if="isPict" style="color: red; font-weight: 400; font-size: 12px">
                  Icon/Logo is required
                </div>

                <!-- Error message untuk resolusi tidak valid -->
                <div class="mt-1" v-if="resolutionError" style="color: red; font-weight: 400; font-size: 12px">
                  {{ resolutionError }}
                </div>
              </v-row>
            </v-col>
            <br />
            <v-btn :loading="loadiing" class="btn-submit" @click="submit">
              Add
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import { mdiClose, mdiFileDocumentOutline } from "@mdi/js";
import Swal from "sweetalert2";
import ApplicationService from "../../../services/application/applicationServices";
import { hitAPI } from "@/services/upload/uploadServices";

const postApps = ApplicationService.build();
export default {
  data() {
    return {
      titleHead: "Add",
      isPict: false,
      isValidResolution: false,
      resolutionError: "",
      appsName: "",
      link: "",
      desc: "",
      idEdit: "",
      idBsns: "",
      idDivision: "",
      division: "",
      dataDivision: [],
      isBisnis: false,
      divisionId: "",
      imgUpload: null,
      selectedFile1: null,
      loadiing: false,
      position: "",
      inputText: "",
      isSelecting: false,
      eventCategory: null,
      tempImage: null,
      eventCategories: ["Event 1", "Event 2"],
      isSelecting: false,
      baseUrl: process.env.VUE_APP_PERTAGAS,
      isDivisionDisabled: false,
      icons: {
        mdiFileDocumentOutline,
        mdiClose,
      },
    };
  },
  validations: {
    appsName: {
      required,
    },
    link: {
      required,
    },
    position: {
      required,
    },
  },
  props: {
    addBisnis: Boolean,
    open: Boolean,
    datas: Object,
    isBsns: Boolean,
    isEdit: Boolean,
  },
  created() { },
  computed: {
    isOpen: {
      get() {
        if (this.isBsns) {
          this.getDivision();
          if (this.addBisnis) {
            this.idDivision = this.datas.id;
            this.titleHead = "Add New";
            this.idBsns = "";
            this.selectedFile1 = null;
            this.isPict = false;
            this.isValidResolution = false;
            this.resolutionError = "";
            this.isDivisionDisabled = true;
          } else {
            this.titleHead = "Edit";
            this.idBsns = this.datas.id;
            this.divisionId = this.datas.divisionId;

            if (this.datas.divisionId === null || this.datas.divisionId === "" || this.datas.divisionId === undefined) {
              this.isDivisionDisabled = false;
              this.idDivision = "";
            } else {
              this.isDivisionDisabled = true;
              this.idDivision = this.datas.divisionId;
            }

            this.division = this.datas.id;
            this.appsName = this.datas.name;
            this.position = this.datas.position;
            this.desc = this.datas.description;
            const links = this.datas.link;
            if (links !== undefined) {
              this.link = links !== undefined || links !== "" ? links : links;
            } else {
              this.link = "";
            }
            this.imgUpload = this.baseUrl + this.datas.imageUrl;
            this.selectedFile1 = this.datas.imageUrl;
            this.tempImage = this.datas.imageUrl;
            this.isValidResolution = true;
            this.resolutionError = "";
          }
        }
        return this.open;
      },
      set(value) {
        if (!value) {
          this.$emit("clicked");
        }
      },
    },
  },
  methods: {
    onPaste(event) {
      event.preventDefault();
    },
    allowOnlyDashDotNumber(event) {
      const keyCode = event.keyCode || event.which;

      if (keyCode >= 48 && keyCode <= 57) {
        return true;
      } else {
        event.preventDefault();
        return false;
      }
    },
    async getDivision() {
      const res = await postApps.getEventsDivision();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.dataDivision = filter;
    },
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "appsName":
          !model.required && errors.push("Application Name is required.");
          break;
        case "link":
          !model.required &&
            errors.push(
              this.isBsns === false
                ? "Personal Application Link"
                : "Bussiness Application Link" + " is required"
            );
          break;
        case "position":
          !model.required && errors.push("Position is required.");
          break;
        default:
          break;
      }

      return errors;
    },
    async submit() {
      this.$v.$touch();

      const isIconMissing = this.selectedFile1 === null;
      const isResolutionInvalid = this.selectedFile1 !== null && !this.isValidResolution;

      this.isPict = isIconMissing;

      if (isIconMissing) {
        return;
      }

      if (isResolutionInvalid) {
        this.errorPopup("Please upload an image with 80x80px resolution");
        return;
      }

      if (!this.isBsns) {
        if (!this.$v.appsName.$invalid && !this.$v.link.$invalid) {
          this.loadiing = true;
          const param = {
            id: this.idEdit,
            name: this.appsName,
            link: this.link,
            description: this.desc,
          };
          const res =
            this.idEdit === ""
              ? await postApps.postApps(param)
              : await postApps.editApps(param);
          if (res.data.status === 200) {
            if (typeof this.selectedFile1 === "string") {
              Swal.fire({
                icon: "success",
                title: "Success",
                text: res.data.message,
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
            } else {
              this.uploadFile(res.data.data.id, 0);
            }
          } else {
            this.loadiing = false;
            Swal.fire({
              icon: "error",
              title: "Failed",
              text: res.data.message,
              buttons: {
                cancel: false,
                confirm: true,
              },
              closeOnEsc: false,
              closeOnClickOutside: false,
            });
          }
        }
      } else {
        if (!this.$v.appsName.$invalid && !this.$v.link.$invalid && !this.$v.position.$invalid) {
          this.loadiing = true;
          const param = {
            id: this.idBsns !== "" ? this.idBsns : this.division,
            name: this.appsName,
            position: parseInt(this.position),
            link: this.link,
            divisionId: this.idDivision,
            description: this.desc,
          };
          const res =
            this.idBsns === ""
              ? await postApps.postAppsBsns(param)
              : await postApps.editAppsBsns(param);
          if (res.data.status === 200) {
            if (this.tempImage === this.selectedFile1) {
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
                  this.loadiing = false;
                  this.close();
                }
              });
            } else {
              this.uploadFile(res.data.data.id, 1);
            }
          } else {
            this.loadiing = false;
            Swal.fire({
              icon: "error",
              title: "Failed",
              text: res.data.message,
              buttons: {
                cancel: false,
                confirm: true,
              },
              closeOnEsc: false,
              closeOnClickOutside: false,
            });
          }
        }
      }
    },
    resetFileInput() {
      this.$refs.uploader.value = "";
      this.selectedFile1 = null;
      this.isSelecting = false;
      this.isValidResolution = false;
      this.resolutionError = "";
      this.imgUpload = null;
      this.inputText = "";
    },
    deleteImage() {
      this.resetFileInput();
      this.isPict = false;
    },
    successPopup(val) {
      Swal.fire({
        title: "Success",
        text: val,
        icon: "success",
        confirmButtonText: "OK",
        closeOnEsc: false,
        closeOnClickOutside: false,
      });
    },
    errorPopup(val) {
      Swal.fire({
        title: "Failed",
        text: val,
        icon: "error",
        button: true,
      });
    },
    onFileChanged(e) {
      this.selectedFile = e.target.files[0];
      this.inputText = e.target.files[0].name;

      if (e.target.files[0].size > 1000000) {
        this.errorPopup("File upload exceeds the 1MB limit!");
        this.resetFileInput();
        return;
      }

      if (
        e.target.files[0].type === "image/png" ||
        e.target.files[0].type === "image/jpeg" ||
        e.target.files[0].type === "image/jpg"
      ) {
        this.validateImageResolution(e.target.files[0]);
      } else {
        this.errorPopup("Unsupported Image File");
        this.resetFileInput();
      }
    },
    validateImageResolution(file) {
      const img = new Image();
      img.onload = () => {
        if (img.width === 80 && img.height === 80) {
          this.isValidResolution = true;
          this.resolutionError = "";
          this.imgUpload = URL.createObjectURL(file);
          this.selectedFile1 = file;
          this.inputText = file.name;
          this.isPict = false;
        } else {
          this.isValidResolution = false;
          this.resolutionError = `Invalid resolution: ${img.width}x${img.height}px. Required: 80x80px`;
          this.errorPopup(`Invalid image resolution: ${img.width}x${img.height}px. Required resolution is 80x80px`);
          this.resetFileInput();
        }
      };

      img.onerror = () => {
        this.errorPopup("Error loading image file");
        this.resetFileInput();
      };

      img.src = URL.createObjectURL(file);
    },
    async uploadFile(id, x) {
      const par = new FormData();

      par.append("file", this.selectedFile1);
      const api =
        x === 0 ? "personal-apps/document/" : "business-apps/document/";
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
              this.loadiing = false;
              this.close();
            }
          });
        } else {
          this.loadiing = false;
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
      this.$refs.uploader.value = "";
      this.$v.$reset();
      this.appsName = "";
      this.link = "";
      this.desc = "";
      this.position = "";
      this.titleHead = "";
      this.imgUpload = null;
      this.selectedFile1 = null;
      this.isPict = false;
      this.isValidResolution = false;
      this.resolutionError = "";
      this.isDivisionDisabled = false;
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

#x {
  background: rgb(197, 194, 194);
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 15px;
}
</style>