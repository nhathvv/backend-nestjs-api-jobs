import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subscribeModel: SoftDeleteModel<SubscriberDocument>,
  ) {}
  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    const isExits = await this.subscribeModel.findOne({
      email: createSubscriberDto.email,
    });
    if (isExits) {
      throw new BadRequestException('Email đã tồn tại trên hệ thống!');
    }
    const newSub = await this.subscribeModel.create({
      ...createSubscriberDto,
      createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        name: user.email,
      },
    });
    return {
      _id: newSub._id,
      createdAt: newSub.createdAt,
    };
  }

  async findAll(limit: number, currentPage: number, qsUrl: string) {
    const { filter, projection } = aqp(qsUrl);
    let { sort }: { sort: any } = aqp(qsUrl);

    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.subscribeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    if (isEmpty(sort)) {
      sort = '-updatedAt';
    }
    const result = await this.subscribeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select(projection)
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
      throw new BadRequestException('Invalid ID!');
    }
    return this.subscribeModel.findById(id);
  }

  update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    return this.subscribeModel.updateOne(
      {
        email: user.email,
      },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          name: user.email,
        },
      },
      { upsert: true },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid) {
      throw new BadRequestException('Invalid ID!');
    }
    await this.subscribeModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          name: user.email,
        },
      },
    );
    return this.subscribeModel.softDelete({ _id: id });
  }
  async getSkills(user: IUser) {
    return this.subscribeModel.findOne(
      {
        email: user.email,
      },
      { skills: 1 },
    );
  }
}
