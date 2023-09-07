import { Global, Module } from '@nestjs/common'
import { RedisService } from './redis.service'
import { createClient } from 'redis'
import { ConfigService } from '@nestjs/config'

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory(configService: ConfigService) {
        const client = createClient({
          socket: {
            host: configService.get('REDIS_CONFIG_HOST'),
            port: configService.get('REDIS_CONFIG_PORT'),
          },
          database: configService.get('REDIS_CONFIG_DATABASE'),
          username: configService.get('REDIS_CONFIG_USERNAME'),
          password: configService.get('REDIS_CONFIG_PASSWORD'),
        })
        await client.connect()
        return client
      },
      inject: [ConfigService]
    }
  ],
  exports: [RedisService]
})
export class RedisModule { }
