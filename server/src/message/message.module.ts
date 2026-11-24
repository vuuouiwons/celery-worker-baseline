import { Module } from "@nestjs/common";
import { RabbitmqModule } from "../rabbitmq/rabbitmq.module";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";

@Module({
  imports: [RabbitmqModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
