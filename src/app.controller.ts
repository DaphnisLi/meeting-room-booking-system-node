import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import {RequirePermission, RequireLogin, UserInfo} from './custom.decorator'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  @Get('aaa')
  @RequireLogin()
  @RequirePermission('ddd')
  aaaa(@UserInfo('username') username: string, @UserInfo() userInfo) {
    console.log(username, userInfo)
    return 'aaa'
  }

  @Get('bbb')
  bbb() {
    return 'bbb'
  }
}
