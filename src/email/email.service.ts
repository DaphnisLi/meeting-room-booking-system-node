import { Injectable } from '@nestjs/common'
import { createTransport, Transporter } from 'nodemailer'
import { emailConfig } from '../common/config'

const { host, port, user, pass } = emailConfig

interface SendMailParams {
  to: string // 目的邮箱地址
  subject: string // 邮箱 title
  html: string // html string
}

@Injectable()
export class EmailService {

  transporter: Transporter

  constructor() {
    this.transporter = createTransport({
      host,
      port,
      secure: false,
      auth: {
        user,
        pass,
      },
    })
  }

  async sendMail(params: SendMailParams) {
    const { to, subject, html } = params
    await this.transporter.sendMail({
      from: {
        name: '会议室预定系统',
        address: user,
      },
      to,
      subject,
      html
    })
  }
}
