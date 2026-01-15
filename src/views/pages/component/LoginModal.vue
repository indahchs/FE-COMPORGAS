<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" width="680">
      <v-card
        class="pa-2"
        :style="
          item.imageUrl !== ''
            ? 'background-color: white'
            : 'background-color: #bae4ff'
        "
        style="border-radius: 24px"
      >
        <v-card-title>
          <v-row align="center">
            <v-col cols="11" align="center">
              <div
                style="
                  font-size: 16px;
                  line-height: 28px;
                  font-weight: 600;
                  color: #606060;
                "
              >
                Login
              </div>
            </v-col>
            <v-col cols="1" class="text-right">
              <v-btn
                style="font-size: 18px; color: #606060"
                icon
                @click="close"
              >
                <v-icon>{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card>
          <iframe
            v-if="is1"
            hidden
            title="Login SSO"
            width="100%"
            ref="iframeRef"
            :height="400"
            id="id_description_iframe"
            src="https://sso.pertaminagas.com/comporgas/comporgas"
            frameborder="0"
            allowFullScreen="true"
          ></iframe>
          <iframe
            v-else
            hidden
            title="Login SSO"
            width="100%"
            ref="iframeRef"
            :height="400"
            id="id_description_iframe"
            src="https://sso.pertaminagas.com/comporgas/actiontracking"
            frameborder="0"
            allowFullScreen="true"
          ></iframe>
          <h2 style="text-align: center">Success Login</h2>

          <div class="mt-6" style="text-align: center">
            <v-btn
              :loading="loading"
              style="color: white"
              color="#0172B9"
              @click="close"
              >Submit</v-btn
            >
          </div>
        </v-card>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import {
  mdiClose,
  mdiFileDocumentOutline,
  mdiFormatQuoteCloseOutline,
} from "@mdi/js";
import HttpService from "@/services/base/HttpService";
import StorageConfig from "@/services/config/StorageConfig";
import Swal from "sweetalert2";
import AuthServices from "@/services/auth/authServices";
const authLogin = AuthServices.build();
export default {
  data() {
    return {
      loading: false,
      is1: false,
      loading: false,
      //media_url: "",
      //caption: "",
      baseUrl: process.env.VUE_APP_PERTAGAS,
      icons: {
        mdiFileDocumentOutline,
        mdiClose,
        mdiFormatQuoteCloseOutline,
      },
      dataToken: "",
    };
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
        return this.open;
      },
      set(value) {
        const data = document.querySelector("#id_description_iframe");
        // localStorage.setItem("isQuote", true);
        if (!value) {
          this.$emit("close");
        }
      },
    },
  },
  mounted() {
    window.addEventListener("message", function (e) {
      if (e.origin === "https://sso.pertaminagas.com/comporgas") {
        // this.dataToken = e.data;
        // setTimeout(() => {
        // }, 100);
      }
    });
    // this.openSwall();
    // if (this.dataToken !== "") {
    //   this.loginSso();
    // }
  },
  methods: {
    openSwall() {
      Swal.fire({
        icon: "success",
        title: "Success",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        text: "Success Login",
        buttons: {
          cancel: false,
          confirm: true,
        },
        closeOnEsc: false,
        closeOnClickOutside: false,
      }).then((result) => {
        if (result) {
          // this.email = "";
          // this.password = "";
          this.close();
        }
      });
    },
    logNetworkRequests() {
      window.addEventListener("load", () => {
        const entries = window.performance.getEntries();
        entries.forEach((entry) => {});
      });
    },
    receiveMessage(event) {},
    close() {
      this.loading = true;
      this.is1 = true;
      // window.addEventListener("message", function (event) {
      //   console.log(event.data.value);
      //   this.dataToken = event.data["value"];
      // });
      window.addEventListener("message", (e) => {
        if (e.data.value !== "") {
          const data = e.data.value;
          this.loginSso(data);
        }
      });
      // this.loginSso();
      const value = document.getElementById("id_description_iframe");
      document
        .getElementById("id_description_iframe")
        .addEventListener("load", function () {
          document
            .getElementById("id_description_iframe")
            .contentWindow.postMessage("hoi", "*");
        });
      window.addEventListener("load", () => {
        const entries = window.performance.getEntries();
        entries.forEach((entry) => {});
      });
    },
    async loginSso(e) {
      const payload = {
        token: e,
      };
      const res = await authLogin.authLoginSso(payload);
      if (res.data.status === 200) {
        this.loading = false;
        StorageConfig.saveToken(res.data.data.token);
        StorageConfig.saveData(JSON.stringify(res.data.data));
        this.$router.replace("/home");
        HttpService.setHeader();
      } else {
        Swal.fire({
          icon: "error",
          title: "Sorry",
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          text: res.data.message,
          buttons: {
            cancel: false,
            confirm: true,
          },
          closeOnEsc: false,
          closeOnClickOutside: false,
        }).then((result) => {
          if (result) {
            // this.email = "";
            // this.password = "";
            this.$emit("clicked");
            this.loading = false;
          }
        });
      }
    },
  },
  beforeDestroy() {
    window.removeEventListener("message", this.receiveMessage);
  },
};
</script>

<style scoped></style>
