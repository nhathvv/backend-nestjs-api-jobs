import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponeMessage, User } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponeMessage('Create a user')
  create(@Body() createUserDto: CreateUserDto, @User() user) {
    return this.usersService.create(createUserDto, user);
  }

  @Public()
  @Get()
  @ResponeMessage('Fetch user with paginate')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qsUrl: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qsUrl);
  }

  @Public()
  @ResponeMessage('Fetch user by id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  @ResponeMessage('Update a user')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  @ResponeMessage('Delete a user')
  remove(@Param('id') id: string, @User() user) {
    return this.usersService.remove(id, user);
  }
}
