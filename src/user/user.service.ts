import { HttpException, HttpStatus, Injectable, Logger, Inject, } from '@nestjs/common'
import { InjectRepository, } from '@nestjs/typeorm'
import { md5 } from 'src/common/utils'
import { Repository } from 'typeorm'
import { RegisterUserDto } from './dto/registerUser.dto'
import { User } from './entities/user'
import { RedisService } from 'src/redis/redis.service'
import { Permission } from './entities/permission'
import { Role } from './entities/role'
import { LoginUserDto } from './dto/loginUser.dto'
import { LoginUserVo } from './vo/loginUser.vo'
import { UpdateUserPasswordDto } from './dto/updateUserPassword.dto'
import { UpdateUserDto } from './dto/updateUser.dto'

@Injectable()
export class UserService {
  private logger = new Logger() // 日志

  @InjectRepository(User)
  private userRepository: Repository<User>

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>

  @InjectRepository(Role)
  private roleRepository: Repository<Role>

  @Inject(RedisService)
  private redisService: RedisService

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(user.email)

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST)
    }

    if (user.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST)
    }

    const foundUser = await this.userRepository.findOneBy({
      username: user.username
    })

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST)
    }

    const newUser = new User()
    newUser.username = user.username
    newUser.password = md5(user.password)
    newUser.email = user.email
    newUser.nickName = user.nickName

    try {
      await this.userRepository.save(newUser)
      return '注册成功'
    } catch (e) {
      this.logger.error(e, UserService)
      return '注册失败'
    }
  }

  /**
   * 验证用户信息, 如果 ok 就返回
   */
  async login(loginUserDto: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
        isAdmin
      },
      relations: ['roles', 'roles.permissions']
    })

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)
    }

    if (user.password !== md5(loginUserDto.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST)
    }

    const vo = new LoginUserVo()
    vo.userInfo = {
      ...user,
      createTime: user.createTime.getTime(),
      roles: user.roles.map(item => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach(permission => {
          if (!arr.includes(permission)) {
            arr.push(permission)
          }
        })
        return arr
      }, [])
    }

    return vo
  }

  async findUserById(userId: number, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isAdmin
      },
      relations: ['roles', 'roles.permissions']
    })

    return {
      ...user,
      roles: user.roles.map(item => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach(permission => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission)
          }
        })
        return arr
      }, [])
    }
  }

  async findUserDetailById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId
      }
    })

    return user
  }
  async updatePassword(userId: number, passwordDto: UpdateUserPasswordDto) {
    const captcha = await this.redisService.get(`update_password_captcha_${passwordDto.email}`)

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST)
    }

    if (passwordDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST)
    }

    const foundUser = await this.userRepository.findOneBy({
      id: userId
    })

    foundUser.password = md5(passwordDto.password)

    try {
      await this.userRepository.save(foundUser)
      return '密码修改成功'
    } catch (e) {
      this.logger.error(e, UserService)
      return '密码修改失败'
    }
  }
  async update(userId: number, updateUserDto: UpdateUserDto) {
    const captcha = await this.redisService.get(`update_user_captcha_${updateUserDto.email}`)

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST)
    }

    if (updateUserDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST)
    }

    const foundUser = await this.userRepository.findOneBy({
      id: userId
    })

    if (updateUserDto.nickName) {
      foundUser.nickName = updateUserDto.nickName
    }
    if (updateUserDto.headPic) {
      foundUser.headPic = updateUserDto.headPic
    }

    try {
      await this.userRepository.save(foundUser)
      return '用户信息修改成功'
    } catch (e) {
      this.logger.error(e, UserService)
      return '用户信息修改成功'
    }
  }
}
