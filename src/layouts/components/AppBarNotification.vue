<template>
  <v-menu offset-y left nudge-bottom="14" max-width="300" content-class="notification-menu-content"
    style="z-index: 120 !important">
    <template #activator="{ on, attrs }">
      <div class="d-flex" v-bind="attrs" v-on="on">
        <div v-if="totalNotif > 0">
          <v-badge color="error" :content="totalNotif" overlap>
            <v-btn icon small class="ms-3">
              <v-icon color="gray">
                {{ icons.mdiBellOutline }}
              </v-icon>
            </v-btn>
          </v-badge>
        </div>
        <div v-else>
          <v-btn icon small class="ms-3">
            <v-icon color="gray">
              {{ icons.mdiBellOutline }}
            </v-icon>
          </v-btn>
        </div>

        <div class="mx-5" style="height: 32px; width: 1px; border: 1px solid #9a9a9a"></div>
      </div>
    </template>

    <v-list two-line>
      <v-list-item-group style="width: 500px">
        <v-virtual-scroll :height="300" :items="notif" :item-height="87" item-width="300">
          <template v-slot:default="{ item, index }">
            <v-list-item v-if="totalNotif !== 0" :key="item.title"
              v-bind:class="`${item.read ? 'notif-read' : 'notif-unread'}`" style="height: 100%"
              @click="handleClick(item)">
              <template>
                <v-list-item-content>
                  <v-list-item-subtitle class="text--primary" style="
                      font-size: 12px;
                      color: #606060;
                      font-weight: 400;
                      line-height: 16px;
                    ">
                    <v-icon color="blue" size="18px">
                      {{ icons.mdiInformationOutline }} </v-icon>{{ " Info | " + item.createdAt
                      }}</v-list-item-subtitle>

                  <v-list-item-title v-text="item.title" style="
                      font-size: 14px;
                      color: #101010;
                      font-weight: 600;
                      line-height: 20px;
                    "></v-list-item-title>

                  <v-list-item-subtitle v-text="item.message" style="
                      font-size: 14px;
                      color: #606060;
                      font-weight: 400;
                      line-height: 20px;
                    "></v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-list-item>
            <div v-else class="mt-4 mb-2" style="font-size: 14px; color: #101010; text-align: center">
              <br /><br /><br /><br /><br />{{ item }}
            </div>
            <v-divider v-if="index < notif.length - 1" :key="`divider-${index}`" class="divider-color"></v-divider>
          </template>
        </v-virtual-scroll>
        <div @click="goDetail" style="text-decoration: none; cursor: pointer">
          <div class="mt-4 mb-2" style="
              font-size: 14px;
              color: #0172b9;
              font-weight: 600;
              line-height: 20px;
              text-align: center;
            ">
            View More
          </div>
        </div>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
import { mdiBellOutline, mdiInformationOutline } from "@mdi/js";
import PersonalNotificationServices from "@/services/notification/notificationServices";

const personalNotificationServices = PersonalNotificationServices.build();

export default {
  data() {
    return {
      notif: ["No Notification"],
      totalNotif: 0,
      icons: {
        mdiBellOutline,
        mdiInformationOutline,
      },
      detailRoute: "notification",
    };
  },
  created() {
    this.getNotif();
  },
  methods: {
    goDetail() {
      this.$emit("clicked", "someValue");
      this.$router.push("notification");
    },
    async getNotif() {
      const res = await personalNotificationServices.getLatest();
      this.notif =
        res.data.data.items.length === 0
          ? ["No Notification"]
          : res.data.data.items;
      this.totalNotif = res.data.data.totalUnread;
    },
    async handleClick(value) {
      const data = [value.id];
      await personalNotificationServices.postReadNotif(data);
      this.getNotif();
      switch (value.actionPath) {
        case "EVENT":
          this.$router.push("events-request").catch(() => { });
          break;
        case "MEETING":
          this.$router.push("meeting-booking").catch(() => { });
          break;
        case "TICKET":
          this.$router.push("ithelpdesksupport").catch(() => { });
          break;
        case "TICKET-USER":
          this.$router.push("ithelpdesk?page=my-request").catch(() => { });
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style>
.notif-unread {
  background: #d9eaf5;
}

.notif-read {
  background: white;
}

.divider-color {
  background: #7bbdee;
}
</style>