import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { Response } from 'express'

// 统一报错响应格式
@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    response.statusCode = exception.getStatus()

    response.json({
      code: exception.getStatus(),
      message: 'fail',
      data: exception.message
    }).end()
  }
}
