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
            <!-- <v-col style="float: right" cols="12">
              <v-btn
                style="font-size: 18px; color: #606060"
                icon
                @click="close"
              >
                <v-icon>{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </v-col> -->
            <v-col cols="12" align="center">
              <div
                style="
                  display: inline;
                  font-size: 16px;
                  line-height: 28px;
                  font-weight: 600;
                  color: #606060;
                "
              >
                <v-icon large>{{ icons.mdiFormatQuoteCloseOutline }}</v-icon
                >Quote
              </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text v-if="item.imageUrl !== null">
          <img
            style="width: 100%; height: 350px"
            :src="baseUrl + item.imageUrl"
          />
        </v-card-text>
        <v-card-text>
          <v-row>
            <v-col
              align="center"
              style="
                font-size: 24px;
                line-height: 32px;
                font-weight: 500;
                color: #000000;
              "
            >
              <div v-html="item.name"></div>
              <!-- {{ item.name }} -->
            </v-col>
          </v-row>
          <v-row
            align="center"
            justify="center"
            style="
              font-size: 14px;
              line-height: 20px;
              font-weight: 700;
              color: #101010;
            "
          >
            {{ item.namePeople }}
          </v-row>
          <v-row
            align="center"
            justify="center"
            style="
              font-size: 12px;
              line-height: 14px;
              font-weight: 400;
              color: #606060;
            "
          >
            {{ item.titlePeople }}
          </v-row>
        </v-card-text>
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

export default {
  data() {
    return {
      loading: false,
      //media_url: "",
      //caption: "",
      baseUrl: process.env.VUE_APP_PERTAGAS,
      icons: {
        mdiFileDocumentOutline,
        mdiClose,
        mdiFormatQuoteCloseOutline,
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
        return this.open;
      },
      set(value) {
        // localStorage.setItem("isQuote", true);
        if (!value) {
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    close() {
      // localStorage.setItem("isQuote", true);
      this.$emit("clicked");
    },
  },
};
</script>

<style scoped></style>
