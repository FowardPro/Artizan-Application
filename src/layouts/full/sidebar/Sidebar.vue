<script setup lang="ts">
import { ref, onMounted } from 'vue';
import sidebarItems from "./sidebarItem";
import LogoDark from "../logo/LogoDark.vue";
import Swal from "sweetalert2";
import axios from "axios";

const sidebarMenu = ref(sidebarItems);
const user = JSON.parse(<string>localStorage.getItem('user'));
const API_URL = import.meta.env.VITE_API_URL;
const getAllArtworks = `${API_URL}artwork/`;
const axiosInstance = axios.create({
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  },
});
onMounted(async () => {

  if(!user) {
     await Swal.fire({
       title: 'Unauthorized Access!',
       text: 'Unauthorized Access, Please login',
       icon: 'error',
       confirmButtonText: 'Ok'
     }).then(() => {
       location.replace('/auth/login');
     });

  } else {
    const isFirstLogin = localStorage.getItem('isFirstLogin');

    if (!isFirstLogin) {
      localStorage.setItem('isFirstLogin', 'false');

      location.reload();
    }

    const user = JSON.parse(<string>localStorage.getItem('user'));
    if(user.role === 'admin'){
      const { data } = await axiosInstance.get(getAllArtworks);
      
      if(data.filter(items => items.status === 'pending').length > 0){
        await Swal.fire({
          title: 'New Artwork Uploaded',
          text: 'New Artworks Requires Your Attention!',
          icon: 'warning',
          confirmButtonText: 'Ok'
        });
      }
    }
  }
});

async function action(item: any) {

  if(item === '/auth/login'){
    localStorage.clear();
  }
  location.replace(item);

}
</script>

<template>
  <div>
    <div class="pa-4">
      <LogoDark />
    </div>

    <div class="scrollnavbar" v-if="user">
      <v-list class="pa-4" color="transparent">
        <template v-for="(item) in sidebarMenu" :key="i">
          <v-list-item
            v-if="item && (item.role === user.role || item.role === '*')"
            @click="action(item.to)"
            rounded="lg"
            class="mb-1"
          >
            <v-list-item-avatar start class="v-list-item-avatar--start">
              <v-icon class="feather-sm v-icon v-icon--size-default">
               {{item.icon}}
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </div>
  </div>
</template>
