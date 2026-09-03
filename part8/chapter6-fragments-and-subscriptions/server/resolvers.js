// ⭐⭐⭐ resolvers.js — part8t "Validation" 加 try/catch 错误处理 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件基于 part8s 改造,新增内容**完全 verbatim 课程 Validation 段**
//   - 课程原文(per course Validation 段 line 7-9):"for handling possible validation
//     errors in the schema, we must add an error-handling try/catch block to the save
//     method. When we end up in the catch, we throw an exception GraphQLError with
//     error code"
//   - 改造范围:**仅 Mutation 块的 addPerson + editNumber**(各加 try/catch)
//   - Query 块 / Person 块 / 文件结构完全 verbatim part8s(per part8t 只关心 save 错误)
//
// ⭐⭐⭐ 关键 Validation 设计决策 ⭐⭐⭐
//   1. 🎯 防御范围:为什么只 catch save() 不 catch Person.findOne / Person.exists?
//      → 课程明示:save() 是唯一会触发 mongoose schema 验证的入口
//      → findOne / exists / find 都是查询操作,不校验字段
//      → 所以 try/catch 只包 save() 是精准防御,不浪费
//   2. 🎯 双重防线:GraphQL 层 vs Mongoose 层
//      → GraphQL SDL 已经在 schema.js 声明字段类型(String!, String 等)
//      → Mongoose schema 又有 minlength 5/3 + required true
//      → 但**客户端可以绕过 GraphQL**(比如直接打 HTTP)直连 GraphQL server
//         或者 server 端构造 Person 对象(new Person({...}))不经过 SDL 验证
//      → 所以 mongoose 验证是**第二道防线**(per course line 41-44 verbatim)
//   3. 🎯 extensions.error 字段
//      → 课程原文(per course line 49-54):"We have also added the Mongoose error
//        and the data that caused the error to the extensions object that is used
//        to convey more info about the cause of the error to the caller"
//      → 把 mongoose 原始 error 对象也塞 extensions,前端可以细看(比如哪个字段
//        触发 validation)
//      → 前端 part8p 用 onError 接住 extensions.code == 'BAD_USER_INPUT' 后
//        显示 error.graphQLErrors[0].message 给用户

// ⭐ GraphQLError — addPerson 重复名 + save 失败都抛(per part8h 沿用)
//
// ⭐ 关键变化 vs part8s:
//   part8s 抛 GraphQLError 只在 nameExists 重复时
//   part8t 加抛在 save 失败时(try/catch 块里)
const { GraphQLError } = require('graphql')

// ⭐ Person mongoose model — 替代 part8r 的 in-memory `persons` 数组
const Person = require('./models/person')

// ⭐⭐⭐ part8u 新增:User mongoose model + jsonwebtoken(verbatim 课程 block 68)⭐⭐⭐
//
// ⭐ 课程原文(per course block 68):
//   "const jwt = require('jsonwebtoken')
//    const User = require('./models/user')"
//
// ⭐ User model 来自 models/user.js(本节新建文件)
// ⭐ jwt 用于签发 / 验证 token — login mutation 签,server.js 的
//   getUserFromAuthHeader 验
const jwt = require('jsonwebtoken')
const User = require('./models/user')

