import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class PublishMessageDto {
  @ApiProperty({
    example: "Hello from Celery feature tester",
    description: "The message payload to send to the Celery worker",
  })
  @IsString()
  @IsNotEmpty({ message: "Message cannot be empty" })
  message!: string;

  @ApiProperty({
    example: 5,
    description: "Number of identical messages with unique UUIDs to publish",
  })
  @IsInt({ message: "Amount must be an integer" })
  @Min(1, { message: "Amount must be greater than 0" })
  amount!: number;
}
