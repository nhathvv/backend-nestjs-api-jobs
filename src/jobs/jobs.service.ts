import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.shema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) { }
  async create(createJobDto: CreateJobDto, user: IUser) {
    const result = await this.jobModel.create({
      ...createJobDto,
      company: {
        _id: new mongoose.Types.ObjectId(createJobDto.company._id.toString()),
        name: createJobDto.company.name
      },
      createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        name: user.name
      }
    })
    return {
      _id: result._id,
      createdAt: result.createdAt
    }
  }
  async findAll(currentPage: number, limit: number, qsUrl: string) {
    const { filter } = aqp(qsUrl);
    let { sort }: { sort: any } = aqp(qsUrl);

    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    if (isEmpty(sort)) {
      sort = '-updatedAt';
    }
    const result = await this.jobModel
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

  async findOne(id: string) {
    const checkExits = await this.jobModel.findOne({
      _id: id,
    })
    if (!checkExits && !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Không tìm thấy job!")
    }
    return this.jobModel.findOne({
      _id: id,
    })
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const checkExits = await this.jobModel.findOne({
      _id: id,
    })
    if (!checkExits && !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Không tìm thấy job!")
    }
    return this.jobModel.updateOne({
      _id: id,
    }, {
      ...updateJobDto, updatedBy: {
        _id: new mongoose.Types.ObjectId(user._id.toString()),
        name: user.name
      }
    })
  }

  async remove(id: string, user: IUser) {
    const checkExits = await this.jobModel.findOne({
      _id: id,
    })
    if (!checkExits && !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Không tìm thấy job!")
    }
    await this.jobModel.updateOne({
      _id: id
    }, {
      deletedBy: {
        _id: new mongoose.Types.ObjectId(user._id.toString()),
        name: user.name
      }
    })
    return this.jobModel.softDelete({ _id: id })
  }
}
