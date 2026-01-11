import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { AvailabilityResult } from 'src/common/types/availability/availability.type';
@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailability(startDate: Date, endDate: Date) {
    const categories = await this.prisma.category.findMany();

    const results: AvailabilityResult[] = [];

    for (const category of categories) {
      const reservations = await this.prisma.reservation.aggregate({
        _sum: { quantity: true },
        where: {
          categoryId: category.id,
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });

      const reserved = reservations._sum.quantity ?? 0;

      results.push({
        category: category.name,
        capacity: category.capacity,
        reserved,
        available: Math.max(category.capacity - reserved, 0),
        price: Number(category.price),
      });
    }

    return results;
  }
}
