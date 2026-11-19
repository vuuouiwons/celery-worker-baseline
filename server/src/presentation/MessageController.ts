import { RouteHandler } from "@hono/zod-openapi";
import { MessageService } from "../business/MessageService.js";
import {
  publishMessageOneRoute,
  publishMessageTwoRoute,
} from "./MessageRoutes.js";

export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  publishOne: RouteHandler<typeof publishMessageOneRoute> = async (c) => {
    const { message, amount } = c.req.valid("json");
    const domainMessages = await this.messageService.publishMessagesOne(
      message,
      amount
    );

    return c.json(
      {
        success: true,
        publishedCount: domainMessages.length,
        messages: domainMessages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
        })),
      },
      200
    );
  };

  publishTwo: RouteHandler<typeof publishMessageTwoRoute> = async (c) => {
    const { message, amount } = c.req.valid("json");
    const domainMessages = await this.messageService.publishMessagesTwo(
      message,
      amount
    );

    return c.json(
      {
        success: true,
        publishedCount: domainMessages.length,
        messages: domainMessages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
        })),
      },
      200
    );
  };
}
