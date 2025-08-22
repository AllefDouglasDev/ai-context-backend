# Context Engineering Configuration Repository

This repository contains context engineering configurations and documentation for a Node.js/NestJS application backend. It serves as a centralized location for storing architectural decisions, development processes, and engineering principles that guide the development of the application.

## Purpose

This project is designed to maintain and organize the context engineering configurations that help AI assistants and development teams understand the project structure, principles, and processes. The configurations ensure consistent development practices and architectural decisions across the application lifecycle.

## Repository Structure

### PRD Directory

The `PRD/` directory contains the core documentation and configuration files:

- **Architecture definitions** - System design and architectural patterns
- **Development processes** - Workflows and development methodologies  
- **Engineering principles** - SOLID, KISS, YAGNI guidelines and best practices
- **Project requirements** - Functional and non-functional specifications

### Key Files

- `CLAUDE.md` - Main configuration file for AI assistant context and project guidance
- Development command references and testing strategies
- TypeScript and linting configurations

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

## Usage

This repository serves as a reference for:

1. **Development Teams** - Understanding project architecture and processes
2. **AI Assistants** - Providing context for code generation and modifications
3. **Code Reviews** - Ensuring adherence to established principles and patterns
4. **Onboarding** - New team members can quickly understand project standards

## Configuration Files

The context engineering configurations help maintain:

- Consistent code architecture patterns
- Adherence to software engineering principles
- Standardized development workflows
- Quality assurance processes
- Testing strategies and methodologies

## Technology Stack

- **Runtime**: Node.js
- **Framework**: NestJS (TypeScript)
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier
- **Build System**: TypeScript Compiler

## License

MIT Licensed