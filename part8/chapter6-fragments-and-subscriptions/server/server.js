// ⭐⭐⭐ server.js — Chapter 6 "Fragments and subscriptions" 子节 2 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件基于 part8v 改造,**整个文件按 part8e.md 课程 verbatim 重写**
//   - 课程原文(per part8e.md line 224-230):
//     "Starting from version 3.0, Apollo Server no longer provides direct support
//     for subscriptions. We therefore need to make a number of changes to the
//     backend code in order to get subscriptions working."
//   - 课程原文(per part8e.md line 290-293):
//     "Let's install Express and the Apollo Server integration package: ...
//      and change the *server.js* file to the following form"
//   - 改造范围:本文件**完全替换**,课程 line 295-388 给完整 final-state 代码
//   - 关键变更 3 处:
//     1. startStandaloneServer → expressMiddleware + express + http.createServer
//     2. new ApolloServer({ typeDefs, resolvers }) → new ApolloServer({ schema: makeExecutableSchema(...) })
//     3. 加 WebSocketServer + useServer(graphql-ws)用于 subscriptions
//
// ⭐⭐ 跟 part8v baseline 的对比:
//   ┌─────────────────────┬───────────────────────────┬─────────────────────────────────────┐
//   │ 维度                │ part8v(原 baseline)        │ Chapter 6 子节 2(verbatim 改后)      │
//   ├─────────────────────┼───────────────────────────┼─────────────────────────────────────┤
//   │ Apollo Server 启动  │ startStandaloneServer     │ expressMiddleware + express + http  │
//   │ server 实例化       │ { typeDefs, resolvers }   │ { schema: makeExecutableSchema(...) }│
//   │ startServer 类型    │ 同步函数                  │ async 函数(等 server.start())       │
//   │ Subscription 支持   │ 无                        │ WebSocketServer + useServer         │
//   │ 优雅关闭 plugin     │ 无                        │ ApolloServerPluginDrainHttpServer +  │
//   │                     │                           │ 自定义 serverWillStart/drainServer   │
//   │ console.log 文案    │ "Server ready at ${url}"  │ "Server is now running at ..."      │
//   └─────────────────────┴───────────────────────────┴─────────────────────────────────────┘
//
// ⭐ 课程安装命令(verbatim):
//   - npm install express cors @as-integrations/express5        (per part8e.md line 287-288)
//   - npm install graphql-ws ws @graphql-tools/schema           (per part8e.md line 471-473)
//   - npm install graphql-subscriptions                         (per part8e.md line 585-587)
//   用户需手动在 server/ 目录运行这些命令(per "Claude 不替你跑任何命令")
//
// ⭐⭐⭐ 关键架构升级:startStandaloneServer → expressMiddleware 的理由 ⭐⭐⭐
//   - 课程原文(per part8e.md line 271-280):
//     "Unfortunately, startStandaloneServer does not allow adding subscriptions
//      to the application, so let's switch to the more robust expressMiddleware
//      function. As the name of the function already suggests, it is an Express
//      middleware, which means that Express must also be configured for the
//      application, with the GraphQL server acting as middleware."
//   - 简单说:
//     startStandaloneServer 是 Apollo Server v3 的"自带 HTTP server"
//     → 它只有一个路由(/)处理 GraphQL HTTP requests,无法挂其他路由
//     → 它**不**支持 WebSocket transport 升级
//     → 所以 Apollo Server v3+ 用户必须换成 express middleware 自己搭 HTTP server
//     → 然后用 httpServer 升级到 WebSocket 承载 subscriptions
//   - 换成 express middleware 后:
//     → express 自己跑 HTTP server(http.createServer(app))
//     → express 用 cors() 处理跨域
//     → express 用 express.json() 解析 JSON body
//     → app.use('/', expressMiddleware(server, ...)) 把 GraphQL HTTP 接到根路由
//     → 同一个 httpServer 升级成 WebSocket 后,graphql-ws 挂同一端口的 '/'
//
// ⭐⭐⭐ 关键概念:ApolloServerPluginDrainHttpServer(per 课程 block 25)⭐⭐⭐
//   - 课程原文(per part8e.md line 416-421):
//     "Following the recommendations in the documentation, ApolloServerPluginDrainHttpServer
//      has been added to the GraphQL server configuration"
//   - 这个 plugin 做的事:server 关闭时,**等所有 in-flight HTTP 请求完成**才退出
//     - 不加 → SIGTERM 时正在处理的请求会被强行中断 → 客户端收到 502/504
//     - 加了 → server.start() / serverWillStart() 钩子通知"准备关闭" → 排空队列 → 退出
//   - 它接 httpServer 作为参数(per course line 426),这样 plugin 才能注册 lifecycle 钩子
//   - 课程原文(per part8e.md line 433-438):
//     "This plugin ensures that the server is shut down cleanly when the server
//      process is stopped. For example, it makes it possible to finish processing
//      in-flight requests and close client connections so that they don't get left hanging."
//
// ⭐⭐⭐ 关键概念:graphql-ws + WebSocketServer + useServer(per 课程 block 26)⭐⭐⭐
//   - 课程原文(per part8e.md line 481-484 verbatim):
//     "const { WebSocketServer } = require('ws')
//      const { useServer } = require('graphql-ws/use/ws')"
//   - ws 包:Node.js WebSocket 实现(http upgrade 协议)
//   - graphql-ws:GraphQL over WebSocket 协议库(sub-protocol: graphql-transport-ws)
//   - useServer 是 graphql-ws 提供的"绑定" helper:
//     → 接受 { schema } + wsServer 实例
//     → 在 wsServer 上注册 graphql-ws 的协议 handler(upgrade 事件 + message 处理)
//     → 返回 serverCleanup 对象(有 .dispose() 用于优雅关闭所有 active subscriptions)
//   - 关键 verbatim(per course line 498-510):
//     "const wsServer = new WebSocketServer({ server: httpServer, path: '/' })
//      const schema = makeExecutableSchema({ typeDefs, resolvers })
//      const serverCleanup = useServer({ schema }, wsServer)"
//     - server: httpServer → 复用上面那个 express HTTP server(同一端口)
//     - path: '/' → WebSocket 握手也在 / 路径(跟 GraphQL HTTP 同路径,通过协议升级区分)
//
// ⭐⭐⭐ 关键概念:drainServer 自定义 plugin(per 课程 block 26 lines 521-530)⭐⭐⭐
//   - 课程 verbatim:
//     "async serverWillStart() {
//        return {
//          async drainServer() {
//            await serverCleanup.dispose();
//          },
//        }
//      },"
//   - serverWillStart 是 Apollo Server plugin 生命周期 hook
//     → 触发时机:ApolloServer 实例 start() 之前(per Apollo docs)
//     → 可以返回 lifecycle 对象,包含 drainServer 等方法
//   - 返回的 drainServer 在 server 关闭时被调,确保 WebSocket 连接也清理
//   - serverCleanup.dispose() 关闭所有 wsServer 上的 active subscriptions
//   - 为什么需要?HTTP 由 ApolloServerPluginDrainHttpServer 处理,WebSocket 需要自己写 plugin
//
// ⭐⭐⭐ 关键概念:makeExecutableSchema(per 课程 block 24)⭐⭐⭐
//   - 课程原文(per part8e.md line 311-312):
//     "const { makeExecutableSchema } = require('@graphql-tools/schema')"
//   - 作用:把 SDL 字符串(typeDefs) + resolvers 对象 → 可执行的 GraphQL schema
//   - 之前 part8v 是 `new ApolloServer({ typeDefs, resolvers })`:
//     → ApolloServer 内部自动 makeExecutableSchema
//   - 现在必须**显式** makeExecutableSchema:
//     → 因为 useServer({ schema }) 需要 executable schema 引用
//     → new ApolloServer({ schema }) 直接传入(不是 typeDefs 字符串)
//   - 同一个 schema 被 ApolloServer 和 useServer 共用(per course line 505-506, 515)

