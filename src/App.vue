<template>
  <component :is="resolveLayout">
    <router-view></router-view>
  </component>
</template>

<script>
import { computed } from "vue";
import { useRouter } from "@/helpers";
import LayoutBlank from "@/layouts/Blank.vue";
import LayoutContent from "@/layouts/Navbar.vue";

export default {
  components: {
    LayoutBlank,
    LayoutContent,
  },
  setup() {
    const { route } = useRouter();

    const resolveLayout = computed(() => {
      if (route.value.name === null) return null;

      if (route.value.meta.layout === "blank") return "layout-blank";

      return "layout-content";
    });

    return {
      resolveLayout,
    };
  },
};
</script>
<style>
@font-face {
  font-family: "Poppins-Regular";
  src: url("~@/assets/font/Poppins-Regular.ttf");
}

div:where(.swal2-container) div:where(.swal2-popup) {
  font-family: "Poppins-Regular" !important;
}
</style>
