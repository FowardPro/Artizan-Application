<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from "sweetalert2";

const usersData = ref([]);
const roles = ['Buyer', 'Artist'];
const dialog = ref(false);
const selectedUser = ref(null);
const selectedRole = ref('');

const API_URL = import.meta.env.VITE_API_URL;
const getAllUsers = `${API_URL}users/`;
const deleteUserAPI = `${API_URL}users/`;
const axiosInstance = axios.create({
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  },
});
const openDialog = (user:any) => {
  selectedUser.value = user;
  selectedRole.value = user.role;
  dialog.value = true;
};

const deleteUser = (user:any) => {

  Swal.fire({
    icon: 'warning',
    title: 'Delete User',
    text: `Are you sure you would like to delete ${user.name}`,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    showCancelButton: true
  }).then(async (res) => {
    if (res.value) {
      try {
        await axiosInstance.delete(`${API_URL}users/${user.id}`).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'User Deleted!',
            text: `Successfully deleted ${user.name}`,
            confirmButtonText: 'Ok'
          })
        });
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Failed to Deleted User!',
          text: `${error}`,
          confirmButtonText: 'Ok'
        })
      }
    }
  })

};

const updateRole = async () => {
  if (selectedUser.value) {

    try {
      await axiosInstance.post(`${API_URL}users/role/${selectedUser.value.id}`, {
        role: selectedRole.value.toLowerCase(),
      });
      selectedUser.value.role = selectedRole.value;
      dialog.value = false;
    } catch (error) {
      console.error('Error updating role:', error);
    }
  }
};

onMounted(async () => {
  try {
    const usersResponse = await axiosInstance.get(getAllUsers);
    usersData.value = usersResponse.data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
});
</script>

<template>
  <div>
    <p class="text-subtitle-1 text-grey-darken-1">
      Change or Manage User Roles
    </p>
    <div class="mt-4">
      <v-table density="compact">
        <thead>
        <tr>
          <th class="text-left text-subtitle-2">Name</th>
          <th class="text-left text-subtitle-2">Email</th>
          <th class="text-left text-subtitle-2">Phone Number</th>
          <th class="text-left text-subtitle-2">User Role</th>
          <th class="text-left text-subtitle-2">Date Created</th>
          <th class="text-left text-subtitle-2">Change Role</th>
          <th class="text-left text-subtitle-2">Remove User</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in usersData" :key="item.id">
          <td>{{ item.name + ' ' + item.surname }}</td>
          <td>{{ item.email }}</td>
          <td>{{ item.contacts }}</td>
          <td>{{ item.role.toUpperCase() }}</td>
          <td>{{ item.created_at }}</td>
          <td class="pa-2">
            <v-btn @click="openDialog(item)" dense>
              Change Role
            </v-btn>
          </td>
          <td class="pa-3">
            <v-btn @click="deleteUser(item)" color="red">
              Delete
            </v-btn>
          </td>
        </tr>
        </tbody>
      </v-table>
    </div>

    <v-dialog v-model="dialog">
      <v-card>
        <v-card-title class="text-h5">Change Role</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedRole"
            :items="roles"
            label="Select Role"
            dense
            hide-details
            solo
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn color="blue darken-1" text @click="updateRole">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
