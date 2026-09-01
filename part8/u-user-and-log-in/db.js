// ⭐⭐⭐ db.js — part8s "Mongoose and Apollo" 新拆出的数据库连接模块 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 课程 line 43-59**(Chapter 4 第二小节)
//   - 课程原文(per course line 41):"Let's create a separate module _db.js_
//     for the code that establishes the database connection"
//   - 这是 part8s 引入的第二个新模块(models/person.js + db.js)
//   - 拆 db.js 的目的:把"数据库连接"从"启动 server"里分离出来
//
// ⭐⭐⭐ 关键设计:为什么需要单独的 db.js?⭐⭐⭐
//
// 1. ⭐ 连接管理 SRP 延续
//   - part8s 之前 schema.js / resolvers.js / server.js / index.js 各自单一职责
//   - db.js 是新增的"连接"职责:connect + error handling
//   - index.js 只编排"先后顺序"(先连接 DB,再启动 server),不关心连接细节
//
// 2. ⭐ 为什么用 async 函数 + try/catch?
//   - mongoose.connect() 返回 Promise(per part3 沿用)
//   - 必须 await 才能确认连接成功,否则下一步 startServer 会失败
//   - try/catch 捕获连接错误 → process.exit(1) 终止进程
//   - 这就是为什么 main 函数(per index.js)需要 async
//
// 3. ⭐ 课程原文(per course line 61):"The module defines the function
//    connectToDatabase, which receives the database URI as a parameter and
//    takes care of connecting to the database."
//   → 工厂模式继续:connectToDatabase(uri) 接受参数,不写死 URI
//   → URI 从 process.env.MONGODB_URI 来(per index.js)

// ⭐ mongoose — 数据库连接用(per models/person.js 沿用)
const mongoose = require('mongoose')

// ⭐⭐⭐ connectToDatabase 工厂函数 — verbatim 课程 line 46-56 ⭐⭐⭐
//
// ⭐ 关键设计:
//   - async 函数:因为内部用 await mongoose.connect(uri)
//   - 接受 uri 参数:URI 从 index.js 传入,函数本身不知道 URI
//   - 返回 Promise<void>:成功后 resolve,失败后 catch → process.exit(1)
//   - 这个函数**不返回**连接句柄 — mongoose.connect 是全局副作用
//     (mongoose 内部维护 connection pool,后续 Person.find 等 API 自动用)
const connectToDatabase = async (uri) => {
  // ⭐ console.log('connecting to database URI:', uri)
  //   - 注意:URI 可能包含密码!课程这里**明文**打印(per part3 沿用)
  //   - 生产实践应该过滤敏感信息,但课程原文如此,我不偏离
  //   - 验证:启动时控制台会看到 'connecting to database URI: <你的 URI>'
  console.log('connecting to database URI:', uri)

  try {
    // ⭐⭐ await mongoose.connect(uri) — 关键 await ⭐⭐
    //   - mongoose v6+ 不再需要 useNewUrlParser / useUnifiedTopology 选项
    //   - 如果连接失败,会抛异常(网络/DNS/认证失败等)
    //   - 成功 → resolve,控制权回到 main() 函数(per index.js)
    //   - 后续 Person.find() 等自动用这个 connection
    await mongoose.connect(uri)
    console.log('connected to MongoDB')
  } catch (error) {
    // ⭐⭐ catch 块 — 关键设计:process.exit(1) ⭐⭐
    //   - 课程原文(per line 53-55)用 process.exit(1) 而非 throw
    //   - 退出码 1 表示"异常退出"(per Unix 惯例,0 = 成功)
    //   - 不 throw 是因为这个 catch 块外层没有 try/catch 包裹 main
    //   - throw 会让 main() 里的 await 抛错,但 index.js 没用 .catch() 处理
    //   - process.exit(1) 是**立即终止进程**,不留 dangling promise
    console.log('error connection to MongoDB:', error.message)
    process.exit(1)
  }
}

// ⭐⭐⭐ 默认导出 connectToDatabase(per course line 58)⭐⭐⭐
//
// ⭐ 跟前面模块保持一致的导出风格:
//   - models/person.js → module.exports = mongoose.model('Person', schema)
//   - db.js            → module.exports = connectToDatabase
//   - schema.js        → module.exports = typeDefs
//   - resolvers.js     → module.exports = resolvers
//   - server.js        → module.exports = startServer
//   每个文件只导出"自己负责的那一份"(单一职责)
//
// ⭐ 验证:node -e "const fn = require('./db'); console.log(fn.name)"
//   应该打印 'connectToDatabase',证明拿到的是函数本身
module.exports = connectToDatabase