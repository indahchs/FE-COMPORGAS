import Vue from "vue";
import VueRouter from "vue-router";
import StorageConfig from "../services/config/StorageConfig";

// Eager loading - semua komponen diimport langsung di awal
import Dashboard from "@/views/dashboard/Dashboard.vue";
import Home from "@/views/home/Home.vue";
import Application from "@/views/application/Application.vue";
import Events from "@/views/events/Events.vue";
import EventRequest from "@/views/events/components/EventRequest.vue";
import Meetings from "@/views/meetings/Meetings.vue";
import ItHelpdesk from "@/views/ithelpdesk/ItHelpdesk.vue";
import ItHelpdeskCatalog from "@/views/ithelpdesk/components/Catalog.vue";
import ItHelpdeskMyRequest from "@/views/ithelpdesk/components/MyRequest.vue";
import ItHelpdeskTicketDetail from "@/views/ithelpdesk/components/TicketDetail.vue";
import ItHelpdeskFaq from "@/views/ithelpdesk/components/Faq.vue";
import ItHelpdeskSupport from "@/views/ithelpdesksupport/ItHelpdeskSupport.vue";
import ItHelpdeskSupportMyRequest from "@/views/ithelpdesksupport/components/MyRequest.vue";
import ItHelpdeskSupportTicketDetail from "@/views/ithelpdesksupport/components/TicketDetail.vue";
import ItHelpdeskSupportResume from "@/views/ithelpdesksupport/components/Resume.vue";
import ItHelpdeskSupportCatalog from "@/views/ithelpdesksupport/components/Catalog.vue";
import ItHelpdeskSupportFaq from "@/views/ithelpdesksupport/components/Faq.vue";
import Notification from "@/views/notification/Notification.vue";
import MeetingUserBooking from "@/views/meetings/MeetingUserBooking.vue";
import ManagementSetting from "@/views/setting/ManagementSetting.vue";
import Chart from "@/views/charts/Chart.vue";
import Typography from "@/views/typography/Typography.vue";
import Icons from "@/views/icons/Icons.vue";
import Card from "@/views/cards/Card.vue";
import SimpleTable from "@/views/tables/SimpleTable.vue";
import FormLayouts from "@/views/forms/FormLayouts.vue";
import AccountSettings from "@/views/pages/account-settings/AccountSettings.vue";
import Gallery from "@/views/gallery/Gallery.vue";
import FolderDetail from "@/views/gallery/FolderDetail.vue";
import Login from "@/views/pages/Login.vue";
import LoginAdmin from "@/views/pages/Login-Admin.vue";
import Register from "@/views/pages/Register.vue";
import Error from "@/views/Error.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: Dashboard,
    meta: {
      reqAuth: true,
      removeMerchantId: true,
      removeStoreId: true,
    },
  },
  {
    path: "/home",
    name: "home",
    component: Home,
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/application",
    name: "application",
    component: Application,
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/events",
    name: "events",
    component: Events,
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/events-request",
    name: "events-request",
    component: EventRequest,
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/meetings",
    name: "meetings",
    component: Meetings,
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/ithelpdesk",
    name: "ithelpdesk",
    component: ItHelpdesk,
    meta: {
      reqAuth: true,
    },
    children: [
      {
        path: "",
        redirect: "catalog",
      },
      {
        path: "catalog",
        name: "ithelpdesk-catalog",
        component: ItHelpdeskCatalog,
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "my-request",
        name: "ithelpdesk-my-request",
        component: ItHelpdeskMyRequest,
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "my-request/:id",
        name: "ithelpdesk-my-request-detail",
        component: ItHelpdeskTicketDetail,
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "faq",
        name: "ithelpdesk-faq",
        component: ItHelpdeskFaq,
        meta: {
          reqAuth: true,
        },
      },
    ],
  },
  {
    path: "/ithelpdesksupport",
    name: "ithelpdesksupport",
    component: ItHelpdeskSupport,
    meta: {
      reqAuth: true,
    },
    children: [
      {
        path: "",
        redirect: "my-request",
      },
      {
        path: "my-request",
        name: "ithelpdesksupport-my-request",
        component: ItHelpdeskSupportMyRequest,
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "my-request/:id",
        name: "ithelpdesk-my-request-detail",
        component: ItHelpdeskSupportTicketDetail,
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "my-request/:id",
        name: "ithelpdesksupport-my-request-detail",
        component: ItHelpdeskSupportTicketDetail,
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "request",
        name: "ithelpdesksupport-request",
        component: ItHelpdeskSupportResume,
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "catalog",
        name: "ithelpdesksupport-catalog",
        component: ItHelpdeskSupportCatalog,
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "faq",
        name: "ithelpdesksupport-faq",
        component: ItHelpdeskSupportFaq,
        meta: {
          reqAuth: true,
        },
      },
    ],
  },
  {
    path: "/notification",
    name: "notification",
    component: Notification,
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/meeting-booking",
    name: "meeting-booking",
    component: MeetingUserBooking,
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/setting",
    name: "setting",
    component: ManagementSetting,
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/charts",
    name: "charts",
    component: Chart,
  },
  {
    path: "/typography",
    name: "typography",
    component: Typography,
  },
  {
    path: "/icons",
    name: "icons",
    component: Icons,
  },
  {
    path: "/cards",
    name: "cards",
    component: Card,
  },
  {
    path: "/tables",
    name: "tables",
    component: SimpleTable,
  },
  {
    path: "/forms",
    name: "forms",
    component: FormLayouts,
  },
  {
    path: "settings",
    name: "settings",
    component: AccountSettings,
  },
  {
    path: "/gallery",
    name: "gallery",
    component: Gallery,
  },
  {
    path: "/gallery/:id",
    name: "FolderDetail",
    component: FolderDetail,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      layout: "blank",
      reqLogout: true,
      removeMerchantId: true,
      removeStoreId: true,
    },
  },
  {
    path: "/login-admin",
    name: "login-admin",
    component: LoginAdmin,
    meta: {
      layout: "blank",
      reqLogout: true,
      removeMerchantId: true,
      removeStoreId: true,
    },
  },
  {
    path: "/register",
    name: "register",
    component: Register,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "/notfound",
    name: "notfound",
    component: Error,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "*",
    redirect: "error-404",
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const reqAuth = to.matched.some(r => r.meta.reqAuth);
  const reqLogout = to.matched.some(r => r.meta.reqLogout);
  const isLoggedIn = !!StorageConfig.getToken();

  if (reqAuth && !isLoggedIn) return next("/login");

  if (reqLogout && isLoggedIn) return next("/home");

  next();
});

export default router;