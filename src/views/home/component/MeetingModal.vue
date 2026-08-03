<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" width="650" persistent>
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
                Meeting
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
          <v-row align="center">
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <img
              class="ml-2 my-2"
              src="../../../assets/images/icons/icon_people_group.png"
            />
            <v-col>
              <div
                style="
                  font-size: 16px;
                  line-height: 24px;
                  font-weight: 600;
                  color: #101010;
                "
              >
                Meeting
              </div>
            </v-col>
          </v-row>
          <br />
          <v-card :color="categoryEventColorBg" depressed>
            <v-card-text>
              <v-row align="center">
                <v-col cols="12" sm="6" md="4" lg="2">
                  <v-card class="text-center" :color="categoryEventColor">
                    <div
                      style="
                        font-size: 24px;
                        line-height: 32px;
                        font-weight: 600;
                        color: white;
                      "
                    >
                      {{ getDate(date) }}
                    </div>
                    <div
                      style="
                        font-size: 12px;
                        line-height: 16px;
                        font-weight: 400;
                        color: white;
                      "
                    >
                      {{ getMonth(date) }}
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="4" lg="10">
                  <v-row>
                    <v-col cols="12" sm="6" md="4" lg="12">
                      <div
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          font-weight: 600;
                          text-align: center;
                          color: #101010;
                        "
                      >
                        {{ name }}
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <br />
          <!-- <h4 style="color: black">{{ description }}</h4> -->
          <v-card-text>
            <ul style="list-style-type: none; padding-left: 0px">
              <li class="li-class">
                <p class="form_text1 mr-1"><span>Date</span>:</p>
                &nbsp; <span style="color: black">{{ formatDate(date) }}</span>
              </li>
              <li class="li-class">
                <p class="form_text1 mr-1"><span>Time</span>:</p>
                &nbsp;
                <span style="color: black"
                  >{{ startTime }} - {{ endTime }}</span
                >
              </li>
              <li class="li-class">
                <p class="form_text1 mr-1"><span>Office Location</span>:</p>
                &nbsp;
                <span style="color: black">{{ location }}</span>
              </li>
              <li class="li-class">
                <p class="form_text1 mr-1"><span>Meeting Room</span>:</p>
                &nbsp;
                <span style="color: black">{{ description }}</span>
              </li>
            </ul>
          </v-card-text>
          <v-divider></v-divider>
          <br />
          <div
            @click="close"
            style="text-align: center; font-weight: bold; cursor: pointer"
          >
            <span style="color: #0172b9">Got It</span>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import moment from "moment";
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
      categoryEventColorBg: "",
      categoryEventColor: "",
      date: "",
      name: "",
      startTime: "",
      location: "",
      description: "",
      endTime: "",
      dataEvent: [],
      eventCategory: "",
      department: "",
      time: "",
      location: "",
      baseUrl: process.env.VUE_APP_PERTAGAS,
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
        this.dataEvent.push(this.datas);
        this.media_url = this.datas.imageUrl;
        this.categoryEventColorBg = this.datas.meetingColorBg;
        this.categoryEventColor = this.datas.meetingColor;
        this.date = this.datas.date;
        this.name = this.datas.title;
        this.startTime = this.datas.startTime;
        this.endTime = this.datas.endTime;
        this.location = this.datas.officeName;
        this.department = this.datas.divisionName;
        this.description = this.datas.roomName;
        this.eventCategory = this.datas.categoryEventName;

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
    formatDate(x) {
      return moment(x).format("DD-MM-YYYY");
    },
    getDate(x) {
      return moment(x).format("DD");
    },
    getMonth(x) {
      return moment(x).format("MMMM");
    },
    close() {
      this.dataEvent = [];
      this.$emit("clicked");
    },
  },
};
</script>
<style scope>
.li-class {
  display: flex;
}
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
}
p.form_text1 > span {
  display: inline-block;
  min-width: 140px;
}
</style>
