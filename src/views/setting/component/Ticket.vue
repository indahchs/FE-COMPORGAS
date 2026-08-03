<template>
  <div>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="10"
        ><span class="title-page">Ticket</span></v-col
      >
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-btn class="btn-submit" @click="createFaq"> Create Ticket </v-btn>
      </v-col>
    </v-row>
    <v-card class="mt-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-select
              dense
              v-model="service"
              outlined
              label="PIC TIcket Name"
              :items="[
                'California',
                'Colorado',
                'Florida',
                'Georgia',
                'Texas',
                'Wyoming',
              ]"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="6">
            <v-select
              dense
              v-model="service"
              outlined
              label="Office Location"
              :items="[
                'California',
                'Colorado',
                'Florida',
                'Georgia',
                'Texas',
                'Wyoming',
              ]"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-text-field
              dense
              v-model="service"
              outlined
              :append-icon="icons.mdiMagnify"
              label="Search"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text>
        <v-data-table
          hide-default-footer
          style="width: 100%"
          :headers="headers"
          :items="items"
          @click:row="handleClick"
          :footer-props="{
            'items-per-page-options': [5, 10, 25],
            'items-per-page-text': 'Items per page:',
            'show-current-page': true,
            'show-first-last-page': true,
          }"
        >
          <template #[`item.noTicket`]="{ item, index }">
            <div
              :style="{ 'background-color': item.noTicket }"
              style="height: 20px; width: 20px; background-color: #101010"
            ></div>
          </template>
          <template #[`item.aksi`]="{ item, index }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                  size="20"
                  style="color: blue"
                  v-on:click.stop="deleteConfirm(item.id)"
                >
                  {{ icons.mdiTrashCanOutline }}
                </v-icon></template
              ><span>Delete</span></v-tooltip
            >
          </template>
        </v-data-table>
        <div class="ml-4" style="display: flex; justify-content: space-between">
          <span style="font-weight: 700; align-self: center"
            >Total Data : {{ totalItems }}</span
          >
          <v-pagination
            v-model="pages"
            :length="totalPage"
            @input="onPageChangeDetil"
            :total-visible="7"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>
    <CreateTicket
      :open="openModalFaq"
      @close="openModalFaq = false"
    ></CreateTicket>
  </div>
</template>
<script>
import { mdiChevronRight, mdiTrashCanOutline, mdiMagnify } from "@mdi/js";
import CreateTicket from "./CreateTicketFormModal.vue";
export default {
  components: {
    CreateTicket,
  },
  data() {
    return {
      pages: 1,
      totalPage: 1,
      totalItems: 0,
      itemsPerpage: 10,
      openModalFaq: false,
      selectedTab: 0,
      tabs: ["Eksternal", "Internal"],
      icons: {
        mdiMagnify,
        mdiTrashCanOutline,
        mdiChevronRight,
      },
      item: 0,
      headers: [
        { text: "PIC Ticket Name", value: "title" },
        { text: "Office Location", value: "category" },
        { text: "Action", value: "aksi" },
      ],
      items: [
        {
          noTicket: "red",
          date: "19-09-2023",
          title: "Blue Screen",
        },
        {
          noTicket: "blue",
          date: "19-09-2023",
          title: "Blue Screen",
          service: "PC / Laptop",
          category: "Lain-lain",
          status: "Pending Ticket",
        },
        {
          noTicket: "green",
          date: "19-09-2023",
          title: "Blue Screen",
          service: "PC / Laptop",
          category: "Lain-lain",
          status: "Assigned Ticket",
        },
        {
          noTicket: "gray",
          date: "19-09-2023",
          title: "Blue Screen",
          service: "PC / Laptop",
          category: "Lain-lain",
          status: "Late Ticket",
        },
        {
          noTicket: "black",
          date: "19-09-2023",
          title: "Blue Screen",
          service: "PC / Laptop",
          category: "Lain-lain",
          status: "Closed Ticket",
        },
        // Add more items as needed
      ],
      listItems: [
        {
          id: 0,
          text: "PC / Laptop",
          subtitle: "Description 1",
          image: require("../../../assets/images/icons/catalog.png"),
        },
        {
          id: 1,
          text: "My Request",
          subtitle: "Description 2",
          image: require("../../../assets/images/icons/request.png"),
        },
        {
          id: 2,
          text: "Faq",
          subtitle: "Description 2",
          image: require("../../../assets/images/icons/faq.png"),
        },
      ],
      faqItems: [
        {
          question: "What is your product about?",
          answer: "Your answer goes here.",
        },
        {
          question: "How can I contact support?",
          answer: "Your answer goes here.",
        },
      ],
    };
  },
  methods: {
    createFaq() {
      this.openModalFaq = true;
    },
    detailPage(x) {
      switch (x) {
        case 0:
          this.faqItems = [
            {
              question: "What is your product about?",
              answer: "Your answer goes here.",
            },
            {
              question: "How can I contact support?",
              answer: "Your answer goes here.",
            },
          ];
          break;
        case 1:
          this.faqItems = [
            {
              question: "kedua",
              answer: "Your answer goes here.",
            },
            {
              question: "Kedua",
              answer: "Your answer goes here.",
            },
          ];
          break;
        case 2:
          this.faqItems = [
            {
              question: "Ketiga",
              answer: "Your answer goes here.",
            },
            {
              question: "Ketiga",
              answer: "Your answer goes here.",
            },
          ];
          break;
        default:
          break;
      }
    },
  },
};
</script>
<style scope>
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
}
.title-page {
  font-weight: bold;
  color: #101010;
}
</style>
