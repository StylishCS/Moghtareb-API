import { HttpAdapterHost, NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { AllExceptionsFilter } from "./common/exception-filters/all-exceptions.filter";
import { DatabaseExceptionsFilter } from "./common/exception-filters/database-exceptions.filter";
import { TrimPipe } from "./common/pipes/trim.pipe";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigBase } from "./config/config.base";
import { HonoAdapter, type NestHonoApplication } from "./common/hono";

async function main() {
  const config = ConfigBase.fromEnv();
  const app = await NestFactory.create<NestHonoApplication>(
    AppModule.register({ config }),
    new HonoAdapter()
  );
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost),
    new DatabaseExceptionsFilter(httpAdapterHost)
  );

  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  if (process.env.NODE_ENV === "development") {
    app.enableCors({
      origin: "*",
      methods: "*",
      allowedHeaders: "*",
    });

    const swaggerConfig = new DocumentBuilder()
      .setTitle("Moghtareb API")
      .setDescription("The Moghtareb API description")
      .setVersion("0.1")
      .addBearerAuth()
      .addCookieAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {});
    SwaggerModule.setup("docs", app, document, {
      swaggerUiEnabled: false,
      jsonDocumentUrl: "/docs/openapi.json",
    });
  }

  await app.listen(3000);
}

main();
