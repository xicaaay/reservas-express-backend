import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from 'src/common/dto/checkout/checkout.dto';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @ApiOperation({
    summary: 'Procesar checkout y generar reserva',
  })
  @ApiBody({
    type: CheckoutDto,
    examples: {
      ejemploValido: {
        summary: 'Ejemplo de checkout válido',
        value: {
          reservationId: 'res_123456',
          cardNumber: '4242424242424242',
          cardHolder: 'Juan Pérez',
          expiration: '12/27',
          cvv: '123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout procesado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de checkout inválidos',
  })
  async checkout(@Body() body: CheckoutDto) {
    return this.checkoutService.processCheckout(body);
  }
}
