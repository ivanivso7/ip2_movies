<template>
  <v-app>
    <v-main>
      <v-container>
        <h2>{{ isEdit ? 'Edit Movie' : 'Add Movie' }}</h2>

        <v-form @submit.prevent="saveMovie">
          <v-text-field
            v-model="movie.title"
            label="Title"
            required
          ></v-text-field>

          <v-text-field
            v-model="movie.genre"
            label="Genre"
            required
          ></v-text-field>

          <v-text-field
            v-model.number="movie.year"
            label="Year"
            type="number"
            required
          ></v-text-field>

          <v-text-field
            v-model.number="movie.rating"
            label="Rating"
            type="number"
          ></v-text-field>

          <!-- ✅ NEW: Description -->
          <v-textarea
            v-model="movie.description"
            label="Description"
            rows="3"
            auto-grow
            clearable
          ></v-textarea>

          <v-btn type="submit" color="green-darken-2" dark>
            Save
          </v-btn>

          <v-btn class="ml-2" color="red-darken-2" @click="$router.push('/movies')">
            Cancel
          </v-btn>
        </v-form>

      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  data() {
    return {
      movie: {
        title: '',
        genre: '',
        year: '',
        rating: '',
        description: ''   // ✅ NEW
      },
      isEdit: false
    }
  },

  mounted() {
    if (this.$route.params.id) {
      this.isEdit = true
      this.fetchMovie(this.$route.params.id)
    }
  },

  methods: {
    async fetchMovie(id) {
      try {
        const res = await axios.get(`http://localhost:3000/movies/${id}`)

        // ✅ osiguraj da description postoji i kad je null
        this.movie = {
          ...res.data,
          description: res.data.description || ''
        }
      } catch (err) {
        Swal.fire('Error', 'Failed to fetch movie', 'error')
      }
    },

    async saveMovie() {
      try {
        const payload = {
          ...this.movie,
          description: this.movie.description || null
        }

        if (this.isEdit) {
          await axios.put(
            `http://localhost:3000/movies/${this.$route.params.id}`,
            payload
          )
          Swal.fire('Updated!', 'Movie updated', 'success')
        } else {
          await axios.post('http://localhost:3000/movies', payload)
          Swal.fire('Added!', 'Movie added', 'success')
        }

        this.$router.push('/movies')
      } catch (err) {
        Swal.fire('Error', 'Failed to save movie', 'error')
      }
    }
  }
}
</script>
