import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import {
  RABBITMQ_CLIENT,
  TASK_NAME_ONE,
} from "../common/constants/queue.constants";
import { QueueException } from "../common/exceptions/app.exception";
import { MessageItem } from "../message/interfaces/message.interface";

@Injectable()
export class RabbitmqService implements OnModuleDestroy {
  constructor(
    @Inject(RABBITMQ_CLIENT)
    private readonly client: ClientProxy
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  async publish(
    messageItem: MessageItem,
    taskName: string = TASK_NAME_ONE
  ): Promise<void> {
    try {
      await lastValueFrom(this.client.emit(taskName, messageItem));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new QueueException(`Failed to publish message to RabbitMQ: ${message}`);
    }
  }

  async publishBatch(
    messageItems: MessageItem[],
    taskName: string = TASK_NAME_ONE
  ): Promise<void> {
    try {
      for (const item of messageItems) {
        await lastValueFrom(this.client.emit(taskName, item));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new QueueException(`Failed to publish batch to RabbitMQ: ${message}`);
    }
  }
}
