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
  // ⭐ Person 块 — verbatim part8s
  Person: {
    address: ({ street, city }) => {
      return {
        street,
        city,
      }
    },
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