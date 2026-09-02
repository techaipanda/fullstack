// ⭐⭐⭐ schema.js — part8r "Refactoring the backend" 新拆出的模块 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 课程 line 22-59**(Chapter 4 第一小节)
//   - 课程原文(per course line 20-21):"We'll start by extracting the application's
//     GraphQL schema into a file called schema.js"
//   - 这个文件以前在 part8a~j 都内嵌在 schema.js 里(per part8j),
//     现在终于被独立成一个 **只导出 typeDefs** 的纯 schema 文件
//
// ⭐⭐⭐ 关键重构决策 ⭐⭐⭐
//   1. 课程原 schema.js = 只 module.exports = typeDefs(单一职责:描述 API 形状)
//   2. 课程原 schema.js = 没有 persons 数组(数据搬家到 resolvers.js)
//   3. 课程原 schema.js = 没有 resolvers(逻辑搬家到 resolvers.js)
//   4. 课程原 schema.js = 没有 GraphQLError / uuid import(都用不到)
//
// ⭐ 跟 part8j 的关键对比:
//   part8j schema.js 里:module.exports = { persons, typeDefs, resolvers } — 一个文件全包
//   part8r schema.js 里:module.exports = typeDefs                     — 只描述 schema
//   part8r 新增 resolvers.js:module.exports = resolvers + persons 数组
//   part8r 新增 server.js:module.exports = startServer(port) 工厂
//   part8r index.js:只剩 5 行(dotenv + require server + PORT + startServer(PORT))

