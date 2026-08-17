import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserDto, PatchUserDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.list();
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.users.create(body);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() body: PatchUserDto) {
    return this.users.patch(id, body);
  }
}
