import { z } from "@hono/zod-openapi";

export const PublishMessageRequestSchema = z
  .object({
    message: z
      .string()
      .min(1, "Message cannot be empty")
      .openapi({
        example: "Hello from Celery feature tester",
        description: "The message payload to send to the Celery worker",
      }),
    amount: z
      .number()
      .int("Amount must be an integer")
      .positive("Amount must be greater than 0")
      .openapi({
        example: 5,
        description: "Number of identical messages with unique UUIDs to publish",
      }),
  })
  .openapi("PublishMessageRequest");

export type PublishMessageRequest = z.infer<typeof PublishMessageRequestSchema>;
