import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { mysqlConfig } from './common/config'
import { User } from './user/entities/user'
import { Permission } from './user/entities/permission'
import { Role } from './user/entities/role'
import { UserModule } from './user/user.module'
import { RedisModule } from './redis/redis.module'
import { EmailModule } from './email/email.module'


const { database, username, password, port, localhost } = mysqlConfig

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: localhost,
      port,
      username,
      password,
      database,
      synchronize: true,
      logging: true,
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugin: 'sha256_password',
      },
      entities: [Permission, Role, User],
    }),
    UserModule,
    RedisModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
