<template>
  <div>
    <v-row>
      <v-col
        @click="openForm(item)"
        class="text-center"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        style="padding: 2%"
        v-for="(item, id) in dataCatalog"
        :key="id"
      >
        <img
          style="cursor: pointer; width: 80px; height: 80px"
          :src="baseUrl + item.imageUrl"
        />
        <v-card-text style="cursor: pointer" class="text-center">
          <div>{{ item.name }}</div>
        </v-card-text></v-col
      >
    </v-row>
    <HelpdeskFormModal
      :open="openModal"
      :datas="datas"
      @close="closeModal"
    ></HelpdeskFormModal>
  </div>
</template>
<script>
import HelpdeskFormModal from "./HelpdeskFormModal.vue";
import ItHelpDeskService from "@/services/ithelpdesk/itHelpDeskServices";
const getCatalog = ItHelpDeskService.build();
export default {
  components: {
    HelpdeskFormModal,
  },
  data() {
    return {
      openModal: false,
      datas: {},
      dataCatalog: [
        // {
        //   img: require("../../../assets/images/icons/laptop.png"),
        //   title: "PC/ Laptop",
        // },
        // {
        //   img: require("../../../assets/images/icons/laptop.png"),
        //   title: "PC/ Laptop",
        // },
        // {
        //   img: require("../../../assets/images/icons/laptop.png"),
        //   title: "PC/ Laptop",
        // },
        // {
        //   img: require("../../../assets/images/icons/laptop.png"),
        //   title: "PC/ Laptop",
        // },
        // {
        //   img: require("../../../assets/images/icons/laptop.png"),
        //   title: "PC/ Laptop",
        // },
      ],
      baseUrl: process.env.VUE_APP_PERTAGAS,
    };
  },
  created() {
    this.getCatalog();
  },
  methods: {
    async getCatalog() {
      const param = {
        size: 999999999,
      };
      const res = await getCatalog.getHelpDeskPage(param);
      const data = res.data.data.content;
      this.dataCatalog = data;
    },
    openForm(id) {
      if (id) {
      }
      this.datas = id;
      this.openModal = true;
    },
    closeModal(val) {
      this.$emit("clicked", val);
      this.openModal = false;
    },
  },
};
</script>
