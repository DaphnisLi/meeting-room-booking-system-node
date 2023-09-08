import { Body, Controller, Post, Inject, Logger, Get, Query, UnauthorizedException } from '@nestjs/common'
import { UserService } from './user.service'
import { RegisterUserDto } from './dto/registerUser.dto'
import { RegisterCaptcha } from './dto/registerCaptcha.dto'
import { EmailService } from '../email/email.service'
import { RedisService } from '../redis/redis.service'
import { LoginUserDto } from './dto/loginUser.dto'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }
  @Inject(EmailService)
  private emailService: EmailService

  @Inject(RedisService)
  private redisService: RedisService

  @Inject(JwtService)
  private jwtService: JwtService

  @Inject(ConfigService)
  private configService: ConfigService

  private logger = new Logger() // 日志

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser)
  }

  @Post('registerCaptcha')
  async captcha(@Body() registerCaptcha: RegisterCaptcha) {
    const { emailAddress } = registerCaptcha
    const code = Math.random().toString().slice(2, 8)

    const ttl = 5 * 60
    await this.redisService.set(emailAddress, code, ttl)

    try {
      await this.emailService.sendMail({
        to: emailAddress,
        subject: '注册验证码',
        html: `
            <p>你的注册验证码是 ${code}</p>
            <p>有效期 ${ttl / 60} min</p>
          `
      })
      return '发送成功'
    } catch (e) {
      this.logger.error(e, UserService)
      return '发送失败'
    }
  }

  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, false)

    vo.accessToken = this.jwtService.sign({
      userId: vo.userInfo.id,
      username: vo.userInfo.username,
      roles: vo.userInfo.roles,
      permissions: vo.userInfo.permissions
    }, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME')
    })

    vo.refreshToken = this.jwtService.sign({
      userId: vo.userInfo.id
    }, {
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME')
    })

    return vo
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true)

    vo.accessToken = this.jwtService.sign({
      userId: vo.userInfo.id,
      username: vo.userInfo.username,
      roles: vo.userInfo.roles,
      permissions: vo.userInfo.permissions
    }, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME')
    })

    vo.refreshToken = this.jwtService.sign({
      userId: vo.userInfo.id
    }, {
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME')
    })

    return vo
  }

  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken)

      const user = await this.userService.findUserById(data.userId, false)

      const access_token = this.jwtService.sign({
        userId: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions
      }, {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME')
      })

      const refresh_token = this.jwtService.sign({
        userId: user.id
      }, {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME')
      })

      return {
        access_token,
        refresh_token
      }
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录')
    }
  }

  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken)

      const user = await this.userService.findUserById(data.userId, true)

      const access_token = this.jwtService.sign({
        userId: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions
      }, {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME')
      })

      const refresh_token = this.jwtService.sign({
        userId: user.id
      }, {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME')
      })

      return {
        access_token,
        refresh_token
      }
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录')
    }
  }
}

