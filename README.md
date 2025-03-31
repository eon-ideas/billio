# Invoice Master

A modern invoice management system built with Vue.js. Create, manage, and track invoices with an intuitive user interface.

## Features

- Customer management
- Invoice creation and tracking
- Company settings management
- Invoice status tracking (paid/unpaid)
- Print-friendly invoice previews
- Dashboard with yearly invoice summary
- User authentication with Supabase
- Secure data storage

## Technology Stack

- Vue.js 3
- TypeScript
- Vite
- Tailwind CSS
- headlessui/vue (UI components)
- heroicons/vue (Icons)
- Pinia (State Management)
- Vue Router
- Supabase (Authentication & Backend)
- TailGrids (UI Components)
- Docker
- Netlify (Hosting & Deployment)

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Supabase account
- Netlify account

## Supabase Setup

### Development Setup

1. Create a new Supabase project:
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Sign in or create an account
   - Click "New Project"
   - Fill in your project details

2. Get your project credentials:
   - In your project dashboard, go to Project Settings > API
   - Copy your project URL and anon key

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

### Database Migrations

There are two ways to apply database migrations to your Supabase project:

#### Option 1: Using Supabase Dashboard (Recommended for Production)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open and run the following migration files in order:
   - `supabase/migrations/20241208_create_company_info.sql`
   - `supabase/migrations/20241208_setup_storage.sql`

#### Option 2: Using Supabase CLI (Recommended for Development)

1. Make sure you're logged in to Supabase CLI:
   ```bash
   supabase login
   ```

2. Link your project (first time only):
   ```bash
   supabase link --project-ref your-project-ref
   ```
   You can find your project ref in your Supabase project settings.

3. Push the migrations:
   ```bash
   supabase db push
   ```

This will apply all migrations in the `supabase/migrations` directory to your database.

### Local Development with Supabase

1. Install Supabase CLI:
```bash
brew install supabase/tap/supabase
```

2. Login to Supabase CLI:
```bash
supabase login
```

3. Initialize Supabase locally:
```bash
supabase init
```

4. Start the local Supabase stack:
```bash
supabase start
```
This will start a local PostgreSQL database and other Supabase services.

5. Get your local credentials:
```bash
supabase status
```
Copy the API URL and anon key to your `.env` file:
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
```

6. Apply database migrations:
```bash
supabase db reset
```

7. When you're done, stop the local stack:
```bash
supabase stop
```

### Deployment

The application is deployed on Netlify. You can find the live version at: [https://invoice-master.netlify.app](https://invoice-master.netlify.app)

#### Deploying to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize Netlify in your project:
```bash
netlify init
```
   - Choose "Create & configure a new site"
   - Select your team
   - Set a custom site name or let Netlify generate one

4. Configure environment variables:
   - Go to Site Settings > Build & Deploy > Environment Variables
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```
   - Or use Netlify CLI:
     ```bash
     netlify env:set VITE_SUPABASE_URL your_project_url
     netlify env:set VITE_SUPABASE_ANON_KEY your_anon_key
     ```

5. Deploy your site:
   ```bash
   # Test deployment (preview URL)
   netlify deploy

   # Production deployment
   netlify deploy --prod
   ```

#### Continuous Deployment

The repository is set up for continuous deployment:
- Every push to `main` triggers a production deployment
- Pull requests create preview deployments
- Branch deployments are available for testing

#### Custom Domains

To set up a custom domain:
1. Go to Site Settings > Domain Management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Wait for SSL certificate provisioning (usually 5-10 minutes)

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Build the application:
```bash
npm run build
```

## Docker

### Building Docker Image

#### Single Architecture Build
```bash
docker build -t invoice-master:latest .
```

#### Multi-Architecture Build
Build for multiple architectures (AMD64, ARM64, ARMv7):
```bash
# Create and use a new builder instance
docker buildx create --use

# Build and push multi-arch image
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t yourusername/invoice-master:latest \
  --push .
```

### Running Docker Container

```bash
docker run -d -p 8080:80 invoice-master:latest
```

The application will be available at `http://localhost:8080`

### Publishing to Docker Hub

1. Tag the image (for single architecture):
```bash
docker tag invoice-master:latest yourusername/invoice-master:latest
```

2. Login to Docker Hub:
```bash
docker login
```

3. Push the image:
```bash
# For single architecture
docker push yourusername/invoice-master:latest

# For multi-architecture (use buildx command from above)
```

### Using Docker Compose

1. Start the application:
```bash
docker-compose up -d
```

2. Stop the application:
```bash
docker-compose down
```

The application will be available at `http://localhost:8080`

### Supported Architectures

The Docker image supports the following architectures:
- linux/amd64 (x86_64) - For most desktop computers and servers
- linux/arm64 (aarch64) - For newer ARM devices (e.g., Apple M1/M2, newer Raspberry Pi)
- linux/arm/v7 - For older ARM devices (e.g., older Raspberry Pi, some NAS devices)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Note: Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

## Project Structure

```
src/
├── components/     # Reusable Vue components
├── views/          # Page components
├── stores/         # Pinia stores
├── router/         # Vue Router configuration
├── types/          # TypeScript type definitions
└── assets/         # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
