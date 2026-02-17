<template>
  <v-card
    class="movie-card"
    elevation="3"
    @click="openDetails"
  >
    <v-card-title class="text-h6">
      {{ movie.title }}
    </v-card-title>

    <v-card-subtitle>
      {{ movie.genre }} | {{ movie.year }}
    </v-card-subtitle>

    <v-card-text>
      Rating: {{ movie.rating ?? 'N/A' }}
    </v-card-text>

    <v-card-actions>
      <v-btn
        color="blue"
        variant="text"
        @click.stop="$emit('edit', movie)"
      >
        Edit
      </v-btn>

      <v-btn
        color="red"
        variant="text"
        @click.stop="$emit('delete', movie.id)"
      >
        Delete
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: ['movie'],
  methods: {
    openDetails() {
      this.$router.push(`/movies/${this.movie.id}`)
    }
  }
}
</script>

<style scoped>
.movie-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 12px;
}

.movie-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.25);
}
</style>
