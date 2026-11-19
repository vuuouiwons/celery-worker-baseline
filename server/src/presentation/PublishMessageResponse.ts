import { z } from "@hono/zod-openapi";

export const MessageItemResponseSchema = z
  .object({
    id: z.string().uuid().openapi({
      example: "d3b07384-d113-494b-9c80-e188f8e41829",
      description: "Unique UUID attached to the message",
    }),
    content: z.string().openapi({
      example: "Hello from Celery feature tester",
      description: "Message content",
    }),
    createdAt: z.string().datetime().openapi({
      example: "2026-11-19T15:00:00.000Z",
      description: "Timestamp when the message was dispatched",
    }),
  })
  .openapi("MessageItemResponse");

export const PublishMessageResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    publishedCount: z.number().openapi({
      example: 5,
      description: "Total messages successfully queued",
    }),
    messages: z.array(MessageItemResponseSchema).openapi({
      description: "List of published message items with UUIDs",
    }),
  })
  .openapi("PublishMessageResponse");

export const ErrorResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: false }),
    error: z.string().openapi({ example: "Invalid request payload" }),
  })
  .openapi("ErrorResponse");

export type PublishMessageResponse = z.infer<typeof PublishMessageResponseSchema>;
