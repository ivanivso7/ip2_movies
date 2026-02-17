<template>
  <v-app>
    <!-- App-bar samo na početnoj stranici (/) -->
    <v-app-bar
      v-if="$route.path === '/'"
      app
      color="#113f67"
    >
      <!-- Klik vodi na početnu -->
      <v-app-bar-title>
        <span
        class="app-title"
        @click="$router.push('/movies')"
        style="cursor: pointer; margin-left: 16px;">
        MovieHub
      </span>

      </v-app-bar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
.app-title {
  display: inline-block;
  padding: 4px 8px;      /* manji padding */
  border-radius: 6px;    /* blago zaobljeno */
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.app-title:hover {
  background-color: rgba(0, 0, 0, 0.2);  /* blago zatamnjenje */
}


</style>

<script>
export default {
  name: 'App'
}
</script>
