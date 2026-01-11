import PDFDocument from 'pdfkit';

export interface ReservationTicketData {
  reservationId: string;
  email: string;
  category: string;
  quantity: number;
  startDate: string;
  endDate: string;
  total: number;
}

export class PdfService {
  static generateReservationTicket(
    data: ReservationTicketData,
  ): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc
        .fontSize(20)
        .text('Reserva Confirmada', { align: 'center' })
        .moveDown();

      // Body
      doc.fontSize(12);

      doc.text(`ID de Reserva: ${data.reservationId}`);
      doc.text(`Email: ${data.email}`);
      doc.moveDown();

      doc.text(`Categoría: ${data.category}`);
      doc.text(`Cantidad: ${data.quantity}`);
      doc.text(`Total: $${data.total.toFixed(2)}`);
      doc.moveDown();

      doc.text(`Desde: ${data.startDate}`);
      doc.text(`Hasta: ${data.endDate}`);

      // Footer
      doc.moveDown(2);
      doc
        .fontSize(10)
        .text('Gracias por usar Sistema de Reservas Express', {
          align: 'center',
        });

      doc.end();
    });
  }
}
