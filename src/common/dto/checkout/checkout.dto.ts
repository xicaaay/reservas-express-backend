import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  Length,
} from 'class-validator';

export class CheckoutDto {
  @ApiProperty({
    description: 'ID de la reserva a pagar',
    example: 'res_123456',
  })
  @IsString()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty({
    description: 'Número de tarjeta (solo validación, no se almacena)',
    example: '4242424242424242',
  })
  @IsString()
  @Length(16, 16)
  cardNumber: string;

  @ApiProperty({
    description: 'Nombre del titular de la tarjeta',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  cardHolder: string;

  @ApiProperty({
    description: 'Fecha de expiración en formato MM/YY',
    example: '12/27',
  })
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'expiration debe tener formato MM/YY',
  })
  expiration: string;

  @ApiProperty({
    description: 'Código de seguridad CVV',
    example: '123',
  })
  @IsString()
  @Length(3, 4)
  cvv: string;
}
