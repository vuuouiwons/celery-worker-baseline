import { Injectable } from "@nestjs/common";
import {
  TASK_NAME_ONE,
  TASK_NAME_TWO,
} from "../common/constants/queue.constants";
import { ValidationException } from "../common/exceptions/app.exception";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { MessageItem } from "./interfaces/message.interface";

@Injectable()
export class MessageService {
  constructor(private readonly rabbitmqService: RabbitmqService) {}

  private validateAndGenerate(content: string, amount: number): MessageItem[] {
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      throw new ValidationException(
        "Message content is required and cannot be empty."
      );
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new ValidationException("Amount must be a positive integer.");
    }

    const messages: MessageItem[] = [];
    for (let i = 0; i < amount; i++) {
      messages.push({
        id: crypto.randomUUID(),
        content: content.trim(),
        createdAt: new Date(),
      });
    }

    return messages;
  }

  async publishMessagesOne(
    content: string,
    amount: number
  ): Promise<MessageItem[]> {
    const messages = this.validateAndGenerate(content, amount);
    await this.rabbitmqService.publishBatch(messages, TASK_NAME_ONE);
    return messages;
  }

  async publishMessages(
    content: string,
    amount: number
  ): Promise<MessageItem[]> {
    return this.publishMessagesOne(content, amount);
  }

  async publishMessagesTwo(
    content: string,
    amount: number
  ): Promise<MessageItem[]> {
    const messages = this.validateAndGenerate(content, amount);
    await this.rabbitmqService.publishBatch(messages, TASK_NAME_TWO);
    return messages;
  }
}
