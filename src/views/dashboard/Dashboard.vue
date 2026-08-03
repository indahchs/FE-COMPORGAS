<template>
  <v-row>
    <v-col cols="12">
      <dashboard-datatable></dashboard-datatable>
    </v-col>
  </v-row>
</template>

<script>
// eslint-disable-next-line object-curly-newline

// demos
import DashboardDatatable from './DashboardDatatable.vue'

export default {
  components: {
    DashboardDatatable,
  },
}
</script>
