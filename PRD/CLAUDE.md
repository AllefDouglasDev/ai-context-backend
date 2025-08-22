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
