import { Injectable } from "@nestjs/common";
import { timestamp } from "rxjs";

@Injectable()
export class HelloService {
    getHello() {
        return {
            message: 'Hello World!',
            timestamp: new Date(),
        }
    }
}