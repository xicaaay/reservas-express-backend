import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CheckoutDto } from 'src/common/dto/checkout/checkout.dto';
import { MailService } from '../../common/utils/mail/mail.service';
import { PdfService } from '../../common/utils/pdf/pdf.service';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Procesa el checkout.
   * IMPORTANTE:
   * - Responde inmediatamente al frontend
   * - El PDF y el correo se generan en background
   */
  async processCheckout(dto: CheckoutDto) {
    const { reservationId, cardNumber } = dto;

    // 1. Buscar la reserva
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { category: true },
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    // 2. Evitar reprocesar pagos
    if (reservation.status === 'PAID') {
      throw new BadRequestException('Reservation already paid');
    }

    // 3. Validar tarjeta (Luhn)
    if (!this.isValidCard(cardNumber)) {
      throw new BadRequestException('Invalid card number');
    }

    // 4. Marcar la reserva como pagada
    const updatedReservation = await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: 'PAID' },
    });

    // 5. Disparar tareas pesadas en background (NO await)
    this.handlePostCheckoutTasks(reservation).catch((error) => {
      // Nunca romper el flujo principal
      console.error('Post-checkout background error:', error);
    });

    // 6. Responder inmediatamente al frontend
    return {
      success: true,
      message: 'Payment processed successfully',
      data: {
        reservationId: updatedReservation.id,
        status: updatedReservation.status,
        totalPaid: reservation.total.toNumber(),
        paidAt: new Date(),
      },
    };
  }

  /**
   * Tareas post-checkout:
   * - Generar PDF
   * - Enviar correo
   *
   * Estas tareas NO deben bloquear el checkout.
   */
  private async handlePostCheckoutTasks(reservation: any) {
    // Generar PDF
    const pdfBuffer = await PdfService.generateReservationTicket({
      reservationId: reservation.id,
      email: reservation.email,
      category: reservation.category.name,
      quantity: reservation.quantity,
      startDate: reservation.startDate.toISOString().split('T')[0],
      endDate: reservation.endDate.toISOString().split('T')[0],
      total: reservation.total.toNumber(),
    });

    // Enviar correo con el PDF adjunto
    await MailService.sendMailWithRetry({
      to: reservation.email,
      subject: 'Pago confirmado - Ticket de reserva',
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #2563eb; color: #ffffff; padding: 20px;">
              <h2 style="margin: 0;">Pago confirmado</h2>
            </div>
            <div style="padding: 24px; color: #333333;">
              <p>
                Tu pago ha sido procesado correctamente.
              </p>
              <p>
                ID de reserva: <strong>${reservation.id}</strong>
              </p>
              <p>
                Categoría: <strong>${reservation.category.name}</strong>
              </p>
              <p>
                Total pagado: <strong>$${reservation.total.toNumber()}</strong>
              </p>
              <p>
                Tu ticket digital va adjunto en formato PDF.
              </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
              ${new Date().getFullYear()} Sistema de Reservas Express
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `reservation-${reservation.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  /**
   * Algoritmo de Luhn para validar números de tarjeta
   */
  private isValidCard(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '').split('').map(Number);
    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }
}
