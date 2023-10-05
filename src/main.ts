import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase the timeout to 240 seconds (4 minutes)
  const httpServer = app.getHttpServer();
  const server = (httpServer.timeout = 240000);

  app.use(cors());
  await app.listen(process.env.PORT || 5001);
}
bootstrap();
