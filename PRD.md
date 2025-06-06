# Product Requirements Document (PRD)
# Billio - Invoice Management System

## 1. Executive Summary

Billio is a modern, web-based invoice management system designed to streamline the invoice creation, management, and tracking process for small to medium-sized businesses. Built with a focus on user experience and security, Billio provides a comprehensive solution for managing customers, creating professional invoices, tracking payments, and maintaining financial records with role-based access control.

## 2. Product Overview

### 2.1 Product Vision
To provide businesses with an intuitive, secure, and efficient platform for managing their entire invoicing workflow, from customer management to payment tracking, with enterprise-grade security and role-based permissions.

### 2.2 Target Users
- Small to medium-sized businesses
- Freelancers and independent contractors
- Accounting departments
- Business administrators and finance teams

### 2.3 Value Proposition
- **Efficiency**: Streamline invoice creation and management processes
- **Security**: Role-based access control with enterprise-grade data protection
- **Flexibility**: Multi-currency support with automatic exchange rate calculations
- **Accessibility**: Cloud-based solution accessible from anywhere
- **Professional**: Generate professional-looking invoices that enhance brand image

## 3. Goals and Objectives

### 3.1 Business Goals
- Reduce time spent on invoice management by 50%
- Improve payment tracking accuracy
- Enhance financial visibility through comprehensive dashboards
- Ensure data security and compliance with role-based permissions

### 3.2 User Goals
- Create and send professional invoices quickly
- Track payment status in real-time
- Manage customer information efficiently
- Access financial data securely based on assigned roles
- Generate reports for business insights

### 3.3 Success Metrics
- User adoption rate
- Average time to create an invoice
- Payment collection time reduction
- User satisfaction score
- System uptime and reliability

## 4. Feature Requirements

### 4.1 Core Features

#### 4.1.1 User Authentication & Authorization
- **User Registration and Login**
  - Email-based authentication via Supabase Auth
  - Secure password requirements
  - Session management
  
- **Role-Based Access Control (RBAC)**
  - Two user roles: ADMIN and USER
  - First registered user automatically becomes ADMIN
  - Subsequent users assigned USER role by default
  - Visual indicators for admin users (purple "ADMIN" badge)

#### 4.1.2 Dashboard
- **Overview Statistics**
  - Total invoices count
  - Paid vs unpaid invoice breakdown
  - Revenue tracking
  - Yearly invoice summary
  
- **Quick Actions**
  - Create new invoice
  - View recent invoices
  - Access customer list

#### 4.1.3 Customer Management
- **Customer Records**
  - Company name and details
  - Contact information
  - Tax identification numbers
  - Currency preference
  - Address management
  
- **CRUD Operations**
  - Create new customers
  - Edit customer information
  - Delete customers (with cascade handling)
  - Search and filter customers

#### 4.1.4 Invoice Management
- **Invoice Creation**
  - Auto-generated invoice numbers
  - Customer selection from existing records
  - Line items with descriptions, quantities, and prices
  - Automatic total calculation
  - Tax calculation support
  - Multi-currency support
  
- **Currency Exchange**
  - Automatic exchange rate fetching for non-EUR currencies
  - Manual exchange rate override option
  - Exchange rate stored with invoice
  - Conditional UI showing exchange rate field only when needed
  
- **Invoice Status Tracking**
  - Paid/Unpaid status
  - Due date tracking
  - Payment date recording
  
- **Invoice Actions**
  - Edit existing invoices
  - Delete invoices
  - Print-friendly preview
  - PDF generation capability

#### 4.1.5 Company Settings
- **Company Information**
  - Company name and details
  - Logo upload
  - Contact information
  - Bank account details
  - Tax registration numbers
  
- **Access Control**
  - View-only mode for non-admin users
  - Yellow notification banner for restricted access
  - Hidden save buttons for non-admin users
  
- **Settings Categories**
  - General company information
  - Invoice settings (admin-only)
  - User profile management (admin-only)
  - Team member management (admin-only)
  - Billing configuration (admin-only)

#### 4.1.6 Email Templates
- Template management for invoice emails
- Customizable email content
- Variable substitution support

### 4.2 Technical Features

#### 4.2.1 Data Security
- Row Level Security (RLS) policies on all tables
- Encrypted data transmission
- Secure authentication tokens
- Role-based data access restrictions

#### 4.2.2 Performance
- Optimized database queries
- Lazy loading for large datasets
- Caching strategies for frequently accessed data
- Responsive UI with loading indicators

#### 4.2.3 Integration
- Supabase backend integration
- External API integration for exchange rates
- Storage bucket support for file uploads

## 5. User Stories

### 5.1 Administrator User Stories
1. As an admin, I want to manage all company settings so that I can configure the system according to business needs
2. As an admin, I want to view and manage all users so that I can control system access
3. As an admin, I want full access to all invoices and customers regardless of who created them
4. As an admin, I want to see a visual indicator of my admin status in the UI

### 5.2 Regular User Stories
1. As a user, I want to create and manage invoices for my assigned customers
2. As a user, I want to view company information but not modify it
3. As a user, I want to track payment status for invoices I manage
4. As a user, I want to see exchange rates automatically when creating invoices for non-EUR customers

### 5.3 General User Stories
1. As any user, I want a dashboard that shows me relevant invoice statistics
2. As any user, I want to search and filter invoices efficiently
3. As any user, I want to generate professional-looking invoice PDFs
4. As any user, I want the system to remember my preferences

