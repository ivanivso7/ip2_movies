import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/movies', name: 'Movies', component: () => import('../views/Movies.vue') },
  { path: '/add', name: 'AddMovie', component: () => import('../views/AddEditMovie.vue') },
  { path: '/edit/:id', name: 'EditMovie', component: () => import('../views/AddEditMovie.vue') },
  { path: '/movies/:id', name: 'MovieDetails', component: () => import('../views/MovieDetails.vue') },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
