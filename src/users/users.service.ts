import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs'
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>
  ) { }

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
  findOneByEmail(email: string) {
    return this.userModel.findOne({
      email,
    })
  }
  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash)
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
    return this.userModel.softDelete({
      _id: id
    })
  }
}
