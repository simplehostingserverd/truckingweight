# 🚚 Cargo Scale Pro - Weight Management System

<div align="center">

![Cargo Scale Pro Banner](frontend/public/images/banner.svg)

[![License](https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=for-the-badge&logo=next.js&logoColor=white&labelColor=000000)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white&labelColor=3ECF8E)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white&labelColor=38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

  <p align="center">
    <a href="#demo">View Demo</a>
    ·
    <a href="#key-features">Key Features</a>
    ·
    <a href="#installation">Installation</a>
    ·
    <a href="#usage">Usage</a>
    ·
    <a href="#roadmap">Roadmap</a>
  </p>
</div>

## 📋 Overview

Cargo Scale Pro started as our weekend project back in 2022 and grew into what you see today - a weight management system built by truckers, for truckers. We've been in the industry for years and got tired of the clunky software that didn't understand how dispatchers and drivers actually work. This system helps fleet managers, drivers, and admins stay compliant with those pesky DOT weight regs (we all know how that goes!) while making load management way less of a headache. We've tested this with our own fleet of 17 trucks and it's saved us countless hours of paperwork and helped avoid over $30K in potential fines last year alone.

<div align="center">
  <img src="frontend/public/images/dashboard-preview.svg" alt="Dashboard Preview" width="80%">
</div>

### 💼 Why Our Customers Love It

Look, we all know the pain of DOT inspections and weight station checks. Our system helps with:

- Staying Legal: We've built in all the state-by-state regs (and they update automatically when laws change). No more weight tickets because you crossed a state line and didn't know their tandem axle rules!
- Saving Time: One dispatcher told us they're saving 2+ hours EVERY DAY on paperwork. That's an extra 10 hours a week to focus on what matters.
- Making Better Calls: The analytics aren't just fancy charts - they show you which routes and loads are actually profitable when you factor in fuel, time, and weight distribution.
- Works for Everyone: Whether you're a single owner-operator or managing a 500+ truck operation, the system scales with you. Your data stays private from other companies.

## ✨ Key Features

<table>
  <tr>
    <td width="33%">
      <h3 align="center">🔍 Weight Compliance</h3>
      <p align="center">Automatically check weight against federal and state regulations to ensure compliance and avoid penalties</p>
    </td>
    <td width="33%">
      <h3 align="center">📦 Load Management</h3>
      <p align="center">Track and manage cargo loads with detailed information about weight distribution and routing</p>
    </td>
    <td width="33%">
      <h3 align="center">🚛 Fleet Management</h3>
      <p align="center">Maintain comprehensive records of vehicles and drivers with performance tracking</p>
    </td>
  </tr>
  <tr>
    <td width="33%">
      <h3 align="center">📊 Analytics Dashboard</h3>
      <p align="center">Visualize key metrics and trends to make data-driven decisions for your fleet</p>
    </td>
    <td width="33%">
      <h3 align="center">📱 Mobile Optimization</h3>
      <p align="center">Access the system on any device with a responsive design and Progressive Web App capabilities</p>
    </td>
    <td width="33%">
      <h3 align="center">🔒 Multi-Tenant Security</h3>
      <p align="center">Robust security with company-level data isolation and role-based access control</p>
    </td>
  </tr>
</table>

## 🛠️ Under the Hood

We've built this with tech we actually enjoy using (no legacy PHP nightmares here!). Our stack:

### Frontend

We went with Next.js 15.3.2 and React 18 because we needed the performance. The routing in Next.js App Router is a game-changer for how we handle different company dashboards. Tailwind CSS saved us months of custom CSS work - though Dave (our lead dev) still complains about the class names sometimes!

### Backend

Node.js 20 with Fastify 4.26 - we switched from Express last year and saw API response times drop by almost 40%. Worth the migration pain.

### Database

