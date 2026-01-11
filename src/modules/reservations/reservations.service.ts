import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateReservationDto } from 'src/common/dto/reservations/create-reservation.dto';
import { PdfService } from '../../common/utils/pdf/pdf.service';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReservation(dto: CreateReservationDto) {
    const { email, category, startDate, endDate, quantity } = dto;

    // Validación básica de cantidad
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validación de fechas
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException('Invalid date range');
    }

    // Lógica crítica dentro de transacción para evitar overbooking
    return this.prisma.$transaction(async (tx) => {
      // 1. Obtener categoría
      const categoryEntity = await tx.category.findUnique({
        where: { name: category },
      });

      if (!categoryEntity) {
        throw new BadRequestException('Invalid category');
      }

      // 2. Calcular reservas existentes en el rango
      const reservations = await tx.reservation.aggregate({
        _sum: { quantity: true },
        where: {
          categoryId: categoryEntity.id,
          startDate: { lt: end },
          endDate: { gt: start },
        },
      });

      const reserved = reservations._sum.quantity ?? 0;

      // 3. Verificar disponibilidad
      const available = categoryEntity.capacity - reserved;

      if (quantity > available) {
        throw new BadRequestException('Not enough availability');
      }

      // 4. Calcular total
      const total = Number(categoryEntity.price) * quantity;

      // 5. Crear reserva en estado PENDING
      return tx.reservation.create({
        data: {
          email,
          startDate: start,
          endDate: end,
          quantity,
          total,
          status: 'PENDING',
          categoryId: categoryEntity.id,
        },
      });
    });
  }

  /**
   * Genera el ticket digital (PDF) de una reserva existente.
   * El PDF se genera en memoria y no se almacena como archivo.
   */
  async generateReservationTicket(reservationId: string): Promise<Buffer> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        category: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return PdfService.generateReservationTicket({
      reservationId: reservation.id,
      email: reservation.email,
      category: reservation.category.name,
      quantity: reservation.quantity,
      startDate: reservation.startDate.toISOString().split('T')[0],
      endDate: reservation.endDate.toISOString().split('T')[0],
      total: reservation.total.toNumber(),
    });
  }
}
