# TruckingWeight Backend

Hey team - this is our backend server code. It handles all the API endpoints for weight tracking, load management, and those compliance reports that keep the DOT off our backs.

## Server Versions

We've gone through a few iterations as we've scaled up:

### The Real Deal (What We Use in Production)

- server-fastify.js: This is our main server - built with Fastify.
  - This is what runs in production and what you should use for dev
  - We switched from Express because Fastify is WAY faster with our load
  - Has all the good stuff: Swagger docs, rate limiting, security, etc.
  - Just run: `npm start` or `npm run dev` to fire it up

### Old Stuff (Don't Use These)

- server.js: Our first attempt with Express.js.

  - Just keeping it around for reference - don't use it!
  - If you really need to: `npm run start:express` or `npm run dev:express`
  - (But seriously, don't use it)

- server.ts: Our TypeScript experiment with Express.
  - Another reference implementation
  - Might convert our Fastify code to TypeScript someday
  - Can't run this directly without compiling it first

## Getting Started

### What You Need

- Node.js 20.x (we use the latest LTS - older versions will probably break things)
- npm 10.x (npm 9 might work but we haven't tested it)

### Setup

1. Clone the repo
2. Jump into the backend folder
3. Install all the dependencies:

```bash
npm install
```

4. Copy `.env.example` to `.env` and fill in your values (ask Mike for the dev credentials if you need them)
5. Fire it up:

```bash
npm run dev
```

## Useful Commands

- `npm start`: Run the production server (what we use on our actual servers)
- `npm run dev`: Development mode with hot reloading (use this for coding)
- `npm run start:express`: Run the old Express server (avoid this)
- `npm run dev:express`: Express server in dev mode (also avoid this)
- `npm run lint`: Check if your code is clean
- `npm run lint:fix`: Fix most code style issues automatically
- `npm test`: Run the test suite (please make sure these pass before PRs!)

## API Docs

Once you've got the server running, you can check out the API docs here:

- Swagger UI: `http://localhost:5000/documentation` (interactive - great for testing)
- Swagger JSON: `http://localhost:5000/swagger.json` (if you need the raw spec)

## Config Settings

Check out `.env.example` for all the settings. The database connection strings are the most important ones - don't commit these to git!

## Docker Stuff

We've containerized everything to make deployment easier. The Docker setup uses our Fastify server.

```bash
# Build it
docker build -t truckingweight-backend .

# Run it (maps port 5000 from container to your machine)
docker run -p 5000:5000 truckingweight-backend
```

## CI/CD Pipeline

Our GitHub Actions pipeline builds and deploys the Fastify version automatically. If the tests pass, it builds a Docker image and pushes it to our registry. We've had some hiccups with the pipeline lately (looking at you, Jake!), so keep an eye on the build status after you push.
