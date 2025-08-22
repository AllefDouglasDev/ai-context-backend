# ARCHITECTURE.md

## Architecture Overview

This project implements an architecture based on **Clean Architecture** and **Domain-Driven Design (DDD)**, 
using NestJS as the main framework. The application is structured in well-defined layers with clear 
separation of responsibilities, facilitating maintainability, testability, and extensibility.

## Fundamental Architectural Principles

### 1. Clean Architecture
The application follows Clean Architecture principles with the following layers:

```
┌─────────────────────────────────────────┐
│            Presentation Layer           │
│         (Controllers, DTOs)             │
├─────────────────────────────────────────┤
│            Application Layer            │
│            (Use Cases)                  │
├─────────────────────────────────────────┤
│             Domain Layer                │
│         (Entities, Interfaces)          │
├─────────────────────────────────────────┤
│           Infrastructure Layer          │
│    (Repositories, Gateways, Services)   │
└─────────────────────────────────────────┘
```

### 2. Domain-Driven Design (DDD)
- **Entities**: Rich classes with domain behavior (`User`, `Encounter`)
- **Value Objects**: Specific types like `DecisionStatus`, `EncounterStatus`
- **Aggregates**: Entities that control the lifecycle of other related entities
- **Domain Services**: Domain logic that doesn't belong to a specific entity

### 3. SOLID Principles

#### Single Responsibility Principle (SRP)
- **Use Cases**: Each use case has a single specific responsibility
- **Repositories**: Each repository manages only one entity
- **Services**: Specialized services for specific operations

#### Open/Closed Principle (OCP)
- **Interfaces**: Extension through interfaces, not modification of existing code
- **Strategy Pattern**: Interchangeable implementations via dependency injection

#### Liskov Substitution Principle (LSP)
- **Repository Pattern**: Prisma, In-Memory, and Facade implementations are interchangeable
- **Service Interfaces**: Different implementations can be substituted without breaking functionality

#### Interface Segregation Principle (ISP)
- **Specific interfaces**: Each interface has methods related only to its responsibility
- **Builder Interfaces**: Specific interfaces for complex object construction

#### Dependency Inversion Principle (DIP)
- **Dependency Injection**: Dependencies injected through interfaces
- **Repository Abstraction**: Use cases depend on abstractions, not concrete implementations

## Detailed Layer Structure

### 1. Presentation Layer (Controllers & DTOs)

```typescript
// Standard controller structure
@Controller('drg')
export class DRGController {
  constructor(
    private readonly listDRGsUsecase: ListDRGsUsecase,
    private readonly createDRGUsecase: CreateDRGUsecase
  ) {}
  
  @Post()
  async create(@Body() dto: DRGInputDTO) {
    return this.createDRGUsecase.execute(dto);
  }
}
```

**Responsibilities:**
- Input reception and validation
- DTO transformation to use case inputs
- Response serialization
- HTTP error handling

### 2. Application Layer (Use Cases)

```typescript
// Use Case pattern
@Injectable()
export class CreateDRGUsecase {
  constructor(
    @Inject(DRG_REPOSITORY) private readonly drgRepository: DRGRepository,
    @Inject(ENCOUNTER_REPOSITORY) private readonly encounterRepository: EncounterRepository
  ) {}

  async execute(input: CreateDRGInput): Promise<CreateDRGOutput> {
    // Application logic
    const encounter = await this.getEncounter(input.encounterId);
    const drg = await this.drgRepository.create(new DRG(input));
    await this.moveEncounterToInProgress(encounter);
    return drg;
  }
}
```

**Use Case Characteristics:**
- Single specific responsibility
- Orchestration of entities and services
- Business rule validation
- Transactions and atomic operations
- Structured logging with context

### 3. Domain Layer (Entities & Domain Logic)

```typescript
// Rich entity with behavior
export class DRG implements DRGProps {
  // Domain behaviors
  isActive(): boolean {
    return (!this.isDeleted() && !this.isRefused()) || this.isRestored();
  }

  accept() {
    this.decisionStatus = 'ACCEPTED';
  }

  refuse() {
    this.decisionStatus = 'REFUSED';
    this.userRestoredAt = null;
  }
}
```

**Entity Characteristics:**
- **Encapsulation**: State and behavior together
- **Invariants**: Business rule validation
- **Domain methods**: Operations that make sense in the business context
- **Immutability**: When appropriate, objects are immutable

### 4. Infrastructure Layer

#### Repository Pattern

