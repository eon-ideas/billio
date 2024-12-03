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