## 6. Technical Requirements

### 6.1 Frontend Stack
- **Framework**: Vue.js 3 with Composition API
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: 
  - headlessui/vue
  - heroicons/vue
  - TailGrids
- **State Management**: Pinia
- **Routing**: Vue Router

### 6.2 Backend Stack
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: RESTful API via Supabase
- **Real-time**: Supabase Realtime (future enhancement)

### 6.3 Infrastructure
- **Hosting**: Netlify
- **CDN**: Netlify Edge
- **SSL**: Automatic SSL provisioning
- **Containerization**: Docker support with multi-architecture builds

### 6.4 Database Schema

#### Tables and Permissions
1. **company_info**
   - ADMIN: Full CRUD
   - USER: Read-only

2. **customers**
   - ADMIN: Full CRUD
   - USER: Read-only

3. **invoices**
   - ADMIN: Full CRUD
   - USER: Full CRUD (where user is creator)
   - Includes currency_exchange_rate field

4. **invoice_items**
   - ADMIN: Full CRUD
   - USER: Full CRUD (where user is creator)

5. **email_templates**
   - ADMIN: Full CRUD
   - USER: Read-only

6. **user_roles**
   - ADMIN: Full CRUD
   - USER: No access

7. **documents**
   - ADMIN: Full CRUD
   - USER: Read-only

8. **chat_histories**
   - ADMIN: Full CRUD
   - USER: Full CRUD

9. **expenses**
   - For future implementation

### 6.5 Security Requirements
- All tables must have Row Level Security (RLS) enabled
- API calls must include authentication tokens
- Sensitive data must be encrypted at rest
- HTTPS required for all communications
- Regular security audits and updates

## 7. User Interface Requirements

### 7.1 Design Principles
- Clean, modern interface using Tailwind CSS
- Responsive design for desktop and mobile
- Consistent color scheme and typography
- Intuitive navigation with clear visual hierarchy
- Loading states for all asynchronous operations
- Error handling with user-friendly messages

### 7.2 Key UI Components
- Navigation menu with user profile and role indicator
- Data tables with sorting and filtering
- Form validation with inline error messages
- Modal dialogs for confirmations
- Toast notifications for success/error feedback
- Print-optimized invoice preview

### 7.3 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## 8. Performance Requirements

### 8.1 Response Times
- Page load: < 2 seconds
- API responses: < 500ms
- Search operations: < 1 second
- File uploads: Progress indication for operations > 2 seconds

### 8.2 Scalability
- Support for 10,000+ invoices per account
- Handle 100+ concurrent users
- Efficient pagination for large datasets
- Optimized database queries with proper indexing

### 8.3 Reliability
- 99.9% uptime target
- Automated backups
- Error recovery mechanisms
- Graceful degradation for non-critical features

## 9. Constraints and Assumptions

### 9.1 Constraints
- Budget limitations for third-party services
- Supabase free tier limitations (initially)
- Browser compatibility (modern browsers only)
- Single language support (English) in initial version

### 9.2 Assumptions
- Users have basic computer literacy
- Internet connection required
- Modern web browser usage
- Email access for authentication

## 10. Future Enhancements

### 10.1 Phase 2 Features
- Multi-language support
- Advanced reporting and analytics
- Recurring invoice automation
- Payment gateway integration
- Mobile application
- Expense tracking (expenses table already in schema)

### 10.2 Phase 3 Features
- AI-powered insights
- Batch invoice operations
- Custom invoice templates
- API for third-party integrations
- Advanced workflow automation
- Real-time collaboration features

## 11. Success Criteria

### 11.1 Launch Criteria
- All core features implemented and tested
- Security audit passed
- Performance benchmarks met
- User documentation complete
- Admin documentation complete

### 11.2 Post-Launch Metrics
- 95% user satisfaction rating
- < 0.1% critical bug rate
- 50% reduction in invoice processing time
- 90% user retention after 3 months

## 12. Risk Assessment

### 12.1 Technical Risks
- **Database scaling**: Mitigated by Supabase's scalability
- **Security breaches**: Mitigated by RLS and security best practices
- **Performance degradation**: Mitigated by optimization and monitoring

### 12.2 Business Risks
- **User adoption**: Mitigated by intuitive UI and onboarding
- **Competition**: Mitigated by unique features and pricing
- **Regulatory compliance**: Mitigated by security measures and data protection

## 13. Timeline and Milestones

### 13.1 Development Phases
1. **Phase 1 (Completed)**: Core functionality
   - User authentication
   - Customer management
   - Basic invoice creation
   - Role-based access control

2. **Phase 2 (In Progress)**: Enhanced features
   - Currency exchange rates
   - Advanced UI improvements
   - Performance optimizations

3. **Phase 3 (Planned)**: Advanced features
   - Reporting and analytics
   - Payment integrations
   - Mobile responsiveness improvements

## 14. Appendices

### 14.1 Glossary
- **RBAC**: Role-Based Access Control
- **RLS**: Row Level Security
- **CRUD**: Create, Read, Update, Delete
- **SPA**: Single Page Application
- **PWA**: Progressive Web Application

### 14.2 References
- Vue.js Documentation
- Supabase Documentation
- Tailwind CSS Documentation
- Netlify Deployment Guide

---

*Last Updated: December 2024*
*Version: 1.0*
