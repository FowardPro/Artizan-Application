<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const usersData = ref([]);
const roles = ['Buyer', 'Artist'];
const API_URL = import.meta.env.VITE_API_URL;
const userProfile = JSON.parse(<string> localStorage.getItem('user'))
const isAdmin = userProfile.role === 'admin';
let isLoading = ref(false);

const axiosInstance = axios.create({
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  },
});
const getAllUsers = async () => {
  try {
    isLoading.value = true;
    if(!isAdmin) {
      const response = await axiosInstance.get(`${API_URL}users/${userProfile.id}`);
      usersData.value.push(response.data);
    } else {
      const response = await axiosInstance.get(`${API_URL}users/`);
      usersData.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
  isLoading.value = false;
};

const updateUser = async (user:any) => {

  if(user.newPassword === user.password || !user.newPassword){
    try {
      isLoading.value = true;

      await axiosInstance.post(`${API_URL}users/${user.id}`, {
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        contacts: user.contacts
      });
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user.');
    }
  } else {
    Swal.fire({
      title: 'Failed To Update User',
      text: `Password provided for ${user.name} do not match`,
      icon: 'error',
      confirmButtonText: 'Ok'
    }).then(() => {
      location.reload();
    })
  }
  isLoading.value = false;

};

onMounted(getAllUsers);
</script>

<template>
  <div v-if="isLoading" class="overlay">
    <div class="loader"></div>
    <p>Loading...</p>
  </div>
  <div>
    <p class="text-subtitle-1 text-grey-darken-1">
      Manage User Profile
    </p>
    <div class="mt-4">
      <v-table  height="300px">
        <thead>
        <tr>
          <th class="text-left">Name</th>
          <th class="text-left">Surname</th>
          <th class="text-left">Email</th>
          <th class="text-left">User Role</th>
          <th class="text-left">Phone Numbers</th>
          <th class="text-left">Password</th>
          <th class="text-left">Confirm Password</th>
          <th class="text-left">Actionable Item</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in usersData" :key="user.id">
          <td>
            <v-text-field v-model="user.name" dense hide-details></v-text-field>
          </td>
          <td>
            <v-text-field v-model="user.surname" dense hide-details></v-text-field>
          </td>
          <td>
            <v-text-field v-model="user.email" dense hide-details></v-text-field>
          </td>
          <td>
            <v-text-field
              :items="roles"
              v-model="user.role"
              dense
              hide-details
              solo
              disabled
            ></v-text-field>
          </td>
          <td>
            <v-text-field v-model="user.contacts" dense hide-details type="Phone Number"></v-text-field>
          </td>
          <td>
            <v-text-field v-model="user.password" dense hide-details type=""></v-text-field>
          </td>
          <td>
            <v-text-field v-model="user.newPassword" dense hide-details type="Phone Number"></v-text-field>
          </td>
          <td>
            <v-btn @click="updateUser(user)" dense>Update</v-btn>
          </td>
        </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
