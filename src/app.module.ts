import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { User } from './user/entities/user'
import { Permission } from './user/entities/permission'
import { Role } from './user/entities/role'
import { UserModule } from './user/user.module'
import { RedisModule } from './redis/redis.module'
import { EmailModule } from './email/email.module'
import { ConfigModule } from '@nestjs/config'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '30m' // 默认 30 分钟
          }
        }
      },
      inject: [ConfigService]
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          type: "mysql",
          host: configService.get('MYSQL_CONFIG_HOST'),
          port: configService.get('MYSQL_CONFIG_PORT'),
          username: configService.get('MYSQL_CONFIG_USERNAME'),
          password: configService.get('MYSQL_CONFIG_PASSWORD'),
          database: configService.get('MYSQL_CONFIG_DATABASE'),
          synchronize: true,
          logging: true,
          poolSize: 10,
          connectorPackage: 'mysql2',
          extra: {
            authPlugin: 'sha256_password',
          },
          entities: [Permission, Role, User],
        }
      },
      inject: [ConfigService]
    }),
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env'
    }),
    RedisModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
