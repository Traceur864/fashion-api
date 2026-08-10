import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Request() req: AuthRequest) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('me')
  updateProfile(@Request() req: AuthRequest, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Get('me/addresses')
  getAddresses(@Request() req: AuthRequest) {
    return this.usersService.getAddresses(req.user.id);
  }

  @Post('me/addresses')
  createAddress(@Request() req: AuthRequest, @Body() dto: CreateAddressDto) {
    return this.usersService.createAddress(req.user.id, dto);
  }

  @Delete('me/addresses/:id')
  deleteAddress(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.usersService.deleteAddress(req.user.id, id);
  }
}
