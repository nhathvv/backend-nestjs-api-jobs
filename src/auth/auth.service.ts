import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDTO } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(username);
    if (user) {
      if (this.usersService.isValidPassword(pass, user.password)) {
        return user;
      }
    }
    return null;
  }
  async login(user: IUser) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'Token Login',
      iss: 'From server',
      _id,
      name,
      email,
      role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
      role,
    };
  }
  async register(registerUserDTO: RegisterUserDTO) {
    return this.usersService.register(registerUserDTO)
  }
}
