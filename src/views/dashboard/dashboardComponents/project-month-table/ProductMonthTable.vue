<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

let isLoading = ref(false);

const API_URL = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  },
});

const monthtable = ref([]);
const usersData = ref([]);

const getAllArtworks = `${API_URL}artwork/`;
const getAllUsers = `${API_URL}users/`;
const approveAPI = `${API_URL}artwork/approve/`;
const rejectAPI = `${API_URL}artwork/reject/`;

function exportReport() {
  try {
    const modifiedData = monthtable.value.map(({ picture, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(modifiedData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Artwork Reports');

    XLSX.writeFile(workbook, 'artwork-report.xlsx');

    Swal.fire({
      icon: 'success',
      title: 'Downloaded Artwork Reports',
      text: 'Successfully download artwork reports',
      showLoaderOnConfirm: true,
    });
  }catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'Error Occurred',
      text: 'Failed to Download Artwork Reports',
      showLoaderOnConfirm: true,
    });
  }
}
function exportCsv() {
  try {
    const modifiedData = monthtable.value.map(({ picture, ...rest }) => rest);

    const worksheet = XLSX.utils.json_to_sheet(modifiedData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "artwork-report.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    Swal.fire({
      icon: 'success',
      title: 'Downloaded Artwork Reports',
      text: 'Successfully download artwork reports',
      showLoaderOnConfirm: true,
    });
  }catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'Error Occurred',
      text: 'Failed to Download Artwork Reports',
      showLoaderOnConfirm: true,
    });
  }
}

onMounted(async () => {
  try {
    isLoading.value = true;

    const response = await axiosInstance.get(getAllArtworks);
    const usersResponse = await axiosInstance.get(getAllUsers);

    monthtable.value = response.data;
    usersData.value = usersResponse.data;

  } catch (error) {
   alert(error);
  }
  isLoading.value = false;
});

function getUserDetails(id: any) {
  const userObj = usersData.value.find(item => item.id === id);

  if(userObj) {
    return `${userObj.name}  ${userObj.surname}`;
  }
}
async function approve(id: any) {
    await Swal.fire({
      title: 'Approve Artwork?',
      text: 'Are you sure you would like to approve this artwork?',
      icon: 'question',
      confirmButtonText: 'Yes, I am sure',
      showCancelButton: true
    }).then(async (result) => {
      if (result.value) {
        isLoading.value = true;

        await axiosInstance.put(approveAPI + id).then(async () => {
          await Swal.fire({
            title: 'Artwork approved!',
            text: 'Artwork approved Successfully',
            icon: 'success',
            confirmButtonText: 'Ok'
          }).then(() => {
            location.reload();
          });
        }).catch(error => {
           Swal.fire({
            title: 'Failed To Approve Artwork!',
            text: error,
            icon: 'error',
            confirmButtonText: 'Ok'
          }).then(() => {
            location.reload();
           })
        })
      }
    });
  isLoading.value = false;
 }
async function reject(id: any) {
  await Swal.fire({
    title: 'Reject Artwork?',
    text: 'Are you sure you would like to reject this artwork?',
    icon: 'question',
    confirmButtonText: 'Yes, I am sure',
    showCancelButton: true
  }).then(async (result) => {
    if (result.value) {

      isLoading.value = true;

      await axiosInstance.put(rejectAPI + id).then(async () => {
        await Swal.fire({
          title: 'Artwork rejected!',
          text: 'Artwork rejected Successfully',
          icon: 'success',
          confirmButtonText: 'Ok'
        }).then(() => {
          location.reload();
        });
      }).catch(error => {
        Swal.fire({
          title: 'Failed To Reject Artwork!',
          text: error,
          icon: 'error',
          confirmButtonText: 'Ok'
        }).then(() => {
          location.reload();
        })
      })
    }
  });
  isLoading.value = false;
}
</script>

<template>
  <v-card elevation="3" class="w-100 h-100">

    <v-card-text>
      <div class="d-sm-flex align-center">
        <div>
          <h2 class="title text-h6 font-weight-medium">Overall Artworks</h2>
        </div>
        <v-spacer></v-spacer>
        <div class="ml-auto">
          <v-row>
            <v-btn elevation="7" @click="exportReport">Export to Excel</v-btn>
            <v-btn class="ml-2" @click="exportCsv" color="default" elevation="5">Export to CSV</v-btn>
          </v-row>
        </div>
      </div>

      <v-table class="month-table mt-10">

        <template v-slot:default>

          <thead>
            <tr>
              <th class="font-weight-medium text-subtitle-1">ID</th>
              <th class="font-weight-medium text-subtitle-1">Artist</th>
              <th class="font-weight-medium text-subtitle-1">Artwork Name</th>
              <th class="font-weight-medium text-subtitle-1">Artwork Status</th>
              <th class="font-weight-medium text-subtitle-1">Price</th>
              <th class="font-weight-medium text-subtitle-1">Bought By</th>
              <th class="font-weight-medium text-subtitle-1">Actionable Item</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in monthtable"
              :key="item.id"
              class="month-item"
            >
              <td>{{ item.id }}</td>
              <td>
                <h4 class="font-weight-bold text-no-wrap">
                  {{ getUserDetails(item.artist_id) }}
                </h4>
              </td>
              <td>
                <h5
                  class="
                    font-weight-medium
                    text-no-wrap text-body-2 text-grey-darken-1
                  "
                >{{ item.name }}

                </h5>
              </td>
              <td>
                <v-chip
                  :color="item.statuscolor"
                  size="large"
                  label
                  ><b>{{ (item.status === "" || item.stage == 1 ? "REJECTED" : item.status.toUpperCase()) }}</b>
                </v-chip >
              </td>
              <td>
                <h4>R {{ item.price }}</h4>
              </td>
              <td>
                <h4>{{ getUserDetails(item.bought_by) }}</h4>
              </td>
              <td>
                <v-row>
                  <v-btn
                    class="pl-5 ml-2"
                    color="success"
                    @click="approve(item.id)"
                    elevation="7"
                    :disabled="item.status === 'sold' || (item.status === 'approved' && item.stage !== 1)"
                  >
                    Approve
                  </v-btn>
                  <v-btn
                    class="pl-5 ml-2"
                    color="error"
                    @click="reject(item.id)"
                    elevation="7"
                    :disabled="item.status === 'sold' || item.stage === 1"
                  >
                    Reject
                  </v-btn>
                </v-row>
              </td>
            </tr>
          </tbody>
        </template>
      </v-table>
    </v-card-text>
  </v-card>
  <div v-if="isLoading" class="overlay">
    <div class="loader"></div>
    <p>Loading...</p>
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