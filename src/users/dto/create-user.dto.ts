import { IsDefined, IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

export class CompanyDTO {
  _id: mongoose.Schema.Types.ObjectId
  name: string
  logo: string
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
  address: string

  @IsNotEmpty()
  role: string

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanyDTO)
  company: CompanyDTO
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
  address: string
}
