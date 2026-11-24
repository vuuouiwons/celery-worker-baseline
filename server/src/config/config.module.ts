import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import appConfig from "./app.config";
import rabbitmqConfig from "./rabbitmq.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, rabbitmqConfig],
    }),
  ],
})
export class AppConfigModule {}
