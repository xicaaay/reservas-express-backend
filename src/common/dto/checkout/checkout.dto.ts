// DTO que representa los datos necesarios para simular un pago
export class CheckoutDto {
  reservationId: string; // ID de la reserva a pagar
  cardNumber: string;    // Número de tarjeta (solo validación, no se guarda)
  cardHolder: string;    // Nombre del titular
  expiration: string;    // MM/YY
  cvv: string;           // Código de seguridad
}
