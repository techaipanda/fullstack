// ⭐⭐⭐ index.js — part8r "Refactoring the backend" 重写后的 stub ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 课程 line 178-185**(Chapter 4 第一小节)
//   - 课程原文(per course line 175):"Only a small amount of code remains in
//     index.js. After the refactor, its contents are as follows"
//   - 这就是重写后的最终状态,part8r 课程子节就这么短
//   - 跟 part8j index.js(27 行)对比,缩减到 5 行
//
// ⭐⭐⭐ 重构前后对比 ⭐⭐⭐
//   part8j index.js(27 行):
//     - require @apollo/server + standalone + ./schema
//     - new ApolloServer({ typeDefs, resolvers })
//     - startStandaloneServer(server, { listen: { port: 4000 } }).then(console.log)
//   part8r index.js(5 行):
//     - require('dotenv').config()         ← 新增
//     - require('./server')                ← 拿工厂函数(不启动)
//     - const PORT = process.env.PORT || 4000  ← 新增(env 变量读 port)
//     - startServer(PORT)                  ← 调工厂,正式启动
//
// ⭐⭐⭐ 核心概念:dotenv + 环境变量 ⭐⭐⭐
//
// 1. ⭐ dotenv 是干什么的?
//   - require('dotenv').config() 会读项目根目录的 .env 文件
//   - 把 .env 文件里的 KEY=VALUE 加载到 process.env 对象里
//   - 例:.env 文件写 PORT=4001 → process.env.PORT === '4001'
//   - 必须先 require('dotenv').config() 才能读到 .env 里的内容
//
// 2. ⭐ process.env.PORT || 4000 兜底链
//   - 先看 .env 里的 PORT(如果有)
//   - 没有 .env / 没有 PORT 变量 → fallback 到 4000
//   - 4000 是"frontend expects"的端口(per course line 187)
//     → React app 默认 fetch localhost:4000/graphql
//     → 所以 server 没指明 port 时,fallback 4000 让前端不需要改
//   - 课程原版注释(per course line 187):"If the PORT environment variable is
//     not found, the default port 4000 is used—which is also the port the
//     frontend currently expects the server to be running on."
//
// 3. ⭐ 为什么需要拆成 stub?
//   - 课程原文(per course line 189):"For now, the contents of index.js are
//     just a stub, but as the application grows it will include more. For example,
//     when we soon switch to using a database for storing data, the database
//     connection must be created before starting the server."
//   - 现在 5 行,后续章节要加 await connectDB() 等数据库初始化
//   - 拆模块就是为了留这种扩展空间
//
// 4. ⭐ 跟 part7 后的 .env 约定对比
//   - fullstack repo 里 part5/phonebook 用过 dotenv(per 全栈课惯例)
//   - part8r 首次正式在 server 端落地 .env 模式
//   - 这个项目**还没创建 .env 文件**(我严格不创建,课程里也没要求具体内容)
//   - 用户可以自己 touch .env 写 PORT=4001 测试
//   - 不写 .env 时,fallback 4000,跟 part8a~j 完全一致

// ⭐⭐⭐ 1. dotenv 加载 .env 文件 — verbatim 课程 line 178 ⭐⭐⭐
//
// ⭐ 关键:.config() 返回 { parsed: {...} } 或 { error },课程这里不接返回值(无 error handling)
//   副作用式:执行完 .config() 后 process.env 自动多了 .env 里的变量
require('dotenv').config()

// ⭐⭐⭐ 2. 引入 startServer 工厂 — verbatim 课程 line 180 ⭐⭐⭐
//
// ⭐ 关键:require('./server') **不会**启动 server!
//   - 因为 server.js 导出的是函数(per server.js:module.exports = startServer)
//   - require 只是"拿到这个函数",不调它就没任何副作用
//   - 这就是工厂模式的核心:导入 ≠ 启动
const startServer = require('./server')

// ⭐⭐⭐ 3. 从环境变量读 PORT,fallback 4000 — verbatim 课程 line 182 ⭐⭐⭐
//
// ⭐ process.env.PORT 类型是 string(环境变量都是 string!)
//   - 如果 .env 里写 PORT=4001 → process.env.PORT === '4001'(字符串)
//   - 4000 fallback 是 number
//   - startStandaloneServer({ listen: { port: '4001' } }) 能自动转成 number 吗?
//   - 课程 verbatim 没强转,我也不加 — 这是课程原文
const PORT = process.env.PORT || 4000

// ⭐⭐⭐ 4. 启动 server — verbatim 课程 line 184 ⭐⭐⭐
//
// ⭐ 现在才真正启动!之前 3 行全是"准备",这一行是"点火"
// ⭐ startServer(PORT) 是同步调用,内部 startStandaloneServer 是异步的(then console.log)
// ⭐ 启动后:控制台打印 'Server ready at http://localhost:PORT/'
startServer(PORT)
