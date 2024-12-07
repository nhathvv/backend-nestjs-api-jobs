import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateCvDto, CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}
  async create(CreateCvDto: CreateCvDto, user: IUser) {
    const newCV = await this.resumeModel.create({
      url: CreateCvDto.url,
      email: user.email,
      userId: new mongoose.Types.ObjectId(user._id),
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: {
            _id: new mongoose.Types.ObjectId(user._id),
            email: user.email,
          },
        },
      ],
      createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
      companyId: new mongoose.Types.ObjectId(CreateCvDto.companyId.toString()),
      jobId: new mongoose.Types.ObjectId(CreateCvDto.jobId.toString()),
    });
    return {
      _id: newCV?.id,
      createdAt: newCV.createdAt,
    };
  }

  async findAll(limit: number, currentPage: number, qsUrl: string) {
    const { filter, projection, population } = aqp(qsUrl);
    let { sort }: { sort: any } = aqp(qsUrl);

    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    if (isEmpty(sort)) {
      sort = '-updatedAt';
    }
    const result = await this.resumeModel
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadGatewayException('Invalid id!');
    }
    return this.resumeModel.findOne({
      _id: id,
    });
  }

  update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadGatewayException('Invalid id!');
    }
    return this.resumeModel.updateOne(
      {
        _id: id,
      },
      {
        $push: {
          history: {
            status: updateResumeDto.status,
            updatedAt: new Date(),
            updatedBy: {
              _id: new mongoose.Types.ObjectId(user._id),
              email: user.email,
            },
          },
        },
        updatedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          email: user.email,
        },
        ...updateResumeDto,
      },
    );
  }

  async remove(id: string, user: IUser) {
    // or @IsMongoId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadGatewayException('Invalid id!');
    }
    await this.resumeModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          email: user.email,
        },
      },
    );
    return this.resumeModel.softDelete({
      _id: id,
    });
  }

  async getCVbyUser(user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(user._id)) {
      throw new BadGatewayException('Invalid id!');
    }
    return this.resumeModel
      .find({
        userId: user._id,
      })
      .sort('-createdAt')
      .populate([
        { path: 'companyId', select: { name: 1 } },
        { path: 'jobId', select: { name: 1 } },
      ]);
  }
}
