# Invoice Master

A modern invoice management system built with Vue.js. Create, manage, and track invoices with an intuitive user interface.

## Features

- Customer management
- Invoice creation and tracking
- Company settings management
- Invoice status tracking (paid/unpaid)
- Print-friendly invoice previews
- Dashboard with yearly invoice summary

## Technology Stack

- Vue.js 3
- TypeScript
- Vite
- Tailwind CSS
- Pinia (State Management)
- Vue Router
- Docker

## Prerequisites

- Node.js 20 or higher
- npm or yarn

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

```bash
docker build -t invoice-master:latest .
```

### Running Docker Container

```bash
docker run -d -p 8080:80 invoice-master:latest
```

The application will be available at `http://localhost:8080`

### Publishing to Docker Hub

1. Tag the image:
```bash
docker tag invoice-master:latest yourusername/invoice-master:latest
```

2. Login to Docker Hub:
```bash
docker login
```

3. Push the image:
```bash
docker push yourusername/invoice-master:latest
```

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
