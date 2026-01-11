import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CheckoutDto } from 'src/common/dto/checkout/checkout.dto';
import { MailService } from '../../common/utils/mail/mail.service';
import { PdfService } from '../../common/utils/pdf/pdf.service';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) { }

  async processCheckout(dto: CheckoutDto) {
    const { reservationId, cardNumber } = dto;

    // 1. Buscar la reserva asociada al checkout
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        category: true,
      },
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    // 2. Evitar que una reserva ya pagada se procese nuevamente
    if (reservation.status === 'PAID') {
      throw new BadRequestException('Reservation already paid');
    }

    // 3. Validar el número de tarjeta usando el algoritmo de Luhn
    if (!this.isValidCard(cardNumber)) {
      throw new BadRequestException('Invalid card number');
    }

    // 4. Confirmar el pago (simulado) y actualizar el estado de la reserva
    const updatedReservation = await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: 'PAID',
      },
    });

    // 5. Generar el ticket digital en PDF a partir de la reserva
    const pdfBuffer = await PdfService.generateReservationTicket({
      reservationId: reservation.id,
      email: reservation.email,
      category: reservation.category.name,
      quantity: reservation.quantity,
      startDate: reservation.startDate.toISOString().split('T')[0],
      endDate: reservation.endDate.toISOString().split('T')[0],
      total: reservation.total.toNumber(),
    });

    // 6. Enviar correo de confirmación con el PDF adjunto
    // El correo se envía únicamente cuando el pago fue exitoso
    await MailService.sendMailWithRetry({
      to: reservation.email,
      subject: '✅ Pago confirmado - Ticket de reserva',
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">

          <!-- Header -->
          <div style="background-color: #2563eb; color: #ffffff; padding: 20px;">
            <h2 style="margin: 0;">Pago confirmado</h2>
          </div>

          <!-- Body -->
          <div style="padding: 24px; color: #333333;">
            <p style="font-size: 16px;">
              Hola 👋,<br />
              Tu pago ha sido procesado correctamente. A continuación encontrarás el detalle de tu reserva:
            </p>

            <!-- Info box -->
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <p style="margin: 6px 0;"><strong>ID de reserva:</strong> ${reservation.id}</p>
              <p style="margin: 6px 0;"><strong>Categoría:</strong> ${reservation.category.name}</p>
              <p style="margin: 6px 0;"><strong>Total pagado:</strong> <span style="color: #16a34a; font-weight: bold;">$${reservation.total.toNumber()}</span></p>
            </div>

            <p style="font-size: 15px;">
               <strong>Tu ticket digital va adjunto</strong> en este correo en formato PDF.
            </p>

           
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">
              ${new Date().getFullYear()} Sistema de Reservas Express<br />
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
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


    // 7. Responder confirmación al frontend
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
   * Algoritmo de Luhn para validar números de tarjeta.
   * No procesa pagos reales, solo valida el formato.
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
