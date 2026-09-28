import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (process.env['CORS_ORIGIN'] ?? 'http://localhost:4200').split(','),
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // Gövdede tanımsız alan varsa sessizce atılır, beklenmedik
      // alanın veritabanına sızması engellenir.
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    })
  );

  const port = Number(process.env['PORT'] ?? 3000);
  await app.listen(port);
  console.log(`API hazır: http://localhost:${port}`);
}

void bootstrap();
