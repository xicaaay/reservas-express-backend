import { Module } from "@nestjs/common";
import { PrismaModule } from './config/prisma/prisma.module';
import { HelloModule } from './modules/hello/hello.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { CheckoutModule } from './modules/checkout/checkout.module';



@Module({
  imports: [PrismaModule, HelloModule, AvailabilityModule, ReservationsModule, CheckoutModule],
})

export class AppModule {}