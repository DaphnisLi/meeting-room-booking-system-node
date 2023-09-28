# CLI
https://nestjs.bootcss.com/cli/usages.html
- 新项目 nest new xxx
- 模块 nest generate module xxx
- 完整模块, 不生成测试代码 nest generate resource xxx --no-spec

全局模块需在 app.module import 一下

controller 接口
service 业务逻辑
module 处理模块

middleware(中间件) 适合通用逻辑
interceptor(拦截器) 适合业务逻辑
guard(守卫) 适合鉴权

# 注意
- src 里的文件才会被复制到 dist
- Authorization 加 Bearer

# 基础
- Injectable 提供者: 提供依赖


# 装饰器
- @Module： 声明 Nest 模块
- @Controller：声明模块里的 controller
- @Injectable：声明模块里可以注入的 provider
- @Inject：通过 token 手动指定注入的 provider，token 可以是 class 或者 string
- @Global：声明全局模块
- @Get、@Post、@Put、@Delete、@Patch、@Options、@Head：声明 get、post、put、delete、patch、options、head 的请求方式
- @Param：取出 url 中的参数，比如 /aaa/:id 中的 id@Query: 取出 query 部分的参数，比如 /aaa?name=xx 中的 name
- @Body：取出请求 body，通过 dto class 来接收
- @Headers：取出某个或全部请求头
- @Catch：声明 exception filter 处理的 exception 类型
- @SetMetadata：在 class 或者 handler 上添加 metadata
- @Req、@Request：注入 request 对象
- @Res、@Response：注入 response 对象，一旦注入了这个 Nest 就不会把返回值作为响应了，除非指定 passthrough 为true
- @HttpCode： 修改响应的状态码
- @Header：修改响应头
- @Redirect：指定重定向的 url
- @Render：指定渲染用的模版引擎
- @Optional：声明注入的 provider 是可选的，可以为空
- @UseFilters：路由级别使用 exception filter
- @UsePipes：路由级别使用 pipe
- @UseInterceptors：路由级别使用 interceptor
- @Session：取出 session 对象，需要启用 express-session 中间件
- @HostParm： 取出 host 里的参数
- @Next：注入调用下一个 handler 的 next 方法

