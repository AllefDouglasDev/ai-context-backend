# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS TypeScript backend application, following the standard NestJS framework architecture. The project uses a modular structure with controllers, services, and modules following dependency injection patterns.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (with file watching)
npm run start:dev

# Production build
npm run build

# Start production server
npm run start:prod

# Linting and formatting
npm run lint
npm run format

# Testing
npm run test           # Unit tests
npm run test:watch     # Watch mode for unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Test coverage report
```

## Architecture

- Must follow what is described in this file `PRD/ARCHITECTURE.md`

### Best Practices and Guidelines
- Always read the `PRD/SOLID_KISS_YAGNI.md` and follow all the principles and guidelines.
- The SOLID principles are a cornerstone of clean code and maintainability, so always apply them.
- The KISS (Keep It Simple, Stupid) principle is a key to writing maintainable code.
- The YAGNI (You Ain't Gonna Need It) principle is to avoid unnecessary features.

### Development Process

- Must follow what is described in this file `PRD/DEVELOPMENT_PROCESS.md`

## Testing Strategy

### Unit Tests
- Never use the NestJS testing framework
- Create helper classes in `test/` directory in each module, to avoid NestJS dependencies
- Use Jest for unit testing when needed
- In-memory repositories for isolated testing
- Fake services for external dependencies

### E2E Tests
- Located in `test/` directory with `.e2e-spec.ts` suffix
- Uses supertest for HTTP testing
- Tests full application flow including HTTP layer

## Configuration

### TypeScript
- Target: ES2017
- Decorators and metadata enabled for NestJS
- Relaxed type checking (no strict null checks, implicit any allowed)
- Output directory: `./dist`

### Linting & Formatting
- ESLint with TypeScript plugin
- Prettier integration
- Single quotes, trailing commas enforced
- Relaxed rules for explicit return types and any usage

## Development Notes

- Application runs on port 3000 by default
- Hot reload available in development mode via `npm run start:dev`
- Source code in `src/` directory, compiled output in `dist/`
- When adding new features, create modules, controllers, and services following existing patterns
- Use NestJS CLI for generating new components: `nest generate [schematic] [name]`
