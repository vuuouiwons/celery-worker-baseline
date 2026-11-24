import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PublishMessageDto } from "./dto/publish-message.dto";
import {
  ErrorResponseDto,
  PublishMessageResponseDto,
} from "./dto/publish-message-response.dto";
import { MessageItem } from "./interfaces/message.interface";
import { MessageService } from "./message.service";

@ApiTags("Messages")
@Controller("message")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  private toResponseDto(
    domainMessages: MessageItem[]
  ): PublishMessageResponseDto {
    return {
      success: true,
      publishedCount: domainMessages.length,
      messages: domainMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      })),
    };
  }

  @Post("publish-one")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Publish messages to process_message_one task",
    description:
      "Accepts a message string and an amount. Attaches unique UUIDs and publishes them to RabbitMQ for process_message_one task.",
  })
  @ApiResponse({
    status: 200,
    type: PublishMessageResponseDto,
    description: "Messages successfully queued for process_message_one",
  })
  @ApiResponse({
    status: 400,
    type: ErrorResponseDto,
    description: "Validation error or invalid request body",
  })
  @ApiResponse({
    status: 500,
    type: ErrorResponseDto,
    description: "Internal server or queue communication error",
  })
  async publishOne(
    @Body() dto: PublishMessageDto
  ): Promise<PublishMessageResponseDto> {
    const messages = await this.messageService.publishMessagesOne(
      dto.message,
      dto.amount
    );
    return this.toResponseDto(messages);
  }

  @Post("publish-two")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Publish messages to process_message_two task",
    description:
      "Accepts a message string and an amount. Attaches unique UUIDs and publishes them to RabbitMQ for process_message_two task.",
  })
  @ApiResponse({
    status: 200,
    type: PublishMessageResponseDto,
    description: "Messages successfully queued for process_message_two",
  })
  @ApiResponse({
    status: 400,
    type: ErrorResponseDto,
    description: "Validation error or invalid request body",
  })
  @ApiResponse({
    status: 500,
    type: ErrorResponseDto,
    description: "Internal server or queue communication error",
  })
  async publishTwo(
    @Body() dto: PublishMessageDto
  ): Promise<PublishMessageResponseDto> {
    const messages = await this.messageService.publishMessagesTwo(
      dto.message,
      dto.amount
    );
    return this.toResponseDto(messages);
  }
}
