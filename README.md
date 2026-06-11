# Edgeflex CRM

Industrial-grade Customer Relationship Management system featuring comprehensive customer, branch, and contact management.

**Version:** 1.0.0  
**Last Updated:** June 11, 2026

## Features

- 🔐 Multi-user authentication with permission-based access control
- 👥 Comprehensive customer and branch management
- 📋 Order tracking and management
- 📊 Advanced analytics and reporting
- 📁 Bulk data import from Excel
- 💾 Secure local database with Prisma

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables by copying `.env.example` to `.env` and updating values:
   ```bash
   cp .env.example .env
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking

## Project Structure

```
├── src/                 # React components and frontend code
├── server/              # Backend server configuration
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── dist/                # Production build output
```
