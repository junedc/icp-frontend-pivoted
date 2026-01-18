import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', component: () => import('@/pages/auth/Login.vue'), meta: { guest: true } },
  { path: '/register', component: () => import('@/pages/auth/Register.vue'), meta: { guest: true } },

  { path: '/', component: () => import('@/pages/products/ProductList.vue'), meta: { auth: true } },
  { path: '/maintenance', component: () => import('@/pages/products/ProductMaintenance.vue'), meta: { auth: true } },
  { path: '/cart', component: () => import('@/pages/cart/Cart.vue'), meta: { auth: true } },
  { path: '/orders', component: () => import('@/pages/orders/MyOrders.vue'), meta: { auth: true } },
  { path: '/orders/:id', component: () => import('@/pages/orders/OrderDetails.vue'), meta: { auth: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.auth && !auth.isAuthenticated) return '/login'
  if (to.meta.guest && auth.isAuthenticated) return '/'
})

export default router
