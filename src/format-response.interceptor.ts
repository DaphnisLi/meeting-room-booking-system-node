import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Response } from 'express'
import { map, Observable } from 'rxjs'

// 修改响应格式
@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>()

    // TAG
    // https://juejin.cn/book/7226988578700525605/section/7234410067343179835
    // 1、这里为什么用 rxjs 的 map，而不是用 lodash？
    // rxjs 是 nest 内置的、rxjs 是处理异步的
    // 2、处理流和处理普通的数据有什么不同？
    // 一个是异步一个是同步, 异步数据是可能间隔一段时间才有数据、同步数据是最开始就有全部的数据
    return next.handle().pipe(map((data) => {
      return {
        code: response.statusCode,
        message: 'success',
        data
      }
    }))
  }
}
