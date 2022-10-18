import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NewPairFrontrunModule } from './new-pair-frontrun.module';
import { getAppLogger } from '@lib/helper/logger';
import { buildCorsOption } from '@lib/helper/cors';
import { AppErrorsInterceptor } from '@lib/helper/interceptor/errors.interceptor';
import { Sentry } from '@lib/helper/service/sentry.service';

async function bootstrap() {
  const logger = getAppLogger();

  const nestAppOpt: NestApplicationOptions = {
    logger: logger,
  };

  const app = await NestFactory.create(NewPairFrontrunModule, nestAppOpt);

  const configService = app.get(ConfigService);
  const port = configService.get('PAIRFRONT_APP_PORT');

  app.enableCors(buildCorsOption(configService, logger));

  // handle all app exception
  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new AppExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new AppErrorsInterceptor());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port).then(() => {
    logger.warn(`🚀 Server ready at :${port} :${process.env.NODE_ENV} 🚀`);
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
