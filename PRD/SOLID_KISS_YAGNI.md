# Engineering Guidelines (SOLID Principles in NestJS)

This document defines the **SOLID principles** that must be followed when generating or reviewing NestJS code. The goal is to ensure clarity, maintainability, and scalability.

---

## 1. Single Responsibility Principle (SRP)

* A class/module should have **one reason to change**.

```typescript
// Bad: UserService handles both user logic and email notifications
@Injectable()
export class UserService {
  createUser(name: string) {
    console.log(`User created: ${name}`);
    this.sendEmail(name);
  }

  private sendEmail(name: string) {
    console.log(`Sending email to ${name}`);
  }
}

// Good: Separate responsibilities
@Injectable()
export class UserService {
  createUser(name: string) {
    console.log(`User created: ${name}`);
  }
}

@Injectable()
export class EmailService {
  sendWelcomeEmail(name: string) {
    console.log(`Sending email to ${name}`);
  }
}
```

---

## 2. Open/Closed Principle (OCP)

* Code should be **open for extension** but **closed for modification**.

```typescript
// Bad: Modifying the method every time we add a new discount type
function calculateDiscount(type: string, price: number): number {
  if (type === 'student') return price * 0.9;
  if (type === 'vip') return price * 0.8;
  return price;
}

// Good: Extend with new strategies without modifying existing code
export interface DiscountStrategy {
  apply(price: number): number;
}

export class StudentDiscount implements DiscountStrategy {
  apply(price: number) {
    return price * 0.9;
  }
}

export class VipDiscount implements DiscountStrategy {
  apply(price: number) {
    return price * 0.8;
  }
}

function calculateDiscount(strategy: DiscountStrategy, price: number) {
  return strategy.apply(price);
}
```

---

## 3. Liskov Substitution Principle (LSP)

* Subtypes must be **substitutable** for their base types.

```typescript
// Bad: Violates substitution because Square breaks Rectangle expectations
class Rectangle {
  constructor(public width: number, public height: number) {}
  area(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  constructor(size: number) { super(size, size); }
  // Mutating width or height independently breaks behavior
}

// Good: Use interface to keep contracts consistent
interface Shape {
  area(): number;
}

class Rectangle2 implements Shape {
  constructor(public width: number, public height: number) {}
  area(): number { return this.width * this.height; }
}

class Square2 implements Shape {
  constructor(public size: number) {}
  area(): number { return this.size * this.size; }
}
```

---

## 4. Interface Segregation Principle (ISP)

* Clients should not depend on methods they don’t use.

```typescript
// Bad: Forcing all classes to implement unused methods
interface Machine {
  print(): void;
  scan(): void;
  fax(): void;
}

class Printer implements Machine {
  print() { console.log('Printing...'); }
  scan() { throw new Error('Not supported'); }
  fax() { throw new Error('Not supported'); }
}

// Good: Split into smaller interfaces
interface Printer {
  print(): void;
}

interface Scanner {
  scan(): void;
}

class SimplePrinter implements Printer {
  print() { console.log('Printing...'); }
}
```

---

## 5. Dependency Inversion Principle (DIP)

* Depend on **abstractions**, not on concrete implementations.

```typescript
// Bad: High-level module depends on low-level implementation
@Injectable()
export class UserService {
  private db = new MySQLDatabase();

  createUser(name: string) {
    this.db.save(name);
  }
}

class MySQLDatabase {
  save(data: string) {
    console.log('Saving to MySQL:', data);
  }
}

// Good: High-level depends on abstraction
export interface Database {
  save(data: string): void;
}

@Injectable()
export class MySQLDatabase implements Database {
  save(data: string) {
    console.log('Saving to MySQL:', data);
  }
}

@Injectable()
export class UserService {
  constructor(private readonly db: Database) {}

  createUser(name: string) {
    this.db.save(name);
  }
}
```

---

## Final Notes

When writing NestJS code with **SOLID principles**:

* **SRP**: Keep each class/service focused on one responsibility.
* **OCP**: Extend functionality without modifying existing code.
* **LSP**: Ensure subclasses respect contracts of their base.
* **ISP**: Prefer small, specific interfaces.
* **DIP**: Rely on abstractions, not concrete implementations.

This ensures generated code is **scalable, testable, and maintainable**.
