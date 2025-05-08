# 🚚 TruckingSemis - Weight Management System

<div align="center">

  ![TruckingSemis Banner](frontend/public/images/banner.svg)

  [![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?style=for-the-badge&logo=next.js&logoColor=white&labelColor=000000)](https://nextjs.org/)
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

**TruckingSemis** is a comprehensive weight management system designed specifically for trucking companies. It helps fleet managers, drivers, and administrators ensure compliance with federal and state weight regulations while optimizing load management and improving operational efficiency.

<div align="center">
  <img src="frontend/public/images/dashboard-preview.svg" alt="Dashboard Preview" width="80%">
</div>

### 💼 Business Value

- **Regulatory Compliance**: Automatically verify weight compliance with federal and state regulations, reducing the risk of costly fines and penalties
- **Operational Efficiency**: Streamline weight checking processes and load management to save time and resources
- **Data-Driven Decisions**: Gain insights from comprehensive reporting and analytics to optimize fleet operations
- **Multi-Company Support**: Designed for both single companies and multi-company environments with secure data isolation

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

## 🛠️ Technology Stack

<div align="center">

  ### Frontend
  ![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?style=flat-square&logo=next.js&logoColor=white)
  ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

  ### Backend
  ![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=node.js&logoColor=white)
  ![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)

  ### Database
  ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)

  ### DevOps
  ![Docker](https://img.shields.io/badge/Docker-Containerization-2496ED?style=flat-square&logo=docker&logoColor=white)
  ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=flat-square&logo=github-actions&logoColor=white)

</div>

## 🚀 Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (optional, for containerized deployment)
- Supabase account (for database)

### Development Setup

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

## 📖 Usage

### Weight Management

Record and track weight information for your vehicles:

```javascript
// Example API call to create a new weight record
const createWeight = async (weightData) => {
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
      }
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
    regulationReference: limits.reference
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
├── backend/                 # Node.js backend API
│   ├── controllers/         # API controllers
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── models/              # Data models
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

- [ ] Phase 3: Advanced Features
  - [ ] Weight compliance checking with federal regulations
  - [ ] Enhanced dashboard with data visualization
  - [ ] Complete load management with route planning

- [ ] Phase 4: Final Polishing
  - [ ] Mobile optimization
  - [ ] Deployment preparation
  - [ ] Final testing and documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

Project Link: [https://github.com/simplehostingserverd/truckingweight](https://github.com/simplehostingserverd/truckingweight)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/simplehostingserverd">simplehostingserverd</a></sub>
</div>
