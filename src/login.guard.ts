import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { Permission } from './user/entities/permission'

interface JwtUserData {
  userId: number;
  username: string;
  roles: string[];
  permissions: Permission[]
}

declare module 'express' {
  interface Request {
    user: JwtUserData
  }
}

// 登陆守卫
@Injectable()
export class LoginGuard implements CanActivate {

  @Inject()
  private reflector: Reflector

  @Inject(JwtService)
  private jwtService: JwtService

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    // requireLogin 为 SetMetadata 传过来的参数
    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(), // 获取对应的 class
      context.getHandler() // 执行对应的方法
    ])

    // 如果没有使用 RequireLogin, 则 requireLogin 为 undefined
    if (!requireLogin) {
      return true
    }

    const authorization = request.headers.authorization

    if (!authorization) {
      throw new UnauthorizedException('用户未登录')
    }

    try {
      const token = authorization.split(' ')[1]
      const data = this.jwtService.verify<JwtUserData>(token)

      request.user = {
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        permissions: data.permissions
      }
      return true
    } catch (e) {
      throw new UnauthorizedException('token 失效，请重新登录')
    }
  }
}
