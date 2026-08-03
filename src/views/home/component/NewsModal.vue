<template>
  <v-dialog v-model="open" max-width="800px">
    <v-card>
      <v-img :src="data?.imageUrl" height="300"></v-img>
      <v-card-title>{{ data?.title }}</v-card-title>
      <v-card-text>{{ data?.description }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="$emit('clicked')">Tutup</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>