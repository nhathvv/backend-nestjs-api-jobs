import { Controller, Post, Request, Get, UseGuards, Body, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponeMessage } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDTO } from 'src/users/dto/create-user.dto';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post("/register")
  @ResponeMessage("Register a new user")
  handleRegister(@Body() registerUserDTO: RegisterUserDTO) {
    return this.authService.register(registerUserDTO)
  }
}
