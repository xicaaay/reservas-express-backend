// DTO que representa el payload requerido para crear una reserva
export class CreateReservationDto {
  email: string;       // Email del usuario invitado
  category: string;    // Nombre de la categoría (BASIC, PLUS, VIP)
  startDate: string;   // Fecha de inicio (YYYY-MM-DD)
  endDate: string;     // Fecha de fin (YYYY-MM-DD)
  quantity: number;    // Cantidad de espacios a reservar
}
