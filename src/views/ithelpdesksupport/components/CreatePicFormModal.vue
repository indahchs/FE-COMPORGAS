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
                {{ isEdit ? "Edit PIC" : "Create PIC" }}
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
            <label class="required">PIC</label>
            <v-autocomplete
              :readonly="isEdit"
              dense
              v-model.trim="$v.pic.$model"
              :error-messages="getErrors('pic', $v.pic)"
              @blur="$v.pic.$touch()"
              :items="picData"
              outlined
              placeholder="PIC"
            ></v-autocomplete>
            <label class="required">Office Location</label>
            <v-select
              dense
              v-model.trim="$v.location.$model"
              :error-messages="getErrors('location', $v.location)"
              @blur="$v.location.$touch()"
              :items="locationData"
              outlined
              placeholder="Office Location"
            ></v-select>
            <label>Status</label>
            <v-switch v-model="status"></v-switch>
            <br />
            <v-btn :loading="loading" class="btn-submit" @click="submit">
              {{ isEdit ? "Edit PIC" : "Create PIC" }}
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
      status: false,
      loading: false,
      slaHari: "",
      slaJam: "",
      picData: [],
      pic: "",
      location: "",
      locationData: [],
      isPict: false,
      judul: "",
      service: "",
      lokasi: "",
      pic: "",
      desc: "",
      idCat: "",
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
    pic: {
      required,
    },
    location: {
      required,
    },
  },
  props: {
    open: Boolean,
    datas: Object,
    isEdit: Boolean,
    statusDetail: String,
  },
  created() {},
  computed: {
    isOpen: {
      get() {
        this.idCat = this.datas.id;
        this.getPic();
        if (this.isEdit) {
          this.isEdit = true;
          this.pic = this.datas.userId;
          this.location = this.datas.officeLocationId;
          this.status = this.datas.active;
        } else {
          this.pic = "";
          this.location = "";
          this.status = true;
        }
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
    async getPic(x) {
      const res = await getHelpDesk.getPic();
      const data = res.data.data;
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      if (this.isEdit) {
        const datas = data.filter((value) => value.text === x);
      }
      this.picData = filter;
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
        case "pic":
          !model.required && errors.push("PIC is required");
          break;
        case "location":
          !model.required && errors.push("Location is required");
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
      if (!this.$v.pic.$invalid && !this.$v.location.$invalid) {
        this.loading = true;
        const param = {
          id: this.idCat,
          catalogIthelpdeskId: this.idCat,
          officeLocationId: this.location,
          userId: this.pic,
          active: this.status,
        };
        const res = this.isEdit
          ? await getHelpDesk.putHelpDeskPic(param)
          : await getHelpDesk.postHelpDeskPic(param);
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
              //this.status = true;
              this.$v.$reset();
              this.$emit("close", res.data);
            }
          });
        } else {
          this.errorPopup(res.data.message);
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
      }).then((result) => {
        if (result) {
          this.loading = false;
          //this.status = true;
          this.$v.$reset();
          this.$emit("close", res.data);
        }
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
      this.location = "";
      this.slaJam = "";
      this.isPict = false;
      this.selectedFile1 = null;
      this.imgUpload = null;
      //this.status = true;
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
