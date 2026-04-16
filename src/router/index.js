import Vue from "vue";
import VueRouter from "vue-router";
import StorageConfig from "../services/config/StorageConfig";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("@/views/dashboard/Dashboard.vue"),
    meta: {
      reqAuth: true,
      removeMerchantId: true,
      removeStoreId: true,
    },
  },
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/home/Home.vue"),
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/application",
    name: "application",
    component: () => import("@/views/application/Application.vue"),
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/events",
    name: "events",
    component: () => import("@/views/events/Events.vue"),
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/events-request",
    name: "events-request",
    component: () => import("@/views/events/components/EventRequest.vue"),
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/meetings",
    name: "meetings",
    component: () => import("@/views/meetings/Meetings.vue"),
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/ithelpdesk",
    name: "ithelpdesk",
    component: () => import("@/views/ithelpdesk/ItHelpdesk.vue"),
    meta: {
      reqAuth: true,
    },
    children: [
      {
        path: "",
        redirect: "catalog"
      },
      {
        path: "catalog",
        name: "ithelpdesk-catalog",
        component: () => import("@/views/ithelpdesk/components/Catalog.vue"),
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "my-request",
        name: "ithelpdesk-my-request",
        component: () => import("@/views/ithelpdesk/components/MyRequest.vue"),
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "my-request/:id",
        name: "ithelpdesk-my-request-detail",
        component: () => import("@/views/ithelpdesk/components/TicketDetail.vue"),
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "faq",
        name: "ithelpdesk-faq",
        component: () => import("@/views/ithelpdesk/components/Faq.vue"),
        meta: {
          reqAuth: true,
        },
      },
    ],
  },
  {
    path: "/ithelpdesksupport",
    name: "ithelpdesksupport",
    component: () => import("@/views/ithelpdesksupport/ItHelpdeskSupport.vue"),
    meta: {
      reqAuth: true,
    },
    children: [
      {
        path: "",
        redirect: "my-request"
      },
      {
        path: "my-request",
        name: "ithelpdesksupport-my-request",
        component: () => import("@/views/ithelpdesksupport/components/MyRequest.vue"),
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "my-request/:id",
        name: "ithelpdesksupport-my-request-detail",
        component: () => import("@/views/ithelpdesksupport/components/TicketDetail.vue"),
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "request",
        name: "ithelpdesksupport-request",
        component: () => import("@/views/ithelpdesksupport/components/Resume.vue"),
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "catalog",
        name: "ithelpdesksupport-catalog",
        component: () => import("@/views/ithelpdesksupport/components/Catalog.vue"),
        meta: {
          reqAuth: true,
        },
      },
      {
        path: "faq",
        name: "ithelpdesksupport-faq",
        component: () => import("@/views/ithelpdesksupport/components/Faq.vue"),
        meta: {
          reqAuth: true,
        },
      },
    ],
  },
  {
    path: "/notification",
    name: "notification",
    component: () => import("@/views/notification/Notification.vue"),
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/meeting-booking",
    name: "meeting-booking",
    component: () => import("@/views/meetings/MeetingUserBooking.vue"),
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/setting",
    name: "setting",
    component: () => import("@/views/setting/ManagementSetting.vue"),
    meta: {
      reqAuth: true,
    },
  },
  {
    path: "/charts",
    name: "charts",
    component: () => import("@/views/charts/Chart.vue"),
  },
  {
    path: "/typography",
    name: "typography",
    component: () => import("@/views/typography/Typography.vue"),
  },
  {
    path: "/icons",
    name: "icons",
    component: () => import("@/views/icons/Icons.vue"),
  },
  {
    path: "/cards",
    name: "cards",
    component: () => import("@/views/cards/Card.vue"),
  },
  {
    path: "/tables",
    name: "tables",
    component: () => import("@/views/tables/SimpleTable.vue"),
  },
  {
    path: "/forms",
    name: "forms",
    component: () => import("@/views/forms/FormLayouts.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () =>
      import("@/views/pages/account-settings/AccountSettings.vue"),
  },
  {
    path: "/gallery",
    name: "gallery",
    component: () =>
      import("@/views/gallery/Gallery.vue"),
  },
  {
    path: "/gallery/:id",
    name: "FolderDetail",
    component: () =>
      import("@/views/gallery/FolderDetail.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/pages/Login.vue"),
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
    component: () => import("@/views/pages/Login-Admin.vue"),
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
    component: () => import("@/views/pages/Register.vue"),
    meta: {
      layout: "blank",
    },
  },
  {
    path: "/notfound",
    name: "notfound",
    component: () => import("@/views/Error.vue"),
    meta: {
      layout: "blank",
    },
  },
  {
    path: "*",
    redirect: "/notfound",
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