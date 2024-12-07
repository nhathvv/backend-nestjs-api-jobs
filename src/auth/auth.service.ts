import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import ms from 'ms';
import { RolesService } from 'src/roles/roles.service';
import { RegisterUserDTO } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private roleService: RolesService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(username);
    if (user) {
      if (this.usersService.isValidPassword(pass, user.password)) {
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.roleService.findOne(userRole._id);
        const objUser = {
          ...user.toObject(),
          permissions: temp?.permissions ?? [],
        };
        return objUser;
      }
    }
    return null;
  }
  signRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRESIN'),
    });
  }
  async login(user: IUser, res: Response) {
    const { _id, name, email, role, permissions } = user;
    const payload = {
      sub: 'Token Login',
      iss: 'From server',
      _id,
      name,
      email,
      role,
    };
    const refresh_token = this.signRefreshToken(payload);
    await this.usersService.updateUserToken(refresh_token, _id);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRESIN')),
    });
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
        permissions,
      },
    };
  }

  async register(registerUserDTO: RegisterUserDTO) {
    return this.usersService.register(registerUserDTO);
  }
  async processNewToken(refreshToken: string, response: Response) {
    try {
      await this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      const user = await this.usersService.findUserByToken(refreshToken);
      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'Token Refresh',
          iss: 'From server',
          _id,
          name,
          email,
          role,
        };
        const refresh_token = this.signRefreshToken(payload);
        await this.usersService.updateUserToken(refresh_token, _id.toString());
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.roleService.findOne(userRole._id);
        response.clearCookie('refresh_token');
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(
            this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRESIN'),
          ),
        });
        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? [],
          },
        };
      } else {
        throw new BadRequestException('Không tìm thấy người dùng!');
      }
    } catch (error) {
      throw new BadRequestException('Token không hợp lệ. Vui lòng login!');
    }
  }
  async logout(user: IUser, response: Response) {
    await this.usersService.updateUserToken(null, user._id.toString());
    response.clearCookie('refresh_token');
    return 'Logout successfully!';
  }
}
