import { IsNotEmpty } from "class-validator"

export class RegisterCaptcha {

  @IsNotEmpty({
    message: "邮箱地址不能为空"
  })
  emailAddress: string
}
