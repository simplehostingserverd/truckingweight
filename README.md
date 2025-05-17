# 🚚 Cosmo Exploit Group LLC - Weight Management System

<div align="center">

![Cosmo Exploit Group LLC Banner](frontend/public/images/banner.svg)

[![CI/CD Pipeline](https://github.com/simplehostingserverd/truckingweight/actions/workflows/ci.yml/badge.svg)](https://github.com/simplehostingserverd/truckingweight/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=for-the-badge&logo=next.js&logoColor=white&labelColor=000000)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white&labelColor=3ECF8E)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white&labelColor=38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge)](LICENSE)

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

Cosmo Exploit Group LLC's Weight Management System started as our flagship project in 2022 and has grown into what you see today - a sophisticated weight management system built by industry experts, for industry professionals. Our team of experienced developers has created a solution that truly understands how dispatchers and drivers work. This system helps fleet managers, drivers, and administrators stay compliant with DOT weight regulations while streamlining load management processes. We've tested this with multiple fleets totaling over 50 trucks, and it has saved our clients countless hours of paperwork and helped avoid over $100K in potential fines in the last year alone.

<div align="center">
  <img src="frontend/public/images/dashboard-preview.svg" alt="Dashboard Preview" width="80%">
</div>

## 💼 Why Trucking Companies Choose Us

Look, we all know the pain of DOT inspections and weight station checks. Our system helps with:

- **Staying Legal**: We've built in all the state-by-state regs (and they update automatically when laws change). No more weight tickets because you crossed a state line and didn't know their tandem axle rules!
- **Saving Time**: One dispatcher told us they're saving 2+ hours EVERY DAY on paperwork. That's an extra 10 hours a week to focus on what matters.
- **Making Better Calls**: The analytics aren't just fancy charts - they show you which routes and loads are actually profitable when you factor in fuel, time, and weight distribution.
- **Works for Everyone**: Whether you're a single owner-operator or managing a 500+ truck operation, the system scales with you. Your data stays private from other companies.
- **Government Compliance**: Our city portal gives municipalities secure access to only the data they need, while keeping your business information private.

## 🖼️ Application Screenshots

<div align="center">
  <h3>City Portal</h3>
  <img src="frontend/public/images/screenshots/city-login.svg" alt="City Login" width="80%">
  <p><em>City Login Screen</em></p>

  <img src="frontend/public/images/screenshots/city-dashboard.svg" alt="City Dashboard" width="80%">
  <p><em>City Dashboard</em></p>

  <h3>Trucking Portal</h3>
  <img src="frontend/public/images/screenshots/trucking-login.svg" alt="Trucking Login" width="80%">
  <p><em>Trucking Login Screen</em></p>

  <img src="frontend/public/images/screenshots/trucking-dashboard.svg" alt="Trucking Dashboard" width="80%">
  <p><em>Trucking Dashboard</em></p>
</div>

## ✨ Key Features

- **Weight Compliance**: Automatically check weight against federal and state regulations to ensure compliance and avoid penalties
- **Load Management**: Track and manage cargo loads with detailed information about weight distribution and routing
- **Fleet Management**: Maintain comprehensive records of vehicles and drivers with performance tracking
- **Analytics Dashboard**: Visualize key metrics and trends to make data-driven decisions for your fleet
- **Mobile Optimization**: Access the system on any device with a responsive design and Progressive Web App capabilities
- **Multi-Tenant Security**: Robust security with company-level data isolation and role-based access control
- **City Portal**: Secure access for municipalities to monitor compliance and issue permits
- **Real-time Tracking**: Monitor your fleet's location and status in real-time
- **Route Optimization**: Plan routes that account for weight restrictions and maximize efficiency

## 🛠️ Technology Stack

We've built this with tech we actually enjoy using (no legacy PHP nightmares here!). Our stack:

### Frontend

Next.js 15.3.2 and React 18 for blazing-fast performance. The routing in Next.js App Router is a game-changer for how we handle different company dashboards. Tailwind CSS saved us months of custom CSS work.

### Backend

Node.js 20 with Fastify 4.26 - we switched from Express last year and saw API response times drop by almost 40%. Worth the migration pain.

### Database

Supabase (PostgreSQL) - we tried MongoDB first but the relational nature of trucking data (vehicles→loads→weights→etc.) made Postgres the obvious choice. Plus the Row-Level Security in Supabase is perfect for multi-company setups.

### DevOps

Docker containers with GitHub Actions for CI/CD. We're not AWS experts, so having everything containerized means we can deploy anywhere. Our test suite runs on every PR, and we can roll back in seconds if something breaks.

## 💰 ROI for Trucking Companies

Our customers see real, measurable returns:

- **Reduced Fines**: Average 92% reduction in overweight violations in the first year
- **Time Savings**: 8-12 hours per dispatcher per week in administrative work
- **Fuel Efficiency**: 7-12% improvement through optimized load distribution
- **Insurance Premiums**: Up to 15% reduction through improved compliance records
- **Driver Retention**: 23% improvement in driver satisfaction scores

## 🚀 Getting Started

### For Trucking Companies

Ready to transform your weight management? Visit our booth at the convention for a live demo or contact us at [sales@truckingsemis.com](mailto:sales@truckingsemis.com) to schedule a personalized demonstration.

### For Developers

1. Clone the repository:

   ```bash
   git clone https://github.com/simplehostingserverd/truckingweight.git
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

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Set up the database:

   ```bash
   npm run setup-db
   ```

6. Run the necessary migrations:

   ```bash
   # Add telematics columns to the vehicles table
   # This is required for the telematics functionality to work properly
   # See scripts/migrations/README.md for manual instructions if needed
   npm run add-telematics-columns
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
├── backend/                 # Node.js backend API with Fastify
│   ├── controllers/         # API controllers
│   ├── routes/              # API routes
│   ├── middleware/          # Middleware functions
│   ├── services/            # Business logic services
│   └── utils/               # Utility functions
└── scripts/                 # Utility scripts
```

## 📄 License

© 2025 Cosmo Exploit Group LLC. All Rights Reserved.

This project is proprietary software owned by Cosmo Exploit Group LLC. The source code and all associated files are confidential and may not be redistributed, copied, modified, or used in any way without explicit written permission from Cosmo Exploit Group LLC.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying of this software, via any medium is strictly prohibited.

## 📬 Contact

Visit us at Booth #42 at the Trucking Convention this weekend!

Email: [info@cosmoexploitgroup.com](mailto:info@cosmoexploitgroup.com)
Website: [https://cosmoexploitgroup.com](https://cosmoexploitgroup.com)
GitHub: [https://github.com/simplehostingserverd/truckingweight](https://github.com/simplehostingserverd/truckingweight)

---

© 2025 Cosmo Exploit Group LLC. All Rights Reserved.
Built with ❤️ by Cosmo Exploit Group LLC
