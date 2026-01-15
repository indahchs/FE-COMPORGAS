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
            <v-text-field
              v-model="name"
              outlined
              disabled
              label="Employee Name"
            ></v-text-field>
            <v-text-field
              disabled
              v-model="email"
              outlined
              label="Email"
            ></v-text-field>
            <v-text-field
              disabled
              v-model="title"
              outlined
              label="Bidang"
            ></v-text-field>
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
import { mdiClose, mdiFileDocumentOutline } from "@mdi/js";
import Swal from "sweetalert2";
import UserService from "@/services/management/user/userServices";
import RoleService from "@/services/management/role/roleServices";

const getRole = RoleService.build();
const getUser = UserService.build();

export default {
  data() {
    return {
      isAdd: true,
      loading: false,
      name: "",
      email: "",
      title: "",
      roleId: "",
      idEdit: "",
      ldpa: false,
      active: false,
      roleOpt: [],
      icons: {
        mdiFileDocumentOutline,
        mdiClose,
      },
    };
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
        this.name = this.datas.fullName;
        this.title = this.datas.title;
        this.roleId = this.datas.roleId;
        this.active = this.datas.active;
        this.ldap = this.datas.ldap;
        this.email = this.datas.email;
        this.titleHead = this.datas.fullName !== undefined ? "Edit" : "Add";
        this.isAdd = this.datas.fullName !== undefined ? false : true;
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
      const filter = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
      this.roleOpt = filter;
    },
    async submit() {
      this.loading = true;
      const param = {
        email: this.email,
        active: true,
        fullName: this.name,
        title: this.title,
        roleId: this.roleId,
      };
      const paramEdit = {
        id: this.idEdit,
        ldap: this.ldap,
        active: this.active,
        fullName: this.name,
        title: this.title,
        roleId: this.roleId,
      };
      const res =
        this.idEdit === undefined
          ? await getUser.postUser(param)
          : await getUser.editUser(paramEdit);
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
      this.idEdit = "";
      this.name = "";
      this.title = "";
      this.roleId = "";
      this.active = "";
      this.ldap = "";
      this.email = "";
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
