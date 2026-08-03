<template>
  <div style="margin-top: -80px">
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3">
        <v-card style="padding: 2%" max-width="100%">
          <v-list>
            <v-list-item-group v-model="item" color="primary" mandatory>
              <v-list-item @click="detailPage(data.query)" v-for="(data, index) in listItems" :key="index">
                <img class="mr-4" :src="index === item ? data.imageBlue : data.image" alt="Item Image" />
                <v-list-item-content>
                  <v-list-item-title>{{ data.text }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    data.subtitle
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="9">
        <div v-if="isUser">
          <User />
        </div>
        <div v-if="isRole">
          <Role />
        </div>
        <div v-if="isOffice">
          <Office />
        </div>
        <div v-if="isMeeting">
          <Meeting />
        </div>
        <div v-if="isEvent">
          <Event />
        </div>
        <div v-if="isDivision">
          <Division />
        </div>
        <div v-if="isFooter">
          <Footer />
        </div>
        <div v-if="isQuote">
          <Quotes />
        </div>
        <div v-if="isBroadcast">
          <Broadcast />
        </div>
        <div v-if="isSpecial">
          <Special />
        </div>
        <div v-if="isHoliday">
          <MasterHoliday />
        </div>
        <div v-if="isLogin">
          <LoginHistory />
        </div>
        <div v-if="isAccess">
          <UserAccess />
        </div>
        <div v-if="isInstagram">
          <Instagram />
        </div>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import User from "./component/User.vue";
import Role from "./component/Role.vue";
import Office from "./component/Office.vue";
import Meeting from "./component/Meeting.vue";
import Event from "./component/Event.vue";
import Division from "./component/Division.vue";
import Footer from "./component/Footer.vue";
import Quotes from "./component/Quotes.vue";
import Broadcast from "./component/Broadcast.vue";
import Special from "./component/SpecialDate.vue";
import MasterHoliday from "./component/MasterHoliday.vue";
import LoginHistory from "./component/LoginHistory.vue";
import UserAccess from "./component/UserAccess.vue";
import Instagram from "./component/Instagram.vue";
export default {
  components: {
    User,
    Role,
    Office,
    Meeting,
    Event,
    Division,
    Footer,
    Quotes,
    Broadcast,
    Special,
    MasterHoliday,
    LoginHistory,
    UserAccess,
    Instagram,
  },
  data() {
    return {
      isInstagram: false,
      isUser: true,
      isRole: false,
      isOffice: false,
      isMeeting: false,
      isEvent: false,
      isDivision: false,
      isFooter: false,
      isQuote: false,
      isBroadcast: false,
      isSpecial: false,
      isHoliday: false,
      isLogin: false,
      isAccess: false,
      item: 0,
      isRoles: false,
      listItems: [],
      temp: "",
    };
  },
  created() {
    this.redirectUrlQuery();
  },
  methods: {
    getMenu() {
      const user = JSON.parse(localStorage.getItem("dataUser"));
      const role = user.roleId;
      this.isRoles = role === "SEKRETARIS" || role === "GS" ? true : false;
      if (role === "SEKRETARIS") {
        this.listItems = [
          {
            id: 0,
            query: "category",
            text: "Event Category",
            subtitle: "Event Category Management",
            image: require("../../assets/images/icons/event_category_green.png"),
            imageBlue: require("../../assets/images/icons/event_category_blue.png"),
          },
          {
            id: 1,
            query: "footer",
            text: "Footer",
            subtitle: "Footer Info Management",
            image: require("../../assets/images/icons/footer_green.png"),
            imageBlue: require("../../assets/images/icons/footer_blue.png"),
          },
          {
            id: 2,
            query: "quotes",
            text: "Quotes Master",
            subtitle: "Quotes Info Management",
            image: require("../../assets/images/icons/quotes_green.png"),
            imageBlue: require("../../assets/images/icons/quotes_blue.png"),
          },
          {
            id: 3,
            query: "broadcast",
            text: "Broadcast",
            subtitle: "Broadcast Management",
            image: require("../../assets/images/icons/broadcast_green.png"),
            imageBlue: require("../../assets/images/icons/broadcast_blue.png"),
          },
          {
            id: 4,
            query: "special-date",
            text: "Special Date",
            subtitle: "Special Date Info Management",
            image: require("../../assets/images/icons/special.png"),
            imageBlue: require("../../assets/images/icons/special_blue.png"),
          },
          {
            id: 5,
            query: "instagram",
            text: "News",
            subtitle: "News Management",
            image: require("../../assets/images/icons/event_category_green.png"),
            imageBlue: require("../../assets/images/icons/event_category_blue.png"),
          },
        ];
      } else if (role === "GS") {
        this.listItems = [
          {
            id: 0,
            query: "office",
            text: "Office Location",
            subtitle: "Office Location Management",
            image: require("../../assets/images/icons/office_green.png"),
            imageBlue: require("../../assets/images/icons/office_blue.png"),
          },
          {
            id: 1,
            query: "room",
            text: "Meeting Room",
            subtitle: "Meeting Room Management",
            image: require("../../assets/images/icons/meeting_room_green.png"),
            imageBlue: require("../../assets/images/icons/meeting_room_blue.png"),
          },
        ];
      } else {
        this.listItems = [
          {
            id: 0,
            query: "user",
            text: "User",
            subtitle: "User Management",
            image: require("../../assets/images/icons/user_green.png"),
            imageBlue: require("../../assets/images/icons/user_blue.png"),
          },
          {
            id: 1,
            query: "role",
            text: "Role",
            subtitle: "User Role Management",
            image: require("../../assets/images/icons/role_green.png"),
            imageBlue: require("../../assets/images/icons/role_blue.png"),
          },
          {
            id: 2,
            query: "office",
            text: "Office Location",
            subtitle: "Office Location Management",
            image: require("../../assets/images/icons/office_green.png"),
            imageBlue: require("../../assets/images/icons/office_blue.png"),
          },
          {
            id: 3,
            query: "room",
            text: "Meeting Room",
            subtitle: "Meeting Room Management",
            image: require("../../assets/images/icons/meeting_room_green.png"),
            imageBlue: require("../../assets/images/icons/meeting_room_blue.png"),
          },
          {
            id: 4,
            query: "category",
            text: "Event Category",
            subtitle: "Event Category Management",
            image: require("../../assets/images/icons/event_category_green.png"),
            imageBlue: require("../../assets/images/icons/event_category_blue.png"),
          },
          {
            id: 5,
            query: "department",
            text: "Department",
            subtitle: "Department Management",
            image: require("../../assets/images/icons/division_green.png"),
            imageBlue: require("../../assets/images/icons/division_blue.png"),
          },
          {
            id: 6,
            query: "footer",
            text: "Footer",
            subtitle: "Footer Info Management",
            image: require("../../assets/images/icons/footer_green.png"),
            imageBlue: require("../../assets/images/icons/footer_blue.png"),
          },
          {
            id: 7,
            query: "quotes",
            text: "Quotes Master",
            subtitle: "Quotes Info Management",
            image: require("../../assets/images/icons/quotes_green.png"),
            imageBlue: require("../../assets/images/icons/quotes_blue.png"),
          },
          {
            id: 8,
            query: "broadcast",
            text: "Broadcast",
            subtitle: "Broadcast Management",
            image: require("../../assets/images/icons/broadcast_green.png"),
            imageBlue: require("../../assets/images/icons/broadcast_blue.png"),
          },
          {
            id: 9,
            query: "special-date",
            text: "Special Date",
            subtitle: "Special Date Info Management",
            image: require("../../assets/images/icons/special.png"),
            imageBlue: require("../../assets/images/icons/special_blue.png"),
          },
          {
            id: 10,
            query: "holiday",
            text: "Master Holiday",
            subtitle: "Master Holiday Management",
            image: require("../../assets/images/icons/event_category_green.png"),
            imageBlue: require("../../assets/images/icons/event_category_blue.png"),
          },
          {
            id: 11,
            query: "login-history",
            text: "Login History",
            subtitle: "Login History",
            image: require("../../assets/images/icons/user_green.png"),
            imageBlue: require("../../assets/images/icons/user_blue.png"),
          },
          {
            id: 12,
            query: "user-access",
            text: "User Access",
            subtitle: "User Access",
            image: require("../../assets/images/icons/user_green.png"),
            imageBlue: require("../../assets/images/icons/user_blue.png"),
          },
          {
            id: 13,
            query: "instagram",
            text: "News",
            subtitle: "News Management",
            image: require("../../assets/images/icons/event_category_green.png"),
            imageBlue: require("../../assets/images/icons/event_category_blue.png"),
          },
        ];
      }
    },
    redirectUrlQuery() {
      this.getMenu();
      this.detailPage(this.$route.query.page);
    },
    getFooter() {
      const img = localStorage.getItem("imageFooter");
      this.detailPage(img === null ? 0 : 7);
      this.item = img === null ? 0 : 6;
    },
    async detailPage(x) {
      const cond = x !== undefined ? x : this.listItems[0].query;
      const user = JSON.parse(localStorage.getItem("dataUser"));
      const role = user.roleId;
      if (role === "SEKRETARIS") {
        switch (cond) {
          case "category":
            this.item = 0;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = true;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "footer":
            this.item = 1;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = true;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "quotes":
            this.item = 2;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = true;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "broadcast":
            this.item = 3;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = true;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "special-date":
            this.item = 4;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = true;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "instagram":
            this.item = 5;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = true;
            break;
          default:
            break;
        }
      } else if (role === "GS") {
        switch (cond) {
          case "office":
            this.item = 0;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = true;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "room":
            this.item = 1;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = true;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          default:
            break;
        }
      } else {
        switch (cond) {
          case "user":
            this.item = 0;
            this.isUser = true;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "role":
            this.item = 1;
            this.isUser = false;
            this.isRole = true;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "office":
            this.item = 2;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = true;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "room":
            this.item = 3;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = true;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "category":
            this.item = 4;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = true;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "department":
            this.item = 5;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = true;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "footer":
            this.item = 6;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = true;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "quotes":
            this.item = 7;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = true;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "broadcast":
            this.item = 8;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = true;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "special-date":
            this.item = 9;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = true;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "holiday":
            this.item = 10;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = true;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "login-history":
            this.item = 11;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = true;
            this.isAccess = false;
            this.isInstagram = false;
            break;
          case "user-access":
            this.item = 12;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = true;
            this.isInstagram = false;
            break;
          case "instagram":
            this.item = 13;
            this.isUser = false;
            this.isRole = false;
            this.isOffice = false;
            this.isMeeting = false;
            this.isEvent = false;
            this.isDivision = false;
            this.isFooter = false;
            this.isQuote = false;
            this.isBroadcast = false;
            this.isSpecial = false;
            this.isHoliday = false;
            this.isLogin = false;
            this.isAccess = false;
            this.isInstagram = true;
            break;
          default:
            break;
        }
      }
      this.$router
        .push({ path: this.$route.path, query: { page: x } })
        .catch(() => { });
    },
  },
};
</script>