// ⭐⭐⭐ Chapter 6 子节 3 新增(per part8e.md 子节 3 verbatim):DataLoader ⭐⭐⭐
//
// ⭐ 课程原文(per course n+1 section line 1290 附近):
//   "Let's install the dataloader library:
//    npm install dataloader"
// ⭐ DataLoader(per facebook/dataloader 文档):
//   - Facebook 开源的批量化数据加载库
//   - 解决 GraphQL 等场景的 N+1 查询问题
//   - 核心 API:
//     - `new DataLoader(batchLoadFn)` 创建 loader
//     - `loader.load(key)` 排队一个 key,返回 Promise<value>
//     - `loader.loadMany(keys)` 排队多个 keys
//     - batchLoadFn(keys) → Promise<values[]>,长度跟 keys 一一对应
//   - 工作机制:在每个 event loop tick,把所有 .load() 调用收集成一个 batch,
//     一次性调 batchLoadFn(keys)
//   - 副作用:keys 顺序跟返回值顺序必须严格对应(per DataLoader 合约)
//
// ⭐ 为什么 n+1 problem 需要 DataLoader(per course 阐释):
//   - 单 GraphQL 请求可能触发多个 resolver,每个 resolver 可能查 DB
//   - 比如 `allPersons { friendOf { username } }`:
//     → allPersons resolver 1 次 Person.find({})
//     → N 个 Person 各自 friendOf resolver → N 次 User.find({ friends: person._id })
//     → 总共 N+1 次 DB 查询
//   - DataLoader 拦截 .load() 调用,在单 tick 内合并:
//     → 1 次 User.find({ friends: { $in: [personId1, ..., personIdN] } })
//     → 内存里 partition 到对应 key
//   - N+1 变成 2(1 次 Person + 1 次 User)
//
// ⭐ 本节用法:friendlyOfLoader
//   - batchLoadFn 接受 personIds[]
//   - 返回 users[][] — 外层索引对应 personIds,内层是该 person 的 friendOf 列表
const DataLoader = require('dataloader')

// ⭐⭐⭐ Chapter 6 子节 2 新增(per course line 597-598 verbatim):PubSub ⭐⭐⭐
//
// ⭐ 课程原文(per part8e.md line 580-583):
//   "Let's first install a library that provides publish–subscribe functionality:
//    npm install graphql-subscriptions"
// ⭐ PubSub 类(per graphql-subscriptions 文档):
//   - 实现"发布-订阅"模式(in-memory,单进程)
//   - publish(channel, payload) → 通知该 channel 所有订阅者
//   - asyncIterableIterator(channel) → 订阅该 channel 的所有客户端
//
// ⭐ 生产环境警告(per graphql-subscriptions docs):
//   - 默认 PubSub 是**单进程内存**实现
//   - 多实例 / 集群部署需要换 PubSub engines(Redis / Kafka / Google PubSub 等)
//   - 课程 verbatim 用 in-memory PubSub,本项目学习用,生产不可
const { PubSub } = require('graphql-subscriptions')

// ⭐⭐⭐ Chapter 6 子节 2 新增(per course line 607 verbatim):pubsub 实例 ⭐⭐⭐
//
// ⭐ 课程原文(per part8e.md line 607):
//   "const pubsub = new PubSub()"
// ⭐ 实例化一次,整个 process 共享同一个 pubsub
//   - addPerson mutation 用 pubsub.publish('PERSON_ADDED', { personAdded: person })
//   - Subscription.personAdded resolver 用 pubsub.asyncIterableIterator('PERSON_ADDED')
//   - 它们靠 channel 名 'PERSON_ADDED' 关联
//
// ⭐ channel 名约定(per course block 27 line 728-729):
//   "The iterator name is an arbitrary string, but to follow the convention,
//    it is the subscription name written in capital letters."
//   - Subscription 字段名 'personAdded' → channel 名 'PERSON_ADDED'
//   - 大写 + 下划线分隔,跟 GraphQL field convention 区分
const pubsub = new PubSub()

