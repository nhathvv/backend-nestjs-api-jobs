import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  password: string

  age: number
  phone: string
}
