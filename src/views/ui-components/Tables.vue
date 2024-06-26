<script setup lang="ts">

import BaseCard from "@/components/BaseCard.vue";
import TableDencity from "./table-data/TableDencity.vue";
import TableFixHeader from "./table-data/TableFixHeader.vue";

const userProfile = JSON.parse(<string> localStorage.getItem('user'))
const isAdmin = userProfile.role === 'admin';

</script>

<template>
  <v-container fluid class="down-top-padding">
    <v-row>
      <v-col cols="12" sm="12">
        <BaseCard heading="Profile User Management">
          <TableFixHeader />
        </BaseCard>
      </v-col>
      <v-col cols="12" sm="12" v-if="isAdmin">
        <BaseCard heading="Role Management">
          <TableDencity />
        </BaseCard>
      </v-col>
    </v-row>
  </v-container>
</template>