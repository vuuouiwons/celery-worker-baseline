# AGENTS.md — Official NestJS Architecture & Coding Conventions

## Project Overview
This codebase strictly follows the **official NestJS documentation architecture** (`Modules`, `Controllers`, `Providers/Services`, `DTOs`, `Interfaces`, and `Common` cross-cutting concerns). All generated, refactored, or reviewed server code must adhere to official NestJS conventions and module boundaries.

---

## Directory Structure
Follow the official NestJS feature-folder layout directly under `src/`:

```text
src/
├── main.ts                                  # Application entry point (NestFactory, ValidationPipe, Filters, Swagger)
├── app.module.ts                            # Root application module
├── app.controller.ts                        # Root controller
├── app.service.ts                           # Root service
├── common/                                  # Shared cross-cutting concerns
│   ├── constants/                           # Shared constants (e.g., queue.constants.ts)
│   ├── exceptions/                          # Custom exceptions (e.g., app.exception.ts)
│   ├── filters/                             # Exception filters (e.g., http-exception.filter.ts)
│   ├── guards/                              # Guards (when needed)
│   ├── interceptors/                        # Interceptors (when needed)
│   ├── middleware/                          # Middleware (when needed)
│   └── pipes/                               # Custom pipes (when needed)
└── <feature>/                               # Feature modules directly under src/ (e.g., message/, rabbitmq/)
    ├── <feature>.module.ts                  # @Module() declaring imports, controllers, providers, exports
    ├── <feature>.controller.ts              # @Controller() handling HTTP requests & Swagger docs
    ├── <feature>.service.ts                 # @Injectable() provider containing business/domain logic
    ├── dto/                                 # Request & Response DTO classes (class-validator + @nestjs/swagger)
    └── interfaces/                          # TypeScript interfaces for domain models & contracts
```

---

## Official NestJS Architectural Rules
1. **Module Encapsulation:** Every domain feature or infrastructure integration is encapsulated in its own `@Module()` folder directly under `src/` (e.g., `src/message/`, `src/rabbitmq/`).
2. **Explicit Imports & Exports:** Modules only share providers explicitly listed in their `exports` array. Feature modules import the modules whose providers they depend on (e.g., `MessageModule` imports `RabbitmqModule`).
3. **Controller -> Service Separation:**
   - Controllers (`*.controller.ts`) handle HTTP routing, request parsing, DTO validation, response mapping, and OpenAPI decorators.
   - Controllers must **never** contain business logic or call infrastructure/database/broker clients directly.
   - Services (`*.service.ts`) encapsulate business logic and orchestration, and must **never** depend on HTTP `Request`/`Response` objects.
4. **DTOs & Validation:**
   - Incoming payloads are typed as DTO classes in `dto/` decorated with `class-validator` and `@nestjs/swagger`, validated globally via `ValidationPipe`.
   - Outgoing responses are mapped to Response DTOs rather than returning raw internal structures.
5. **Exception Handling:**
   - Use NestJS built-in `HttpException` subclasses or custom exceptions under `src/common/exceptions/`, handled uniformly by an `@Catch()` filter in `src/common/filters/`.
6. **Lifecycle Hooks:**
   - Infrastructure providers (e.g., RabbitMQ, database connections) implement NestJS lifecycle hooks (`OnModuleInit`, `OnModuleDestroy`) for clean initialization and graceful shutdown.
7. **No Path Aliases:** Use standard relative imports across the codebase. Do not configure TypeScript `paths` aliases.

---

## Naming Conventions
* **Files:** `kebab-case` with NestJS role suffixes:
  - `<name>.module.ts`
  - `<name>.controller.ts`
  - `<name>.service.ts`
  - `<name>.dto.ts` (inside `dto/`)
  - `<name>.interface.ts` (inside `interfaces/`)
  - `<name>.filter.ts`, `<name>.guard.ts`, `<name>.pipe.ts`, `<name>.interceptor.ts` (inside `common/`)
* **Classes:** `PascalCase` matching the file name (e.g., `MessageController`, `MessageService`, `RabbitmqService`, `PublishMessageDto`).

---

## Agent Workflow & Verification Checklist
Before finalizing any code changes, verify the following:
- [ ] Does each feature/integration live in its own NestJS module folder directly under `src/`?
- [ ] Are providers shared across modules via `@Module({ imports, exports })`?
- [ ] Are controllers thin and delegating exclusively to services?
- [ ] Are DTOs in `dto/` validated with `class-validator` and documented with `@nestjs/swagger`?
- [ ] Are cross-cutting concerns (filters, exceptions, constants) placed in `src/common/`?
- [ ] Are all imports standard relative paths with zero path aliases?
