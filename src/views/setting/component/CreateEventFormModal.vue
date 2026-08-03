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
            <v-col cols="6">
              <label class="required">Name</label>
              <v-text-field
                v-model.trim="$v.name.$model"
                :error-messages="getErrors('name', $v.name)"
                @blur="$v.name.$touch()"
                outlined
                placeholder="Name"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <label class="required">Description</label>
              <v-text-field
                v-model.trim="$v.description.$model"
                :error-messages="getErrors('description', $v.description)"
                @blur="$v.description.$touch()"
                outlined
                placeholder="Description"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <label class="required">Foreground Color</label>
              <div style="text-align: -webkit-center">
                <v-color-picker
                  style="width: 100%"
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
                  style="width: 100%"
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
            <br />
            <v-btn
              class="btn-submit mt-2 mb-2"
              @click="submit"
              @loading="loading"
            >
              Save Event Category
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
import EventCategoryService from "../../../services/management/event_category/eventCategoryServices";

const eventCategoryService = EventCategoryService.build();

export default {
  data() {
    return {
      title: "Create Event Category",
      loading: false,
      id: "",
      name: "",
      description: "",
      color: "",
      colorSecondary: "",
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
    description: {
      required,
    },
    color: {
      required,
    },
    colorSecondary: {
      required,
    },
  },
  props: {
    open: Boolean,
    item: Object,
    statusDetail: String,
  },
  created() {},
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
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "name":
          !model.required && errors.push("Name is required.");
          break;
        case "description":
          !model.required && errors.push("Description is required");
          break;
        case "color":
          !model.required && errors.push("Foreground Color is required");
          break;
        case "colorSecondary":
          !model.required && errors.push("Background Color is required");
          break;
        default:
          break;
      }

      return errors;
    },
    edit() {
      if (this.item != null) {
        this.title = "Edit Event Category";
        this.id = this.item.id;
        this.name = this.item.name;
        this.description = this.item.description;
        this.color = this.item.color;
        this.colorSecondary = this.item.colorSecondary;
      } else {
        this.title = "Create Event Category";
        this.$v.$reset();
        this.name = "";
        this.description = "";
        this.color = "";
        this.colorSecondary = "";
        this.form = {};
      }
    },
    async submit() {
      this.$v.$touch();
      if (
        !this.$v.name.$invalid &&
        !this.$v.color.$invalid &&
        !this.$v.colorSecondary.$invalid &&
        !this.$v.description.$invalid
      ) {
        this.loading = true;

        const param = {
          id: this.id,
          name: this.name,
          description: this.description,
          color: this.color.hex !== undefined ? this.color.hex : this.color,
          colorSecondary:
            this.colorSecondary.hex !== undefined
              ? this.colorSecondary.hex
              : this.colorSecondary,
        };
        const res =
          this.item == null
            ? await eventCategoryService.add(param)
            : await eventCategoryService.update(param);

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
              this.form = {};
              this.$emit("close");
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
      this.$v.$reset();
      this.name = "";
      this.description = "";
      this.color = "";
      this.colorSecondary = "";
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
</style>
