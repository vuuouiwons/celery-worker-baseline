import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { MessageController } from "./MessageController.js";
import { PublishMessageRequestSchema } from "./PublishMessageRequest.js";
import {
  ErrorResponseSchema,
  PublishMessageResponseSchema,
} from "./PublishMessageResponse.js";

export const publishMessageOneRoute = createRoute({
  method: "post",
  path: "/message/publish-one",
  summary: "Publish messages to process_message_one task",
  description:
    "Accepts a message string and an amount. Attaches unique UUIDs and publishes them to RabbitMQ for process_message_one task.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PublishMessageRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PublishMessageResponseSchema,
        },
      },
      description: "Messages successfully queued for process_message_one",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Validation error or invalid request body",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Internal server or queue communication error",
    },
  },
});

export const publishMessageTwoRoute = createRoute({
  method: "post",
  path: "/message/publish-two",
  summary: "Publish messages to process_message_two task",
  description:
    "Accepts a message string and an amount. Attaches unique UUIDs and publishes them to RabbitMQ for process_message_two task.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PublishMessageRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PublishMessageResponseSchema,
        },
      },
      description: "Messages successfully queued for process_message_two",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Validation error or invalid request body",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Internal server or queue communication error",
    },
  },
});

export function registerMessageRoutes(
  app: OpenAPIHono,
  controller: MessageController
): void {
  app.openapi(publishMessageOneRoute, controller.publishOne);
  app.openapi(publishMessageTwoRoute, controller.publishTwo);
}
