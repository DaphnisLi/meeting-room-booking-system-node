import { Body, Controller, Post, Inject } from '@nestjs/common'
import { UserService } from './user.service'
import { RegisterUserDto } from './dto/registerUser.dto'
import { RegisterCaptcha } from './dto/registerCaptcha.dto'
import { EmailService } from '../email/email.service'
import { RedisService } from '../redis/redis.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }
  @Inject(EmailService)
  private emailService: EmailService

  @Inject(RedisService)
  private redisService: RedisService

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

    await this.emailService.sendMail({
      to: emailAddress,
      subject: '注册验证码',
      html: `
          <p>你的注册验证码是 ${code}</p>
          <p>有效期 ${ttl / 60} min</p>
        `
    })
    return '发送成功'
  }
}

