import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
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
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req: AuthRequest) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  addItem(@Request() req: AuthRequest, @Body() dto: AddItemDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @Put('items/:id')
  updateItem(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.cartService.updateItem(req.user.id, id, dto);
  }

  @Delete('items/:id')
  removeItem(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.id, id);
  }

  @Delete()
  clearCart(@Request() req: AuthRequest) {
    return this.cartService.clearCart(req.user.id);
  }
}
