import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { genSaltSync, hashSync } from 'bcryptjs'
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  hashPassword(password: string) {
    const salt = genSaltSync(10)
    return hashSync(password, salt)
  }
  async create(createUserDto: CreateUserDto) {
    const user = await this.userModel.create({
      email: createUserDto.email,
      password: this.hashPassword(createUserDto.password),
      name: createUserDto.name
    })
    return user
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return {
      msg: "User not found!"
    }
    return this.userModel.findOne({
      _id: id
    })
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) return {
      msg: "User not found!"
    }
    return this.userModel.updateOne({ _id: id }, { ...updateUserDto });
  }

  remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return {
      msg: "User not found!"
    }
    return this.userModel.deleteOne({
      _id: id
    })
  }
}
