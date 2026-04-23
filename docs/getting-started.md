# 🚀 Getting Started

Welcome to **CloudVault**! This guide will help you set up your own personal cloud storage system on your server.

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **NPM**: v9.x or higher
- **VPS/Server**: Linux recommended (Ubuntu/Debian)
- **RAM**: Minimum 512MB

## 🛠️ Installation

### 1. Clone & Core Setup
```bash
git clone https://github.com/muhammadzili/cloudvault
cd cloudvault
npm install
```

### 2. Layer Dependencies
CloudVault consists of a Frontend and a Backend. Install dependencies for both:
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=3001
JWT_SECRET=your_random_secret_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
```

## 🏃 Running the Application

You can start both layers simultaneously from the root folder:
```bash
npm run dev
```

CloudVault will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
