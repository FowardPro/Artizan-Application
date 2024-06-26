<script setup lang="ts">
import { ref } from "vue";
import { profile } from "./data";

const userprofile = ref(profile);
const userDetails = JSON.parse(<string> localStorage.getItem('user'))
</script>

<template>
  <v-row justify="end" class="align-center">
    <h3 class="mr-4">Welcome,
      {{ `${userDetails.name.toUpperCase()}
          ${userDetails.surname.toUpperCase()} `}}</h3>
    ({{ userDetails.role }})
    <v-menu >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          elevation="0"
          color="transparent"
          plain
          :ripple="false"
        >
          <v-avatar size="35">
<!--            <img src="@/assets/images/users/user2.jpg" alt="User" />-->
          </v-avatar>
        </v-btn>
      </template>

    </v-menu>
  </v-row>
</template>