// ⭐ ApolloServer — @apollo/server 主类(per part8a 沿用)
const { ApolloServer } = require('@apollo/server')

// ⭐⭐⭐ Chapter 6 子节 2 新增(per course line 296-315 verbatim):⭐⭐⭐
//   1. ApolloServerPluginDrainHttpServer — 优雅关闭 plugin(per 课程 block 25)
//   2. expressMiddleware — Apollo Server 作为 express middleware(per course line 305-306)
//   3. cors — 处理浏览器跨域(per course line 307-308)
//   4. express — web framework(per course line 309-310)
//   5. makeExecutableSchema — @graphql-tools/schema 提供,把 SDL + resolvers 编成 schema(per course line 311-312)
//   6. http — Node.js 内置 http 模块,创建 HTTP server(per course line 313-314)
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')
const { expressMiddleware } = require('@as-integrations/express5')
const cors = require('cors')
const express = require('express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const http = require('http')

// ⭐⭐⭐ Chapter 6 子节 2 新增(per course line 480-484 verbatim):⭐⭐⭐
//   - WebSocketServer:ws 包提供的类,接受 server + path 配置
//   - useServer:graphql-ws 提供的"绑定"函数,把 GraphQL schema 挂到 WebSocketServer
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/use/ws')

// ⭐ part8u 沿用:jsonwebtoken + User model(verbatim 课程 block 79)
const jwt = require('jsonwebtoken')
const User = require('./models/user')

// ⭐⭐⭐ 关键差异:per course line 350,server.js 里 schema 是 **makeExecutableSchema(...)** ⭐⭐
//   - 之前 part8v 是 `const server = new ApolloServer({ typeDefs, resolvers })`
//     → ApolloServer 自己从 typeDefs 字符串 + resolvers 对象构造 schema
//   - 现在必须显式 `const schema = makeExecutableSchema({ typeDefs, resolvers })`
//     → 因为 useServer({ schema }) 需要这个 executable schema 引用
//     → new ApolloServer({ schema }) 直接传入 schema(不是 typeDefs 字符串)
//   - 课程原文(per part8e.md line 350-352):
//     "const server = new ApolloServer({
//        schema: makeExecutableSchema({ typeDefs, resolvers }),
//        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
//      })"
const resolvers = require('./resolvers')
const typeDefs = require('./schema')

// ⭐ part8u 沿用:getUserFromAuthHeader helper(verbatim 课程 block 79)
//   - 课程 line 326-338 verbatim 保留这个 helper
//   - 在新 expressMiddleware 的 context 里复用(per course line 367-374)
const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.startsWith('Bearer ')) {
    return null
  }

  const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
  return User.findById(decodedToken.id).populate('friends')
}

