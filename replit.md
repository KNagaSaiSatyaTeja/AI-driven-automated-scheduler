# AI-Driven Automated Scheduler

## Overview

This is a full-stack web application built for automated class scheduling using AI algorithms. The system manages faculty, subjects, rooms, breaks, and college time configurations to generate optimal schedules while respecting constraints and availability.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: Dual database setup - PostgreSQL with Drizzle ORM and MongoDB with Mongoose
- **Authentication**: JWT-based authentication with session management
- **API**: RESTful API endpoints

### Hybrid Database Strategy
The application uses a unique dual-database approach:
- **PostgreSQL**: Primary database for structured data using Drizzle ORM
- **MongoDB**: Secondary database for flexible document storage using Mongoose
- **Database Management**: Singleton pattern for MongoDB connections with fallback to in-memory server

## Key Components

### Authentication System
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Express sessions with configurable storage
- **Role-based Access**: Admin and user roles with different permissions
- **Middleware**: Authentication middleware for protected routes

### AI Scheduling Engine
- **Constraint Solver**: Custom algorithm handling faculty availability, room capacity, and time conflicts
- **Time Slot Management**: Flexible time slot allocation with break consideration
- **Conflict Resolution**: Automatic detection and resolution of scheduling conflicts
- **Optimization**: AI-driven optimization for resource utilization

### Entity Management
- **Faculty**: Availability management with time slots
- **Subjects**: Duration, frequency, and faculty assignment
- **Rooms**: Capacity and type-based allocation
- **Breaks**: Configurable break periods
- **College Time**: Institutional time settings

### Schedule Generation
- **Automated Scheduling**: AI algorithm generates optimal schedules
- **Constraint Validation**: Real-time validation of scheduling constraints
- **Conflict Detection**: Identifies and reports scheduling conflicts
- **Export Functionality**: Schedule export to various formats

## Data Flow

1. **User Authentication**: Login/signup with role-based access control
2. **Entity Configuration**: Admin users configure faculty, subjects, rooms, and breaks
3. **Schedule Generation**: AI algorithm processes constraints and generates schedules
4. **Schedule Validation**: System validates generated schedules for conflicts
5. **Schedule Display**: Rendered timetable grids with interactive features
6. **Schedule Export**: Export functionality for external use

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL hosting service
- **MongoDB**: Document database for flexible data storage
- **MongoDB Memory Server**: Development fallback for testing

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Build tool with HMR and optimization
- **ESBuild**: Fast JavaScript bundler for production
- **TSX**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Server**: Node.js with hot reload using TSX
- **Client**: Vite development server with HMR
- **Database**: MongoDB Memory Server fallback
- **Port Configuration**: 5000 for server, 27017 for MongoDB

### Production Environment
- **Build Process**: Vite build for client, ESBuild for server
- **Deployment Target**: Autoscale deployment on Replit
- **Environment Variables**: DATABASE_URL, JWT_SECRET, SESSION_SECRET
- **Static Assets**: Served from dist/public directory

### Configuration Management
- **Environment Variables**: Secure configuration management
- **Database URLs**: Configurable database connections
- **Session Security**: Configurable session secrets
- **CORS**: Cross-origin resource sharing configuration

## Changelog

- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.