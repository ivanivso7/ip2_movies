<template>
  <v-app>
    <v-main>
      <v-container>
        <v-btn variant="text" @click="$router.push('/movies')">
          ← Back
        </v-btn>

        <v-card class="pa-4 mt-4" v-if="movie">
          <h2>{{ movie.title }}</h2>
          <p><b>Genre:</b> {{ movie.genre }}</p>
          <p><b>Year:</b> {{ movie.year }}</p>
          <p><b>Rating:</b> {{ movie.rating ?? 'N/A' }}</p>

          <v-divider class="my-3"></v-divider>

          <!-- ✅ PRIORITET: opis iz baze -->
          <p v-if="movie.description && movie.description.trim().length">
            <b>Description:</b> {{ movie.description }}
          </p>

          <!-- ✅ FALLBACK: OMDb plot -->
          <p v-else-if="plot && plot.trim().length">
            <b>Description (OMDb):</b> {{ plot }}
          </p>

          <p v-else class="text-grey">
            No description available.
          </p>
        </v-card>

        <p v-else>Loading...</p>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      movie: null,
      plot: ''
    }
  },

  async mounted() {
    const id = this.$route.params.id

    // 1) Dohvati film iz baze (sada sadrži i description)
    const res = await axios.get(`http://localhost:3000/movies/${id}`)

    // ✅ osiguraj da description postoji i kad je null
    this.movie = {
      ...res.data,
      description: res.data.description || ''
    }

    // 2) Ako nema opis u bazi, pokušaj dohvatiti OMDb opis
    if (!this.movie.description.trim()) {
      try {
        const omdb = await axios.get(`http://localhost:3000/omdb/details`, {
          params: {
            title: this.movie.title,
            year: this.movie.year
          }
        })
        this.plot = omdb.data.plot || ''
      } catch (e) {
        this.plot = ''
      }
    }
  }
}
</script>
