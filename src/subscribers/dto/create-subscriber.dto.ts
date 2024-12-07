import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  email: string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  skills: string[];
}
