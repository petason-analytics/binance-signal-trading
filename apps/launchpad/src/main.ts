import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { AppLogger } from '@lib/helper/logger';
import { buildCorsOption } from '@lib/helper/cors';
import { AppErrorsInterceptor } from '@lib/helper/interceptor/errors.interceptor';
import { PrismaService } from '@lib/prisma';
import { Sentry } from '@lib/helper/service/sentry.service';
import { LaunchpadModule } from './launchpad.module';

async function bootstrap() {
  const logger = new AppLogger();

  const nestAppOpt: NestApplicationOptions = {
    logger: logger,
  };

  const env = process.env.NODE_ENV;
  const ssl = process.env.APP_SSL == 'true';
  // Add https for development only
  if (ssl) {
    nestAppOpt.httpsOptions = {
      key: fs.readFileSync('../../secrets/server.' + env + '.key'),
      cert: fs.readFileSync('../../secrets/server.' + env + '.crt'),
    };
  }

  // Currently we use Express platform for work with stable apolo graphql
  const app = await NestFactory.create(LaunchpadModule, nestAppOpt);

  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT');

  app.enableCors(buildCorsOption(configService, logger));

  // handle all app exception
  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new AppExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new AppErrorsInterceptor());

  app.useGlobalPipes(new ValidationPipe());

  // https://docs.nestjs.com/recipes/prisma#issues-with-enableshutdownhooks
  const prismaService: PrismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  // TODO: Add rate limiting: https://docs.nestjs.com/security/rate-limiting
  await app.listen(port).then(() => {
    logger.warn(`🚀 Server ready at :${port} :${env} ${ssl ? ':ssl' : ''} 🚀`);
    onBootstrapped(app, logger);
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
// For HMR
declare const module: any;

function onBootstrapped(app, logger) {
  // Sentry.test();
  Sentry.safeInit(() => {
    logger.log('Sentry was enabled & initialized');
  });
}

bootstrap();
