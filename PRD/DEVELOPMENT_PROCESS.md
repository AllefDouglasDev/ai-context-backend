# Development Process Guidelines

This document describes the **development process** for creating and testing use cases in this project. 
The goal is to ensure that every use case is:

* Framework-agnostic (can be instantiated with `new` outside of NestJS)
* Strictly adheres to **single responsibility** (only one thing)
* Has only one **public method**: `.execute`
* Is always accompanied by a corresponding `.spec.ts` file, written with raw TypeScript and helper classes (no NestJS dependencies)

---

## Entity Rules

### 1. Folder Location

* All entities must be placed inside the `entities/` folder. It can be inside `src/common/entities`, `src/domain/entities/`
or any other folder that belogs to the domain layer.

### 2. No Third-Party Imports

* Entities **must never import third-party libraries**.
* They represent the **core of the application** and must remain framework-agnostic.

### 3. Business Logic

* Entities should contain most of the business logic of the application.
* They represent the domain and enforce invariants.

### 4. Testing

* Each entity must have a `.spec.ts` file.
* Specs should validate the entity’s behavior, ensuring correctness of business logic.

---

## Example Entity

```typescript
export interface UserProps {
  id?: string
  name: string
  email: string
  createdAt?: Date
}

export class User implements UserProps {
  id: string
  name: string
  email: string
  createdAt: Date

  constructor(props: UserProps) {
    this.id = props.id || Math.random().toString(36).substring(2)
    this.name = props.name
    this.email = props.email
    this.createdAt = props.createdAt || new Date()
  }

  changeEmail(newEmail: string) {
    if (!newEmail.includes('@')) {
      throw new Error('Invalid email')
    }
    this.email = newEmail
  }
}
```

---

## Example Entity Test (Spec)

```typescript
import { User } from './user.entity'

describe('User Entity', () => {
  it('should create a user with default values', () => {
    const user = new User({ name: 'Alice', email: 'alice@example.com' })

    expect(user.id).toBeDefined()
    expect(user.createdAt).toBeInstanceOf(Date)
    expect(user.name).toBe('Alice')
  })

  it('should change email when valid', () => {
    const user = new User({ name: 'Alice', email: 'alice@example.com' })
    user.changeEmail('new@example.com')

    expect(user.email).toBe('new@example.com')
  })

  it('should throw an error for invalid email', () => {
    const user = new User({ name: 'Alice', email: 'alice@example.com' })

    expect(() => user.changeEmail('invalid-email')).toThrow('Invalid email')
  })
})
```

---

## Use Case Rules

### 1. Instantiation without NestJS

* A use case must be able to be initialized outside of NestJS by passing its dependencies directly.
* Example:

```typescript
const useCase = new CreateUserUseCase(new UserRepository())
```

### 2. Single Responsibility

* Each use case should handle **exactly one concern**.
* Avoid mixing responsibilities such as logging, validation, and persistence in one class.

### 3. Public API

* The **only public method** should be `.execute(input)`.
* Any other helpers must remain **private**.

### 4. Testing

* Each use case must have a `.spec.ts` file.
* Specs must be written in **plain TypeScript** using only Jest or helper classes.
* **No NestJS modules, decorators, or dependency injection** should be used in the tests.

---

## Example Use Case

```typescript
import { Injectable } from '@nestjs/common'
import { UserRepository } from 'src/repositories/user.repository'
import { User } from 'src/entities/user.entity'

export type CreateUserInput = {
  name: string
  email: string
}

export type CreateUserOutput = User

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const user = new User(input)
    return this.userRepository.save(user)
  }
}
```

---

## Example Test (Spec)

```typescript
import { CreateUserUseCase } from './create-user.usecase'
import { User } from 'src/entities/user.entity'

class InMemoryUserRepository {
  private users: User[] = []

  async save(user: User): Promise<User> {
    this.users.push(user)
    return user
  }
}

function buildSut() {
  const userRepository = new InMemoryUserRepository()
  const sut = new CreateUserUseCase(userRepository)
  return { sut, userRepository }
}

describe('User - CreateUserUseCase', () => {
  it('should create and persist a user', async () => {
    const { sut, userRepository } = buildSut()

    const input = { name: 'Alice', email: 'alice@example.com' }
    const output = await sut.execute(input)

    expect(output).toBeInstanceOf(User)
    expect(output.name).toBe('Alice')
    expect(output.email).toBe('alice@example.com')
  })
})
```

---

## Summary Checklist

* [ ] Use cases can be instantiated with `new`, without NestJS
* [ ] Only one public method: `.execute`
* [ ] Each use case does only **one thing**
* [ ] `.spec.ts` file written with raw TypeScript + Jest helpers
* [ ] No NestJS dependencies in tests
* [ ] Entities live inside `entities/` folder
* [ ] Entities never import third-party libraries
* [ ] Entities hold most of the application’s logic
* [ ] Each entity has its own `.spec.ts` test file
