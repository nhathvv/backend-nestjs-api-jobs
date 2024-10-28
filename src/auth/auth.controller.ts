import { Controller, Post, Get, UseGuards, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponeMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDTO } from 'src/users/dto/create-user.dto';
import { Response, Request } from 'express';
import { IUser } from 'src/users/users.interface';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponeMessage("User login")
  @Post('/login')
  handleLogin(@User() user, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(user, res);
  }

  @Public()
  @Post("/register")
  @ResponeMessage("Register a new user")
  handleRegister(@Body() registerUserDTO: RegisterUserDTO) {
    return this.authService.register(registerUserDTO)
  }

  @Get("/account")
  @ResponeMessage("Get user information")
  handleGetAccount(@User() user: IUser) {
    return {
      user
    }
  }

  @Public()
  @ResponeMessage("Get user by refresh token")
  @Get("/refresh")
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refresh_token = request.cookies['refresh_token'];
    return this.authService.processNewToken(refresh_token, response)
  }

  @Post("/logout")
  @ResponeMessage("Logout user")
  handleLogout(
    @User() user: IUser,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.logout(user, response)
  }
}

