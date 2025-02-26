import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './auth/seed';
import { IoAdapter } from '@nestjs/platform-socket.io/adapters/io-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const seedService = app.get(SeedService);
  await seedService.seedUsers();
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
