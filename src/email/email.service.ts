import {Injectable, Inject} from '@nestjs/common'
import { Transporter } from 'nodemailer'

interface SendMailParams {
  to: string // 目的邮箱地址
  subject: string // 邮箱 title
  html: string // html string
}

@Injectable()
export class EmailService {

  @Inject('EMAIL_CLIENT')
  private emailClient: Transporter

  @Inject('EMAIL_USER')
  private emailUser: string

  async sendMail(params: SendMailParams) {
    const { to, subject, html } = params
    await this.emailClient.sendMail({
      from: {
        name: '会议室预定系统',
        address: this.emailUser,
      },
      to,
      subject,
      html
    })
  }
}
