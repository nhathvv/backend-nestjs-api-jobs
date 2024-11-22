import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from 'src/permissions/schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) { }
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const { name, description, isActive, permissions } = createRoleDto
    const isExits = await this.roleModel.findOne({
      name
    })
    if (isExits) {
      throw new BadRequestException("Role đã tồn tại!")
    }
    const newRole = await this.roleModel.create({
      name, description, isActive, permissions, createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email
      }
    })
    return {
      _id: newRole._id,
      createdAt: newRole.createdAt
    }
  }

  async findAll(limit: number, currentPage: number, qsUrl: string) {
    const { filter, projection } = aqp(qsUrl);
    let { sort }: { sort: any } = aqp(qsUrl);

    delete filter.current;
    delete filter.pageSize;


    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    if (isEmpty(sort)) {
      sort = '-updatedAt';
    }
    const result = await this.roleModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select(projection)
      .populate({
        path: "permissions",
        select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 }
      })
      .setOptions({ strictPopulate: false })
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid id!")
    }
    return (await this.roleModel.findById(id)).populate({
      path: "permissions",
      select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 }
    })
  }

  update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid id!")
    }
    return this.roleModel.updateOne({
      _id: id
    }, {
      ...updateRoleDto,
      updatedBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email
      }
    })
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid id!")
    }
    const role = await this.roleModel.findOne({
      _id: id,
    })
    if (role.name === 'ADMIN') {
      throw new BadRequestException("Không được xoá role ADMIN")
    }
    await this.roleModel.updateOne({
      _id: id
    }, {
      deletedBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email
      }
    })
    return this.roleModel.softDelete({
      _id: id
    })
  }
}
