import { Module } from "@nestjs/common";
import { PrismaModule } from './config/prisma/prisma.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { RootController } from './root/root.controller';



@Module({
  imports: [PrismaModule, AvailabilityModule, ReservationsModule, CheckoutModule],
  controllers: [RootController],
})

export class AppModule {}