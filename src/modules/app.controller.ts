import { Controller, Get } from "@nestjs/common";
import { Auth } from "./auth/decorators/auth.decorators";
import { User } from "./auth/decorators/user.decorator";

@Controller()
export class AppController {
  @Get()
  helloWorld(): string {
    return "Hello World!";
  }

  @Get("test")
  @Auth()
  test(@User() user: any) {
    console.log(user);
    return user;
  }
}
