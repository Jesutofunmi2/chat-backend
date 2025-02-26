import { NestFactory } from '@nestjs/core';
import { SeedService } from './seed/seed.service';
import { SeedModule } from './seed/seed.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedService = app.get(SeedService);

  await seedService.seedUsers();
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ Seeding failed:', err);
});
