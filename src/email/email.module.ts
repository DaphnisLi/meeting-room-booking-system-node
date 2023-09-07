import { Module, Global } from '@nestjs/common'
import { EmailService } from './email.service'
import { ConfigService } from '@nestjs/config'
import { createTransport } from 'nodemailer'

@Global()
@Module({
    providers: [
      EmailService,
      {
        provide: 'EMAIL_CLIENT',
        async useFactory(configService: ConfigService) {

          const client = createTransport({
            host: configService.get('EMAIL_CONFIG_HOST'),
            port: configService.get('EMAIL_CONFIG_PORT'),
            secure: false,
            auth: {
              user: configService.get('EMAIL_CONFIG_USER'),
              pass: configService.get('EMAIL_CONFIG_PASS'),
            },
          })
          return client
        },
        inject: [ConfigService]
      },
      {
        provide: 'EMAIL_USER',
        async useFactory(configService: ConfigService) {
          return configService.get('EMAIL_CONFIG_USER')
        },
        inject: [ConfigService]
      }
    ],
  exports: [EmailService]
})
export class EmailModule { }
