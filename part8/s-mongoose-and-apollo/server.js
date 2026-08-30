// ⭐⭐⭐ server.js — part8r "Refactoring the backend" 新拆出的模块 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 课程 line 147-167**(Chapter 4 第一小节)
//   - 课程原文(per course line 144-145):"Finally, we'll also move the code responsible
//     for starting the Apollo server into its own file, server.js"
//   - 这个文件以前在 part8a~j 都内嵌在 index.js 里(per part8j line 15-26),
//     现在独立成 **只导出 startServer 工厂函数**
//
// ⭐⭐⭐ 关键设计:工厂函数模式 ⭐⭐⭐
//
// 1. ⭐⭐ 核心概念:工厂函数(Factory Function)⭐⭐
//   - 课程原版把 Apollo 启动代码包成一个函数 startServer(port)
//   - 接受参数:port(端口号)
//   - 内部做:new ApolloServer({ typeDefs, resolvers }) + startStandaloneServer(server, { listen: { port } })
//   - 导出:startServer 函数本身(让外部调用)
//   - 整个工厂:传 port 进去 → server 就起来了
//
// 2. 为什么要工厂函数?
//   - 课程原文(per course line 169):"Starting the Apollo server is now handled
//     inside the startServer function we defined ourselves. This lets us export
//     the function and start the server from outside the module, from the
//     index.js file. The function takes as a parameter the port that Apollo
//     Server will listen on."
//   - 拆模块的关键:让 index.js "能控制启动时机",而不是 "import 就立即启动"
//   - 如果不抽函数,import './server' 时就会立即启动 server
//   - 抽成函数后,index.js 里调 startServer(PORT) 才启动
//   - 这给后续章节(per course line 188-189:"when we soon switch to using a database
//     for storing data, the database connection must be created before starting
//     the server")留出空间:
//     → index.js 里可以先 `await connectDB()` 再 `startServer(PORT)`
//
// 3. 对比 part8j 的内联写法:
//   - part8j index.js(27 行):new ApolloServer + startStandaloneServer + .then(console.log)
//     → require('./schema') 时就立即启动,无法推迟
//   - part8r index.js(5 行):require('./server') 只拿到函数,不启动
//     → 后面显式调 startServer(PORT) 才启动
//   - 这就是 "工厂模式" vs "立即执行" 的区别

// ⭐ ApolloServer — @apollo/server 主类(per part8a 沿用)
const { ApolloServer } = require('@apollo/server')

// ⭐ startStandaloneServer — Apollo Server v4 的最小 standalone 启动器(per part8a 沿用)
const { startStandaloneServer } = require('@apollo/server/standalone')

// ⭐⭐⭐ 引入兄弟模块(关键依赖)⭐⭐⭐
//
// ⭐ 关键设计:server.js 是"装配车间",依赖另外两个模块
//   - require('./resolvers') → 拿到 resolvers 对象(per part8r 新模块)
//   - require('./schema') → 拿到 typeDefs 字符串(per part8r 新模块)
//   - 注意 require('./schema') 拿到的**直接是字符串**(因为 schema.js 里
//     `module.exports = typeDefs` 是单值导出,不是对象)
//   - 同样 require('./resolvers') 拿到的**直接是 resolvers 对象**
const resolvers = require('./resolvers')
const typeDefs = require('./schema')

// ⭐⭐⭐ startServer 工厂函数 — verbatim 课程 line 153-164 ⭐⭐⭐
//
// ⭐⭐⭐ 关键设计:port 作为参数传入(而不是硬编码 4000)⭐⭐⭐
//   - 函数签名 `(port) =>`,无默认值,无默认值兜底
//   - 调用方负责给 port(per part8r index.js:startServer(PORT))
//   - PORT 在 index.js 里读 env 变量(per course line 182):
//     `const PORT = process.env.PORT || 4000`
const startServer = (port) => {
  // ⭐ new ApolloServer({ typeDefs, resolvers }) — verbatim 课程 line 154-157
  //   typeDefs: SDL 字符串(从 schema.js 来)
  //   resolvers: Query/Person/Mutation 三块对象(从 resolvers.js 来)
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  // ⭐ startStandaloneServer — verbatim 课程 line 159-163
  //   - listen: { port } 是 ES6 shorthand,等价 { port: port }
  //   - .then(({ url }) => console.log(...)) — 异步拿到 url 后打印
  //   - 课程原版 console.log 用 `Server ready at ${url}`
  //     (per part8a-j 我加了 🚀 / 👉 emoji 是教学标记,这里恢复纯课程原文)
  startStandaloneServer(server, {
    listen: { port },
  }).then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
}

// ⭐⭐⭐ 默认导出 startServer 工厂(per course line 166)⭐⭐⭐
//
// ⭐ 跟前面两个文件保持一致的导出风格:
//   - schema.js     → module.exports = typeDefs
//   - resolvers.js  → module.exports = resolvers
//   - server.js     → module.exports = startServer
//   每个文件只导出"自己负责的那一份"(单一职责)
//
// ⭐ 验证:node -e "const s = require('./server'); console.log(typeof s)"
//   应该打印 'function',证明拿到的是 startServer 函数本身
module.exports = startServer
