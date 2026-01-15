<template>
  <v-app>
    <v-app-bar style="height: 70px !important" app flat absolute color="white">
      <div class="boxed-container w-full">
        <div class="d-flex align-center navbar-content" style="height: 70px;">
          <div class="logo-container" @click="goToHome">
            <img class="logo" src="../assets/images/logos/comporgas.png" alt="Comporgas Logo" />
          </div>

          <v-spacer class="hidden-sm-and-down"></v-spacer>

          <div v-if="isNotif" class="custom-tabs hidden-sm-and-down">
            <div v-for="(item, index) in displayMenu" :key="item.id" @click="handleMenuClick(item, index)"
              class="custom-tab" :class="{ 'active': activeTab === index }">
              {{ item.name }}
            </div>
          </div>

          <v-spacer class="hidden-sm-and-down"></v-spacer>

          <div class="d-flex align-center user-menu">
            <AppBarNotification @clicked="onClickChild"></AppBarNotification>
            <app-bar-user-menu></app-bar-user-menu>

            <v-btn icon class="hidden-md-and-up mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
              <v-icon>{{ mobileMenuOpen ? icons.mdiClose : icons.mdiMenu }}</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <div v-if="isNotif && mobileMenuOpen" class="mobile-nav hidden-md-and-up">
        <div class="mobile-nav-content">
          <div v-for="(item, index) in displayMenu" :key="item.id"
            @click="handleMenuClick(item, index); mobileMenuOpen = false" class="mobile-nav-item"
            :class="{ 'active': activeTab === index }">
            {{ item.name }}
          </div>
        </div>
      </div>
    </v-app-bar>

    <v-main class="main-container bg">
      <div class="app-content-container boxed-container pa-4">
        <slot></slot>
      </div>
    </v-main>

    <img :style="imgFooter === null ? 'display: none' : ''" :src="imgFooter" style="width: 100%" />
    <div :style="imgFooter === null ? 'margin-top: 12px' : ''">
      <div style="background-color: #004e80" class="boxed-container w-full">
        <div class="footer-content">
          <div class="footer-text">
            <v-icon class="footer-icon" color="white">{{ icons.mdiDomain }}</v-icon>
            <span class="footer-address">
              Grha Pertamina. Pertamax Tower, Lantai 20 - 23. Jl. Medan Merdeka
              Timur No. 11-13. Jakarta Pusat 10110 -
            </span>
          </div>
          <div class="footer-contact">
            <v-icon class="footer-icon" color="white">{{ icons.mdiEmailOutline }}</v-icon>
            <span class="footer-email">servicedesk.pertagas@pertamina.com</span>
            <v-icon @click="clickIg" class="footer-social" color="white">{{
              icons.mdiInstagram
            }}</v-icon>
          </div>
        </div>
      </div>
    </div>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000" top right>
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false">
          Tutup
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import { ref } from "vue";
import {
  mdiEmailOutline,
  mdiInstagram,
  mdiDomain,
  mdiMenu,
  mdiClose,
} from "@mdi/js";
import AppBarUserMenu from "./components/AppBarUserMenu.vue";
import AppBarNotification from "./components/AppBarNotification.vue";

