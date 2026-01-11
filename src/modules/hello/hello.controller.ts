import { Controller, Get } from "@nestjs/common";
import { HelloService } from "./hello.service";

@Controller('hello')
export class HelloController {
    constructor(private readonly helloService:  HelloService) {}

    @Get()
    sayHello() {
        return this.helloService.getHello();
    }
}