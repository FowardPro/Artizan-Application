<template>
  <v-container>
    <v-row v-if="onBuy">
      <v-col cols="12" md="6">
        <BaseCard heading="Your Order">
          <div class="order-details">
            <div class="order-item" v-for="item in cartItems" :key="item.id">
              <div class="item-name">
                <h2>{{ item.name }}</h2>
              </div>
              <div class="item-quantity">
                <b>Quantity:</b> 1
              </div>
              <div class="item-price">
                <strong>Price: R</strong>{{ item.price }}
              </div>
              <v-divider></v-divider>
              <div class="order-total">
                <strong>Total: R{{ item.price }}</strong>
              </div>
            </div>
          </div>
        </BaseCard>
      </v-col>
      <v-col cols="12" md="6">
        <BaseCard heading="Payment Gateway">
          <div class="paypal-header">
            <img
              src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
              alt="PayPal Logo"
              class="paypal-logo"
            />
            <h2>Checkout with PayPal</h2>
          </div>
          <v-form @submit.prevent="buyArtwork">
            <v-text-field
              label="Card Number"
              v-model="cardNumber"
              type="text"
              required
            ></v-text-field>
            <v-text-field
              label="Expiry Date (MM/YY)"
              v-model="expiryDate"
              type="text"
              required
            ></v-text-field>
            <v-text-field
              label="CVV"
              v-model="cvv"
              type="text"
              required
            ></v-text-field>
            <v-btn
              required
              color="primary"
              type="submit"
              block
            >Pay Now</v-btn>
          </v-form>
        </BaseCard>
      </v-col>
    </v-row >
    <v-row>
      <v-col cols="12">
        <v-card elevation="3" class="w-100 h-100">

          <v-card-text>
            <div class="d-sm-flex align-center">
              <div>
                <h2 class="title text-h6 font-weight-medium">Payment History</h2>
              </div>
              <v-spacer></v-spacer>
              <div class="ml-auto">
                <v-row>
                  <v-btn elevation="7" @click="exportReport">Export to Excel</v-btn>
                  <v-btn class="ml-2" color="default" elevation="5" @click="exportCsv">Export to CSV</v-btn>
                </v-row>
              </div>
            </div>

            <v-table class="month-table mt-10">

              <template v-slot:default>

                <thead>
                <tr>
                  <th class="font-weight-medium text-subtitle-1">ID</th>
                  <th class="font-weight-medium text-subtitle-1">Payment By</th>
                  <th class="font-weight-medium text-subtitle-1">Payment Date</th>
                  <th class="font-weight-medium text-subtitle-1">Payment Status</th>
                  <th class="font-weight-medium text-subtitle-1">Payment Amount</th>
                  <th class="font-weight-medium text-subtitle-1">Payment Method</th>
                </tr>
                </thead>
                <tbody>
                <tr
                  v-for="item in paymentHistory"
                  :key="item.id"
                  class="month-item"
                >
                  <td>{{ item.id }}</td>
                  <td>
                    <h4 class="font-weight-bold text-no-wrap">
                      {{ getUserDetails(item.user_id) }}
                    </h4>
                  </td>
                  <td>
                    <h5
                      class="font-weight-mediumtext-no-wrap
                              text-body-2 text-grey-darken-1"
                    >
                      {{ item.created_at }}
                    </h5>
                  </td>
                  <td>
                    <v-chip
                      color="success"
                      size="large"
                      label
                    ><b>{{ (item.status === "" ? "REJECTED" : item.status.toUpperCase()) }}</b>
                    </v-chip >
                  </td>
                  <td>
                    <h3>R {{ item.price }}</h3>
                  </td>
                  <td>
                    <h2>Paypal</h2>
                  </td>
                </tr>
                </tbody>
              </template>
            </v-table>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
    <div v-if="isLoading" class="overlay">
      <div class="loader"></div>
      <p>Loading...</p>
    </div>
  </v-container>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import { useRoute } from 'vue-router';
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
const cardNumber = ref<string>('');
const expiryDate = ref<string>('');
const cvv = ref<string>('');
let totalAmount = ref<number>(100);
const onBuy = ref(false);
const route = useRoute();

const cartItems = ref([]);

const paymentHistory = ref([]);

