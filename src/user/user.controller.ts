import { Body, Controller, Post, Inject, Logger, Get, Query, UnauthorizedException } from '@nestjs/common'
import { UserService } from './user.service'
import { RegisterUserDto } from './dto/registerUser.dto'
import { RegisterCaptcha } from './dto/registerCaptcha.dto'
import { EmailService } from '../email/email.service'
import { RedisService } from '../redis/redis.service'
import { LoginUserDto } from './dto/loginUser.dto'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { RequireLogin, UserInfo } from 'src/custom.decorator'
import { UserDetailVo } from './vo/userInfo.vo'
import { UpdateUserPasswordDto } from './dto/updateUserPassword.dto'
import { UpdateUserDto } from './dto/updateUser.dto'

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

  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId)

    const vo = new UserDetailVo()
    vo.id = user.id
    vo.email = user.email
    vo.username = user.username
    vo.headPic = user.headPic
    vo.phoneNumber = user.phoneNumber
    vo.nickName = user.nickName
    vo.createTime = user.createTime
    vo.isFrozen = user.isFrozen
    return vo
  }

  // 数组里面是两个路由
  @Post(['update_password', 'admin/update_password'])
  @RequireLogin() // ! 需要登陆
  async updatePassword(@UserInfo('userId') userId: number, @Body() passwordDto: UpdateUserPasswordDto) {
    return await this.userService.updatePassword(userId, passwordDto)
  }

  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8)

    await this.redisService.set(`update_password_captcha_${address}`, code, 10 * 60)

    await this.emailService.sendMail({
      to: address,
      subject: '更改密码验证码',
      html: `<p>你的更改密码验证码是 ${code}</p>`
    })
    return '发送成功'
  }

  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(@UserInfo('userId') userId: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(userId, updateUserDto)
  }

  @Get('update/captcha')
  async updateCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8)

    await this.redisService.set(`update_user_captcha_${address}`, code, 10 * 60)

    await this.emailService.sendMail({
      to: address,
      subject: '更改用户信息验证码',
      html: `<p>你的验证码是 ${code}</p>`
    })
    return '发送成功'
  }



}

