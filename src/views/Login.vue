<template>
  <div id="app">
    <div class="loginBox">
      <div class="inner">
        <div class="signIn" v-if="signIn">
          <div class="top">
            <h1>Artizen App</h1>
            <div class="title">Sign in</div>
            <div class="subtitle">
              Don't have an account?
              <span class="subtitle-action" @click="signIn = !signIn">
                Create Account
              </span>
            </div>
          </div>
          <form @submit.prevent="login">
            <div class="form">
              <input
                required
                aria-required="true"
                aria-invalid="false"
                aria-label="E-mail"
                type="email"
                pattern="^[\w\.-]+@[\w\.-]+\.\w+$"
                class="w100"
                :class="{ invalid: email.error }"
                ref="email"
                placeholder="Email"
                autofocus
                @blur="validateEmail"
                @keydown="validateEmail"
                v-model="email.value"
              />

              <input
                v-if="!forgotPassword"
                required
                aria-required="true"
                type="password"
                class="w100"
                :class="{ invalid: password.error }"
                placeholder="Password"
                v-model="password.value"
                @blur="validatePassword"
                @keydown="validatePassword"
              />
            </div>

            <input
              type="button"
              value="Submit"
              class="action"
              @click="login"
              v-if="!forgotPassword"
              :class="{ 'action-disabled': !loginValid }"
            />
          </form>

          <br>
          <v-btn @click="resetPassword" style="border-radius: 20px" v-if="forgotPassword" block="" color="primary">Send Email</v-btn>
          <br>
          <a href="#" v-if="!forgotPassword" @click="forgotPassword = true" class="href">Forgot Password?</a>
          <br>
          <a href="#" v-if="forgotPassword"  @click="forgotPassword = false" >Sign In</a>
        </div>

        <div class="register" v-else>
          <div class="top">
            <h1>Artizen App</h1>
            <div class="title">Create an Account</div>
            <div class="subtitle">
              Already have an account?
              <span class="subtitle-action" @click="signIn = !signIn">
                Sign In
              </span>
            </div>
          </div>

          <div class="form">
            <input
              type="text"
              placeholder="First name"
              autofocus
              v-model="firstName"
              class="w100"
              @input="validateAlphaOnly"
            />

            <input
              type="text"
              placeholder="Last name"
              v-model="lastName"
              class="w100"
              @input="lastNameValidation"
            />

            <input
              type="email"
              class="w100"
              placeholder="Email"
              v-model="email.value"
              @input="validateEmail"
            />
            <input
              type="password"
              class="w100"
              placeholder="Password"
              v-model="password.value"
              minlength="5"
              required
            />

            <input
              type="password"
              class="w100"
              placeholder="Confirm Password"
              v-model="confirmPassword.value"
              minlength="5"
              required
            />

            <span v-if="password.value !== confirmPassword.value" style="color: red">Passwords Do not Match</span>

            <input
              type="text"
              class="w100"
              placeholder="Contact Numbers"
              v-model="contacts"
              @input="validatePhoneNumber"
              :maxlength="10"
            />

            <br>
            <v-select
              outlined
              v-model="role"
              :items="['Buyer', 'Artist']"
              label="Role"
              placeholder="Select role"
            ></v-select>
          </div>

          <button
            class="action"
            :class="{ 'action-disabled': !registerValid }"
            @click="register"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export default {
  data() {
    return {
      emailRegex: /^[\w\.-]+@[\w\.-]+\.\w+$/,
      passwordRegex: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/,
      firstName: "",
      lastName: "",
      confirmPassword: {
        value: "",
        error: false
      },
      password: {
        value: "",
        error: false
      },
      email: {
        value: "",
        error: false
      },
      role: "",
      contacts: "",
      forgotPassword: false,
      signIn: true,
      isInvalid: false,
    };
  },

  methods: {
    validatePhoneNumber() {
      // Regular expression to validate a 10-digit phone number
      const phonePattern = /^\d{10}$/;
      this.isInvalid = !phonePattern.test(this.contacts);
    },
    validateAlphaOnly(event) {
      this.firstName = event.target.value.replace(/[^a-zA-Z]/g, '');
    },
    lastNameValidation(event) {
      this.lastName = event.target.value.replace(/[^a-zA-Z]/g, '');
    },
    emailValidation(event) {
      this.firstName = event.target.value.replace(/[^a-zA-Z]/g, '');
    },
    async register() {
      if(this.contacts.length !== 10) {
        await Swal.fire({
          title: 'Invalid Contacts!',
          text: 'Contact Numbers must have exactly 10 digits',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
        return;
      }
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

      if(this.password.value !== this.confirmPassword.value) {
        await Swal.fire({
          title: 'Invalid Passwords!',
          text: 'The Two Passwords Do Not Match, Make Sure You Enter Correct Passwords',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
        return;
      }

      if(!passwordPattern.test(this.password.value)) {
        await Swal.fire({
          title: 'Invalid Password!',
          text: 'Password must be at least 6 characters long, and include at least one uppercase letter, one lowercase letter, one digit, and one special character.',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
        return;
      }

      if(this.role !== '') {
        try {
          await axios.post(
            `${API_URL}auth/register`, {
              name: this.firstName,
              surname: this.lastName,
              email: this.email.value,
              role: (this.role === 'Buyer' ? 'buyer' : 'artist'),
              contact: this.contacts,
              password: this.password.value
            }).then(() => {
            Swal.fire({
              title: 'Create Account',
              text: 'Account Created Successfully, Please Login',
              icon: 'success',
              confirmButtonText: 'Ok'
            }).then(() => {
              location.href = "/auth/login";
            });
          });
        } catch (error) {
          let errorMessage = 'Error Occurred while creating an account';

          if (error.response && error.response.data && error.response.data.error) {
            const message = error.response.data.error.message;
            const index = message.lastIndexOf(':');
            if (index !== -1) {
              errorMessage = message.substring(index + 1).trim();
            }
          }
          await Swal.fire({
            title: 'Failed to Register!',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Ok'
          });

        }
      } else {
       await Swal.fire({
          title: 'Failed to Register!',
          text: 'Role Cannot Be null, Please Select The Role',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    },

    async resetPassword() {
      try {

        const email = this.email.value;

        if (!this.emailRegex.test(email)) {
          await Swal.fire({
            title: "Invalid Email!",
            text: "Please enter a valid email address.",
            icon: "error",
            confirmButtonText: "Ok"
          });
          return;
        }

       await axios.post(`https://artizen-api.azurewebsites.net/api/v1/auth/passwordReset`, {
         email: this.email.value,
       }).then(async () => {
         await Swal.fire({
           title: "Email Sent!",
           text: "Please check your email for password reset instructions.",
           icon: "success",
           confirmButtonText: "Ok"
         });
       });

      } catch (error) {
        await Swal.fire({
          title: "Failed to Send Email!",
          text: error.message,
          icon: "error",
          confirmButtonText: "Ok"
        });
      }
    },

    async login() {
      try {
        const response = await axios.post(`https://artizen-api.azurewebsites.net/api/v1/auth/login`, {
          email: this.email.value,
          password: this.password.value
        });

        await Swal.fire({
          title: 'Success Login!',
          text: 'Login In Successfully',
          icon: 'success',
          confirmButtonText: 'Ok'
        });

        const user = response.data.data.user;

        localStorage.setItem('user', JSON.stringify(user));
        if(user.role === 'admin') {
          await this.$router.push('/dashboard');
        } else {
          await this.$router.push('/ui-components/buttons');
        }
      } catch (error) {
        await Swal.fire({
          title: 'Failed to login!',
          text: error.response.data.error,
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    },
    async resetResetPassword() {
      try {
        const response = await axios.post(`https://artizen-api.azurewebsites.net/api/v1/auth/passwordReset`, {
          email: this.email.value,
          password: this.password.value
        });

        await Swal.fire({
          title: 'Success Login!',
          text: 'Login In Successfully',
          icon: 'success',
          confirmButtonText: 'Ok'
        });

        const user = response.data.data.user;

        localStorage.setItem('user', JSON.stringify(user));
        if(user.role === 'admin') {
          await this.$router.push('/dashboard');
        } else {
          await this.$router.push('/ui-components/buttons');
        }
      } catch (error) {
        await Swal.fire({
          title: 'Failed to login!',
          text: error.response.data.error,
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    },
     validateEmail(event) {
      this.email.error = this.email.value === "";
    },

    validatePassword(event) {
      this.password.error = this.password.value <= 6;
    }
  },

  mounted() {
    // this.$refs.email.focus();
  },

  computed: {
    validFirstName() {
      return this.firstName.length > 0;
    },

    validLastName() {
      return this.lastName.length > 0;
    },

    emailValid() {
      return this.emailRegex.test(this.email.value);
    },

    passwordValid() {
      return this.password.value.length > 5;
    },

    loginValid() {
      return this.emailValid && this.passwordValid;
    },

    registerValid() {
      return (
        this.emailValid &&
        this.passwordValid &&
        this.validFirstName &&
        this.validLastName
      );
    }
  }
};
</script>
<style lang="scss">
@mixin box {
  box-shadow: 1px 1px 2px 1px #ccc;
}

@mixin field {
  border: 1px solid #aaa;
  height: 40px;
  padding: 10px;
  margin-top: 20px;
  border-radius: 5px;
  box-sizing: border-box;
}

input[type="text"] {
  @include field;
}

input[type="email"] {
  @include field;
}

input[type="password"] {
  @include field;
}

.invalid {
  border: 2px solid red !important;

  &::placeholder {
    color: red;
  }
}

.errorMessage {
  color: red;
  margin: 10px;
  top: 5px;
}

.w100 {
  width: 100%;
}

#app {
}

.logo {
  width: 300px;
  margin-bottom: 10px;
}

.action {
  height: 40px;
  text-transform: uppercase;
  border-radius: 25px;
  width: 100%;
  border: none;
  cursor: pointer;
  background: green;
  margin-top: 20px;
  color: #fff;
  font-size: 1.2rem;
  @include box;
}

.action-disabled {
  color: #eee;
  background: #aaa;
  cursor: auto;
}

.top {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 10px;
}

.title {
  width: 100%;
  font-size: 1.8rem;
  margin-bottom: 10px;
  text-align: center;
}

.subtitle {
  .subtitle-action {
    color: green;
    font-weight: bold;
    cursor: pointer;
  }
}

html {
  background-repeat: no-repeat;
  background-image: url('https://tanyajacobszart.com/wp-content/uploads/2023/05/Jacaranda-bloom-in-Pretoria-oil-painting-on-canvas.jpg');
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: sans-serif;
}

.loginBox {
  background: #fff;
  border-radius: 15px;
  max-width: 400px;
  padding: 25px 55px;
  animation: slideInTop 1s;
}

@keyframes slideInTop {
  from {
    opacity: 0;
    transform: translateY(-30%);
  }

  to {
    opacity: 100;
    transform: translateY(0%);
  }
}

@media screen and (min-width: 440px) {
  .loginBox {
    @include box;
  }
}

@media screen and (max-width: 440px) {
  html {
    background: #fff;
    align-items: start;
    justify-content: start;
  }

  .loginBox {
    padding: 25px 25px;
    max-width: 100vw;
  }
}
</style>