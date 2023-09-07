import 'dotenv/config'

const {
  MYSQL_CONFIG_DATABASE,
  MYSQL_CONFIG_USERNAME,
  MYSQL_CONFIG_PASSWORD,
  MYSQL_CONFIG_HOST,
  MYSQL_CONFIG_PORT,
  REDIS_CONFIG_PORT,
  REDIS_CONFIG_HOST,
  REDIS_CONFIG_USERNAME,
  REDIS_CONFIG_PASSWORD,
  REDIS_CONFIG_DB,
  EMAIL_CONFIG_HOST,
  EMAIL_CONFIG_POST,
  EMAIL_CONFIG_USER,
  EMAIL_CONFIG_PASS,
} = process.env

export const config = {
  port: 3000,
}

export const mysqlConfig = {
  database: MYSQL_CONFIG_DATABASE,
  username: MYSQL_CONFIG_USERNAME,
  password: MYSQL_CONFIG_PASSWORD,
  localhost: MYSQL_CONFIG_HOST,
  port: +MYSQL_CONFIG_PORT,
}

export const redisConfig = {
  port: +REDIS_CONFIG_PORT,
  host: REDIS_CONFIG_HOST,
  username: REDIS_CONFIG_USERNAME,
  password: REDIS_CONFIG_PASSWORD,
  database: +REDIS_CONFIG_DB,
}

export const emailConfig = {
  host: EMAIL_CONFIG_HOST,
  port: +EMAIL_CONFIG_POST,
  user: EMAIL_CONFIG_USER,
  pass: EMAIL_CONFIG_PASS,
}

