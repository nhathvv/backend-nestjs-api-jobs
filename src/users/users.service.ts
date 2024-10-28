import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) { }
  hashPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }
  async create(createUserDto: CreateUserDto, user: IUser) {
    const isEmailExits = await this.userModel.findOne({ email: createUserDto.email })
    if (isEmailExits) {
      throw new BadRequestException(`Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác!`)
    }
    const result = await this.userModel.create({
      ...createUserDto,
      password: this.hashPassword(createUserDto.password),
      createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email
      },
      company: {
        _id: new mongoose.Types.ObjectId(createUserDto.company._id.toString()),
        name: createUserDto.company.name,
      }
    });
    return {
      _id: result._id,
      createdAt: result.createdAt
    }
  }
  async register(registerUserDTO: RegisterUserDTO) {
    const isEmailExits = await this.userModel.findOne({ email: registerUserDTO.email })
    if (isEmailExits) {
      throw new BadRequestException(`Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác!`)
    }
    const data = await this.userModel.create({
      ...registerUserDTO,
      password: await this.hashPassword(registerUserDTO.password),
      role: "USER"
    })
    return {
      _id: data.id,
      createdAt: data.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qsUrl: string) {
    const { filter } = aqp(qsUrl);
    let { sort }: { sort: any } = aqp(qsUrl);

    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    if (isEmpty(sort)) {
      sort = '-updatedAt';
    }
    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return {
        msg: 'User not found!',
      };
    return this.userModel.findOne({
      _id: id,
    }).select(["-password", "-refreshToken"]);
  }

  findOneByEmail(email: string) {
    return this.userModel.findOne({
      email,
    });
  }
  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }
  updateUserToken(refreshToken: string, _id: string) {
    return this.userModel.updateOne({
      _id
    }, { refreshToken })
  }
  update(updateUserDto: UpdateUserDto) {
    const userId = updateUserDto._id.toString()
    if (!mongoose.Types.ObjectId.isValid(userId))
      return {
        msg: 'User not found!',
      };
    return this.userModel.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { ...updateUserDto });
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return {
        msg: 'User not found!',
      };
    await this.userModel.updateOne({ _id: new mongoose.Types.ObjectId(id) }, {
      deletedBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email
      }
    })
    return this.userModel.softDelete({
      _id: id,
    });
  }
  async findUserByToken(refreshToken: string) {
    return this.userModel.findOne({
      refreshToken
    })
  }
}
