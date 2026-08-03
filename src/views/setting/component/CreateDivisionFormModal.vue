<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" width="1000" persistent>
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
                {{ titleHead }} Department
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
            <v-col cols="6">
              <label class="required">Department Name</label>
              <v-text-field
                v-model.trim="$v.divisionName.$model"
                :error-messages="getErrors('divisionName', $v.divisionName)"
                @blur="$v.divisionName.$touch()"
                outlined
                placeholder="Department Name"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <label class="required">Position</label>
              <v-text-field
                @keypress="allowOnlyDashDotNumber"
                v-model.trim="$v.position.$model"
                :error-messages="getErrors('position', $v.position)"
                @blur="$v.position.$touch()"
                outlined
                placeholder="Position"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <label class="required">Yeaster Member ID</label>
              <v-text-field
                @keypress="allowOnlyDashDotNumber"
                v-model.trim="$v.yeastarMemberId.$model"
                :error-messages="
                  getErrors('yeastarMemberId', $v.yeastarMemberId)
                "
                @blur="$v.yeastarMemberId.$touch()"
                outlined
                placeholder="Yeastar Member Id"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <label class="required">Yeaster User ID</label>
              <v-text-field
                @keypress="allowOnlyDashDotNumber"
                v-model.trim="$v.yeastarUserId.$model"
                :error-messages="getErrors('yeastarUserId', $v.yeastarUserId)"
                @blur="$v.yeastarUserId.$touch()"
                outlined
                placeholder="Yeastar User Id"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <label class="required">Foreground Color</label>
              <div style="text-align: -webkit-center">
                <v-color-picker
                  depressed
                  hide-mode-switch
                  mode="hexa"
                  v-model.trim="$v.color.$model"
                  :error-messages="getErrors('color', $v.color)"
                  @blur="$v.color.$touch()"
                ></v-color-picker>
              </div>
            </v-col>
            <v-col cols="6">
              <label class="required">Background Color</label>
              <div style="text-align: -webkit-center">
                <v-color-picker
                  depressed
                  hide-mode-switch
                  mode="hexa"
                  v-model.trim="$v.colorSecondary.$model"
                  :error-messages="
                    getErrors('colorSecondary', $v.colorSecondary)
                  "
                  @blur="$v.colorSecondary.$touch()"
                ></v-color-picker>
              </div>
            </v-col>
            <v-col cols="6">
              <label class="required">Description</label>
              <v-textarea
                v-model.trim="$v.desc.$model"
                :error-messages="getErrors('desc', $v.desc)"
                @blur="$v.desc.$touch()"
                outlined
                placeholder="Description"
              ></v-textarea>
            </v-col>
            <br />
            <v-btn :loading="loading" class="btn-submit mb-2" @click="submit">
              SAVE
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import Swal from "sweetalert2";
import { mdiClose, mdiFileDocumentOutline } from "@mdi/js";
import DivisionService from "@/services/management/division/divisionServices";

const postDiv = DivisionService.build();
export default {
  data() {
    return {
      yeastarMemberId: "",
      yeastarUserId: "",
      titleHead: "",
      loading: false,
      divisionName: "",
      desc: "",
      position: "",
      id: "",
      color: "",
      colorSecondary: "",
      icons: {
        mdiFileDocumentOutline,
        mdiClose,
      },
    };
  },
  validations: {
    divisionName: {
      required,
    },
    desc: {
      required,
    },
    color: {
      required,
    },
    colorSecondary: {
      required,
    },
    position: {
      required,
    },
    yeastarMemberId: {
      required,
    },
    yeastarUserId: {
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
        this.id = this.datas.id;
        this.divisionName = this.datas.name;
        this.desc = this.datas.description;
        this.color = this.datas.color;
        this.position = this.datas.position;
        this.colorSecondary = this.datas.colorSecondary;
        this.yeastarMemberId = this.datas.yeastarMemberId;
        this.yeastarUserId = this.datas.yeastarUserId;
        this.titleHead = this.datas.name !== undefined ? "Edit" : "Add";
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
    allowOnlyDashDotNumber(event) {
      const keyCode = event.keyCode || event.which;

      if (keyCode >= 48 && keyCode <= 57) {
        // Allow the key
        return true;
      } else {
        event.preventDefault(); // Prevent the key from being entered
        return false;
      }
    },
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "divisionName":
          !model.required && errors.push("Department Name is required.");
          break;
        case "desc":
          !model.required && errors.push("Description is required");
          break;
        case "color":
          !model.required && errors.push("Foreground Color is required");
          break;
        case "position":
          !model.required && errors.push("Position is required");
          break;
        case "colorSecondary":
          !model.required && errors.push("Background Color is required");
          break;
        case "yeastarMemberId":
          !model.required && errors.push("Yeaster Member Id is required");
          break;
        case "yeastarUserId":
          !model.required && errors.push("Yeaster User Id is required");
          break;

        default:
          break;
      }

      return errors;
    },
    async submit() {
      this.$v.$touch();
      if (
        !this.$v.divisionName.$invalid &&
        !this.$v.desc.$invalid &&
        !this.$v.position.$invalid &&
        !this.$v.yeastarMemberId.$invalid &&
        !this.$v.yeastarUserId.$invalid
      ) {
        this.loading = true;
        const param = {
          id: this.id,
          name: this.divisionName,
          position: this.position,
          description: this.desc,
          yeastarUserId: this.yeastarUserId,
          yeastarMemberId: this.yeastarMemberId,
          color: this.color.hex !== undefined ? this.color.hex : this.color,
          colorSecondary:
            this.colorSecondary.hex !== undefined
              ? this.colorSecondary.hex
              : this.colorSecondary,
        };
        const res =
          this.id === undefined
            ? await postDiv.postDivision(param)
            : await postDiv.editDivision(param);
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
            text: res.data.message,
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
      this.$v.$reset();
      this.name = "";
      this.desc = "";
      this.color = "";
      this.colorSecondary = "";
      this.$emit("clicked");
    },
  },
};
</script>
<style scope>
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
  font-size: 12px !important;
}
</style>