```typescript
// Interface (Domain Layer)
export interface DRGRepository {
  find(encounterId: string): Promise<DRG[]>;
  create(drg: DRG): Promise<DRG>;
  update(drg: DRG): Promise<DRG>;
}

// Prisma implementation (Infrastructure Layer)
@Injectable()
export class PrismaDRGRepository implements DRGRepository {
  constructor(private database: PrismaDatabaseService) {}
  
  async create(drg: DRG): Promise<DRG> {
    const data = await this.database.dRG.create({
      data: mapDomainToPrismaDrg(drg)
    });
    return mapPrismaDrgToDomain(data);
  }
}

// In-Memory implementation (For testing)
export class InMemoryDRGRepository implements DRGRepository {
  constructor(private database: InMemoryDatabase) {}
  
  async create(drg: DRG): Promise<DRG> {
    this.database.drgs.push(drg);
    return drg;
  }
}
```

#### Gateway Pattern

```typescript
@Injectable()
export class ThirdPartyEncounterGateway {
  constructor(private readonly thirdPartyGateway: ThirdPartyGateway) {}

  async findById(id: string, requestId?: string): Promise<EncounterR4> {
    return this.thirdPartyGateway.request<EncounterR4>(
      `Encounter/${removeIdPrefix(id)}`,
      undefined,
      requestId
    );
  }
}
```

#### Builder Pattern

```typescript
@Injectable()
export class ThirdPartyGenerateDrgInputBuilder implements GenerateDRGInputBuider {
  async build({encounter, icds, patientData}: BuildArgs): Promise<GenerateDRGInput> {
    const patient = await this.buildPatient(encounter, patientData);
    const primary = this.getPrimaryICD(icds);
    
    return new GenerateDRGInput({
      encounterId: encounter.id,
      patient,
      primaryDiagnosis: this.icdToAIDiagnosis(primary),
      secondaryDiagnoses: secondary.map(this.icdToAIDiagnosis),
    });
  }
}
```

## Service Orchestration and Dependencies

### Dependency Injection Strategy

```typescript
// repositories.module.ts
@Module({
  providers: [
    {
      provide: DRG_REPOSITORY,
      useClass: PrismaDRGRepository, // Can be easily substituted
    },
    {
      provide: AI_REPOSITORY,
      useClass: RestAIRepository,
    },
    {
      provide: ENCOUNTER_REPOSITORY,
      useClass: FacadeEncounterRepository, // Facade that combines multiple sources
    }
  ],
  exports: [DRG_REPOSITORY, AI_REPOSITORY, ENCOUNTER_REPOSITORY]
})
export class RepositoriesModule {}
```

### Facade Pattern for Data Aggregation

```typescript
// Combines data from different sources
@Injectable()
export class FacadeEncounterRepository implements EncounterRepository {
  constructor(
    private prismaRepository: PrismaEncounterRepository,
    private thirdPartyGateway: ThirdPartyEncounterGateway
  ) {}

  async findById(id: string): Promise<Encounter> {
    // Combines local database data with FHIR data
    const localData = await this.prismaRepository.findById(id);
    const thirdPartyData = await this.thirdPartyGateway.findById(id);
    return this.mergeData(localData, thirdPartyData);
  }
}
```

## Testing Strategy

### 1. Isolated Test Architecture

```typescript
// Test pattern with SUT (System Under Test)
function buildSut() {
  const inMemoryDatabase = buildDatabase();
  const sut = new CreateDRGUsecase(
    new VoidLogger(), // Logger mock
    new InMemoryDRGRepository(inMemoryDatabase),
    new InMemoryEncounterRepository(inMemoryDatabase),
    new InMemoryUserRepository(inMemoryDatabase)
  );
  return { sut, inMemoryDatabase };
}

describe('CreateDRGUsecase', () => {
  it('should create a DRG', async () => {
    const { sut, inMemoryDatabase } = buildSut();
    const output = await sut.execute(input);
    
    const drg = inMemoryDatabase.findById('drgs', output.id);
    expect(drg.code).toBe(input.code);
  });
});
```

### 2. In-Memory Database for Testing

```typescript
export class InMemoryDatabase {
  drgs: DRG[] = [];
  encounters: Encounter[] = [];
  users: User[] = [];

  findById<T = any>(key: keyof InMemoryDatabase, id: string): T {
    const list = this[key] as any[];
    return list?.find?.((item: any) => item.id === id);
  }
}
```

### 3. Fake Implementations

```typescript
// Fake services for integration testing
export class FakeCheckEncounterWeightDiffService 
  implements CheckEncounterWeightDiffService {
  
  async execute(encounterId: string): Promise<boolean> {
    return true; // Controlled behavior for testing
  }
}
```

### 4. Coverage Strategy

**Included in Coverage:**
- Use Cases (business logic)
- Entities (domain behaviors)
- Services (application logic)
- Helpers and utilities

**Excluded from Coverage:**
- Controllers (orchestration only)
- DTOs (data structures only)
- Modules (configuration only)
- Mappers (simple transformation)

## Implemented Design Patterns

### 1. Repository Pattern
- **Data abstraction**: Interfaces for different data sources
- **Testability**: In-memory implementations for testing
- **Flexibility**: Easy switching between implementations