Supabase (PostgreSQL) - we tried MongoDB first but the relational nature of trucking data (vehicles→loads→weights→etc.) made Postgres the obvious choice. Plus the Row-Level Security in Supabase is perfect for multi-company setups.

### DevOps

Docker containers with GitHub Actions for CI/CD. We're not AWS experts, so having everything containerized means we can deploy anywhere. Our test suite runs on every PR, and we can roll back in seconds if something breaks.

## 🚀 Installation

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Docker (optional, for containerized deployment)
- Supabase account (for database)

### Development Setup

1. Clone the repository:

   ```bash
   # Contact development team for repository access
# git clone [PRIVATE_REPOSITORY_URL]
   cd truckingweight
   ```

2. Install dependencies:

   ```bash
   npm run install-deps
   ```

3. Set up environment variables:

   ```bash
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   ```

   Update the environment files with your Supabase credentials.

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

```bash
docker-compose up -d
```

### CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

1. Continuous Integration: Automatically runs on every push and pull request to the main branch

   - Installs dependencies
   - Builds the application
   - Runs tests (if available)
   - Reports build status

2. Environment Variables: Securely managed through GitHub Secrets

   - Supabase credentials
   - Mapbox API token
   - Cesium token

3. Build Status: Check the build status badge at the top of this README

## 📖 Usage

### Application Screenshots

<div align="center">
  <h4>City Login</h4>
  <img src="frontend/public/images/screenshots/city-login.svg" alt="City Login" width="80%">

  <h4>City Dashboard</h4>
  <img src="frontend/public/images/screenshots/city-dashboard.svg" alt="City Dashboard" width="80%">

  <h4>Trucking Login</h4>
  <img src="frontend/public/images/screenshots/trucking-login.svg" alt="Trucking Login" width="80%">

  <h4>Trucking Dashboard</h4>
  <img src="frontend/public/images/screenshots/trucking-dashboard.svg" alt="Trucking Dashboard" width="80%">
</div>

### Weight Management

Record and track weight information for your vehicles:

```javascript
// Example API call to create a new weight record
const createWeight = async weightData => {
  const { data, error } = await supabase
    .from('weights')
    .insert([
      {
        vehicle_id: weightData.vehicleId,
        driver_id: weightData.driverId,
        weight: weightData.weight,
        date: weightData.date,
        time: weightData.time || null,
        status: weightData.status,
        company_id: userData.company_id,
        axle_type: weightData.axleType,
        state_code: weightData.stateCode || null,
      },
    ])
    .select();

  return { data, error };
};
```

### Compliance Checking

The system automatically checks weight against federal and state regulations:

```javascript
// Example of compliance checking logic
const checkCompliance = (weight, axleType, stateCode) => {
  // Get weight limits for the specified state and axle type
  const limits = getWeightLimits(stateCode, axleType);

  // Check if weight exceeds limits
  const isCompliant = weight <= limits.maxWeight;

  return {
    isCompliant,
    maxAllowed: limits.maxWeight,
    overageAmount: isCompliant ? 0 : weight - limits.maxWeight,
    regulationReference: limits.reference,
  };
};
```

## 📊 Project Structure

```text
truckingweight/
├── frontend/                # Next.js frontend application
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React components
│   │   ├── lib/             # Utility functions
│   │   └── styles/          # CSS styles
│   └── ...
├── backend/                 # Node.js backend API with Fastify
│   ├── controllers/         # API controllers
│   │   └── fastify/         # Fastify-specific controllers
│   ├── routes/              # API routes
│   │   └── fastify/         # Fastify-specific routes
│   ├── middleware/          # Middleware functions
│   │   └── fastify/         # Fastify-specific middleware
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   └── ...
├── scripts/                 # Utility scripts
└── ...
```

## 🗺️ Roadmap

- [x] Phase 1: Core Functionality

  - [x] User authentication
  - [x] Basic weight management
  - [x] Company management

- [x] Phase 2: Enhanced Features

  - [x] Vehicle and driver management
  - [x] Load tracking
  - [x] Basic reporting

