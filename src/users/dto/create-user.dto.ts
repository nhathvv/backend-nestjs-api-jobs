import {
  IsDefined,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CompanyDTO {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  logo: string;
}
export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  gender: string;

  @IsNotEmpty()
  age: number;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @IsMongoId()
  role: mongoose.Schema.Types.ObjectId;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanyDTO)
  company: CompanyDTO;
}
export class RegisterUserDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  gender: string;

  @IsNotEmpty()
  age: number;

  @IsNotEmpty()
  address: string;
}
export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'nhathv.21it@gmail.com', description: 'username' })
  readonly username: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123456',
    description: 'password',
  })
  readonly password: string;
}
