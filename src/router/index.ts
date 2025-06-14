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
      path: '/invoices',
      name: 'invoices',
      component: () => import('@/views/invoices/InvoicesView.vue'),
      meta: routeMeta['invoices']
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
      path: '/customers/:customerId/email-template',
      name: 'customer-email-template',
      component: () => import('@/views/email/EmailTemplateView.vue'),
      meta: routeMeta['customer-view']
    },
    {
      path: '/company-settings',
      name: 'company-settings',
      component: () => import('@/views/CompanySettingsView.vue'),
      meta: routeMeta['company-settings']
    },
    {
      path: '/profile',
      name: 'user-profile',
      component: () => import('@/views/UserProfileView.vue'),
      meta: { requiresAuth: true, title: 'User Profile' }
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
  
  try {
    // Initialize auth if not already initialized
    if (!auth.isInitialized) {
      // Initialize auth and wait for it to complete before continuing
      await auth.initAuth()
    }
    
    // After auth is initialized, handle routing based on auth state
    
    // If going to login while authenticated, redirect to dashboard
    if (to.path === '/login' && auth.isAuthenticated) {
      return '/dashboard'
    }
    
    // If going to protected route while not authenticated, redirect to login
    if (to.meta.requiresAuth !== false && !auth.isAuthenticated) {
      return '/login'
    }
    
    // Otherwise, allow navigation
    return true
  } catch (error) {
    console.error('Router guard error:', error)
    // On error, redirect to login for safety
    return '/login'
  }
})

// Update document title on route change
router.afterEach((to) => {
  document.title = to.meta.title as string || 'Invoice Master'
})

export default router