import { Module } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import {
  DEFAULT_QUEUE,
  RABBITMQ_CLIENT,
} from "../common/constants/queue.constants";
import rabbitmqConfig from "../config/rabbitmq.config";
import { CelerySerializer } from "./celery.serializer";
import { RabbitmqService } from "./rabbitmq.service";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_CLIENT,
        inject: [rabbitmqConfig.KEY],
        useFactory: (config: ConfigType<typeof rabbitmqConfig>) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.url],
            queue: DEFAULT_QUEUE,
            queueOptions: {
              durable: true,
            },
            persistent: true,
            serializer: new CelerySerializer(),
          },
        }),
      },
    ]),
  ],
  providers: [RabbitmqService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
