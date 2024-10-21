import { Controller, Post, Request, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { Public } from './decorator/customize';
import { LocalAuthGuard } from './auth/local-auth.guard';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService
  ) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("/login")
  handleLogin(@Request() req) {
    return this.authService.login(req.user)
  }
  @Get("/profile")
  getProfile(@Request() req) {
    return req.user
  }
}
