# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat robot management frontend application built with React, TypeScript, and Rsbuild. It provides a web interface to manage WeChat bots, including robot status monitoring, message management, contact management, and settings configuration.

## Common Development Commands

### Installation and Setup
```bash
# Install dependencies (requires Node.js 18+)
pnpm install

# Generate client API types from Swagger definitions
pnpm run build-types

# Start development server
pnpm run dev
```

### Build and Development
```bash
# Start development server (opens at localhost:9100)
pnpm run dev

# Build for production
pnpm run build
```

### Code Quality
```bash
# Run ESLint
npx eslint .

# Run TypeScript type checking
npx tsc --noEmit
```

## Architecture and Tech Stack

### Core Technologies
- **Build Tool**: Rsbuild (Rspack-based) with React plugin
- **Framework**: React 19 with TypeScript
- **UI Library**: Ant Design (antd)
- **Styling**: Styled Components + Less
- **State Management**: Built-in React hooks + ahooks
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios with auto-generated API clients
- **Date Handling**: dayjs

### Project Structure
```
src/
├── @types/           # TypeScript type definitions
├── api/              # Auto-generated API clients (from Swagger)
├── components/       # Reusable UI components
├── context/          # React context providers
├── hooks/            # Custom React hooks
├── icons/            # Custom icon components
├── utils/            # Utility functions and app initialization
├── robot/            # Robot management pages
├── contact/          # Contact management pages
├── chat/             # Chat interface components
├── moments/          # WeChat moments functionality
├── settings/         # Application settings
└── [feature]/        # Feature-specific directories
```

### Key Architecture Patterns

#### API Client Generation
- Swagger/OpenAPI definitions are stored in `scripts/swagger/`
- Run `pnpm run build-types` to generate TypeScript API clients
- Generated clients are available globally via `window.wechatRobotClient`
- API clients use Axios with interceptors for authentication and error handling

#### Component Structure
- Most components are lazy-loaded using React.lazy()
- Styled Components used for component-specific styling
- Ant Design components for consistent UI patterns
- Custom hooks in `src/hooks/` for reusable logic

#### Development Proxy
- Development server runs on port 9100
- API requests to `/api/v1/**` are proxied to `http://127.0.0.1:9000`
- Change target in `rsbuild.config.ts` for different backend endpoints

## Development Guidelines

### File Organization
- Feature-based directory structure under `src/`
- Shared components in `src/components/`
- Types and interfaces in `src/@types/`
- API-related code auto-generated in `src/api/`

### Code Standards
- ESLint configuration enforces consistent code style
- TypeScript strict mode enabled
- Prettier integration for code formatting
- Import sorting with custom plugin

### API Integration
- All API calls use the auto-generated client from Swagger definitions
- Global client instance available as `window.wechatRobotClient`
- Authentication handled via interceptors
- Error handling with Ant Design message components

### State Management
- React Context for user state (`src/context/user.tsx`)
- ahooks for data fetching and state management
- Component-local state with useState/useReducer

## Important Notes

- The project uses Chinese for UI text and comments
- API types are auto-generated - do not manually edit files in `src/api/`
- Development server has HMR enabled via React Refresh
- Build process includes chunk splitting for optimal performance
- ESLint ignores auto-generated directories (`src/api/`, `dist/`, etc.)