### 2. Gateway Pattern
- **External integration**: Encapsulation of external APIs (FHIR)
- **Protocol abstraction**: Hides communication complexity
- **Resilience**: Centralized network error handling

### 3. Builder Pattern
- **Complex construction**: Objects with multiple dependencies
- **Flexibility**: Different construction strategies
- **Single responsibility**: Each builder has a specific responsibility

### 4. Facade Pattern
- **Data aggregation**: Combines multiple data sources
- **Simplification**: Single interface for complex operations
- **Decoupling**: Clients don't need to know multiple interfaces

### 5. Strategy Pattern
- **Interchangeable algorithms**: Different implementations via DI
- **Extensibility**: New algorithms without modifying existing code

### 6. Factory Method
- **Object creation**: DTOs with factory methods (`create()`)
- **Encapsulation**: Encapsulated creation logic

## Error Handling and Logging

### Exception Hierarchy

```typescript
export class AppHttpException extends HttpException {
  constructor(status: HttpStatus, error: Error) {
    super(error.message, status);
  }
}
```

### Structured Logging

```typescript
@Injectable()
export class DefaultLogger implements LoggerService {
  private context: string;
  private requestId?: string;

  log(...messages: MessageType[]) {
    const message = this.createMessage(
      { level: 'LOG', mainColor: Color.GREEN },
      this.formatMessagesToString(...messages)
    );
    process.stdout.write(message + '\n');
  }
}
```

**Logging Characteristics:**
- **Request ID**: Request tracking
- **Context**: Class/operation identification
- **Structured levels**: LOG, WARN, ERROR, DEBUG, etc.
- **Colored formatting**: For local environment
- **Transient scope**: New instance per context

## Data Validation and Transformation

### DTO Pattern with Validation

```typescript
export class DRGInputDTO {
  @ApiProperty({ description: 'DRG code' })
  code: string;

  @ApiProperty({ description: 'DRG Weight' })
  weight: number;

  static create(data: DRGInputDTO) {
    return Object.assign(new this(), data);
  }
}
```

### Mappers for Transformation

```typescript
// Clear separation between domain and persistence
export function mapPrismaDrgToDomain(prismaDrg: PrismaDRGWithIncludes): DRG {
  return new DRG({
    ...prismaDrg,
    evidence: prismaDrg.evidence as object,
    drgRefusedReason: prismaDrg.drgRefusedReason?.length > 0 
      ? mapPrismaDrgRefusedReasonToDomain(getLastDrgRefusedReason(prismaDrg.drgRefusedReason))
      : undefined,
  });
}

export function mapDomainToPrismaDrg(drg: DRG): PrismaDRG {
  return {
    id: drg.id,
    code: drg.code,
    // ... other fields
  };
}
```

## Authentication and Authorization (must have the refresh token logic)

### Guard Pattern

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers?.['authorization']?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['userId'] = payload.sub;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

### Role-Based Access Control

```typescript
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
```

## Background Processing and Queues

### Queue Pattern

```typescript
// Asynchronous processing of heavy operations
export class BuildRetroEncounterDataQueue {
  async process(data: BuildRetroEncounterDataInput) {
    // Background processing
    await this.buildRetroEncounterDataUsecase.execute(data);
  }
}
```

### Service Orchestration

```typescript
// Multiple service orchestration
@Injectable()
export class FinishRetrospectiveServiceImpl implements FinishRetrospectiveService {
  constructor(
    @Inject(RETROSPECTIVE_REPOSITORY) private retrospectiveRepository: RetrospectiveRepository,
    @Inject(ENCOUNTER_REPOSITORY) private encounterRepository: EncounterRepository
  ) {}

  async execute(retrospectiveId: string): Promise<void> {
    const retrospective = await this.retrospectiveRepository.findById(retrospectiveId);
    const encounters = await this.encounterRepository.findByRetrospectiveId(retrospectiveId);
    
    // Orchestration logic
    retrospective.finish();
    await this.retrospectiveRepository.update(retrospective);
  }
}
```

## Architectural Conclusions

### Benefits of Current Architecture

1. **Testability**: Easy creation of isolated tests with in-memory implementations
2. **Maintainability**: Clear separation of responsibilities and low coupling
3. **Extensibility**: New features can be added without modifying existing code
4. **Flexibility**: Different implementations can be easily substituted
5. **Clarity**: Self-documented code following established patterns

### Quality Patterns

1. **Dependency Inversion**: Use cases depend on abstractions, not implementations
2. **Single Responsibility**: Each class has a well-defined responsibility
3. **Interface Segregation**: Specific and cohesive interfaces
4. **Composition over Inheritance**: Favor composition for code reuse
5. **Fail Fast**: Early validations and explicit error handling

### Quality Metrics

- **Low coupling**: Independent modules
- **High cohesion**: Related functionalities grouped together
- **Testability**: >80% coverage in business layers
- **Readability**: Self-explanatory code with consistent naming
- **Maintainability**: Localized changes and controlled impact
