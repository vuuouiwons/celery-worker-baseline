import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import dotenv from "dotenv";
import { MessageService } from "./business/MessageService.js";
import { RabbitMQMessageRepository } from "./data/RabbitMQMessageRepository.js";
import { MessageController } from "./presentation/MessageController.js";
import { registerMessageRoutes } from "./presentation/MessageRoutes.js";
import { AppError } from "./shared/errors/AppError.js";

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const rabbitmqUrl =
  process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

// Composition Root (Dependency Injection)
const rabbitmqRepository = new RabbitMQMessageRepository(rabbitmqUrl);
const messageService = new MessageService(rabbitmqRepository);
const messageController = new MessageController(messageService);

const app = new OpenAPIHono();

// Global Error Handler Middleware
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.statusCode as any
    );
  }

  console.error("[ServerError]:", err);
  return c.json(
    {
      success: false,
      error: err.message || "Internal Server Error",
    },
    500
  );
});

// Register Domain Routes
registerMessageRoutes(app, messageController);

// OpenAPI JSON documentation endpoint
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Celery Feature Tester API",
    version: "1.0.0",
    description:
      "A Hono backend that dispatches Celery-compatible task messages to RabbitMQ.",
  },
});

// Swagger UI documentation endpoint
app.get("/docs", swaggerUI({ url: "/openapi.json" }));

// Root healthcheck/redirect
app.get("/", (c) =>
  c.json({
    name: "Celery Feature Tester API",
    docs: "/docs",
    publishEndpoint: "/message/publish",
  })
);

console.log(`[Server] Starting Hono backend on port ${port}...`);
console.log(`[Server] Swagger documentation available at http://localhost:${port}/docs`);

serve({
  fetch: app.fetch,
  port,
});
