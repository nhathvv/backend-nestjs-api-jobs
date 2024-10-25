import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector))

  app.enableCors({
    origin: "http://localhost:3001/",
    methods: "GET,POST,PUT,PATCH,DELETE,HEAD",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
  app.useGlobalPipes(new ValidationPipe());

  // config versioning
  app.setGlobalPrefix('api')
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2']
  });
  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT');

  await app.listen(port || 3000);
}
bootstrap();