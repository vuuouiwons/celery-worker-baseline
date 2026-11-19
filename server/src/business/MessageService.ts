import {
  TASK_NAME_ONE,
  TASK_NAME_TWO,
} from "../shared/constants/queue.constants.js";
import { ValidationError } from "../shared/errors/AppError.js";
import { IMessageQueueRepository } from "./IMessageQueueRepository.js";
import { MessageItem } from "./Message.js";

export class MessageService {
  constructor(private readonly queueRepository: IMessageQueueRepository) {}

  private validateAndGenerate(content: string, amount: number): MessageItem[] {
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      throw new ValidationError("Message content is required and cannot be empty.");
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new ValidationError("Amount must be a positive integer.");
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

  async publishMessagesOne(content: string, amount: number): Promise<MessageItem[]> {
    const messages = this.validateAndGenerate(content, amount);
    await this.queueRepository.publishBatch(messages, TASK_NAME_ONE);
    return messages;
  }

  // Alias for backward compatibility
  async publishMessages(content: string, amount: number): Promise<MessageItem[]> {
    return this.publishMessagesOne(content, amount);
  }

  async publishMessagesTwo(content: string, amount: number): Promise<MessageItem[]> {
    const messages = this.validateAndGenerate(content, amount);
    await this.queueRepository.publishBatch(messages, TASK_NAME_TWO);
    return messages;
  }
}
