import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';

@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar disponibilidad por rango de fechas',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    example: '2026-01-10',
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    example: '2026-01-12',
    description: 'Fecha de fin (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidad calculada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Fechas inválidas o faltantes',
  })
  async getAvailability(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException('Invalid date range');
    }

    return this.availabilityService.getAvailability(start, end);
  }
}
