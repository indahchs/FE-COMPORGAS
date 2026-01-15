<template>
  <v-menu offset-y left nudge-bottom="14" min-width="230" content-class="user-profile-menu-content">
    <template v-slot:activator="{ on, attrs }">

      <div class="pb-3 pt-2" v-bind="attrs" v-on="on">
        <div class="d-inline-flex flex-column justify-center ms-3" style="vertical-align: middle">
          <span style="color: #0172b9" class="font-weight-semibold mb-n1">
            {{ user }}
          </span>
          <small style="color: #9a9a9a; overflow-wrap: break-word; max-width: 200px" class="new-line text-capitalize">{{
            title }}</small>
        </div>
        <v-badge bottom color="success" overlap offset-x="12" offset-y="12" class="ms-4" dot>
          <v-avatar size="40px">
            <v-img :src="require('@/assets/images/avatars/user.png')"></v-img>
          </v-avatar>
        </v-badge>
      </div>
    </template>
    <v-list>
      <div class="pb-3 pt-2">

        <div class="d-inline-flex flex-column justify-center ms-3" style="vertical-align: middle">
          <span class="text--primary font-weight-semibold mb-n1">
            {{ user }}
          </span>
          <small class="new-line text--disabled text-capitalize">{{
            title
          }}</small>
        </div>
      </div>

      <v-divider class="my-2"></v-divider>

      <v-list-item @click="logout" link>
        <v-list-item-icon class="me-2">
          <v-icon size="22">
            {{ icons.mdiLogoutVariant }}
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import {
  mdiAccountOutline,
  mdiEmailOutline,
  mdiCheckboxMarkedOutline,
  mdiChatOutline,
  mdiCogOutline,
  mdiCurrencyUsd,
  mdiHelpCircleOutline,
  mdiLogoutVariant,
} from "@mdi/js";

export default {
  setup() {
    return {
      icons: {
        mdiAccountOutline,
        mdiEmailOutline,
        mdiCheckboxMarkedOutline,
        mdiChatOutline,
        mdiCogOutline,
        mdiCurrencyUsd,
        mdiHelpCircleOutline,
        mdiLogoutVariant,
      },
    };
  },
  data() {
    return {
      user: "",
      title: "",
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    getUser() {
      const user = JSON.parse(localStorage.getItem("dataUser"));
      this.user = user.fullName;
      this.title = user.title;
    },
    formatString(inputString, maxCharacters) {
      const result = inputString.match(/.{20}/g).join("\n");
    },
    logout() {
      localStorage.clear();
      sessionStorage.clear();

      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }

      this.$router.replace("/login");
    },
  },
};
</script>

<style lang="scss">
.user-profile-menu-content {
  .v-list-item {
    min-height: 2.5rem !important;
  }
}

.new-line {
  overflow-wrap: break-word;
  max-width: 200px;
}
</style>