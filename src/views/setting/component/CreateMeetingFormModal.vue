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
            <label class="required">Room Name</label>
            <v-text-field
              v-model.trim="$v.name.$model"
              :error-messages="getErrors('name', $v.name)"
              @blur="$v.name.$touch()"
              outlined
              placeholder="Room Name"
            ></v-text-field>
            <label class="required">Office Location</label>
            <v-select
              v-model.trim="$v.officeId.$model"
              :error-messages="getErrors('officeId', $v.officeId)"
              @blur="$v.officeId.$touch()"
              outlined
              :items="officeOptions"
              item-text="label"
              item-value="value"
              placeholder="Office Location"
            ></v-select>
            <label class="required">ID Yeaster</label>
            <v-text-field
              v-model.trim="$v.idYeaster.$model"
              :error-messages="getErrors('idYeaster', $v.idYeaster)"
              @blur="$v.idYeaster.$touch()"
              @keydown="allowNumeric"
              outlined
              placeholder="Room Capacity"
            ></v-text-field>
            <label class="required">Room Capacity</label>
            <v-text-field
              v-model.trim="$v.capacity.$model"
              :error-messages="getErrors('capacity', $v.capacity)"
              @blur="$v.capacity.$touch()"
              @keydown="allowNumeric"
              outlined
              placeholder="Room Capacity"
            ></v-text-field>
            <label class="required">Description</label>
            <v-textarea
              v-model.trim="$v.description.$model"
              :error-messages="getErrors('description', $v.description)"
              @blur="$v.description.$touch()"
              outlined
              placeholder="Description"
            ></v-textarea>
            <br />
            <v-btn class="btn-submit" @click="submit"> SAVE </v-btn>
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
import MeetingRoomService from "../../../services/management/meeting_room/meetingRoomServices";

const officeService = OfficeService.build();
const meetingRoomService = MeetingRoomService.build();

export default {
  data() {
    return {
      title: "Create Meeting Room",
      loading: false,
      id: "",
      name: "",
      officeId: "",
      capacity: "",
      idYeaster: "",
      description: "",
      officeOptions: [],
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
    officeId: {
      required,
    },
    capacity: {
      required,
    },
    description: {
      required,
    },
    idYeaster: {
      required,
    },
  },
  props: {
    open: Boolean,
    item: Object,
    datas: Object,
    statusDetail: String,
  },
  created() {
    this.getOfficeOptions();
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
          this.id = "";
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    allowNumeric(event) {
      // Allow navigation keys like arrow keys, delete, backspace, etc.
      if (
        (event.keyCode >= 35 && event.keyCode <= 40) ||
        event.keyCode === 8 || // Backspace
        event.keyCode === 46 // Delete
      ) {
        return;
      }

      // Allow numeric keys
      if (event.keyCode < 48 || event.keyCode > 57) {
        event.preventDefault();
      }
    },
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "name":
          !model.required && errors.push("Room Name is required.");
          break;
        case "officeId":
          !model.required && errors.push("Office Location is required");
          break;
        case "capacity":
          !model.required && errors.push("Room Capacity is required");
          break;
        case "description":
          !model.required && errors.push("Description is required");
          break;
        case "idYeaster":
          !model.required && errors.push("ID Yeaster is required");
          break;
        default:
          break;
      }

      return errors;
    },
    async getOfficeOptions() {
      const res = await officeService.getOptions();
      const data = res.data.data;
      this.officeOptions = data;
    },
    edit() {
      if (this.item.id !== undefined) {
        this.title = "Edit Meeting Room";
        this.id = this.item.id;
        this.name = this.item.name;
        this.officeId = this.item.officeId;
        this.capacity = this.item.capacity;
        this.description = this.item.description;
        this.idYeaster = this.item.yeastarId;
      } else {
        this.title = "Create Meeting Room";
        this.item = null;
        this.id = "";
        this.name = "";
        this.officeId = "";
        this.capacity = "";
        this.description = "";
        this.$v.$reset();
        this.form = {};
      }
    },
    async submit() {
      this.$v.$touch();
      if (
        !this.$v.name.$invalid &&
        !this.$v.officeId.$invalid &&
        !this.$v.capacity.$invalid &&
        !this.$v.description.$invalid &&
        !this.$v.idYeaster.$invalid
      ) {
        this.loading = true;
        const param = {
          id: this.id,
          name: this.name,
          officeId: this.officeId,
          capacity: this.capacity,
          description: this.description,
          yeastarId: this.idYeaster,
        };
        const res =
          this.item == null
            ? await meetingRoomService.add(param)
            : await meetingRoomService.update(param);

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
      this.item = null;
      this.id = "";
      this.name = "";
      this.officeId = "";
      this.capacity = "";
      this.description = "";
      this.idYeaster = "";
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
