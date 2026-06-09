<template>
  <div>
    <v-card class="border-card" style="box-shadow: none">
      <v-card-text>
        <v-btn icon class="rounded-circle" @click="goBack">
          <v-icon color="black">
            {{ icons.mdiArrowLeft }}
          </v-icon>
        </v-btn>
      </v-card-text>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <label class="required">Catalog</label>
            <v-text-field
              dense
              v-model.trim="$v.catalog.$model"
              :error-messages="getErrors('catalog', $v.catalog)"
              @blur="$v.catalog.$touch()"
              outlined
              placeholder="Catalog"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <label class="required">SLA Days</label>
            <v-text-field
              type="number"
              min="0"
              dense
              v-model.trim="$v.slaHari.$model"
              :error-messages="getErrors('slaHari', $v.slaHari)"
              @blur="$v.slaHari.$touch()"
              outlined
              placeholder="SLA Days"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <label class="required">SLA Hours</label>
            <v-text-field
              type="number"
              min="0"
              dense
              v-model.trim="$v.slaJam.$model"
              :error-messages="getErrors('slaJam', $v.slaJam)"
              @blur="$v.slaJam.$touch()"
              outlined
              placeholder="SLA Hours"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <label class="required">Image Catalog</label>
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
                <v-icon size="50"> {{ icons.mdiImage }} </v-icon
                ><br />
                <span class="font-subt">Add Image</span><br />
                <span class="font-subt">Max 1 image dan max size 5 MB</span><br />
              </v-col>
              <v-col v-else class="mb-12" style="text-align: center" cols="12">
                <button style="margin-left: 80px" id="x" @click="deleteImage()">
                  X</button
                ><br />
                <img style="width: 80px; height: 80px" :src="imgUpload" />
                <br /><span class="limit-text">{{ inputText }}</span>
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
          </v-col>
          <v-col cols="12">
            <label class="required">Note</label>
            <v-textarea
              v-model.trim="$v.note.$model"
              :error-messages="getErrors('note', $v.note)"
              @blur="$v.note.$touch()"
              outlined
              placeholder="Write your note here"
            >
            </v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-btn :loading="loading" @click="submit" class="mt-6 btn-submit" depressed
      >SAVE</v-btn
    >
    <v-card class="mt-6 border-card">
      <v-card-title class="align-start">
        <h4>PIC</h4>
        <v-spacer></v-spacer>

        <v-btn class="btn-submit" @click="createPic" depressed
          >CREATE</v-btn
        >
      </v-card-title>
      <v-card-text class="mt-6">
        <v-data-table
          style="width: 100%"
          :loading="myloadingvariable"
          :headers="headers"
          :items="items"
          @click:row="handleClick"
          :footer-props="{
            'items-per-page-options': [5, 10, 25],
            'items-per-page-text': 'Items per page:',
            'show-current-page': true,
            'show-first-last-page': true,
          }"
        >
          <template #[`item.active`]="{ item, index }">
            {{ item.active === true ? "Active" : "Not Active" }}
          </template>
          <template #[`item.aksi`]="{ item, index }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                  size="20"
                  style="color: blue"
                  v-on:click.stop="deleteConfirm(item.id)"
                >
                  {{ icons.mdiTrashCanOutline }}
                </v-icon></template
              ><span>Delete</span></v-tooltip
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <CreatePicFormModalVue
      :open="openModalPic"
      :datas="datasCat"
      :isEdit="isEdit"
      @close="closePic"
    ></CreatePicFormModalVue>
  </div>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import Swal from "sweetalert2";
import {
  mdiCloseBox,
  mdiTrashCanOutline,
  mdiArrowLeft,
  mdiImage,
  mdiPlus,
} from "@mdi/js";
import CreatePicFormModalVue from "./CreatePicFormModal.vue";
import { hitAPI } from "@/services/upload/uploadServices";
import ItHelpDeskService from "../../../services/ithelpdesk/itHelpDeskServices";

