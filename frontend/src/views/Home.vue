<template>
  <v-app>
    <v-main>
      <div class="home-background">
        <div class="overlay">
          <v-container class="text-center content">
            <h1 class="title">Welcome to MovieHub</h1>
            <p class="subtitle">Your personal movie collection</p>
            <p class="info">Projekt rađen pomocu Vue, Vuetify i Node.js</p>

            <v-btn
              class="mt-4"
              color="blue-darken-2"
              size="large"
              @click="$router.push('/movies')"
            >
              View Movies
            </v-btn>
          </v-container>
        </div>
      </div>
    </v-main>
  </v-app>


</template>

<script>
export default {
  mounted() {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  },
  beforeUnmount() {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }
}
</script>


<style scoped>
.home-background {
  background-image: url('https://t4.ftcdn.net/jpg/02/71/50/69/360_F_271506927_WWFfd92jDIIDx6DgMflakU14o5jRPgBm.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  width: 100%;
}

/* Tamni overlay da tekst bude čitljiv */
.overlay {
  background: rgba(0, 0, 0, 0.6);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  color: white;
}

.title {
  font-size: 48px;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 20px;
  margin-bottom: 30px;
}

.content .info {
  font-size: 14px;
  color: #cccccc;
}
</style>



