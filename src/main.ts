import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FormatResponseInterceptor } from './format-response.interceptor'
import { InvokeRecordInterceptor } from './invoke-record.interceptor'
import { CustomExceptionFilter } from './custom-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  app.useGlobalPipes(new ValidationPipe()) // 全局注册校验
  app.useGlobalInterceptors(new FormatResponseInterceptor())
  app.useGlobalInterceptors(new InvokeRecordInterceptor())
  app.useGlobalFilters(new CustomExceptionFilter())

  await app.listen(configService.get('NEST_SERVICE_PORT'))
}

bootstrap()
