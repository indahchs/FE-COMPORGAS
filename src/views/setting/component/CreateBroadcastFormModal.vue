<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" width="825" persistent>
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
                Announcement Detail
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
          <h2 class="mb-4">{{ title }}</h2>
          <v-row>
            <v-col
              v-if="urlLink !== ''"
              style="border: 1px solid #dfdfdf; border-radius: 5px"
              cols="12"
              sm="6"
              md="4"
              lg="7"
            >
              URL/LINK:
              <span
                @click="urlBroad(urlLink)"
                style="color: blue; cursor: pointer"
                >{{ urlLink }}</span
              > </v-col
            ><v-spacer></v-spacer>
            <v-col
              v-if="attachment !== null"
              style="border: 1px solid #dfdfdf; border-radius: 5px"
              cols="12"
              sm="6"
              md="4"
              lg="4"
            >
              <span>Attachment</span>
              <v-icon
                @click="downloadImg()"
                color="black"
                style="float: right"
                >{{ icons.mdiDownload }}</v-icon
              >
            </v-col>
          </v-row>
          <v-row class="mt-8 mb-4">
            <v-skeleton-loader
              v-if="!isImage"
              style="width: 100%"
              type="image"
            ></v-skeleton-loader>
            <img v-else style="width: 100%" :src="baseUrl + imgBroad" />
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mdiClose, mdiDownload } from "@mdi/js";
import BroadcastServices from "@/services/broadcast/broadcatService";

const broadcastService = BroadcastServices.build();
export default {
  data() {
    return {
      loading: false,
      isImage: false,
      title: "",
      urlLink: "",
      attachment: "",
      imgBroad: null,
      //media_url: "",
      //caption: "",
      baseUrl: process.env.VUE_APP_PERTAGAS,
      icons: {
        mdiClose,
        mdiDownload,
      },
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
        if (this.item !== null) {
          this.isImage = true;
          const data = this.item;
          this.title = data.subject;
          this.urlLink = data.url;
          this.attachment = data.urlAttachment;
          this.imgBroad = data.urlImage;
        }
        //this.media_url = this.datas.media_url;
        //this.caption = this.datas.caption;
        //this.titleHead = this.datas.username;

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
    async downloadImg(x) {
      const data = this.item;
      var a = document.createElement("a"); //Create <a>
      a.href = this.baseUrl + data.urlAttachment; //Image Base64 Goes here
      a.download = data.image; //File name Here
      a.click(); //Downloaded file
    },
    urlBroad(x) {
      window.open(x);
    },
    close() {
      this.title = "";
      this.urlLink = "";
      this.attachment = "";
      this.imgBroad = null;
      this.$emit("clicked");
    },
  },
};
</script>

<style scoped></style>