// ⭐⭐⭐ Chapter 6 子节 3 新增(per course 子节 3 verbatim):friendOfLoader 实例 ⭐⭐⭐
//
// ⭐ 课程原文(per course n+1 section 末尾,per part8e.md line 1500+):
//   "const friendOfLoader = new DataLoader(async (personIds) => {
//      const users = await User.find({ friends: { $in: personIds } })
//      return personIds.map(personId =>
//        users.filter(user =>
//          user.friends.some(f => f.toString() === personId.toString())
//        )
//      )
//    })"
//
// ⭐⭐⭐ 批量化原理 ⭐⭐⭐
//   - 输入:personIds: string[] — 单次 GraphQL 请求里所有 Person.friendOf 解析需要的 person._id
//   - 输出:User[][] — 外层数组索引对应 personIds 顺序,内层是该 person 的 friendOf users
//   - DataLoader 合约:输入 keys.length === 输出 values.length(per DataLoader docs)
//   - 课程实现里 personIds.map(...) 保证每个 key 都有对应返回(即使空数组)
//
// ⭐⭐⭐ 单查询替代 N 查询 ⭐⭐⭐
//   - 没有 loader:N 次 User.find({ friends: person._id })
//     → 每次单独查 mongo,N 次往返
//   - 有 loader:1 次 User.find({ friends: { $in: [所有 personIds] } })
//     → $in 是 mongo 原生多值匹配,1 次往返拿到所有相关 users
//     → 然后内存里 partition 到对应 personId
//   - 网络延迟从 N 次降到 1 次
//
// ⭐⭐⭐ partition 逻辑详解 ⭐⭐⭐
//   - users 是所有 "friends 数组里有任何 personId" 的用户
//   - 每个 user 可能同时被多个 person 引用(一个 user 的 friends 可能有多个)
//   - 我们要把 users 按 "该 user 是哪个 person 的 friendOf" 分组
//   - 实现:对每个 personId,过滤出 "friends 数组里有这个 personId" 的 users
//   - `.some(f => f.toString() === personId.toString())` 比较 ObjectId 字符串
//     → mongoose populate 后 friends 里的元素是 ObjectId,需要 toString() 比较
//
// ⭐⭐⭐ 注意:course loader 是 module-level 单例 ⭐⭐⭐
//   - 当前实现:loader 在 module load 时创建一次,整个进程共用
//   - 单次 GraphQL 请求里所有 .load() 自动批量化(per DataLoader 设计)
//   - 跨请求:loader 会缓存上次的 keys/values,可能有 stale data
//   - 课程**简化**用 module-level,生产应该 per-request loader(per DataLoader docs)
//   - 本节 verbatim 沿用课程简化版本,per-request 版本留作生产化扩展
const friendOfLoader = new DataLoader(async (personIds) => {
  const users = await User.find({ friends: { $in: personIds } })

  return personIds.map(personId =>
    users.filter(user =>
      user.friends.some(f => f.toString() === personId.toString())
    )
  )
})

