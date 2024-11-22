import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) { }

  async checkExitsPermission(apiPath: string, method: string) {
    const isExitsPermission = await this.permissionModel.findOne({
      apiPath,
      method
    })
    if (isExitsPermission) {
      throw new BadRequestException("Permission đã tồn tại !")
    }
    return false
  }
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const { apiPath, name, method, module } = createPermissionDto
    await this.checkExitsPermission(apiPath, method)
    const newPermission = await this.permissionModel.create({
      apiPath, name, method, module, createdBy: {
        _id: new mongoose.Types.ObjectId(user._id.toString()),
        email: user.email
      }
    })
    return {
      _id: newPermission._id,
      createdAt: newPermission.createdAt
    }
  }

  async findAll(limit: number, currentPage: number, qsUrl: string) {
    const { filter, projection, population } = aqp(qsUrl);
    let { sort }: { sort: any } = aqp(qsUrl);

    delete filter.current;
    delete filter.pageSize;


    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    if (isEmpty(sort)) {
      sort = '-updatedAt';
    }
    const result = await this.permissionModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select(projection)
      .populate(population)
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

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid) {
      throw new BadRequestException("Invalid ID")
    }
    return this.permissionModel.findOne({
      _id: id,
    })
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    const { apiPath, method } = updatePermissionDto
    await this.checkExitsPermission(apiPath, method)
    if (!mongoose.Types.ObjectId.isValid) {
      throw new BadRequestException("Invalid ID")
    }
    return this.permissionModel.updateOne({
      _id: id,
    }, {
      ...updatePermissionDto,
      updatedBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email
      }
    })
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid) {
      throw new BadRequestException("Invalid ID")
    }
    await this.permissionModel.updateOne({
      _id: id,
    }, {
      deletedBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email
      }
    })
    return this.permissionModel.softDelete({
      _id: id
    })
  }
}
