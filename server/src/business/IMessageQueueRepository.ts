import { MessageItem } from "./Message.js";

export interface IMessageQueueRepository {
  publish(messageItem: MessageItem, taskName?: string): Promise<void>;
  publishBatch(messageItems: MessageItem[], taskName?: string): Promise<void>;
}
