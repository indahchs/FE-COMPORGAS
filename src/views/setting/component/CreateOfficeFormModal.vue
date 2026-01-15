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
          <form @submit.prevent="submit">
            <label class="required">Office Name</label>
            <v-text-field
              v-model.trim="$v.name.$model"
              :error-messages="getErrors('name', $v.name)"
              @blur="$v.name.$touch()"
              outlined
              placeholder="Input Office Name"
            ></v-text-field>
            <label class="required">Latitude</label>
            <v-text-field
              @keypress="allowOnlyDashDotNumber"
              v-model.trim="$v.latitude.$model"
              :error-messages="getErrors('latitude', $v.latitude)"
              @blur="$v.latitude.$touch()"
              outlined
              placeholder="Latitude"
            ></v-text-field>
            <label class="required">Longitude</label>
            <v-text-field
              @keypress="allowOnlyDashDotNumber"
              v-model.trim="$v.longitude.$model"
              :error-messages="getErrors('longitude', $v.longitude)"
              @blur="$v.longitude.$touch()"
              outlined
              placeholder="Longitude"
            ></v-text-field>
            <label class="required">Address</label>
            <v-textarea
              v-model.trim="$v.address.$model"
              :error-messages="getErrors('address', $v.address)"
              @blur="$v.address.$touch()"
              outlined
              placeholder="Address"
            ></v-textarea>
            <br />
            <v-btn class="btn-submit" @click="submit" @loading="loading">
              SAVE
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
import OfficeService from "../../../services/management/office/officeLocationServices";

const officeService = OfficeService.build();

export default {
  data() {
    return {
      title: "Create Office Location",
      loading: false,

      id: "",
      name: "",
      latitude: "",
      longitude: "",
      address: "",

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
    latitude: {
      required,
    },
    longitude: {
      required,
    },
    address: {
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
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    allowOnlyDashDotNumber(event) {
      const keyCode = event.keyCode || event.which;

      if (
        (keyCode >= 48 && keyCode <= 57) || // Numbers 0-9
        keyCode === 45 || // Dash (-)
        keyCode === 46 // Dot (.)
      ) {
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
        case "name":
          !model.required && errors.push("Office Name is required.");
          break;
        case "latitude":
          this.isYear = !!model.$error;
          !model.required && errors.push("Latitude is required");
          break;
        case "longitude":
          this.isStart = !!model.$error;
          !model.required && errors.push("Longitude is required");
          break;
        case "address":
          this.isEnd = !!model.$error;
          !model.required && errors.push("Address is required");
          break;
        default:
          break;
      }

      return errors;
    },
    edit() {
      if (this.item != null) {
        this.title = "Edit Office Location";
        this.id = this.item.id;
        this.name = this.item.name;
        this.latitude = this.item.latitude;
        this.longitude = this.item.longitude;
        this.address = this.item.address;
      } else {
        this.title = "Create Office Location";
        this.id = "";
        this.name = "";
        this.latitude = "";
        this.longitude = "";
        this.address = "";
        this.$v.$reset();
        this.form = {};
      }
    },
    async submit() {
      this.$v.$touch();
      if (
        !this.$v.name.$invalid &&
        !this.$v.latitude.$invalid &&
        !this.$v.longitude.$invalid &&
        !this.$v.address.$invalid
      ) {
        this.loading = true;
        const param = {
          id: this.id,
          name: this.name,
          latitude: this.latitude,
          longitude: this.longitude,
          address: this.address,
        };
        const res =
          this.item == null
            ? await officeService.add(param)
            : await officeService.update(param);

        const resData = res.data;
        if (resData.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: resData.message,
            showCancelButton: false,
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(async (result) => {
            if (result) {
              this.loading = false;
              this.item = null;
-              this.$emit("close");
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
    close() {
      this.id = "";
      this.name = "";
      this.latitude = "";
      this.longitude = "";
      this.address = "";
      this.$v.$reset();
      this.$emit("close");
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
