// ⭐⭐⭐ resolvers.js — part8s "Mongoose and Apollo" 重写后的 mongoose 版本 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 课程 line 75-126**(Chapter 4 第二小节)
//   - 课程原文(per course line 73):"The contents of _resolvers.js_, which
//     is responsible for the application logic, will change almost completely."
//   - 跟 part8r 的 in-memory 数组版(137 行)对比,降到 ~85 行(去掉了 persons 数组)
//   - 课程原版说"will change almost completely" — 所以这是大改
//
// ⭐⭐⭐ 关键重构决策 ⭐⭐⭐
//   1. ❌ 删除 in-memory `persons` 数组(per part8r line 39-60)
//      → 数据从内存搬到 MongoDB(per models/person.js mongoose schema)
//   2. ❌ 删除 `uuid` import(per part8r line 22)
//      → MongoDB 自动生成 _id(ObjectId 类型),不需要 uuid
//   3. ➕ 新增 `const Person = require('./models/person')`
//      → 拿 mongoose Model 实例,所有查询/更新都通过 Person
//   4. ➕ 所有 resolvers 加 `async` 关键字
//      → 因为内部都是 await mongoose 操作(per course line 130)
//   5. ➕ allPersons 保留 `// filters missing` 占位 comment
//      → 课程原文(per line 83):后续子节(per line 149-162)才补全
//        这是 part8t 的内容,不是 part8s — 我严格保留 verbatim 占位

// ⭐ GraphQLError — addPerson 抛错用(per part8h 沿用)
//
// ⭐ 关键变化:part8r 是同步 `persons.find` 检查重复
//   part8s 改成 async `await Person.exists({ name: args.name })`
//   抛 GraphQLError + extensions.code BAD_USER_INPUT 保持 verbatim
const { GraphQLError } = require('graphql')

// ⭐ Person mongoose model — 替代 part8r 的 in-memory `persons` 数组
const Person = require('./models/person')

// ⭐⭐⭐ resolvers 对象 — verbatim 课程 line 79-123 ⭐⭐⭐
//
// ⭐⭐⭐ 三个顶层块(跟 part8r 一致)⭐⭐⭐
//   - Query 块:personCount + allPersons + findPerson
//   - Person 块:address resolver(从 flat 字段拼嵌套对象)
//   - Mutation 块:addPerson + editNumber
//
// ⭐ 跟 part8r 核心区别:所有 resolver 都是 async,内部用 await mongoose API
//   课程原文(per course line 130):"the resolver functions now return a
//   _promise_, when they previously returned normal objects. When a resolver
//   returns a promise, Apollo server sends back the value which the promise
//   resolves to."
const resolvers = {
  // ⭐ Query 块 — verbatim 课程 line 80-87
  Query: {
    // ⭐ personCount — verbatim 课程 line 81
    //   - async () => Person.collection.countDocuments()
    //   - countDocuments() 返回 Promise<number>
    //   - Person.collection 直接拿底层 MongoDB Collection
    //   - countDocuments() 比 .find().count() 快(per mongoose 文档)
    //   - 课程原版用 Person.collection.countDocuments() 我严格 verbatim
    personCount: async () => Person.collection.countDocuments(),
    // ⭐ allPersons — verbatim 课程 line 82-85(占位版本,phone filter 后续子节补全)
    //   - 课程原文(per line 83):`// filters missing`
    //   - 这是占位 comment,表示"phone filter 还没实现"
    //   - 后续子节 line 149-162(per part8t)才会补全:
    //     if (!args.phone) return Person.find({})
    //     return Person.find({ phone: { $exists: args.phone === 'YES' } })
    //   - 我严格 verbatim 保留 `// filters missing`
    allPersons: async (root, args) => {
      // filters missing
      return Person.find({})
    },
    // ⭐ findPerson — verbatim 课程 line 86
    //   - Person.findOne({ name: args.name }) 返回 Promise<Person|null>
    //   - 找不到返回 null(per mongoose 行为)
    //   - 同步版 part8r 是 persons.find(...)(返回对象或 undefined)
    //   - 异步版 part8s 是 Person.findOne(...)(返回 Promise,resolve 对象或 null)
    findPerson: async (root, args) => Person.findOne({ name: args.name }),
  },
  // ⭐ Person 块 — verbatim 课程 line 88-95
  //   - address resolver 从 flat street/city 拼嵌套对象(per part8f 沿用)
  //   - 这里**不需要** async,因为只是普通 JS 对象构造
  //   - 课程原版没用 async,我也不加
  Person: {
    address: ({ street, city }) => {
      return {
        street,
        city,
      }
    },
  },
  // ⭐ Mutation 块 — verbatim 课程 line 96-122
  Mutation: {
    // ⭐ addPerson — verbatim 课程 line 97-111
    //   - 跟 part8r 一样:重复 name 抛 GraphQLError + BAD_USER_INPUT
    //   - 区别:part8r 用 `persons.find(...)` 同步检查
    //            part8s 用 `await Person.exists(...)` 异步检查
    //   - `await person.save()` 替代 part8r 的 `persons.concat(person)`
    //   - 返回值是 Promise<Person>,Apollo 自动 await 拿到对象
    addPerson: async (root, args) => {
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
      return person.save()
    },
    // ⭐ editNumber — verbatim 课程 line 112-121
    //   - 跟 part8r 一样:找不到 return null
    //   - 区别:part8r 用 immutable `persons.map` 替换整个数组
    //            part8s 用 mongo 文档的 `person.phone = args.phone` 直接修改字段
    //            然后 `person.save()` 持久化(走 mongoose hooks + validation)
    //   - 课程原版直接修改 person 字段,不用 spread { ...person, phone }
    //   - 这是 mongoose 的 idiomatic 写法,我严格 verbatim
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name })

      if (!person) {
        return null
      }

      person.phone = args.phone
      return person.save()
    },
  },
}

// ⭐⭐⭐ 默认导出 resolvers(per course line 125)⭐⭐⭐
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