// ⭐⭐⭐ typeDefs — verbatim 课程 line 23-58 ⭐⭐⭐
//
// ⭐ 完整内嵌 GraphQL SDL(typeDefs 用 backtick template literal 写)
//   - Address type — street + city(per part8f)
//   - Person type — name + phone + address + id(per part8a)
//   - YesNo enum — YES / NO(per part8i,allPersons 用)
//   - Query — personCount + allPersons(phone: YesNo) + findPerson(name: String!)
//   - Mutation — addPerson + editNumber(name: String!, phone: String!): Person
//
// ⭐ 注意 phone 字段声明:address: Address!(不可空,必有 street + city)
// ⭐ 注意 editNumber 返回 Person(可空)— resolver return null 是合法返回值
const typeDefs = /* GraphQL */ `
  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  # ⭐⭐⭐ part8u 新增 User + Token 类型(verbatim 课程 block 63)⭐⭐⭐
  #
  # ⭐ User 类型三个字段:
  #   - username: String! — 用户名(非空,per models/user.js minlength: 3)
  #   - friends: [Person!]! — 朋友列表(非空数组,引用 Person 类型)
  #     → 数组里每个 Person 都非空
  #     → 数组本身也非空(空数组 [] 也合法,但 null 不合法)
  #     → resolver 实现靠 .populate('friends') 把 ObjectId 转成 Person 文档
  #   - id: ID! — MongoDB 默认 _id
  #
  # ⭐ Token 类型一个字段:
  #   - value: String! — JWT token 值
  #   → login mutation 返回 { value: jwt.sign(...) }
  #
  # ⭐ 课程原文(per course block 63) — verbatim SDL:
  #   type User {
  #     username: String!
  #     friends: [Person!]!
  #     id: ID!
  #   }
  #   type Token {
  #     value: String!
  #   }
  type User {
    username: String!
    friends: [Person!]!
    id: ID!
  }

  type Token {
    value: String!
  }

  enum YesNo {
    YES
    NO
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
    # ⭐⭐⭐ part8u 新增 Query.me — 当前登录用户(verbatim 课程 block 63)⭐⭐⭐
    #
    # ⭐ Query.me 返回 User(可空):
    #   - 没带 Authorization header → return null(未登录)
    #   - 带有效 token → return context.currentUser(per server.js context 注入)
    #   - 带无效 token → return null(getUserFromAuthHeader 返回 null)
    #
    # ⭐ 课程原文(per course block 83):
    #   "The context value is passed to resolvers as the third parameter. The
    #   resolver for the me query is very simple: it only returns the currently
    #   logged-in user, which it gets from the resolver parameter context, from
    #   the field currentUser"
    me: User
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
    # ⭐⭐⭐ part8v 新增 Mutation.addAsFriend — 把 Person 加为朋友(verbatim 课程 block 94)⭐⭐⭐
    #
    # ⭐ addAsFriend(name: String!): User
    #   - 入参: person name(per course verbatim,不用 personId)
    #   - 返回: 更新后的 User 文档(friends 数组已加新朋友)
    #
    # ⭐ 课程原文(per course block 94 highlighted line 3):
    #   "type Mutation {
    #      // ...
    #      addAsFriend(name: String!): User
    #    }"
    #
    # ⭐ 跟 addPerson 的关系:
    #   - addPerson 自动把**新** person 加到 currentUser.friends(per course block 91)
    #   - addAsFriend 把**已存在**的 person 加到 currentUser.friends(per course block 96)
    #   - 两者最终都调用 currentUser.friends.concat(person) + currentUser.save()
    addAsFriend(
      name: String!
    ): User
    # ⭐⭐⭐ part8u 新增 Mutation.createUser — 创建用户(verbatim 课程 block 63)⭐⭐⭐
    #
    # ⭐ createUser(username: String!): User
    #   - 入参: 只接受 username(无 password,per course block 57 "all users have
    #     the same password which is hardcoded to the system")
    #   - 返回: User 对象
    #
    # ⭐ 课程原文(per course block 64):
    #   "New users are created with the createUser mutation"
    createUser(
      username: String!
    ): User
    # ⭐⭐⭐ part8u 新增 Mutation.login — 登录拿 token(verbatim 课程 block 63)⭐⭐⭐
    #
    # ⭐ login(username, password): Token
    #   - 入参: username + password(password 永远 = 'secret',per course 简化)
    #   - 返回: Token 对象 { value: jwt.sign(...) }
    #
    # ⭐ 课程原文(per course block 64):
    #   "logging in happens with the login mutation"
    login(
      username: String!
      password: String!
    ): Token
  }

  # ⭐⭐⭐ Chapter 6 子节 2 新增(per part8e.md line 456-459 verbatim):type Subscription ⭐⭐⭐
  #
  # ⭐ Subscription type 含义:
  #   - Subscription 是 GraphQL 第三置操作(per part8e.md line 192-198):
  #     "Along with query and mutation types, GraphQL offers a third operation
  #      type: subscriptions. With subscriptions, clients can subscribe to
  #      updates about changes in the server."
  #   - query/mutation 是 client-initiated HTTP 请求
  #   - subscription 是 client 订阅,server 主动推送(server-initiated WebSocket)
  #
  # ⭐ personAdded: Person! 字段设计(per course line 458 verbatim):
  #   - 字段名 personAdded → 跟 resolvers.js 的 Subscription.personAdded 对应
  #   - 返回类型 Person! → 非空 Person(per part8v schema.js Person type)
  #   - 客户端订阅这个字段时,新 person 一被 server 添加,server 立即通过 WebSocket 推送
  #
  # ⭐ 课程原文(per part8e.md line 461-464):
  #   "So when a new person is added, all of its details are sent to all subscribers."
  #   → "all of its details" → resolver 返回完整 Person 对象(对应 PERSON_ADDED payload)
  #
  # ⭐ 为什么 resolver 不需要完整 Person,只 push 一个字段?
  #   - 客户端订阅时用 ...PersonDetails fragment 展开(per frontend queries.js PERSON_ADDED)
  #   - fragment 定义在 client,不在 server schema(per part8e.md line 74 verbatim)
  #   - server 只需要保证 Subscription.personAdded 返回的 Person 字段能被 client fragment 展开
  type Subscription {
    personAdded: Person!
  }
`

// ⭐⭐⭐ 默认导出 typeDefs(per course line 58)⭐⭐⭐
//
// ⭐⭐⭐ 核心概念:module.exports = X(单一职责)vs { X, Y, Z }(聚合导出) ⭐⭐⭐
//   - course line 58 写 `module.exports = typeDefs`(单值,不是对象字面量)
//   - server.js 那边 `const typeDefs = require('./schema')` 拿到的是 **字符串**
//     而不是 `{ typeDefs: "..." }`
//   - 跟 part8j 的 `module.exports = { persons, typeDefs, resolvers }` 是反模式对比:
//     part8j 拿到的就是 `{ persons: [...], typeDefs: "...", resolvers: {...} }`
//     → part8j 里 const { typeDefs, resolvers } = require('./schema') 才能解构
//   - 课程这次拆模块后,每个模块只导出自己负责的那一份
//     → schema.js 只导出 typeDefs 字符串
//     → resolvers.js 只导出 resolvers 对象
//     → server.js 只导出 startServer 函数
//     → index.js 用 require('./schema') / require('./resolvers') / require('./server')
//   - 单一职责,每个模块 "管好自己的一摊事"
//
// ⭐ 验证:node -e "console.log(require('./schema'))" 应该打印 SDL 字符串本身,
//   不是 { typeDefs: ... } 这种包装对象
module.exports = typeDefs