const getArtwork = `${API_URL}artwork/owner/`;
const buyArtworkAPI = `${API_URL}artwork/buy/`;
const getPaymentsAPI = `${API_URL}payments/user/`;
const getAllPaymentsAPI = `${API_URL}payments/`;
const getAllUsers = `${API_URL}users/`;
const usersData = ref([]);

let artId = ref('');
const user = JSON.parse(<string>localStorage.getItem('user'));

function getUserDetails(id: any) {
  const userObj = usersData.value.find(item => item.id === id);

  if(userObj) {
    return `${userObj.name}  ${userObj.surname}`;
  }
}

function exportReport() {
  try {
    const worksheet = XLSX.utils.json_to_sheet(paymentHistory.value);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Reports');

    XLSX.writeFile(workbook, 'payment-report.xlsx');

    Swal.fire({
      icon: 'success',
      title: 'Downloaded Payment Reports',
      text: 'Successfully download payment reports',
      showLoaderOnConfirm: true,
    });
  } catch (e) {
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

    const worksheet = XLSX.utils.json_to_sheet(paymentHistory.value);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "payment-report.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    Swal.fire({
      icon: 'success',
      title: 'Downloaded Payment Reports',
      text: 'Successfully download payment reports',
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
    const usersResponse = await axiosInstance.get(getAllUsers);
    usersData.value = usersResponse.data;

    if(route.query.art) {
      const response = await axiosInstance.get(getArtwork +  user.id);
      onBuy.value = true;
      artId = route.query.art;
      totalAmount = response.data.price;

      cartItems.value = response.data.filter(items => items.id == route.query.art);
    } else {
      onBuy.value = false;
    }

    const payments_response = await axiosInstance.get(getAllPaymentsAPI);
    paymentHistory.value = (user.role !== 'admin' ? payments_response.data.filter(payment  =>
                         payment.id === user.id || payment.artist_id === user.id) :
                            payments_response.data);
  } catch (error) {
    alert('Error Occurred : ' + error);
  }

  isLoading.value = false;

});

function handlePaymentSubmit() {

  cardNumber.value = '';
  expiryDate.value = '';
  cvv.value = '';
}

async function buyArtwork() {
  if(cvv.value.length !== 3) {
    await Swal.fire({
      title: 'Invalid CVV Number!',
      text: 'Please enter Valid 3 Digits',
      icon: 'error',
      confirmButtonText: 'Ok'
    })
  } else if(cardNumber.value.length < 8 || cardNumber.value.length > 19){
    await Swal.fire({
      title: 'Invalid Card Number!',
      text: 'Please enter numbers between 8 to 19 digits',
      icon: 'error',
      confirmButtonText: 'Ok'
    });
  } else if(!/^\d{2}\/\d{2}$/.test(expiryDate.value)){
    await Swal.fire({
      title: 'Invalid Expiry Date!',
      text: 'Please enter a valid expiry date in the format MM/YY',
      icon: 'error',
      confirmButtonText: 'Ok'
    });
  } else {
    artId = cartItems.value[0].id;
    try {
      await Swal.fire({
        title: 'Artwork Payment',
        text: 'Are you sure you would like to buy this artwork?',
        icon: 'question',
        confirmButtonText: 'Yes, I am sure',
        showCancelButton: true
      }).then(async (result) => {
        if (result.value) {
          await axiosInstance.put(buyArtworkAPI + artId, {
            bought_by: user.id,
          }).then(() => {
            onBuy.value = false;
            Swal.fire({
              title: 'Artwork Purchased!',
              text: 'Payment for this order is successful',
              icon: 'success',
              confirmButtonText: 'Ok'
            }).then(() => {
              location.replace('/ui-components/menus');
            })
          }).catch(error => {
            Swal.fire({
              title: 'Failed To Approve Artwork!',
              text: error.response.data,
              icon: 'error',
              confirmButtonText: 'Ok'
            })
          })
        }
      });
    } catch (error) {
      alert('Error Occurred : ' + error);
    }
  }
}
</script>
<style scoped>
.paypal-header {
  text-align: center;
  margin-bottom: 20px;
}

.paypal-logo {
  width: 150px;
  margin-bottom: 10px;
}

.order-details {
  margin-bottom: 20px;
}

.order-item {
  margin-bottom: 10px;
}

.order-total {
  font-size: 1.2em;
  font-weight: bold;
  margin-top: 20px;
  text-align: right;
}

.item-name h3 {
  color: blue;
}

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
