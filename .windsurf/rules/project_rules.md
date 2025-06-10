---
trigger: always_on
---

# Billio - Project-Specific Rules

## Role-Based Access Control Implementation

When working with any view components or functionality that requires authorization:

1. **User Roles**:
   - Always check user role before rendering admin-restricted content
   - Use the `auth.isAdmin()` helper from the auth store
   - Visual indicator: Purple badge with "ADMIN" text must appear next to admin user's email

2. **View Access Restrictions**:
   - CompanySettingsView must be in view-only mode for non-admin users
   - Hide admin-only tabs (Invoice Settings, User Profile, Team Members, Billing) from regular users
   - Display yellow notification banner for non-admin users in view-only areas
   - Never show "Save Changes" buttons to non-admin users

3. **Database Access Rules**:
   - ADMIN role: Full CRUD access to all database tables
   - USER role:
     - READ access: 'company_info' and 'email_templates' tables
     - CRUD access: 'customers', 'invoices', and 'invoice_items' tables for records where user is creator
     - NO access: 'user_roles' table
   - Always enforce Row Level Security (RLS) policies

## Currency Exchange Rate Feature

When implementing or modifying invoice-related functionality:

1. **Exchange Rate Requirements**:
   - Always check if customer's currency is not EUR
   - Only show currency_exchange_rate input field for non-EUR currencies
   - Exchange rate defined as: value of 1 unit customer currency in EUR

2. **API Integration**:
   - Use Billio backend API for automatic exchange rate fetching
   - Implement proper loading indicators and error handling
   - Optimize to fetch rates only when creating new invoices or when invoice date changes
   - Use the dedicated useExchangeRate composable for exchange rate operations

## Component Structure Standards

1. **Form Components**:
   - Always implement validation for all input fields
   - Provide clear error messages and visual indicators for validation errors
   - Include loading states for async operations

2. **Vue Components Structure**:
   - Use script setup syntax with TypeScript
   - Declare props with proper typing and validation
   - Extract reusable logic to composables
   - Keep components focused on single responsibility
   - Implement proper error handling for all async operations

## Invoice Management Features

1. **Invoice Creation and Editing**:
   - Always validate required fields before submission
   - Support multiple currencies with proper exchange rate handling
   - Calculate totals accurately considering exchange rates when applicable
   - Maintain consistent formatting for monetary values

2. **Customer Management Integration**:
   - Link customers properly to their respective invoices
   - Fetch customer currency and apply exchange rate logic accordingly
   - Ensure proper display of customer details in invoice forms

## UI/UX Guidelines

1. **Consistent Styling**:
   - Use Tailwind CSS for all styling
   - Follow existing color scheme and component patterns
   - Ensure responsive design across all views

2. **User Feedback**:
   - Provide loading indicators for asynchronous operations
   - Display clear success/error messages after operations
   - Implement proper form validation with visual feedback