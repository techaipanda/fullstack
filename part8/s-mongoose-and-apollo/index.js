// ⭐⭐⭐ index.js — part8s "Mongoose and Apollo" 重写后的编排入口 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 课程 line 63-69**(Chapter 4 第二小节)
//   - 课程原文(per course line 63):"Let's use the module in the file _index.js_"
//   - 这是 part8r 5 行 stub 的进化版,加了 main 异步函数包 connectToDatabase
//   - 跟 part8r index.js(5 行)对比,扩充到 9 行(6 个 require/const + main 函数)
//
// ⭐⭐⭐ 重构前后对比(part8r → part8s)⭐⭐⭐
//   part8r index.js(5 行):
//     - require('dotenv').config()
//     - require('./server')
//     - const PORT = process.env.PORT || 4000
//     - startServer(PORT)
//   part8s index.js(9 行):
//     - require('dotenv').config()              ← 沿用
//     - require('./db')                         ← 新增(connectToDatabase)
//     - require('./server')                     ← 沿用
//     - const MONGODB_URI = process.env.MONGODB_URI  ← 新增
//     - const PORT = process.env.PORT || 4000   ← 沿用
//     - const main = async () => {              ← 新增(包 await + startServer)
//       await connectToDatabase(MONGODB_URI)
//       startServer(PORT)
//     }
//     - main()                                  ← 新增(调用 main)
//
// ⭐⭐⭐ 核心概念:async/await 顶层 await + main 模式 ⭐⭐⭐
//
// 1. ⭐ 课程原文(per course line 69):"Because the async/await syntax can only
//    be used inside functions, we now define a simple _main_ function that
//    handles starting the application. This allows us to call the function
//    that creates the database connection using the _await_ keyword."
//   → 关键限制:await 只能在 async 函数里用
//   → Node.js 14+ 支持顶层 await(在 ESM 里),但本项目是 CommonJS
//   → CommonJS 必须把 await 包在 async 函数里
//
// 2. ⭐ main 函数的执行序(line 9-10 高亮):
//   - await connectToDatabase(MONGODB_URI)
//     → 阻塞,直到 MongoDB 连接成功(或 process.exit(1))
//     → 如果连接失败,不会执行下一行(进程已退出)
//   - startServer(PORT)
//     → 只有 DB 连上后才启动 Apollo Server
//     → 顺序很关键:**先 DB,后 server**
//
// 3. ⭐ 为什么 startServer 不需要 await?
//   - startServer 是同步函数,内部 startStandaloneServer 是 async(返回 Promise)
//   - 但课程 verbatim 不 await startStandaloneServer(per part8r 沿用)
//   - main 函数**不**等待 server 启动完成就返回
//   - 如果 server 启动失败,main 已经 resolve,错误只能从 .then(...) 链路冒泡
//   - 课程原版如此,我严格 verbatim 不加 await
//
// 4. ⭐ 为什么需要 main 函数包起来?
//   - 直接写 `await connectToDatabase(MONGODB_URI)` 在顶层会报错(SyntaxError)
//   - 必须有 async 函数包裹,await 才能工作
//   - 课程给的方案:main = async () => { ... }; main()

// ⭐⭐⭐ 1. dotenv 加载 .env 文件 — verbatim 课程 line 67(拆分)⭐⭐⭐
//
// ⭐ 关键:.config() 返回 { parsed: {...} } 或 { error },课程这里不接返回值(无 error handling)
//   副作用式:执行完 .config() 后 process.env 自动多了 .env 里的变量
//   part8s 多了 MONGODB_URI 变量需要读(per .env.example)
require('dotenv').config()

// ⭐⭐⭐ 2. 引入 connectToDatabase 工厂 — verbatim 课程 line 67(拆分)⭐⭐⭐
//
// ⭐ 关键:require('./db') **不会**连接 DB!
//   - 因为 db.js 导出的是函数(per db.js:module.exports = connectToDatabase)
//   - require 只是"拿到这个函数",不调它就没任何副作用
//   - 这就是工厂模式的核心:导入 ≠ 启动
const connectToDatabase = require('./db')

// ⭐⭐⭐ 3. 引入 startServer 工厂 — verbatim 课程 line 67(拆分)⭐⭐⭐
//
// ⭐ 关键:require('./server') **不会**启动 server!
//   - 因为 server.js 导出的是函数(per server.js:module.exports = startServer)
//   - require 只是"拿到这个函数",不调它就没任何副作用
const startServer = require('./server')

// ⭐⭐⭐ 4. 从环境变量读 MONGODB_URI — verbatim 课程 line 67(拆分)⭐⭐⭐
//
// ⭐ 关键:课程 verbatim **不**给 fallback!
//   - MONGODB_URI = process.env.MONGODB_URI(没有 || '默认值')
//   - 如果 .env 里没设 MONGODB_URI → mongoose.connect(undefined) 会报错
//   - 错误会在 db.js 的 try/catch 里捕获 → console.log + process.exit(1)
//   - 课程原版如此,我不加兜底链
//
// ⭐ process.env.MONGODB_URI 类型是 string(环境变量都是 string!)
//   - Atlas 集群:mongodb+srv://user:pass@cluster.mongodb.net/phonebook
//   - 本地:mongodb://localhost:27017/phonebook
const MONGODB_URI = process.env.MONGODB_URI

// ⭐⭐⭐ 5. 从环境变量读 PORT,fallback 4000 — verbatim 课程 line 67(拆分)⭐⭐⭐
//
// ⭐ part8r 沿用:先看 .env 里的 PORT(如果有)
//   没有 .env / 没有 PORT 变量 → fallback 到 4000
//   4000 是"frontend expects"的端口(per course line 187)
//     → React app 默认 fetch localhost:4000/graphql
const PORT = process.env.PORT || 4000

// ⭐⭐⭐ 6. main 函数 + 调用 — verbatim 课程 line 67(拆分) ⭐⭐⭐
//
// ⭐⭐ 关键高亮行(per course line 65):"Highlighted lines: 3, 6, 9 to 10"
//   - 第 3 行:const MONGODB_URI = process.env.MONGODB_URI
//   - 第 6 行:const PORT = process.env.PORT || 4000
//   - 第 9-10 行:main async 函数的 await + startServer(PORT)
//   → 课程在原文里把行号标出来,意味着"重点关注 main 函数里这两行"
const main = async () => {
  // ⭐⭐ await connectToDatabase(MONGODB_URI) — 高亮行 9 ⭐⭐
  //   - 必须 await:不等连接成功就调 startServer,会找不到 model
  //   - 失败时 db.js 内部 process.exit(1),这里 await 永远不会 resolve
  await connectToDatabase(MONGODB_URI)
  // ⭐ startServer(PORT) — 高亮行 10
  //   - DB 连上后才启动 server,顺序固定
  startServer(PORT)
}

// ⭐ 启动 main(per course line 67 末尾的 main())
// ⭐ 注意:课程没有 .catch() 包裹,错误处理全靠 db.js 的 process.exit(1)
//   如果 main 里有其他异步错误,会变成 unhandledRejection(per Node 默认)
//   课程原版如此,我严格 verbatim
main()