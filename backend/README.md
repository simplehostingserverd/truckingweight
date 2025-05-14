# TruckingWeight Backend

This is the backend server for the TruckingWeight application, providing API endpoints for weight management, load tracking, and compliance reporting.

## Server Implementations

This project contains multiple server implementations:

### Primary Implementation (Used in Production)

- **server-fastify.js**: The primary server implementation using Fastify framework.
  - Used in production and development by default
  - Offers better performance than Express
  - Includes Swagger documentation, rate limiting, and enhanced security features
  - Run with: `npm start` or `npm run dev`

### Legacy Implementations (Not Used in Production)

- **server.js**: Original Express.js implementation in JavaScript.

  - Kept for reference purposes only
  - Run with: `npm run start:express` or `npm run dev:express` if needed

- **server.ts**: Express.js implementation in TypeScript.
  - Kept for reference purposes only
  - May be used as a basis for a future TypeScript Fastify implementation
  - Not directly runnable without compilation

## Getting Started

### Prerequisites

- Node.js 20.x
- npm 10.x

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on `.env.example`
5. Start the server:

```bash
npm run dev
```

## Available Scripts

- `npm start`: Start the Fastify server in production mode
- `npm run dev`: Start the Fastify server in development mode with hot reloading
- `npm run start:express`: Start the Express server (legacy) in production mode
- `npm run dev:express`: Start the Express server (legacy) in development mode
- `npm run lint`: Run ESLint to check code quality
- `npm run lint:fix`: Run ESLint and automatically fix issues
- `npm test`: Run tests

## API Documentation

When running the Fastify server, API documentation is available at:

- Swagger UI: http://localhost:5000/documentation
- Swagger JSON: http://localhost:5000/swagger.json

## Environment Variables

See `.env.example` for required environment variables.

## Docker

The backend is containerized using Docker. The Dockerfile is configured to use the Fastify server implementation.

```bash
# Build the Docker image
docker build -t truckingweight-backend .

# Run the container
docker run -p 5000:5000 truckingweight-backend
```

## CI/CD Pipeline

The CI/CD pipeline is configured to use the Fastify server implementation. The Docker container built and deployed by the pipeline uses `server-fastify.js` as specified in the Dockerfile.
