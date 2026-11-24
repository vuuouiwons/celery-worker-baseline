import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { MessageModule } from "./message/message.module";

@Module({
  imports: [AppConfigModule, MessageModule],
})
export class AppModule {}
