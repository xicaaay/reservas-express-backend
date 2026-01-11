// src/root.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      message: 'API is running!',
      timestamp: new Date(),
    };
  }
}