export default {
  components: {
    AppBarUserMenu,
    AppBarNotification,
  },
  setup() {
    const isDrawerOpen = ref(null);
    const currentYear = ref(new Date().getFullYear());

    return {
      isDrawerOpen,
      currentYear,
    };
  },
  data() {
    return {
      mobileMenuOpen: false,
      isNotif: true,
      baseUrl: process.env.VUE_APP_PERTAGAS,
      activeTab: 0,
      imgFooter: "",
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'error',
      icons: {
        mdiInstagram,
        mdiEmailOutline,
        mdiDomain,
        mdiMenu,
        mdiClose,
      },
      displayMenu: [],
      menuMapping: {},
      userRole: null,
    };
  },
  created() {
    this.initializeMenu();
  },
  mounted() {
    this.updateTabFromRoute();
  },
  watch: {
    $route(to, from) {
      this.mobileMenuOpen = false;
      if (to.path === "/notification") {
        this.isNotif = false;
      } else {
        this.isNotif = true;
      }
      this.updateTabFromRoute();
    },
  },
  methods: {
    goToHome() {
      this.$router.push('/home').catch(() => { });
      this.activeTab = 0;
      this.mobileMenuOpen = false;
    },

    onClickChild() {
      this.isNotif = false;
    },

    clickIg() {
      window.open("https://www.instagram.com/pertaminagas/", "_blank");
    },

    showSnackbar(message, color = 'error') {
      this.snackbarText = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },

    initializeMenu() {
      const data = JSON.parse(localStorage.getItem("dataUser"));
      if (!data) return;

      this.userRole = data.roleId;
      const { menus } = data;

      const navbarMenus = menus.filter((item) => item.typeId === "NAVBAR");

      this.menuMapping = {
        'home': '/home',
        'application': '/application',
        'events': '/events',
        'meeting': '/meetings',
        'gallery': '/gallery',
        'helpdesk': this.isITRole() ? '/ithelpdesksupport' : '/ithelpdesk',
        'management_setting': '/setting',
      };

      this.displayMenu = navbarMenus.map(menu => ({
        id: menu.id,
        name: menu.name,
        path: menu.path,
        children: menu.children || []
      }));

      console.log('Initialized menu:', this.displayMenu);
    },

    isITRole() {
      return ['IT', 'IT_LEAD', 'SUPER'].includes(this.userRole);
    },

    handleMenuClick(menuItem, index) {
      console.log('Menu clicked:', menuItem);

      this.activeTab = index;

      const routePath = this.menuMapping[menuItem.id];

      if (routePath) {
        this.$router.push(routePath).catch(() => { });
      } else {
        console.warn('No route mapping found for menu:', menuItem.id);
      }
    },

    updateTabFromRoute() {
      const fullPath = this.$route.path;

      const menuIndex = this.displayMenu.findIndex(menu => {
        const mappedPath = this.menuMapping[menu.id];
        if (!mappedPath) return false;
        return fullPath === mappedPath || fullPath.startsWith(mappedPath);
      });

      if (menuIndex !== -1) {
        this.activeTab = menuIndex;
      } else {
        this.activeTab = 0;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.navbar-content {
  position: relative;
  padding: 0 20px;
}

.logo-container {
  flex-shrink: 0;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  .logo {
    width: 200px;
    height: 48px;
    max-width: 100%;
    height: auto;
  }
}

.user-menu {
  flex-shrink: 0;
  gap: 8px;
  margin-left: auto;
}

.mobile-menu-btn {
  margin-left: 8px;
}

.custom-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  height: 50px;
  flex: 1;
}

.custom-tab {
  color: #606060;
  min-width: 70px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-transform: none;
  background: transparent;
  border: none;
  outline: none;
  white-space: nowrap;
  padding: 0 8px;
  font-size: 14px;

  &.active {
    color: #0172B9;
    font-weight: 600;
  }

  &:hover:not(.active) {
    color: #0172B9;
  }
}

.mobile-nav {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.mobile-nav-content {
  padding: 12px 18px;
}

.mobile-nav-item {
  padding: 12px 16px;
  color: #606060;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 6px;
  margin-bottom: 6px;

  &.active {
    color: #0172B9;
    background-color: #f0f8ff;
    font-weight: 600;
  }

  &:hover:not(.active) {
    color: #0172B9;
    background-color: #f8f9fa;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.main-container {
  margin-top: 70px;
}

.boxed-container {
  margin-left: auto;
  margin-right: auto;
}

.footer-content {
  padding: 0.8%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-text {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 280px;
}

.footer-contact {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-icon {
  margin-right: 6px;
}

.footer-address,
.footer-email {
  color: white;
  font-size: 14px;
}

.footer-social {
  cursor: pointer;
  margin-left: 12px;

  &:hover {
    opacity: 0.8;
  }
}

@media (max-width: 1400px) {
  .custom-tabs {
    gap: 16px;
  }

  .custom-tab {
    min-width: 65px;
    font-size: 13px;
  }
}

@media (max-width: 1200px) {
  .custom-tabs {
    gap: 12px;
  }

  .custom-tab {
    min-width: 60px;
    font-size: 12px;
    padding: 0 6px;
  }
}

@media (max-width: 960px) {
  .navbar-content {
    padding: 0 12px;
  }

  .logo {
    width: 160px !important;
    height: 38px !important;
  }

  .user-menu {
    gap: 6px;
  }

  .boxed-container {
    max-width: 100%;
    padding: 0 10px;
  }
}

@media (max-width: 768px) {
  .navbar-content {
    padding: 0 10px;
    height: 70px !important;
  }

  .logo {
    width: 150px !important;
    height: 36px !important;
  }

  .user-menu {
    gap: 5px;
  }

  .app-content-container {
    padding: 12px !important;
  }

  .footer-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
  }

  .footer-text {
    min-width: auto;
    width: 100%;
  }

  .footer-contact {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 600px) {
  .navbar-content {
    padding: 0 8px;
  }

  .logo {
    width: 135px !important;
    height: 32px !important;
  }

  .user-menu {
    gap: 4px;
  }

  .mobile-menu-btn {
    margin-left: 4px;
  }

  .mobile-nav-content {
    padding: 10px 14px;
  }

  .footer-address,
  .footer-email {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .navbar-content {
    padding: 0 6px;
  }

  .logo {
    width: 120px !important;
    height: 29px !important;
  }

  .mobile-nav-item {
    padding: 8px 10px;
    font-size: 13px;
  }

  .footer-text {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .footer-address {
    font-size: 12px;
    margin-left: 0;
  }

  .app-content-container {
    padding: 10px !important;
  }
}

.hidden-sm-and-down {
  @media (max-width: 959px) {
    display: none !important;
  }
}

.hidden-md-and-up {
  @media (min-width: 960px) {
    display: none !important;
  }
}
</style>