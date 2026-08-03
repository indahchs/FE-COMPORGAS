<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" width="650" persistent>
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col>
              <div
                style="
                  display: inline-flex;
                  align-items: center;
                  font-size: 18px;
                  line-height: 28px;
                  font-weight: 600;
                  color: #000000;
                "
              >
                <img
                  class="ml-2 my-2 mr-4"
                  src="../../../assets/images/logos/logo_pertagas_round.png"
                />
                {{ titleHead }}
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
          <div v-if="isManual">
            <img
              v-if="media_type !== 'VIDEO'"
              style="width: 100%; height: 650px"
              :src="baseUrl + media_url"
            />
            <video
              v-else
              ref="videoPlayer"
              style="width: 100%; height: 650px"
              autoplay
              loop
            >
              <source :src="baseUrl + media_url" type="video/mp4" />
            </video>
          </div>
          <div v-else>
            <img
              v-if="media_type !== 'VIDEO'"
              style="width: 100%; height: 650px"
              :src="media_url"
            />
            <video
              v-else
              ref="videoPlayer"
              style="width: 100%; height: 650px"
              autoplay
              loop
            >
              <source :src="media_url" type="video/mp4" />
            </video>
          </div>
          <br />
          <h4 style="color: black">{{ caption }}</h4>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { mdiClose, mdiFileDocumentOutline } from "@mdi/js";
import Swal from "sweetalert2";
import RoleService from "@/services/management/role/roleServices";

const getRole = RoleService.build();
export default {
  data() {
    return {
      loading: false,
      media_url: "",
      media_type: "",
      caption: "",
      isManual: false,
      icons: {
        mdiFileDocumentOutline,
        mdiClose,
      },
      baseUrl: process.env.VUE_APP_PERTAGAS,
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
        this.media_url = this.datas.mediaUrl;
        this.isManual = this.datas.manual;
        this.caption = this.datas.caption;
        this.titleHead = this.datas.username;
        this.media_type = this.datas.mediaType;

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
    close() {
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
</style>
