<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" width="400" persistent>
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col>
              <div style="font-size: 18px; line-height: 28px; font-weight: 600; color: #000000;">
                {{ titleHead }} User
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
            <label class="required">Employee Name</label>
            <v-text-field
              v-model="name"
              outlined
              :disabled="false"
              placeholder="Input Employee Name"
            ></v-text-field>

            <label :class="isAdd ? 'required' : ''">Email</label>
            <v-text-field
              v-model="email"
              outlined
              :disabled="!isAdd"
              placeholder="Input Email"
            ></v-text-field>

            <label>Bidang</label>
            <v-text-field
              v-model="title"
              outlined
              placeholder="Input Bidang"
            ></v-text-field>

            <template v-if="isAdd">
              <label class="required">Password</label>
              <v-text-field
                v-model="password"
                outlined
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? icons.mdiEye : icons.mdiEyeOff"
                @click:append="showPassword = !showPassword"
                placeholder="Input Password"
              ></v-text-field>
            </template>

            <label class="required">Role</label>
            <v-select
              v-model="roleId"
              outlined
              :items="roleOpt"
              placeholder="Role"
            ></v-select>
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
import { mdiClose, mdiFileDocumentOutline, mdiEye, mdiEyeOff } from "@mdi/js";
import Swal from "sweetalert2";
import UserService from "@/services/management/user/userServices";
import RoleService from "@/services/management/role/roleServices";

const getRole = RoleService.build();
const getUser = UserService.build();

export default {
  data() {
    return {
      isAdd: true,
      titleHead: "Add",
      loading: false,
      name: "",
      email: "",
      title: "",
      password: "",
      showPassword: false,
      roleId: "",
      idEdit: "",
      ldap: false,
      active: false,
      roleOpt: [],
      icons: {
        mdiFileDocumentOutline,
        mdiClose,
        mdiEye,
        mdiEyeOff,
      },
    };
  },
  props: {
    open: Boolean,
    datas: Object,
    statusDetail: String,
  },
  computed: {
    isOpen: {
      get() {
        if (this.datas && this.datas.id !== undefined) {
          this.isAdd = false;
          this.titleHead = "Edit";
          this.idEdit = this.datas.id;
          this.name = this.datas.fullName;
          this.title = this.datas.title;
          this.roleId = this.datas.roleId;
          this.active = this.datas.active;
          this.ldap = this.datas.ldap;
          this.email = this.datas.email;
        } else {
          this.isAdd = true;
          this.titleHead = "Add";
          this.idEdit = undefined;
          this.name = "";
          this.email = "";
          this.title = "";
          this.password = "";
          this.roleId = "";
          this.active = true;
          this.ldap = false;
        }
        this.getRole();
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
    async getRole() {
      const res = await getRole.getRoleOpt();
      const data = res.data.data;
      this.roleOpt = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
    },
    async submit() {
      if (this.isAdd) {
        if (!this.name || !this.email || !this.password || !this.roleId) {
          Swal.fire({
            icon: "warning",
            title: "Peringatan",
            text: "Harap lengkapi semua field yang wajib diisi.",
          });
          return;
        }
        if (this.name.length < 5) {
          Swal.fire({
            icon: "warning",
            title: "Peringatan",
            text: "Nama Lengkap harus minimal 5 karakter.",
          });
          return;
        }
        if (this.email.length < 5) {
          Swal.fire({
            icon: "warning",
            title: "Peringatan",
            text: "Email harus minimal 5 karakter.",
          });
          return;
        }
      } else {
        if (!this.roleId) {
          Swal.fire({
            icon: "warning",
            title: "Peringatan",
            text: "Role wajib dipilih.",
          });
          return;
        }
      }

      this.loading = true;

      const param = {
        email: this.email,
        active: true,
        fullName: this.name,
        title: this.title,
        roleId: this.roleId,
        password: this.password,
      };

      const paramEdit = {
        id: this.idEdit,
        ldap: this.ldap,
        active: this.active,
        fullName: this.name,
        title: this.title,
        roleId: this.roleId,
      };

      try {
        const res = this.isAdd
          ? await getUser.postUser(param)
          : await getUser.editUser(paramEdit);

        if (res && res.data && res.data.status === 200) {
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
              this.close();
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: res?.data?.message || "Terjadi kesalahan",
            showCancelButton: false,
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.loading = false;
          });
        }
      } catch (error) {
        this.loading = false;
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Terjadi kesalahan: " + error.message,
        });
      }
    },
    close() {
      this.idEdit = "";
      this.name = "";
      this.email = "";
      this.title = "";
      this.password = "";
      this.showPassword = false;
      this.roleId = "";
      this.active = "";
      this.ldap = "";
      this.isAdd = true;
      this.titleHead = "Add";
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