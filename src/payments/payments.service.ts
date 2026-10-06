import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY')!);
  }

  async createCheckoutSession(userId: string, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { include: { images: true } } },
            },
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.status !== 'PENDING')
      throw new BadRequestException('La orden ya fue procesada');

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'mxn',
        product_data: {
          name: `${item.variant.product.name} - Talla ${item.variant.size} / ${item.variant.color}`,
        },
        unit_amount: Math.round(Number(item.priceSnapshot) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${this.config.get('FRONTEND_URL')}/orders/${order.id}?success=true`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/cart?cancelled=true`,
      metadata: { orderId: order.id },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.get<string>('STRIPE_WEBHOOK_SECRET')!,
      );
    } catch {
      throw new BadRequestException('Webhook inválido');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            stripePaymentId: session.payment_intent as string,
          },
        });
      }
    }

    return { received: true };
  }
}
