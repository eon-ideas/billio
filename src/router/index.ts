import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/customers',
      name: 'customers',
      component: () => import('@/views/customers/CustomersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/customers/new',
      name: 'customers-new',
      component: () => import('@/views/customers/CustomerNewView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/customers/:id/edit',
      name: 'customers-edit',
      component: () => import('@/views/customers/CustomerEditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/customers/:customerId/invoices',
      name: 'customer-invoices',
      component: () => import('@/views/invoices/CustomerInvoicesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/customers/:customerId/invoices/new',
      name: 'invoice-new',
      component: () => import('@/views/invoices/InvoiceNewView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/customers/:customerId/invoices/:id/edit',
      name: 'invoice-edit',
      component: () => import('@/views/invoices/InvoiceEditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/customers/:customerId/invoices/:id/preview',
      name: 'invoice-preview',
      component: () => import('@/views/invoices/InvoicePreviewView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/dashboard'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && auth.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router