// ⭐⭐⭐ resolvers 对象 — 在 part8s 基础上加 try/catch ⭐⭐⭐
//
// ⭐⭐⭐ 三个顶层块(跟 part8s 一致)⭐⭐⭐
//   - Query 块:personCount + allPersons + findPerson(verbatim part8s)
//   - Person 块:address resolver(verbatim part8s)
//   - Mutation 块:addPerson + editNumber(**part8t 加 try/catch**)
//
// ⭐ 跟 part8s 核心区别:addPerson.save() / editNumber.save() 加 try/catch
//   catch 里抛 GraphQLError + extensions.code BAD_USER_INPUT + invalidArgs + error
//   课程原文(per course line 16-28):addPerson 的 try/catch
//   课程原文(per course line 39-51):editNumber 的 try/catch
const resolvers = {
  // ⭐ Query 块 — verbatim part8s(per part8t 不改 Query)
  Query: {
    // ⭐ personCount — verbatim part8s
    personCount: async () => Person.collection.countDocuments(),
    // ⭐ allPersons — verbatim part8s 占位版本
    //   - `// filters missing` 仍保留 — Validation 段**不**包含 phone filter
    //   - phone filter 是 part8s README 提到的 line 149-162,但**课程实际把
    //     这部分放到了 Validation 节之后** — part8t 仍不补
    //   - 课程 Validation 节只有 try/catch,**没有** phone filter
    //   - 验证:course Validation 段 line 83-85 verbatim 是 `return Person.find({})`
    allPersons: async (root, args) => {
      // filters missing
      return Person.find({})
    },
    // ⭐ findPerson — verbatim part8s
    findPerson: async (root, args) => Person.findOne({ name: args.name }),
    // ⭐⭐⭐ me(part8u 新增) — 当前登录用户(verbatim 课程 block 84)⭐⭐⭐
    //
    // ⭐ 课程原文(per course block 84):
    //   "Query: {
    //      // ...
    //      me: (root, args, context) => {
    //        return context.currentUser
    //      }
    //    },"
    //
    // ⭐ 第三个参数 context 由 server.js 的 startStandaloneServer.context 注入
    //   (per course block 79 highlighted lines 26-30)
    //   → server.js 里 context 字段:
    //     async ({ req }) => {
    //       const auth = req.headers.authorization
    //       const currentUser = await getUserFromAuthHeader(auth)
    //       return { currentUser }
    //     }
    //   → 没 Authorization header → currentUser = null → me return null(未登录)
    //   → 带 valid token → currentUser = User 文档 → me return User 文档
    //
    // ⭐ 课程 me resolver **不**是 async 函数(per course verbatim 用箭头函数无 async)
    //   → 因为只是 return 一个对象引用,不需要 await
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  // ⭐ Person 块 — verbatim part8s + Chapter 6 子节 3 加 friendOf
  Person: {
    address: ({ street, city }) => {
      return {
        street,
        city,
      }
    },
    // ⭐⭐⭐ Chapter 6 子节 3 新增(per course 子节 3 verbatim):Person.friendOf resolver ⭐⭐⭐
    //
    // ⭐ 课程原文(per course n+1 section):
    //   "Person: {
    //      // ...
    //      friendOf: (person) => friendOfLoader.load(person._id),
    //    },"
    //
    // ⭐⭐⭐ resolver 签名 ⭐⭐⭐
    //   - (person, args, context, info) 是 GraphQL resolver 默认四参数
    //   - person 参数:父对象(就是被查询 friendOf 字段的 Person 实例)
    //   - person._id:当前 Person 的 MongoDB ObjectId
    //   - 返回:friendOfLoader.load(person._id) → Promise<User[]>
    //     → DataLoader 在 tick 末批量触发 batchLoadFn
    //     → 一次 GraphQL 请求里所有 Person.friendOf 合并成 1 次 User.find
    //
    // ⭐⭐⭐ 课程故意省略 args/context(per course verbatim):⭐⭐⭐
    //   - 不需要 query 参数,不需要 currentUser
    //   - person 参数足够(我们要 person._id 来查 users)
    //   - 严格箭头函数 (person) => 风格,verbatim 沿用
    //
    // ⭐⭐⭐ 跟 n+1 修复前对比 ⭐⭐⭐
    //   - 修复前:friendOf: async (person) => User.find({ friends: person._id })
    //     → N 个 Person → N 次 User.find
    //   - 修复后:friendOf: (person) => friendOfLoader.load(person._id)
    //     → N 个 Person 合并 → 1 次 User.find
    friendOf: (person) => friendOfLoader.load(person._id),
  },
  // ⭐⭐⭐ Mutation 块 — part8t 关键改造 ⭐⭐⭐
  Mutation: {
    // ⭐⭐⭐ addPerson — part8t 加 try/catch(verbatim 课程 line 16-28)⭐⭐⭐
    //
    // ⭐ 改造前后对比:
    //   part8s(无 try/catch):
    //     const person = new Person({ ...args })
    //     return person.save()
    //   part8t(verbatim 课程 line 16-28):
    //     const person = new Person({ ...args })
    //     try {
    //       await person.save()
    //     } catch (error) {
    //       throw new GraphQLError(`Saving person failed: ${error.message}`, {
    //         extensions: {
    //           code: 'BAD_USER_INPUT',
    //           invalidArgs: args.name,
    //           error
    //         }
    //       })
    //     }
    //     return person
    //
    // ⭐ 触发场景示例:
    //   1. mongoose 验证失败:name 太短(<5)/ street 太短(<5)/ city 太短(<3)/
    //      缺 required 字段
    //      → mongoose 抛 ValidationError
    //      → error.message 像 "Person validation failed: name: Path `name`
    //        (`xx`) is shorter than the minimum length (5)"
    //      → 透传给前端,显示 "Saving person failed: Person validation failed..."
    //   2. 数据库连接异常(罕见,通常 main 启动时就 catch 了)
    //      → mongoose 抛 MongooseServerSelectionError 等
    //      → 透传给前端
    //
    // ⭐ 为什么 catch 里**再抛** GraphQLError 而不是直接 return error?
    //   → GraphQL 约定:resolver 抛 GraphQLError 才进入 errors[] 数组
    //   → 直接 return error 会让前端收到 data: null + 没具体错误信息
    //   → 抛 GraphQLError + extensions.code 标准化错误,前端 part8p onError 接住
    //   → extensions.error 字段塞 mongoose 原始 error 给前端调试
    // ⭐⭐⭐ addPerson — part8v 加 context + UNAUTHENTICATED + friends 自动加(verbatim 课程 block 91)⭐⭐⭐
    //
    // ⭐ 改造前后对比(part8u → part8v):
    //   part8u signature: addPerson: async (root, args) => { ... }
    //   part8v signature: addPerson: async (root, args, context) => { ... }  ← 新增 context 参数
    //
    //   part8u: 无 auth check,任何人能 addPerson
    //   part8v: 必须登录 — 鉴权后,新加的 person 自动加到 currentUser.friends
    //
    // ⭐ part8v 改造点(per course block 91 highlighted lines 2-11, 28-29):
    //   1. 新增 context 第三个参数(per server.js context 注入的 { currentUser })
    //   2. 读 currentUser = context.currentUser
    //   3. 鉴权:!currentUser → throw GraphQLError 'not authenticated' code 'UNAUTHENTICATED'
    //   4. try 块里:person.save() 后 → currentUser.friends.concat(person) + currentUser.save()
    //
    // ⭐ 课程原文(per course block 88):"Let's complete the application's backend so
    //   that adding and editing persons requires logging in, and added persons are
    //   automatically added to the friends list of the user."
    //
    // ⭐ 注意:课程 block 88 文字提"adding and editing",但 block 91-103 **只**展示
    //   addPerson 改动,editNumber **不**加鉴权(per part8v 故意不做,留给后续章节)
    addPerson: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          }
        })
      }

      const nameExists = await Person.exists({ name: args.name })

      if (nameExists) {
        throw new GraphQLError(`Name must be unique: ${args.name}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
          },
        })
      }

      const person = new Person({ ...args })
      try {
        await person.save()
        // ⭐ part8v 新增:把新 person 加到当前用户的 friends 列表
        //   - currentUser.friends.concat(person) — 不可变追加(per mongoose 文档数组)
        //   - await currentUser.save() — 持久化 user 文档
        //   - per course block 91 highlighted lines 28-29
        currentUser.friends = currentUser.friends.concat(person)
        await currentUser.save()
      } catch (error) {
        throw new GraphQLError(`Saving person failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }

      // ⭐⭐⭐ Chapter 6 子节 2 新增(per course line 675-677 verbatim):pubsub.publish ⭐⭐⭐
      //
      // ⭐ 课程原文(per part8e.md line 736-739):
      //   "Adding a new person publishes a notification about the operation to
      //    all subscribers with PubSub's method publish:
      //    pubsub.publish('PERSON_ADDED', { personAdded: person })"
      //
      // ⭐ 触发时机(per course line 732-734):
      //   - addPerson mutation **成功** 后
      //   - 把新创建的 person 对象作为 payload
      //   - pubsub.publish 是 fire-and-forget:不返回 Promise,不影响 mutation 返回值
      //
      // ⭐ 关键:课程把它放在 try 块外,return 之前
      //   - 即使 catch 块抛 GraphQLError 也不 publish(没创建成功,不发通知)
      //   - 这保证只有**真的成功**的 addPerson 才会触发订阅者收到 personAdded
      //   - 注意:如果 save() 抛 GraphQLError,这里**不会**执行(抛错导致控制流离开函数)
      //
      // ⭐ 课程 line 742-745 解释:
      //   "Execution of this line sends a WebSocket message about the added person
      //    to all the clients registered in the iterator PERSON_ADDED."
      //   → 所有订阅 personAdded 的 client 都会收到 WebSocket 消息
      pubsub.publish('PERSON_ADDED', { personAdded: person })  // highlight-line

      return person
    },
    // ⭐⭐⭐ editNumber — part8t 加 try/catch(verbatim 课程 line 39-51)⭐⭐⭐
    //
    // ⭐ 改造前后对比:
    //   part8s(无 try/catch):
    //     person.phone = args.phone
    //     return person.save()
    //   part8t(verbatim 课程 line 39-51):
    //     person.phone = args.phone
    //     try {
    //       await person.save()
    //     } catch (error) {
    //       throw new GraphQLError(`Saving number failed: ${error.message}`, {
    //         extensions: {
    //           code: 'BAD_USER_INPUT',
    //           invalidArgs: args.name,
    //           error
    //         }
    //       })
    //     }
    //     return person
    //
    // ⭐ editNumber 触发 try/catch 的场景:
    //   → phone 太短(<5 字符,per models/person.js schema minlength: 5)
    //   → 例:editNumber(name: "Arto", phone: "1234") 会触发
    //   → mongoose 抛 ValidationError:phone shorter than minimum length
    //   → 透传 "Saving number failed: Person validation failed..."
    //
    // ⭐ addPerson vs editNumber catch 区别:
    //   addPerson 抛 "Saving person failed: ..."
    //   editNumber 抛 "Saving number failed: ..."
    //   → 课程原文两段 catch message 不同,我严格 verbatim
    //   → 验证:per course line 19 vs line 42,确实不同
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name })

      if (!person) {
        return null
      }

      person.phone = args.phone
      try {
        await person.save()
      } catch (error) {
        throw new GraphQLError(`Saving number failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return person
    },
    // ⭐⭐⭐ createUser(part8u 新增)— 创建用户(verbatim 课程 block 68)⭐⭐⭐
    //
    // ⭐ 课程原文(per course block 68):
    //   "createUser: async (root, args) => {
    //      const user = new User({ username: args.username })
    //
    //      return user.save()
    //        .catch(error => {
    //          throw new GraphQLError(`Creating the user failed: ${error.message}`, {
    //            extensions: {
    //              code: 'BAD_USER_INPUT',
    //              invalidArgs: args.username,
    //              error
    //            }
    //          })
    //        })
    //    },"
    //
    // ⭐ 跟 part8t 的 addPerson/editNumber 错误处理**风格不同**:
    //   - part8t 用 try/catch await save()(ES7 async/await 风格)
    //   - createUser 用 .save().catch(...)(Promise chain 风格)
    //   - 课程**两种都展示**,我都 verbatim 不统一
    //   - 触发场景:username 太短(<3)/ 缺 required/ 重复 username(无 unique index 不会触发)
    //
    // ⭐ 课程原文(per course block 69):"The new user mutation is straightforward"
    //   → 不需要 exists 检查,直接 new + save
    //   → username 重复由 mongoose duplicate key error 兜底(自动 catch)
    createUser: async (root, args) => {
      const user = new User({ username: args.username })

      return user.save()
        .catch(error => {
          throw new GraphQLError(`Creating the user failed: ${error.message}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    // ⭐⭐⭐ login(part8u 新增)— 登录拿 token(verbatim 课程 block 68)⭐⭐⭐
    //
    // ⭐ 课程原文(per course block 68):
    //   "login: async (root, args) => {
    //      const user = await User.findOne({ username: args.username })
    //
    //      if ( !user || args.password !== 'secret' ) {
    //        throw new GraphQLError('wrong credentials', {
    //          extensions: {
    //            code: 'BAD_USER_INPUT'
    //          })
    //      }
    //
    //      const userForToken = {
    //        username: user.username,
    //        id: user._id,
    //      }
    //
    //      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    //    },"
    //
    // ⭐ 课程原文(per course block 57):"all users have the same password which
    //   is hardcoded to the system" → args.password !== 'secret' 永远 false
    //   所以密码校验其实形同虚设 — 但课程 verbatim 保留
    //
    // ⭐ 触发 wrong credentials 的两种场景:
    //   1. User.findOne 找不到 username(没创建过)→ !user = true
    //   2. password 不是 'secret'(per course 永远 false,但保留)
    //
    // ⭐ jwt.sign(userForToken, process.env.JWT_SECRET):
    //   - payload: { username, id } — id 是 MongoDB _id
    //   - secret: 从 .env 读 JWT_SECRET(必须配,否则 jwt.sign 抛 TokenError)
    //   - 返回:jwt token 字符串(无过期时间,per course 简化)
    //
    // ⭐ 课程原文(per course block 69):"if it is indeed valid, it returns a jwt
    //   token familiar from part 4. Note that the JWT_SECRET must be defined in
    //   the .env file."
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'secret' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
    // ⭐⭐⭐ addAsFriend(part8v 新增)— 把已存在的 Person 加为朋友(verbatim 课程 block 96)⭐⭐⭐
    //
    // ⭐ 课程原文(per course block 96):
    //   "addAsFriend: async (root, args, { currentUser }) => {
    //      if (!currentUser) {
    //        throw new GraphQLError('not authenticated', {
    //          extensions: { code: 'UNAUTHENTICATED' },
    //        })
    //      }
    //
    //      const nonFriendAlready = (person) =>
    //        !currentUser.friends
    //          .map((f) => f._id.toString())
    //          .includes(person._id.toString())
    //
    //      const person = await Person.findOne({ name: args.name })
    //
    //      if (!person) {
    //        throw new GraphQLError("The name didn't found", {
    //          extensions: {
    //            code: 'BAD_USER_INPUT',
    //            invalidArgs: args.name,
    //          },
    //        })
    //      }
    //
    //      if (nonFriendAlready(person)) {
    //        currentUser.friends = currentUser.friends.concat(person)
    //      }
    //
    //      await currentUser.save()
    //
    //      return currentUser
    //    },"
    //
    // ⭐⭐⭐ 关键设计:解构 currentUser ⭐⭐⭐
    //   - 课程 verbatim 用 `(root, args, { currentUser }) =>` — 直接从 context 解构
    //   - 备选写法(per course block 98-100 教学注解):
    //       `addAsFriend: async (root, args, context) => {
    //          const currentUser = context.currentUser
    //          ... }`
    //   - 两种**功能完全等价**,只是 ES6 解构语法糖
    //   - 课程**故意**展示两种 — part8u me resolver 用非解构版,本节 addAsFriend 用解构版
    //
    // ⭐ nonFriendAlready helper(per course verbatim):
    //   - 检查 person 是否已在 currentUser.friends 里(避免重复)
    //   - 实现:.map(f => f._id.toString()) 把 ObjectId 转字符串 → includes 比对
    //   - 返回 true 表示"还不是朋友"(可以加)
    //   - 返回 false 表示"已经是朋友"(跳过,不重复 concat)
    //
    // ⭐⭐ 课程原文(per course block 96)错误消息是 "The name didn't found"
    //   - 英文有点别扭(应该是 "The name wasn't found"),但**严格 verbatim**,不改
    //   - 这是课程仓库的原文,翻译/改写不在 part8v 范围
    //
    // ⭐ 跟 addPerson 的区别(per course block 91 vs 96):
    //   addPerson: 创建**新** person + 自动加到 currentUser.friends
    //   addAsFriend: 把**已存在**的 person 加到 currentUser.friends
    //   → 两个都最终调用 currentUser.friends.concat(person) + currentUser.save()
    addAsFriend: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      const nonFriendAlready = (person) =>
        !currentUser.friends
          .map((f) => f._id.toString())
          .includes(person._id.toString())

      const person = await Person.findOne({ name: args.name })

      if (!person) {
        throw new GraphQLError("The name didn't found", {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
          },
        })
      }

      if (nonFriendAlready(person)) {
        currentUser.friends = currentUser.friends.concat(person)
      }

      await currentUser.save()

      return currentUser
    },
  },
  // ⭐⭐⭐ Chapter 6 子节 2 新增(per course line 685-693 verbatim):Subscription block ⭐⭐⭐
  //
  // ⭐ 课程原文(per part8e.md line 685-693):
  //   "Subscription: {
  //      personAdded: {
  //        subscribe: () => pubsub.asyncIterableIterator('PERSON_ADDED')
  //      },
  //    },"
  //
  // ⭐⭐⭐ 关键概念:subscription resolver 的 subscribe 字段 ⭐⭐⭐
  //   - 跟 Query / Mutation 字段不同
  //   - Query / Mutation 字段:resolver 返回值就是响应数据(Promise<value>)
  //   - Subscription 字段:必须有 **subscribe** 子字段,返回 AsyncIterableIterator
  //   - Apollo Server 检测 subscribe 函数返回的 AsyncIterator → 自动用 server-push 模式
  //   - 客户端订阅该字段时,会一直 listen 这个 iterator yield 的所有值
  //
  // ⭐ pubsub.asyncIterableIterator('PERSON_ADDED'):
  //   - 返回一个 async iterable
  //   - 每次 pubsub.publish('PERSON_ADDED', payload) → iterator 都 yield 一个 payload
  //   - channel 名 'PERSON_ADDED' 跟 addPerson 里 publish 用同一个 string
  //   - 它们靠 channel 名关联(per graphql-subscriptions PubSub class 文档)
  //
  // ⭐ 课程 block 27 line 717-724 再次重申(verbatim):
  //   "Subscription: {
  //      personAdded: {
  //        subscribe: () => pubsub.asyncIterableIterator('PERSON_ADDED')
  //      }
  //    },"
  // 课程原版没有 trailing comma(虽然 ESLint 会报),本项目 verbatim 沿用
  //
  // ⭐ 课程 block 27 line 726-729 channel 名约定:
  //   "The iterator name is an arbitrary string, but to follow the convention,
  //    it is the subscription name written in capital letters."
  //   - Subscription 字段名 'personAdded' → channel 名 'PERSON_ADDED'
  //   - 大写 + 下划线分隔,跟 GraphQL field convention 区分
  Subscription: {
    personAdded: {
      subscribe: () => pubsub.asyncIterableIterator('PERSON_ADDED')
    },
  },
}

// ⭐⭐⭐ 默认导出 resolvers(per course line 125 沿用)⭐⭐⭐
//
// ⭐ 跟前面模块保持一致的导出风格:
//   - schema.js     → module.exports = typeDefs
//   - resolvers.js  → module.exports = resolvers  ← 本文件
//   - server.js     → module.exports = startServer
//   - db.js         → module.exports = connectToDatabase
//   - models/person.js → module.exports = mongoose.model('Person', schema)
//
// ⭐ 验证:node -e "console.log(Object.keys(require('./resolvers')))"
//   应该打印 [ 'Query', 'Person', 'Mutation' ],证明拿到的是 resolvers 对象本身
module.exports = resolvers