const getHelpDesk = ItHelpDeskService.build();
export default {
  components: {
    CreatePicFormModalVue,
  },
  data() {
    return {
      isEdit: false,
      datasCat: {},
      openModalPic: false,
      myloadingvariable: false,
      headers: [
        { text: "Name", value: "userName" },
        { text: "Office Location", value: "officeLocationName" },
        { text: "Status", value: "active" },
        { text: "Action", value: "aksi" },
      ],
      items: [],
      loading: false,
      totalPages: 0,
      totalElements: 0,
      first: true,
      numberOfElements: 0,
      size: 20,
      number: 0,
      isData: false,
      dataPic: [],
      slaHari: "",
      slaJam: "",
      note: "",
      isPict: false,
      imgUpload: null,
      selectedFile1: null,
      inputText: "",
      isSelecting: false,
      catalog: "",
      location: "",
      locationData: [],
      pic: "",
      textFieldValue: "",
      switchValue: false,
      picData: [],
      tempImage: "",
      idEdit: "",
      baseUrl: process.env.VUE_APP_PERTAGAS,
      icons: {
        mdiArrowLeft,
        mdiPlus,
        mdiCloseBox,
        mdiTrashCanOutline,
        mdiImage,
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
    catalog: {
      required,
    },
    location: {
      required,
    },
    note: {
      required,
    },
  },
  props: ["datas"],
  created() {
    this.getLocations();
    this.getPic();
    this.getProps();
  },
  watch: {
    selectedFile1() {
      this.isPict = this.selectedFile1 !== null ? false : true;
    },
  },
  methods: {
    async deleteConfirm(id) {
      Swal.fire({
        icon: "warning",
        title: "Delete",
        text: "Are you sure you deleted this data?",
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
    async delete(id) {
      const res = await getHelpDesk.deleteHelpDeskPic(id);
      if (res.data.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.message,
          showCancelButton: false,
          showConfirmButton: true,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((result) => {
          if (result) {
            this.loading = false;
            this.getData(res.data, 1);
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res.data.message,
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
    },
    closePic(x) {
      this.getData(x);
      this.openModalPic = false;
    },
    async getData(x, y) {
      const id = y === 1 ? this.idEdit : x.data.id;
      const res = await getHelpDesk.getHelpDeskById(id);
      const data = res.data.data;
      this.idEdit = data.id;
      this.catalog = data.name;
      this.slaHari = data.slaDays;
      this.slaJam = data.slaHours;
      this.note = data.note;
      this.tempImage = data.imageUrl;
      this.imgUpload = this.baseUrl + data.imageUrl;
      this.selectedFile1 = data.imageUrl;
      this.items = data.listPic;
    },
    createPic() {
      this.openModalPic = true;
      this.isEdit = false;
      this.datasCat = this.datas;
    },
    handleClick(x) {
      this.isEdit = true;
      this.openModalPic = true;
      this.datasCat = x;
    },
    goBack() {
      this.openModalPic = false;
      this.$emit("clicked");
    },
    getProps() {
      this.idEdit = this.datas.id;
      this.catalog = this.datas.name;
      this.location = this.datas.officeLocationId;
      this.slaHari = this.datas.slaDays;
      this.slaJam = this.datas.slaHours;
      this.note = this.datas.note;
      this.tempImage = this.datas.imageUrl;
      this.imgUpload = this.baseUrl + this.datas.imageUrl;
      this.selectedFile1 = this.datas.imageUrl;
      this.items = this.datas.listPic;
    },
    async submitPic(x) {
      const userId = this.dataPic[0];
      const param = {
        catalogIthelpdeskId: x,
        userId: userId !== undefined ? userId.value : this.pic.value,
        active: true,
      };
      const res = await getHelpDesk.postHelpDeskPic(param);
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
            this.$emit("clicked");
          }
        });
      } else {
        this.errorPopup(res.data.message);
      }
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
              this.$emit("clicked");
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
        return;
      }
      this.isPict = false;
      if (
        !this.$v.slaHari.$invalid &&
        !this.$v.slaJam.$invalid &&
        !this.$v.catalog.$invalid &&
        !this.$v.note.$invalid
      ) {
          this.loading = true;
          const param = {
            id: this.idEdit,
            name: this.catalog,
            slaDays: this.slaHari,
            slaHours: this.slaJam,
            note: this.note,
          };
          const res = await getHelpDesk.putHelpDesk(param);
          if (res.data.status === 200) {
            if (this.tempImage !== this.selectedFile1) {
              this.uploadFile(res.data.data.id);
            } else {
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
                  this.getData(res.data);
                }
              });
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed",
              text: res.data.errors !== null
                ? res.data.errors[0].message
                : res.data.message,
              buttons: { cancel: false, confirm: true },
              closeOnEsc: false,
              closeOnClickOutside: false,
            }).then((result) => {
              if (result) {
                this.close();
              }
            });
          }
        }
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
        case "catalog":
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
    addPic() {
      const data = [this.pic];
      data.forEach(function (obj) {
        obj["active"] = true;
      });
      this.isData = true;
      this.dataPic.push(data[0]);
    },
    async getPic() {
      const res = await getHelpDesk.getPic();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.picData = filter;
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
      const file = e.target.files[0];
      if (!file) return;
      this.inputText = file.name;

      if (file.size > 5000000) {
        this.errorPopup("File upload exceeds the 5MB limit!");
        this.$refs.uploader.value = "";
        return;
      }

      if (["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imgUpload = e.target.result;
          this.selectedFile1 = file;
        };
        reader.readAsDataURL(file);
      } else {
        this.errorPopup("Unsupported Image File");
        this.$refs.uploader.value = "";
      }
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
    async getLocations() {
      const res = await getHelpDesk.getLocation();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.locationData = filter;
    },
  },
};
</script>
<style scoped>
.required:after {
  content: " *";
  color: red;
}
.border-card {
  border: 1px solid #dfdfdf;
}
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 10%;
}
.rounded-circle {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  min-width: 50px;
  min-height: 50px;
  background-color: white;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.1);
}
#x {
  background: rgb(197, 194, 194);
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 15px;
}
</style>
