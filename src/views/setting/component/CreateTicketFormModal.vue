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
                Create PIC Ticket
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
            <v-text-field
              v-model="service"
              outlined
              label="Masukkan Nama Ruangan"
            ></v-text-field>
            <v-select
              dense
              v-model="service"
              outlined
              :items="[
                'California',
                'Colorado',
                'Florida',
                'Georgia',
                'Texas',
                'Wyoming',
              ]"
              label="Pilih Lokasi Kantor"
            ></v-select>
            <v-text-field
              v-model="lokasi"
              outlined
              label="Masukkan Kapasitas Ruangan"
            ></v-text-field>
            <v-textarea
              v-model="service"
              outlined
              label="Masukkan Deskripsi"
            ></v-textarea>
            <br />
            <v-btn class="btn-submit" @click="submit">
              Save Office Location
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

export default {
  data() {
    return {
      judul: "",
      service: "",
      lokasi: "",
      pic: "",
      desc: "",
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
  props: {
    open: Boolean,
    datas: Object,
    statusDetail: String,
  },
  created() {},
  computed: {
    isOpen: {
      get() {
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
    submit() {
      const param = {
        judul: this.judul,
        service: this.service,
        lokasi: this.lokasi,
        pic: this.pic,
        desc: this.desc,
        image: this.selectedFile1,
      };
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
