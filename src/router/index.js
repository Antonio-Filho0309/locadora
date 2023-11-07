import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import BookView from '../views/BookView.vue'
import RentalView from '../views/RentalView.vue'
import UserView from '../views/UserView.vue'
import PubView from '../views/PublisherView.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard
  },
  {
    path: '/Usuarios',
    name: 'userview',
    component: UserView
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    //component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/Livros',
    name:'bookview',
    component: BookView
  },
   {
    path:'/Alugueis',
    name:'rentalview',
    component: RentalView
   },
   {
    path:'/Editoras',
    name:'pubview',
    component: PubView
   }

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
