<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import moment from "moment";
import Swal from "sweetalert2";

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

const imageApiUrl = `${API_URL}artwork/image/`;
const getAllArtworks = `${API_URL}artwork/`;
const getAllUsers = `${API_URL}users/`;
const updateBidTimerAPI = `${API_URL}artwork/reloadBid/`;
const placeBidAPI = `${API_URL}artwork/update/`;
const artworks = ref([]);
const countdowns = ref<{ [key: number]: string }>({});
const usersData = ref([]);
const user = JSON.parse(<string>localStorage.getItem('user'));
let timeElapsed = ref(false);

const bidAmounts = ref<{ [key: number]: string }>({});
function getUserDetails(id: number) {
  const userObj = usersData.value.find(item => item.id === id);
  if (userObj) {
    return `${userObj.name} ${userObj.surname}`;
  }
  return '';
}

function startCountdown(artwork: any) {
  if (artwork.status === 'approved') {
    const bidTime = moment(artwork.bid_time);
    const expiresAt = bidTime.add(0, 'minutes');

    const updateCountdown = () => {
      const now = moment();
      const duration = moment.duration(expiresAt.diff(now));

      if (duration.asSeconds() <= 0 && artwork.stage !== 5 ) {
        if(artwork.bought_by === null) {
          updateArtworkStatus(artwork.id);
          location.reload();
        } else {
          timeElapsed.value = true;
          countdowns.value[artwork.id] = 'Payment In Progress';
        }
      } else {
        countdowns.value[artwork.id] = `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
      }
    };
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
}
async function updateArtworkStatus(artworkId: number) {
  try {
    await axios.put(updateBidTimerAPI + artworkId, {
      status: 'Bought'
    }).then(() => {
      location.reload();
    })
  } catch (error) {
    console.error('Error updating artwork status:', error);
  }
}
onMounted(async () => {
  try {
    isLoading.value = true;

    const response = await axiosInstance.get(getAllArtworks);
    const usersResponse = await axiosInstance.get(getAllUsers);

    artworks.value = response.data.filter(
      item => (item.status === 'approved' && item.stage !== 1)
    );

    usersData.value = usersResponse.data;

    artworks.value.forEach(artwork => {
      startCountdown(artwork);

      bidAmounts.value[artwork.id] = '';
    });

    const myPendingArtworks = artworks.value.filter(work => work.bought_by == user.id);

      if(myPendingArtworks.filter(art => art.status === 'approved' && art.stage === 4).length > 0) {
        await Swal.fire({
          title: 'Artwork Payment Required!',
          text: 'Please Make A Payment For Artworks that needs Your Payment',
          icon: 'info',
          confirmButtonText: 'Proceed To Payment',
          showCancelButton: false
        }).then(() => {
          location.replace('/ui-components/menus?art=' + myPendingArtworks[0].id);
        })
    }

  } catch (error) {
    console.log(import.meta.env);
  }
  isLoading.value = false;
});

async function makePayment(artwork: any) {
  location.replace('/ui-components/menus?art=' + artwork.id);
}

async function placeBid(artwork: any) {
  const bidAmount = bidAmounts.value[artwork.id];

  if (!bidAmount || isNaN(parseFloat(bidAmount))) {
    alert('Please enter a valid bid amount.');
    return;
  }
  const currentBid = artwork.price;
  if (parseFloat(bidAmount) <= currentBid) {
    alert('Bid amount must be higher than the current bid amount.');
    return;
  }

  try {
    isLoading.value = true;
    await Swal.fire({
      title: 'Place Bid',
      text: 'Are you sure you would like to place a bid for this artwork?',
      icon: 'question',
      confirmButtonText: 'Yes, I am sure',
      showCancelButton: true
    }).then(async (result) => {
      if (result.value) {
        await axiosInstance.post(placeBidAPI + artwork.id, {
          bought_by: user.id,
          price: bidAmount,
        }).then(() => {
          Swal.fire({
            title: 'Place bid!',
            text: 'Bid for this artwork is successfully placed',
            icon: 'success',
            confirmButtonText: 'Ok'
          }).then(() => {
            location.reload();
          })
        }).catch(error => {
          Swal.fire({
            title: 'Failed To Place bid !',
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
  isLoading.value = false;
}

</script>

<template>
  <h1>
    Art Gallery
  </h1>

  <v-divider></v-divider>

  <div v-if="artworks.length <= 0" class="pt-10">
    <h3>
      <marquee>No Artworks Available</marquee>
    </h3>
  </div>
  <v-row class="pt-5">
    <v-col v-for="artwork in artworks" :key="artwork.id" cols="12" lg="4">
      <v-card>
        <img
          style="width: 100%;"
          height="320"
          :src="`data:image/png;base64,${artwork.picture}`"
          :alt="artwork.name"
        />
        <v-card-text>
          <h5 class="title font-weight-medium mb-2 text-h6">{{ artwork.name }}</h5>
          <v-divider></v-divider>
          <h5 class="title font-weight-medium mb-2 text-h6">Current Bid: <b>R {{ artwork.price }}</b></h5>
          <p class="mb-3">
            Artwork Designed by - {{ getUserDetails(artwork.artist_id) }}
          </p>
          <br>
          <b>Status: </b> {{ artwork.status.toUpperCase() }}
          <br><br>
          <span v-if="artwork.status !== 'pending'">
            <b>{{ timeElapsed ? 'Time Left: ' : 'Bid Status: '}} </b> {{ countdowns[artwork.id] }}
          </span>
          <br><br>

          <v-text-field
            v-model="bidAmounts[artwork.id]"
            label="Enter Bid Amount.."
            :disabled="countdowns[artwork.id] === 'Payment In Progress'"
            v-if="artwork.status === 'approved' &&
                  artwork.stage !== 1 &&
                  user.role !== 'admin'"
          >
          </v-text-field>
          <p class="mb-3">
            <b>Highest Bidder:</b> {{ getUserDetails(artwork.bought_by) }}
          </p>
          <v-btn
            block
            @click="placeBid(artwork)"
            v-if="artwork.status === ''"
            depressed color="error"
            disabled
          >Rejected
          </v-btn>
          <v-btn
            v-if="artwork.status === 'pending'"
            depressed color="info"
            disabled
            block
          >
            Pending Approval
          </v-btn>

          <v-btn
            v-if="artwork.status === 'approved' &&
                  artwork.stage !== 1 &&
                  user.role !== 'admin'"
            elevation="5"
            color="success"
            @click="placeBid(artwork)"
            block
            :disabled="countdowns[artwork.id] === 'Payment In Progress'"
          >
            Place Bid
          </v-btn>

          <br>
          <v-btn
            v-if="artwork.status === 'approved' &&
                  artwork.stage !== 1 &&
                  artwork.bought_by == user.id &&
                  countdowns[artwork.id] === 'Payment In Progress'"
            elevation="5"
            color="warning"
            @click="makePayment(artwork)"
            block
          >
            Make Payment
          </v-btn>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
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