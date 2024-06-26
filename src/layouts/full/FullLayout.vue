<script setup lang="ts">
import { RouterView } from "vue-router";
import { ref, onMounted } from "vue";
import SidebarVue from "./sidebar/Sidebar.vue";
import HeaderVue from "./header/Header.vue";

const drawer = ref(undefined || true);
const innerW = window.innerWidth;

onMounted(() => {
  if (innerW < 950) {
    drawer.value = !drawer.value;
  }
});
</script>

<template>
  <v-app>

    <v-navigation-drawer
      left
      :permanent="$vuetify.display.mdAndUp"
      elevation="10"
      app
      :temporary="$vuetify.display.mdAndDown"
      v-model="drawer"
      expand-on-hover
    >
      <SidebarVue />
    </v-navigation-drawer>


    <v-app-bar elevation="0" class="v-topbar">
      <v-app-bar-nav-icon class="hidden-md-and-up" @click="drawer = !drawer" />
      <v-spacer />
      <HeaderVue />
    </v-app-bar>

    <v-main>
      <v-container fluid class="page-wrapper">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>
