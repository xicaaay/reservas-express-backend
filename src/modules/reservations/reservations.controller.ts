import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
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
   * Valida disponibilidad, fechas y capacidad.
   * Devuelve la reserva creada para el frontend.
   */
  @Post()
  async create(@Body() body: CreateReservationDto) {
    const reservation = await this.reservationsService.createReservation(body);

    // Se envuelve la respuesta para mantener un formato consistente
    return {
      success: true,
      message: 'Reservation created successfully',
      data: reservation,
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

    // Se configuran los headers para indicar que la respuesta es un archivo PDF descargable
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reservation-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    // Se envía el buffer del PDF como respuesta HTTP
    res.end(pdfBuffer);
  }
}