// ⭐⭐⭐ startServer 工厂函数 — 完全重写(per course line 342-384 verbatim)⭐⭐⭐
//
// ⭐ 跟 part8v 的对比:
//   part8v: const startServer = (port) => { ... } (同步)
//   Chapter 6 子节 2: const startServer = async (port) => { ... } (异步)
//   理由:server.start() 是 async(返回 Promise),要 await
//   课程原文(per part8e.md line 408-413):
//     "The GraphQL server must be started before the Express application can
//      begin listening on the specified port, so the startServer function has
//      been made an async function in order to be able to wait for the GraphQL
//      server to start"
const startServer = async (port) => {
  // ⭐ 1. 创建 express app(per course line 344)
  //   - express() 返回一个 app 对象,可以挂 middleware
  //   - 跟 part8v 的 startStandaloneServer 不同,这里**先**创建 app 再 mount middleware
  const app = express()

  // ⭐ 2. 创建 HTTP server(per course line 345-346)
  //   - http.createServer(app) 把 express app 包成 Node.js HTTP server
  //   - 这个 server 同时承载 HTTP(GraphQL queries/mutations)和 WebSocket(subscriptions)
  //   - 课程原文(per part8e.md line 393-395):
  //     "The GraphQL server in the *server* variable is now connected to listen
  //      to the root of the server, i.e. to the / route, using the expressMiddleware
  //      object"
  const httpServer = http.createServer(app)

  // ⭐⭐⭐ 3. WebSocketServer + useServer(per course line 498-510 verbatim)⭐⭐⭐
  //
  // ⭐ WebSocketServer 配置:
  //   - server: httpServer → 复用上面那个 HTTP server(同一端口)
  //   - path: '/' → 跟 GraphQL HTTP 同路径,通过协议升级区分
  //     → HTTP 请求走 expressMiddleware,WebSocket 握手走 wsServer
  //
  // ⭐ schema 用 makeExecutableSchema 构造(per course line 505-506):
  //   - 必须是 executable schema(不是 SDL 字符串)
  //   - 同一个 schema 会被 ApolloServer 和 useServer 共用
  //
  // ⭐ serverCleanup 用于优雅关闭(per course line 528):
  //   - serverCleanup.dispose() 关闭所有 active WebSocket subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })

  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleanup = useServer({ schema }, wsServer)

  // ⭐⭐⭐ 4. ApolloServer 实例(per course line 512-536 verbatim)⭐⭐⭐
  //
  // ⭐ schema 字段:传 executable schema(per course line 515)
  //   - 不传 typeDefs/resolvers,直接传 schema
  //
  // ⭐ plugins 字段(per course line 517-533):
  //   1. ApolloServerPluginDrainHttpServer({ httpServer })
  //      → 优雅关闭 HTTP server(per 课程 block 25 line 426-429)
  //   2. 内联对象:{ async serverWillStart() { return { async drainServer() { ... } } } }
  //      → 优雅关闭 WebSocket subscriptions(per 课程 block 26 line 522-530)
  //      → serverWillStart 是 plugin 生命周期 hook,server 启动时调
  //      → 返回的 drainServer 在 server 关闭时被调
  //      → drainServer 里 await serverCleanup.dispose() 关闭所有 ws
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          }
        },
      },
    ],
  })

  // ⭐ 5. await server.start()(per course line 538)
  //   - 必须 await,否则下面 app.use() 拿到的 server 可能还没初始化
  //   - 课程原文(per part8e.md line 411-413):
  //     "await server.start()"
  await server.start()

  // ⭐⭐⭐ 6. app.use 挂载 express middleware(per course line 359-376 verbatim)⭐⭐⭐
  //
  // ⭐ 路径 '/':
  //   - 所有 '/' 路径的 HTTP 请求都走这个 middleware 链
  //   - cors() → express.json() → expressMiddleware(server, { context })
  //   - 顺序很重要:cors 必须早于 expressMiddleware(否则跨域先被拒绝)
  //   - 课程原文(per part8e.md line 391-401):
  //     "Since it is an Express server, the middlewares express-json and cors
  //      are also needed so that the data included in the requests is correctly
  //      parsed and so that CORS problems do not appear"
  //
  // ⭐ cors():
  //   - 课程 inline 文档说"so that CORS problems do not appear"
  //   - 默认 cors() 允许所有来源(*),开发环境 OK;生产环境应该白名单
  //
  // ⭐ express.json():
  //   - 解析 POST body 的 JSON(Apollo Server HTTP transport 用 POST + JSON)
  //   - 不加 → req.body 是 undefined → Apollo 拿不到 query
  //
  // ⭐ expressMiddleware(server, { context }):
  //   - context 跟 part8v 的 startStandaloneServer context **完全一样**
  //     → 读 req.headers.authorization
  //     → getUserFromAuthHeader 解 token
  //     → return { currentUser }
  //   - 课程 verbatim(per course line 367-374)
  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization
        const currentUser = await getUserFromAuthHeader(auth)
        return { currentUser }
      },
    }),
  )

  // ⭐ 7. httpServer.listen(port)(per course line 379-383)
  //   - 课程原文(per part8e.md line 381-383):
  //     "httpServer.listen(port, () =>
  //        console.log(`Server is now running on http://localhost:${port}`),
  //      )"
  //   - 注意:课程用 `Server is now running` 跟 part8v 的 `Server ready at` 不一样
  //   - part8v 用 startStandaloneServer 的 url 字段(path=/graphql),这里用 port
  httpServer.listen(port, () =>
    console.log(`Server is now running on http://localhost:${port}`),
  )
}

// ⭐⭐ 默认导出 startServer 工厂(per course line 388)
//
// ⭐ 跟前面模块保持一致的导出风格:
//   - schema.js     → module.exports = typeDefs
//   - resolvers.js  → module.exports = resolvers
//   - server.js     → module.exports = startServer  ← 本文件
module.exports = startServer