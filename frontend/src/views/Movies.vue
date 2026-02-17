<template>
  <v-app id="inspire">
    <v-app-bar color="#113f67" dark>
      <v-app-bar-title>
        <span
      class="app-title" @click="$router.push('/')">MovieHub
      </span>
      </v-app-bar-title>
      <v-spacer></v-spacer>

      <v-btn
        class="add-movie"
        color="#1E88E5"
        variant="elevated"
        @click="$router.push('/add')"
      >
        + Add Movie
      </v-btn>
    </v-app-bar>

    <v-main>
        <div class="movies-background">
      <v-container>

        <!-- SEARCH + FILTER -->
        <v-row class="mb-4">
          <v-col cols="12" md="5">
            <v-text-field
              v-model="search"
              label="Search movies..."
              append-icon="mdi-magnify"
              clearable
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="5">
            <v-select
              v-model="selectedGenre"
              :items="genres"
              label="Filter by genre"
              clearable
            ></v-select>
          </v-col>

          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn color="red" variant="flat" block @click="clearFilters">
              Clear All
            </v-btn>
          </v-col>
        </v-row>

        <!-- MOVIE GRID (FROM MYSQL) -->
        <v-row>
          <v-col
            v-for="movie in movies"
            :key="movie.id"
            cols="12"
            sm="6"
            md="4"
          >
            <MovieCard
              :movie="movie"
              @edit="editMovie"
              @delete="deleteMovie"
            />
          </v-col>
        </v-row>

        <!-- OMDb RESULTS (always shown when searching) -->
        <v-row v-if="search.trim().length >= 3">
  <v-col cols="12">
    <v-card class="pa-4 omdb-card" elevation="4">

      <h3 class="mb-2">
        {{ movies.length === 0
          ? 'No movies found in your database.'
          : 'More results from OMDb (not in your database yet)' }}
      </h3>

      <p class="mb-4 text-grey-darken-1">
        Click <b>Add</b> to save a movie into your database.
      </p>

      <v-progress-linear
        v-if="loadingOmdb"
        indeterminate
        color="blue"
        class="mb-4"
      ></v-progress-linear>

      <v-list v-if="omdbResults.length > 0" lines="one">
        <v-list-item
          v-for="m in omdbResults"
          :key="m.imdbID"
          class="omdb-item"
        >
          <v-list-item-title>
            {{ m.Title }} ({{ m.Year }})
          </v-list-item-title>

          <template #append>
            <v-btn
              color="green"
              size="small"
              variant="elevated"
              @click.stop="addFromOmdb(m.imdbID)"
            >
              Add
            </v-btn>
          </template>
        </v-list-item>
      </v-list>

      <p v-else-if="!loadingOmdb" class="mt-2 text-grey">
        No more results from OMDb.
      </p>

    </v-card>
  </v-col>
</v-row>


        <!-- NO MOVIES (when search empty/short) -->
        <v-row v-if="movies.length === 0 && search.trim().length < 3">
          <v-col cols="12">
            <p class="text-center">No movies found.</p>
          </v-col>
        </v-row>

        <!-- PAGINATION -->
        <v-row justify="center" class="mt-4" v-if="totalPages > 1">
          <v-pagination v-model="page" :length="totalPages" circle />
        </v-row>

      </v-container>
      </div>
    </v-main>
  </v-app>


</template>

<style scoped>
.movies-background {
  position: relative;
  background-image: url('https://t4.ftcdn.net/jpg/02/71/50/69/360_F_271506927_WWFfd92jDIIDx6DgMflakU14o5jRPgBm.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

/* Tamni overlay */
.movies-background::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6); /* promijeni broj za jače/slabije zatamnjenje */
  z-index: 0;
}

/* Da sadržaj bude iznad overlay-a */
.movies-background > * {
  position: relative;
  z-index: 1;
}

.omdb-card {
  border-radius: 12px;
}

.omdb-item {
  transition: background-color 0.2s ease;
  border-radius: 8px;
}

.omdb-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
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

.add-movie {
  margin-right: 20px;
}


</style>


<script>
import axios from 'axios'
import MovieCard from '../components/MovieCard.vue'
import Swal from 'sweetalert2'

export default {
  components: { MovieCard },

  data() {
    return {
      movies: [],
      search: '',
      selectedGenre: null,
      //NOVO DODANO
      genres: [],
      page: 1,
      limit: 6,
      totalPages: 1,

      // OMDb
      omdbResults: [],
      loadingOmdb: false
    }
  },

  mounted() {
    this.fetchMovies()
    //NOOVO DODANO
    this.fetchGenres()
  },

  watch: {
    page() {
      this.fetchMovies()
    },

    search() {
      this.page = 1
      this.fetchMovies()
    },

    selectedGenre() {
      this.page = 1
      this.fetchMovies()
    }
  },

  methods: {
    async fetchGenres() {
  try {
    const res = await axios.get('http://localhost:3000/genres')
    this.genres = res.data
  } catch (err) {
    console.error(err)
  }
},

openMovie(id) {
  this.$router.push(`/movies/${id}`)
},


    async fetchMovies() {
      try {
        const res = await axios.get('http://localhost:3000/movies', {
          params: {
            page: this.page,
            limit: this.limit,
            search: this.search || undefined,
            genre: this.selectedGenre || undefined
          }
        })

        this.movies = res.data.movies
        this.totalPages = Math.ceil(res.data.total / this.limit)

        // ✅ ALWAYS fetch OMDb when searching (>= 3 chars)
        if (this.search.trim().length >= 3) {
          await this.fetchFromOmdb()
        } else {
          this.omdbResults = []
        }

      } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Failed to fetch movies', 'error')
      }
    },

    // ✅ Fetch OMDb AND remove those that already exist in DB
    async fetchFromOmdb() {
      try {
        this.loadingOmdb = true

        const res = await axios.get('http://localhost:3000/omdb/search', {
          params: { query: this.search.trim() }
        })

        const results = res.data.results || []

        // Set existing movies in DB: title+year
        const existing = new Set(
          this.movies.map(m => `${(m.title || '').toLowerCase()}_${m.year}`)
        )

        // Filter OMDb results to show only not-yet-added movies
        this.omdbResults = results.filter(m => {
          const key = `${(m.Title || '').toLowerCase()}_${m.Year}`
          return !existing.has(key)
        })

      } catch (err) {
        console.error(err)
        this.omdbResults = []
      } finally {
        this.loadingOmdb = false
      }
    },

    async addFromOmdb(imdbID) {
      try {
        await axios.post('http://localhost:3000/omdb/add', { imdbID })
        Swal.fire('Added!', 'Movie added to your database.', 'success')

        this.page = 1
        this.fetchMovies()

        //NOVO DODANO
        await this.fetchGenres()

      } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Failed to add movie.', 'error')
      }
    },

    clearFilters() {
      this.search = ''
      this.selectedGenre = null
      this.page = 1
      this.omdbResults = []
      this.fetchMovies()
    },

    editMovie(movie) {
      this.$router.push({
        name: 'EditMovie',
        params: { id: movie.id }
      })
    },



    async deleteMovie(id) {
      try {
        await axios.delete(`http://localhost:3000/movies/${id}`)
        Swal.fire('Deleted!', 'Movie has been deleted.', 'success')

        if (this.movies.length === 1 && this.page > 1) {
          this.page--
        }

        this.fetchMovies()
        await this.fetchGenres() //NOVO DODANO - refresh žanrova nakon brisanja
      } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Failed to delete movie', 'error')
      }
    }
  }
}
</script>
