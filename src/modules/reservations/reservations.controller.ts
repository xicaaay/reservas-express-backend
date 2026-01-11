import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from 'src/common/dto/reservations/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
  ) {}

  /**
   * Crea una nueva reserva.
   * Valida fechas, disponibilidad y capacidad.
   * La reserva se crea en estado PENDING.
   */
  @Post()
  async create(@Body() body: CreateReservationDto) {
    const reservation =
      await this.reservationsService.createReservation(body);

    return {
      success: true,
      message: 'Reservation created successfully',
      data: reservation,
    };
  }

  /**
   * Obtiene una reserva por su ID.
   * Este endpoint es usado por el checkout para mostrar el resumen
   * (email, categoría, cantidad, total, etc.).
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    const reservation =
      await this.reservationsService.getById(id);

    if (!reservation) {
      throw new NotFoundException(
        'Reservation not found',
      );
    }

    return {
      id: reservation.id,
      email: reservation.email,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      quantity: reservation.quantity,
      total: reservation.total,
      status: reservation.status,
      category: reservation.category.name,
    };
  }

  /**
   * Genera y devuelve el ticket digital (PDF) de una reserva existente.
   * El PDF se genera en memoria y no se almacena como archivo.
   */
  @Get(':id/ticket')
  async downloadTicket(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer =
      await this.reservationsService.generateReservationTicket(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reservation-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
