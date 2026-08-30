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

  enum YesNo {
    YES
    NO
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
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
