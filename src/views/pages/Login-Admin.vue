<template>
  <div>
    <!-- <img src="../../assets/images/logos/bumn.png" class="mt-2 ml-2" /> -->
    <img
      style="float: right; width: 240px; height: 57px"
      src="../../assets/images/logos/comporgas.png"
      class="mt-2 mr-2"
    />
    <div class="auth-wrapper auth-v1">
      <div class="auth-inner">
        <v-card class="auth-card">
          <!-- logo -->
          <v-card-title class="d-flex py-7">
            <v-img
              :src="require('@/assets/images/logos/comporgas.png')"
              max-height="80px"
              max-width="240px"
              alt="logo"
              contain
              class="me-3"
            ></v-img>

            <!-- <h2 class="text-2xl font-weight-semibold">Beautify</h2> -->
          </v-card-title>

          <!-- title -->
          <v-card-text>
            <p class="mb-2">
              Log in admin with your data that you entered during your
              registration.
            </p>
          </v-card-text>

          <!-- login form -->
          <v-card-text>
            <v-form>
              <label>Username</label>
              <v-text-field
                :error-messages="getErrors('email', $v.email)"
                @blur="$v.email.$touch()"
                outlined
                v-model.trim="$v.email.$model"
                placeholder="Tuliskan Username Anda"
                class="mb-3"
                @keyup.enter.native="login()"
              ></v-text-field>

              <label>Password</label>
              <v-text-field
                v-model.trim="$v.password.$model"
                :error-messages="getErrors('password', $v.password)"
                @blur="$v.password.$touch()"
                @keyup.enter.native="login()"
                outlined
                :type="isPasswordVisible ? 'text' : 'password'"
                placeholder="Tuliskan Password Anda"
                :append-icon="
                  !isPasswordVisible
                    ? icons.mdiEyeOffOutline
                    : icons.mdiEyeOutline
                "
                class="mb-3"
                @click:append="isPasswordVisible = !isPasswordVisible"
              ></v-text-field>

              <div class="d-flex align-center justify-space-between flex-wrap">
                <v-checkbox
                  label="Keep me logged in"
                  hide-details
                  class="me-3 mt-1"
                >
                </v-checkbox>
              </div>

              <v-btn
                :loading="loading"
                block
                style="color: white"
                color="#0172B9"
                @click="login()"
                class="mt-6"
              >
                Log In
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <!-- <LoginModal
      v-if="isLogin"
      :open="openModalLogin"
      :item="loginData"
      @clicked="closeModalLogin"
    ></LoginModal> -->
  </div>
</template>

<script>
// eslint-disable-next-line object-curly-newline
import Swal from "sweetalert2";
import {
  mdiFacebook,
  mdiTwitter,
  mdiGoogle,
  mdiEyeOutline,
  mdiEyeOffOutline,
} from "@mdi/js";
import { required, email } from "vuelidate/lib/validators";
import HttpService from "../../services/base/HttpService";
import AuthServices from "@/services/auth/authServices";
import StorageConfig from "@/services/config/StorageConfig";
import { ref } from "vue";
import { useRouter } from "vue-router";
import LoginModal from "./component/LoginModal.vue";

const authLogin = AuthServices.build();

export default {
  components: {
    LoginModal,
  },
  setup() {
    const isPasswordVisible = ref(false);

    return {
      isPasswordVisible,
    };
  },
  data() {
    return {
      isIframe: false,
      loginData: {},
      isLogin: false,
      openModalLogin: false,
      loading: false,
      email: "",
      password: "",
      icons: {
        mdiEyeOutline,
        mdiEyeOffOutline,
      },
      isSso: process.env.VUE_APP_SSO,
    };
  },
  validations: {
    email: {
      required,
      // email
    },
    password: {
      required,
    },
  },
  mounted() {
    window.addEventListener("message", this.receiveMessage);
  },
  created() {
    // setTimeout(() => {
    //   this.postMessage();
    // }, 1000);
  },
  methods: {
    performLogin() {
      const iframe = window.frames["Iframe"];
      iframe.postMessage("Message", "https://sso.pertaminagas.com/comporgas");
    },
    testing() {
      const iframeWindow = this.$refs.myIframe.contentWindow;
      iframeWindow.postMessage("Message", "*"); // '*' means any origin
    },
    async receiveMessage(e) {
      if (e.origin === "https://sso.pertaminagas.com/comporgas") {
        this.loginSSO(e.data.value);
      }
    },
    postMessage() {
      this.loading = true;
      const iframe = window.frames["Iframe"];
      iframe.postMessage("Message", "https://sso.pertaminagas.com/comporgas");
    },
    closeModalLogin() {
      this.openModalLogin = false;
    },

    getStringAfterSymbol(str, symbol) {
      const index = str.indexOf(symbol);

      if (index !== -1) {
        // If the symbol is found, return the substring after the symbol
        return str.substring(index + 1);
      } else {
        // If the symbol is not found, return the original string
        return "";
      }
    },
    async loginSSO(e) {
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
            this.loading = false;
          }
        });
      }
    },
    async login() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.loading = true;
        var checkEmailFormat = process.env.VUE_APP_CHECK_EMAIL_FORMAT;
        var emailFormat = process.env.VUE_APP_EMAIL_FORMAT;
        const inputMail =
          this.getStringAfterSymbol(this.email, "@") === checkEmailFormat ||
          this.getStringAfterSymbol(this.email, "@") === ""
            ? this.email.match(/^[^@]+/)[0] + emailFormat
            : this.email;
        const paramLogin = {
          // email: this.email.match(/^[^@]+/)[0] + "@pertamina.com",
          email: inputMail,
          password: this.password,
        };
        const res = await authLogin.authLogin("", paramLogin);
        if (res.data.status === 200) {
          this.loading = false;
          StorageConfig.saveToken(res.data.data.token);
          StorageConfig.saveData(JSON.stringify(res.data.data));
          this.$router.replace("/home");
          HttpService.setHeader();
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
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
              this.loading = false;
            }
          });
        }
      }
    },
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "password":
          !model.required && errors.push("Password is required.");
          break;
        case "email":
          // !model.email && errors.push('Must be valid e-mail')
          !model.required && errors.push("Username is required");
          break;
        default:
          break;
      }
      return errors;
    },
  },
};
</script>

<style lang="scss">
@import "~@/plugins/vuetify/default-preset/preset/pages/auth.scss";
.auth-wrapper {
  min-height: calc(var(--vh, 1vh) * 90);
}
</style>
