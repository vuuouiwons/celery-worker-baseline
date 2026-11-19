import amqp, { Channel, ChannelModel } from "amqplib";
import { IMessageQueueRepository } from "../business/IMessageQueueRepository.js";
import { MessageItem } from "../business/Message.js";
import {
  DEFAULT_EXCHANGE,
  DEFAULT_QUEUE,
  DEFAULT_ROUTING_KEY,
  TASK_NAME_ONE,
} from "../shared/constants/queue.constants.js";
import { QueueError } from "../shared/errors/AppError.js";

export class RabbitMQMessageRepository implements IMessageQueueRepository {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private isConnecting: boolean = false;

  constructor(private readonly amqpUrl: string) {}

  private async getChannel(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    if (this.isConnecting) {
      while (this.isConnecting) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (this.channel) {
        return this.channel;
      }
    }

    this.isConnecting = true;
    try {
      const conn = await amqp.connect(this.amqpUrl);
      this.connection = conn;
      const ch = await conn.createChannel();
      this.channel = ch;

      // Assert Celery default direct exchange and queue
      await ch.assertExchange(DEFAULT_EXCHANGE, "direct", {
        durable: true,
      });
      await ch.assertQueue(DEFAULT_QUEUE, {
        durable: true,
      });
      await ch.bindQueue(
        DEFAULT_QUEUE,
        DEFAULT_EXCHANGE,
        DEFAULT_ROUTING_KEY
      );

      conn.on("error", (err: Error) => {
        console.error("[RabbitMQ] Connection error:", err.message);
        this.resetConnection();
      });

      conn.on("close", () => {
        console.warn("[RabbitMQ] Connection closed");
        this.resetConnection();
      });

      return ch;
    } catch (error: unknown) {
      this.resetConnection();
      const message = error instanceof Error ? error.message : String(error);
      throw new QueueError(`Failed to connect to RabbitMQ broker: ${message}`);
    } finally {
      this.isConnecting = false;
    }
  }

  private resetConnection(): void {
    this.channel = null;
    this.connection = null;
  }

  private formatCeleryPayload(
    item: MessageItem,
    taskName: string = TASK_NAME_ONE
  ): {
    bodyBuffer: Buffer;
    options: amqp.Options.Publish;
  } {
    // Format message with UUID attached
    const formattedMessage = `${item.content} [UUID: ${item.id}]`;

    // Celery v2 protocol body: [args, kwargs, embed]
    const celeryBody = JSON.stringify([
      [formattedMessage],
      {},
      {
        callbacks: null,
        errbacks: null,
        chain: null,
        chord: null,
      },
    ]);

    const options: amqp.Options.Publish = {
      contentType: "application/json",
      contentEncoding: "utf-8",
      correlationId: item.id,
      deliveryMode: 2, // Persistent
      headers: {
        lang: "py",
        task: taskName,
        id: item.id,
        root_id: item.id,
        parent_id: null,
        group: null,
        group_index: null,
        argsrepr: JSON.stringify([formattedMessage]),
        kwargsrepr: "{}",
        origin: "hono-server",
        retries: 0,
        timelimit: [null, null],
        eta: null,
        expires: null,
        ignore_result: true,
      },
    };

    return {
      bodyBuffer: Buffer.from(celeryBody, "utf-8"),
      options,
    };
  }

  async publish(
    messageItem: MessageItem,
    taskName: string = TASK_NAME_ONE
  ): Promise<void> {
    const channel = await this.getChannel();
    const { bodyBuffer, options } = this.formatCeleryPayload(
      messageItem,
      taskName
    );

    const canContinue = channel.publish(
      DEFAULT_EXCHANGE,
      DEFAULT_ROUTING_KEY,
      bodyBuffer,
      options
    );

    if (!canContinue) {
      // Socket buffer saturated; wait for kernel socket to drain to RabbitMQ
      await new Promise<void>((resolve) => channel.once("drain", resolve));
    }
  }

  async publishBatch(
    messageItems: MessageItem[],
    taskName: string = TASK_NAME_ONE
  ): Promise<void> {
    const channel = await this.getChannel();

    for (const item of messageItems) {
      const { bodyBuffer, options } = this.formatCeleryPayload(
        item,
        taskName
      );
      const canContinue = channel.publish(
        DEFAULT_EXCHANGE,
        DEFAULT_ROUTING_KEY,
        bodyBuffer,
        options
      );

      if (!canContinue) {
        // Handle backpressure by waiting for the socket drain event
        await new Promise<void>((resolve) => channel.once("drain", resolve));
      }
    }
  }
}