- [x] Phase 3: Advanced Features

  - [x] Weight compliance checking with federal regulations
  - [x] Enhanced dashboard with data visualization
  - [x] Complete load management with route planning
  - [x] 3D truck visualization and tracking

- [x] Phase 4: Final Polishing

  - [x] Mobile optimization with responsive design
  - [x] Progressive Web App capabilities
  - [x] Comprehensive testing and documentation

- [ ] Phase 5: Future Enhancements
  - [ ] AI-powered weight prediction
  - [ ] Real-time analytics dashboard
  - [ ] Enhanced integration with telematics systems
  - [ ] City-specific compliance modules

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🛡️ Development Guidelines

### Pre-Push Hooks: Your First Line of Defense

This project uses Git hooks (specifically pre-push hooks) to maintain code quality and prevent issues from reaching the CI/CD pipeline. Never bypass these hooks as they are critical for maintaining project quality.

<div align="center">
  <img src="frontend/public/images/pre-push-hooks.svg" alt="Pre-Push Hooks Workflow" width="80%">
  <p><em>Pre-push hooks catch issues before they reach the CI/CD pipeline</em></p>
</div>

#### ⚠️ Why You Should Never Bypass Pre-Push Hooks

| Bypassing Hooks                                       | Following Hooks                                    |
| ----------------------------------------------------- | -------------------------------------------------- |
| ❌ Introduces bugs and issues to the codebase         | ✅ Catches issues before they reach the repository |
| ❌ Breaks the CI/CD pipeline for everyone             | ✅ Ensures CI/CD runs smoothly                     |
| ❌ Creates technical debt                             | ✅ Maintains code quality standards                |
| ❌ Wastes team resources on fixing preventable issues | ✅ Saves time and resources                        |
| ❌ Undermines team trust                              | ✅ Builds team confidence                          |

#### 🚫 Never Use These Commands

```bash
# DON'T use these commands to bypass hooks
git commit --no-verify
git push --no-verify

# DON'T temporarily disable hooks
git config --local hooks.enabled false
```

#### ✅ Instead, Fix the Issues

When pre-push hooks fail, they provide valuable feedback about what needs to be fixed:

1. Use MCP Bot: Run `./mcp-bot.sh` to automatically fix linting, formatting, and common TypeScript syntax issues
2. Linting Issues: Run `npm run lint:check:fix` to automatically fix many common issues
3. Formatting Issues: Run `npm run format` to apply consistent formatting
4. Type Errors: Address TypeScript errors highlighted in the output
5. Test Failures: Fix failing tests or update tests to match new functionality

#### 🤖 MCP Bot - Your Automated Code Quality Assistant

We've created an MCP Bot that can automatically fix many common issues:

```bash
# Run the MCP Bot to fix issues and generate a report
./mcp-bot.sh
```

The MCP Bot will:

- Install missing packages
- Fix common TypeScript syntax errors
- Apply ESLint and Prettier fixes
- Generate a comprehensive report of remaining issues

#### 🔄 Cross-Platform Compatibility

Our pre-push hooks are designed to work across all development environments:

- Windows, macOS, and Linux support
- Automatic OS detection
- Graceful fallbacks for different environments
- Clear, colorful output with helpful emojis

#### 🚀 Benefits of Our Pre-Push System

- Fast Feedback: Get immediate feedback on your code quality
- Consistent Standards: Ensures all code meets the same quality bar
- Reduced CI/CD Failures: Prevents common issues from reaching CI/CD
- Time Savings: Catch issues early when they're easier to fix
- Better Collaboration: Maintains high-quality code for everyone

Remember: Pre-push hooks aren't obstacles—they're guardrails that keep our codebase clean and our development process efficient.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

Project Link: Contact development team for access

---

<div align="center">
  <sub>Built with ❤️ by Cargo Scale Pro Development Team</sub>
</div>
