<template>
  <div>
    <v-card>
      <v-card-text>
        <img style="width: 100%" :src="imgUpload" />
      </v-card-text>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="7">
            <v-btn class="mr-2" @click="onButtonClick">Change Image</v-btn>
            <span>{{ inputText }}</span>
            <input
              ref="uploader"
              class="d-none"
              type="file"
              accept="image/*"
              @change="onFileChanged"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="5">
            <v-btn
              v-if="!isStorage && selectedFile1 !== null"
              @click="preview"
              class="btn-prev mr-2"
              >Preview</v-btn
            >
            <v-btn v-if="isStorage" @click="cancel" class="btn-prev mr-2"
              >Cancel</v-btn
            >
            <v-btn
              v-if="isImage && selectedFile1 === null && !isStorage"
              @click="deleteImage"
              class="btn-delete"
              >Delete</v-btn
            >
            <v-btn
              v-if="selectedFile1 !== null || isStorage"
              @click="submit"
              class="btn-submit"
              >Save</v-btn
            >
          </v-col>
          <!-- <v-col v-if="isImage" cols="12" sm="6" md="4" lg="2"> </v-col>
          <v-col v-if="selectedFile1 !== null" cols="12" sm="6" md="4" lg="2">
          </v-col> -->
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import Swal from "sweetalert2";
import FooterService from "../../../services/management/footer/footerServices";
import { hitAPI } from "@/services/upload/uploadServices";
const getFooter = FooterService.build();
export default {
  data() {
    return {
      imgUpload: "",
      baseUrl: process.env.VUE_APP_PERTAGAS,
      selectedFile1: null,
      inputText: "With jpeg, png, SVG and color background #F4F5FA",
      isSelecting: false,
      isStorage: false,
      isImage: false,
      isSave: false,
    };
  },
  created() {
    this.getFooter();
  },
  methods: {
    cancel() {
      localStorage.removeItem("imageFooter");
      setTimeout(() => {
        location.reload();
      }, 100);
    },
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = reader.result;
          resolve(base64String);
        };
        reader.onerror = (error) => {
          reject(error);
        };
      });
    },
    async preview() {
      const base64Image = await this.blobToBase64(this.selectedFile1);
      const image = this.selectedFile1;
      localStorage.setItem("imageFooter", base64Image);
      setTimeout(() => {
        location.reload();
      }, 100);
    },
    base64toFile(base64String, filename) {
      if (base64String !== null) {
        // Extract content type and base64 payload from original string
        const parts = base64String.split(";base64,");
        const contentType = parts[0].split(":")[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uint8Array = new Uint8Array(new ArrayBuffer(rawLength));

        // Convert binary string to Uint8Array
        for (let i = 0; i < rawLength; ++i) {
          uint8Array[i] = raw.charCodeAt(i);
        }

        // Create Blob object
        const blob = new Blob([uint8Array], { type: contentType });

        // Create File object
        return new File([blob], filename, { type: contentType });
      } else {
        return null;
      }
    },
    async submit() {
      const par = new FormData();
      const imgFooter = localStorage.getItem("imageFooter");
      const file = this.base64toFile(imgFooter, "footer.png");
      par.append("file", imgFooter === null ? this.selectedFile1 : file);
      hitAPI.post(`system/footer`, par).then((res) => {
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
              localStorage.removeItem("imageFooter");
              window.location.reload();
            }
          });
        } else {
          this.errorPopup(res.data.message);
        }
      });
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
      if (
        e.target.files[0].type === "image/png" ||
        e.target.files[0].type === "image/jpeg" ||
        e.target.files[0].type === "image/jpg"
      ) {
        let img = new Image();
        img.src = URL.createObjectURL(e.target.files[0]);
        img.onload = () => {
          // if (img.width < 1439) {
          //  this.errorPopup("File resolution is not appropriate");
          // } else if (img.height < 547) {
          //  this.errorPopup("File resolution is not appropriate");
          // } else {
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
            // this.uploadFile(this.selectedFile1);
          } else {
            this.errorPopup("Invalid File Type");
          }
          // }
        };
      } else {
        this.errorPopup("Invalid File Type");
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
    arrayBufferToBase64(buffer) {
      let binary = "";
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    },
    async deleteImage() {
      Swal.fire({
        icon: "warning",
        title: "Delete",
        text: "Are you sure you deleted this data?",
        showCancelButton: true,
        buttons: {
          cancel: false,
          confirm: true,
        },
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        closeOnEsc: false,
        closeOnClickOutside: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleted();
        } else {
          return false;
        }
      });
    },
    async deleted() {
      const res = await getFooter.deleteFooter();
      this.successPopup(res.data.message);
      location.reload();
    },
    async getFooter() {
      const res = await getFooter.getFooter();
      const data =
        res.data.data !== null ? this.baseUrl + res.data.data.imageUrl : null;
      const imgFooter = localStorage.getItem("imageFooter");
      this.isImage = data !== null ? true : false;
      this.isStorage = imgFooter === null ? false : true;
      this.imgUpload = imgFooter === null ? data : imgFooter;
    },
  },
};
</script>
<style scoped>
.btn-prev {
  width: 48%;
}
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 50%;
}
.btn-delete {
  color: white !important;
  background-color: red !important;
  width: 50%;
  float: right;
}
</style>
