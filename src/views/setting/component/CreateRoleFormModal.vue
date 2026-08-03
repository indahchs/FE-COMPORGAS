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
                {{ titleHead }} Role
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
            <label class="required">Role Name</label>
            <v-text-field
              v-model.trim="$v.role.$model"
              :error-messages="getErrors('role', $v.role)"
              @blur="$v.role.$touch()"
              outlined
              placeholder="Role Name"
            ></v-text-field>
            <v-text-field
              v-model="desc"
              outlined
              label="Description"
            ></v-text-field>
            <br />
            <v-btn :loading="loading" class="btn-submit" @click="submit">
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
import RoleService from "@/services/management/role/roleServices";

const getRole = RoleService.build();
export default {
  data() {
    return {
      loading: false,
      role: "",
      desc: "",
      idEdit: "",
      icons: {
        mdiFileDocumentOutline,
        mdiClose,
      },
    };
  },
  validations: {
    role: {
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
        this.idEdit = this.datas.id;
        this.role = this.datas.name;
        this.desc = this.datas.description;
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
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "role":
          !model.required && errors.push("Role Name is required.");
          break;
        default:
          break;
      }

      return errors;
    },
    async submit() {
      this.$v.$touch();
      if (!this.$v.role.$invalid) {
        this.loading = true;
        const param = {
          id: this.idEdit,
          name: this.role,
          description: this.desc,
        };
        const res =
          this.idEdit === undefined
            ? await getRole.postRole(param)
            : await getRole.editRole(param);
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
              this.loading = false;
              this.close();
            }
          });
        }
      }
    },
    close() {
      this.$v.$reset();
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
}
.required:after {
  content: " *";
  color: red;
}
</style>
