# EcoTide - Aquatic Health Monitoring System

## Overview

EcoTide is a real-time aquatic health monitoring system designed to track water quality parameters across multiple monitoring sites. The application provides live dashboards, predictive analytics, and alert systems for environmental monitoring. It features a React frontend with a modern UI built using shadcn/ui components, an Express.js backend with WebSocket support for real-time updates, and PostgreSQL database integration using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom aquatic theme variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket integration for live data updates

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Real-time**: WebSocket server for live data streaming
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Build System**: esbuild for production bundling

### Development Environment
- **Package Manager**: npm
- **Development Server**: Vite dev server with HMR
- **TypeScript**: Strict mode enabled with modern ES modules
- **Environment**: EcoTide-optimized with development tooling

## Key Components

### Database Schema (Drizzle ORM)
- **Monitoring Sites**: Stores location data, status, and health scores for water monitoring stations
- **Sensor Readings**: Time-series data for water quality metrics (pH, temperature, dissolved oxygen, nitrates, turbidity)
- **Alerts**: Real-time alert system with priority levels and confidence scores

### API Endpoints
- `GET /api/sites` - Retrieve all monitoring sites
- `GET /api/sites/:id/readings` - Get sensor readings for a specific site
- `GET /api/sites/:id/latest-reading` - Get the most recent reading for a site
- `GET /api/alerts` - Fetch active alerts
- `POST /api/alerts/:id/dismiss` - Dismiss an alert
- WebSocket endpoint at `/ws` for real-time data streaming

### Frontend Components
- **Dashboard**: Main interface showing real-time metrics, charts, and alerts
- **Sidebar Navigation**: Site navigation with aquatic theme
- **Metric Cards**: Display key performance indicators
- **Charts**: Interactive data visualization using Recharts
- **Alerts System**: Real-time alert management with priority-based styling
- **Monitoring Locations**: Geographic display of monitoring sites

### Real-time Features
- WebSocket connection with automatic reconnection logic
- Live data updates for sensor readings and alerts
- Connection status indicators
- Real-time chart updates

## Data Flow

1. **Data Ingestion**: Sensor readings are stored via API endpoints (currently simulated with in-memory storage)
2. **Database Storage**: Drizzle ORM manages PostgreSQL data operations with type-safe queries
3. **API Layer**: Express.js serves data through RESTful endpoints
4. **Real-time Updates**: WebSocket server broadcasts new readings and alerts to connected clients
5. **Frontend State**: TanStack Query manages API data caching and synchronization
6. **UI Updates**: React components automatically re-render with new data

## External Dependencies

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- Recharts for data visualization

### Backend Infrastructure
- Neon Database for serverless PostgreSQL hosting
- WebSocket (ws) library for real-time communication
- Drizzle Kit for database migrations and schema management

### Development Tools
- Vite with React plugin for fast development
- TypeScript for type safety across the stack
- Development environment plugins for integration

## Deployment Strategy

### Development
- Vite development server with HMR for frontend
- Express server with middleware integration for API
- Environment variables for database configuration
- Hot reloading for both client and server code

### Production Build
- Vite builds optimized React bundle to `dist/public`
- esbuild compiles Express server to `dist/index.js`
- Static file serving integrated with Express
- Environment-based configuration for database connections

### Database Management
- Drizzle migrations stored in `./migrations` directory
- Schema definitions in `shared/schema.ts` for type sharing
- PostgreSQL dialect with Neon Database integration
- Push-based schema updates with `npm run db:push`

The application is structured as a monorepo with shared TypeScript types between frontend and backend, enabling type-safe communication across the full stack. The in-memory storage implementation provides a development foundation that can be easily replaced with full database integration.