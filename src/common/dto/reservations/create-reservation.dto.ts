import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

// DTO que representa el payload requerido para crear una reserva
export class CreateReservationDto {
  @ApiProperty({
    description: 'Email del usuario invitado',
    example: 'usuario@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Nombre de la categoría (BASIC, PLUS, VIP)',
    example: 'VIP',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Fecha de inicio de la reserva (YYYY-MM-DD)',
    example: '2026-01-10',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin de la reserva (YYYY-MM-DD)',
    example: '2026-01-12',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Cantidad de espacios a reservar',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
