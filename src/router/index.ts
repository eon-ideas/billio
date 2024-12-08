import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { routeMeta } from './meta'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignUpView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: routeMeta.dashboard
    },
    {
      path: '/customers',
      name: 'customers',
      component: () => import('@/views/customers/CustomersView.vue'),
      meta: routeMeta.customers
    },
    {
      path: '/customers/new',
      name: 'customers-new',
      component: () => import('@/views/customers/CustomerNewView.vue'),
      meta: routeMeta['customers-new']
    },
    {
      path: '/customers/:id',
      name: 'customer-view',
      component: () => import('@/views/customers/CustomerView.vue'),
      meta: routeMeta['customer-view']
    },
    {
      path: '/customers/:id/edit',
      name: 'customers-edit',
      component: () => import('@/views/customers/CustomerEditView.vue'),
      meta: routeMeta['customers-edit']
    },
    {
      path: '/customers/:customerId/invoices',
      name: 'customer-invoices',
      component: () => import('@/views/invoices/CustomerInvoicesView.vue'),
      meta: routeMeta['customer-invoices']
    },
    {
      path: '/customers/:customerId/invoices/new',
      name: 'invoice-new',
      component: () => import('@/views/invoices/InvoiceNewView.vue'),
      meta: routeMeta['invoice-new']
    },
    {
      path: '/customers/:customerId/invoices/:id/edit',
      name: 'invoice-edit',
      component: () => import('@/views/invoices/InvoiceEditView.vue'),
      meta: routeMeta['invoice-edit']
    },
    {
      path: '/customers/:customerId/invoices/:id/preview',
      name: 'invoice-preview',
      component: () => import('@/views/invoices/InvoicePreviewView.vue'),
      meta: routeMeta['invoice-preview']
    },
    {
      path: '/company-settings',
      name: 'company-settings',
      component: () => import('@/views/CompanySettingsView.vue'),
      meta: routeMeta['company-settings']
    },
    {
      path: '/',
      redirect: '/dashboard'
    }
  ]
})

// Navigation guard
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  
  // Wait for auth to be initialized
  if (!auth.isInitialized) {
    await auth.initAuth()
  }
  
  const isAuthRoute = to.path === '/login' || to.path === '/signup'
  
  // If going to auth route while authenticated, redirect to dashboard
  if (isAuthRoute && auth.isAuthenticated) {
    return '/dashboard'
  }
  
  // If going to protected route while not authenticated, redirect to login
  if (!isAuthRoute && to.meta.requiresAuth !== false && !auth.isAuthenticated) {
    return '/login'
  }
  
  // Otherwise, allow navigation
  return true
})

// Update document title on route change
router.afterEach((to) => {
  document.title = to.meta.title as string || 'Invoice Master'
})

export default router