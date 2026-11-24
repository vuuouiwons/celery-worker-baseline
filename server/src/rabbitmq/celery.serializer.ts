import { ReadPacket, Serializer } from "@nestjs/microservices";
import { MessageItem } from "../message/interfaces/message.interface";

type CelerySerializedPacket = [
  [Record<string, string>],
  Record<string, never>,
  {
    callbacks: null;
    errbacks: null;
    chain: null;
    chord: null;
  },
] & {
  options?: {
    contentType: string;
    contentEncoding: string;
    correlationId: string;
    persistent: boolean;
    headers: Record<string, unknown>;
  };
};

export class CelerySerializer
  implements Serializer<ReadPacket<MessageItem>, CelerySerializedPacket>
{
  serialize(packet: ReadPacket<MessageItem>): CelerySerializedPacket {
    const item = packet.data;
    const taskName = String(packet.pattern);
    const payload: Record<string, string> = {
      message: `${item.content} [UUID: ${item.id}]`,
    };

    // Celery v2 AMQP body: [args, kwargs, embed]
    const celeryBody: CelerySerializedPacket = [
      [payload],
      {},
      {
        callbacks: null,
        errbacks: null,
        chain: null,
        chord: null,
      },
    ];

    // ClientRMQ extracts and deletes `.options` before JSON.stringify(celeryBody)
    celeryBody.options = {
      contentType: "application/json",
      contentEncoding: "utf-8",
      correlationId: item.id,
      persistent: true,
      headers: {
        lang: "py",
        task: taskName,
        id: item.id,
        root_id: item.id,
        parent_id: null,
        group: null,
        group_index: null,
        argsrepr: JSON.stringify([payload]),
        kwargsrepr: "{}",
        origin: "nestjs-server",
        retries: 0,
        timelimit: [null, null],
        eta: null,
        expires: null,
        ignore_result: true,
      },
    };

    return celeryBody;
  }
}
