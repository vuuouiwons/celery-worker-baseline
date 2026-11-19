# Celery Feature Tester

A lightweight, end-to-end testing suite for Python Celery features with a TypeScript Hono backend, RabbitMQ message broker, and Python Celery worker.

---

## Architecture Overview

Strict **3-Layer Architecture** (`Presentation` -> `Business Logic` -> `Data Access`) enforced without path aliases:

```text
├── client/                     # Simple client curl scripts and documentation
│   ├── publish.sh              # Shell script for /message/publish (Task One)
│   ├── publish.bat             # Windows CMD script for /message/publish (Task One)
│   ├── publish-two.sh          # Shell script for /message/publish-two (Task Two)
│   ├── publish-two.bat         # Windows CMD script for /message/publish-two (Task Two)
│   └── README.md
├── server/                     # Hono backend (managed via pnpm)
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── presentation/       # MessageController, MessageRoutes, Request/Response DTOs
│       ├── business/           # MessageService, Message domain model, IMessageQueueRepository
│       ├── data/               # RabbitMQMessageRepository (Celery v2 protocol publisher)
│       ├── shared/             # Custom errors, queue constants (TASK_NAME_ONE, TASK_NAME_TWO)
│       └── index.ts            # Composition root & HTTP server entrypoint
├── worker/                     # Python Celery worker (managed via uv)
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── uv.lock
│   └── app.py                  # Celery application, process_message_one & process_message_two tasks
├── docker-compose.yml          # Multi-container orchestration
└── AGENTS.md                   # Architectural guidelines & conventions
```

---

## Quickstart with Docker Compose

1. **Start all services**:
   ```bash
   docker compose up --build
   ```

2. **Access Endpoints**:
   - **Swagger UI Documentation**: [http://localhost:3000/docs](http://localhost:3000/docs)
   - **OpenAPI JSON Spec**: [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json)
   - **RabbitMQ Management Dashboard**: [http://localhost:15672](http://localhost:15672) *(User: `guest`, Pass: `guest`)*

---

## Available Publishing Endpoints

- **`POST /message/publish-one`** (or `/message/publish`): Dispatches tasks to `process_message_one`.
- **`POST /message/publish-two`**: Dispatches tasks to `process_message_two`.

### Examples

**Task One:**
```bash
curl -X POST http://localhost:3000/message/publish-one \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Task One", "amount": 3}'
```

**Task Two:**
```bash
curl -X POST http://localhost:3000/message/publish-two \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Task Two", "amount": 3}'
```

---

## Observing Celery Worker Output

Stream worker container stdout logs:
```bash
docker compose logs -f worker
```

Output:
```text
celery-worker  | [CELERY WORKER ONE RECEIVED]: Hello Task One [UUID: 6e30a7af-6aaf-448e-ab4f-a93bf154ac6b]
celery-worker  | [CELERY WORKER TWO RECEIVED]: Hello Task Two [UUID: 9c58d259-de2c-4a39-9776-97bf9c0aac08]
```
