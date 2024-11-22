import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { ResponeMessage, User } from 'src/decorator/customize';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  @Post()
  @ResponeMessage("Create a new resume")
  create(
    @Body() CreateCvDto: CreateCvDto,
    @User() user: IUser) {
    return this.resumesService.create(CreateCvDto, user);
  }

  @Get()
  @ResponeMessage("Fetch all resumes with paginate")
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qsUrl: string,
  ) {
    return this.resumesService.findAll(+limit, +currentPage, qsUrl);
  }

  @Get(':id')
  @ResponeMessage("Fetch a resume by id")
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponeMessage("Update status a Resume")
  update(
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
    @User() user: IUser,

  ) {
    return this.resumesService.update(id, updateResumeDto, user);
  }

  @Delete(':id')
  @ResponeMessage("Delete a resume by ID")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }

  @Post("/by-user")
  @ResponeMessage("Get CV by user")
  getCVbyUser(
    @User() user: IUser,
  ) {
    return this.resumesService.getCVbyUser(user)
  }
}
