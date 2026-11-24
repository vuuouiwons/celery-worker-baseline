import { ApiProperty } from "@nestjs/swagger";

export class MessageItemResponseDto {
  @ApiProperty({
    example: "d3b07384-d113-494b-9c80-e188f8e41829",
    description: "Unique UUID attached to the message",
  })
  id!: string;

  @ApiProperty({
    example: "Hello from Celery feature tester",
    description: "Message content",
  })
  content!: string;

  @ApiProperty({
    example: "2026-11-19T15:00:00.000Z",
    description: "Timestamp when the message was dispatched",
  })
  createdAt!: string;
}

export class PublishMessageResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({
    example: 5,
    description: "Total messages successfully queued",
  })
  publishedCount!: number;

  @ApiProperty({
    type: [MessageItemResponseDto],
    description: "List of published message items with UUIDs",
  })
  messages!: MessageItemResponseDto[];
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success!: boolean;

  @ApiProperty({ example: "Invalid request payload" })
  error!: string;
}
