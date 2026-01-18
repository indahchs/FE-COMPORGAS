<template>
  <div style="margin-top: -60px; margin-bottom: 20px;">
    <v-row>
      <v-col cols="12" sm="12" md="4" lg="3">
        <v-card style="padding: 2%">
          <v-list>
            <v-list-item-group v-model="item" color="primary" mandatory>
              <v-list-item 
                @click="navigateToPage(data.query)" 
                v-for="(data, index) in listItems" 
                :key="index"
              >
                <img 
                  class="mr-4" 
                  :src="isActive(data.query) ? data.imageBlue : data.image" 
                  alt="Item Image" 
                />
                <v-list-item-content>
                  <v-list-item-title>{{ data.text }}</v-list-item-title>
                  <v-list-item-subtitle class="subt-text">
                    {{ data.subtitle }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" sm="12" md="8" lg="9">
        <router-view></router-view>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      item: 0,
      listItems: [
        {
          id: 0,
          query: "my-request",
          text: "Request Ticket",
          subtitle: "Requests for assistance or problem reports sent to the helpdesk team",
          image: require("../../assets/images/icons/request.png"),
          imageBlue: require("../../assets/images/icons/request_blue.png"),
        },
        {
          id: 1,
          query: "request",
          text: "Resume Ticket",
          subtitle: "A summary of requests for help or problem reports sent to the helpdesk team to monitor and evaluate the performance of the helpdesk team",
          image: require("../../assets/images/icons/resume.svg"),
          imageBlue: require("../../assets/images/icons/resume_blue.png"),
        },
        {
          id: 2,
          query: "catalog",
          text: "Master Catalog",
          subtitle: "A page containing a collection of lists of available IT services",
          image: require("../../assets/images/icons/catalog.png"),
          imageBlue: require("../../assets/images/icons/catalog_blue.png"),
        },
        {
          id: 3,
          query: "faq",
          text: "FAQ",
          subtitle: "A page that contains a list of questions and answers related to a specific topic, product, or service.",
          image: require("../../assets/images/icons/faq.png"),
          imageBlue: require("../../assets/images/icons/faq_blue.png"),
        },
      ],
    };
  },
  created() {
    const userData = JSON.parse(localStorage.getItem("dataUser"));
    if (userData.roleId === "IT") {
      this.listItems = this.listItems.filter(value => value.id !== 1);
    }
    this.setActiveItem();
  },
  watch: {
    '$route'() {
      this.setActiveItem();
    }
  },
  methods: {
    navigateToPage(page) {
      this.$router.push(`/ithelpdesksupport/${page}`).catch(() => {});
    },
    isActive(query) {
      return this.$route.path.includes(query);
    },
    setActiveItem() {
      const currentPath = this.$route.path;
      const activeIndex = this.listItems.findIndex(item =>
        currentPath.includes(item.query)
      );
      this.item = activeIndex !== -1 ? activeIndex : 0;
    }
  },
};
</script>

<style scoped>
.subt-text {
  white-space: normal;
  text-align: justify;
}
</style>