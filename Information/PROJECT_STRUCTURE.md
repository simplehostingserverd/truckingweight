<!--

 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * 
 * This file contains proprietary and confidential information of 
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 

-->

# Project Structure

This document outlines the organization of the Truckers Weight Management System.

## Directory Structure

```
/
├── client/             # Frontend web application
│   ├── public/         # Static assets
│   └── src/            # Source code
│       ├── components/ # Reusable UI components
│       ├── pages/      # Application pages
│       ├── services/   # API services
│       └── styles/     # CSS/SCSS files
│
├── server/             # Backend application
│   ├── controllers/    # Request handlers
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── utils/          # Utility functions
│
├── database/           # Database scripts and migrations
│   ├── migrations/     # Database schema changes
│   └── seeds/          # Initial data
│
└── docs/               # Documentation
    ├── api/            # API documentation
    └── user/           # User guides
```

## Technology Stack (Proposed)

### Frontend

- React.js with Next.js for server-side rendering
- Tailwind CSS for styling
- Redux or Context API for state management

### Backend

- Node.js with Express
- Authentication with JWT
- API documentation with Swagger/OpenAPI

### Database

- PostgreSQL for relational data
- Redis for caching (optional)

### DevOps

- Docker for containerization
- GitHub Actions for CI/CD

## Multi-tenancy Approach

The system will support multiple trucking companies through a multi-tenant architecture:

1. Each company will have isolated data
2. Authentication system will manage company-specific access
3. Shared infrastructure with logical separation of data
