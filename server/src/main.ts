import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import appConfig from "./config/app.config";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  const port = config.port;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Celery Feature Tester API")
    .setDescription(
      "A NestJS backend that dispatches Celery-compatible task messages to RabbitMQ."
    )
    .setVersion("1.0.0")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document, {
    jsonDocumentUrl: "openapi.json",
  });

  app.enableShutdownHooks();

  await app.listen(port);
}

bootstrap();
