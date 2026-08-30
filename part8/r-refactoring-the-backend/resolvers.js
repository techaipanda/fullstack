// ⭐⭐⭐ resolvers.js — part8r "Refactoring the backend" 新拆出的模块 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 课程 line 64-139**(Chapter 4 第一小节)
//   - 课程原文(per course line 61-62):"Next, we'll move the code responsible
//     for the resolvers into its own module, resolvers.js"
//   - 这个文件以前在 part8j 的 schema.js 里(per part8j line 134-196),
//     现在独立成 **只导出 resolvers** + 内含 persons 数组
//
// ⭐⭐⭐ 关键重构决策 ⭐⭐⭐
//   1. resolvers.js = 数据 + 逻辑(per course line 142:"the _persons_ array that holds
//     the people's data is now placed in the same file as the resolvers")
//   2. 用 require 拿 GraphQLError + uuid(per part8a-j 沿用)
//   3. residency 数组从 part8j 的 schema.js 原样搬到这(2 个 person:Arto + Mary Popup)
//     — 注意 part8r 的课程原版是 3 个 person(Arto + Matti + Venla),不是 part8j 的 2 个
//     — 这里我**严格按课程原文**用 3 个 person
//   4. 课程原版 resolvers.js = module.exports = resolvers(单值导出)

// ⭐ GraphQLError — addPerson 抛错用(per part8h 沿用,完整 GraphQLError + extensions)
const { GraphQLError } = require('graphql')

// ⭐ uuid v1 — addPerson 生成 id 用(per part8g 沿用)
const { v1: uuid } = require('uuid')

// ⭐⭐⭐ persons 数组 — verbatim 课程 line 67-88 ⭐⭐⭐
//
// ⭐ 注意(诚实声明):
//   课程原文(line 67-88)的 persons 数组**包含 3 个人**:Arto Hellas + Matti Luukkainen + Venla Ruuska
//   part8j schema.js(line 46-61)的 persons 数组只有 2 个人:Arto + Mary Popup
//   这个差异是 part8r 课程原版的固定数据(基于 graphql-phonebook-backend repo 的 part8-3 分支)
//   → 我严格按课程原文(3 人),不改成 part8j 的 2 人
//   → 这是 part8r 比 part8j 数据多 1 人的地方,README 会明说
//
// ⭐ 课程原文(per course line 142):"the persons array that holds the people's data
//   is now placed in the same file as the resolvers. The array will soon be removed
//   when we switch to using a database for storing data."
//   → 这是个过渡形态:本子节把数据放在 resolvers.js 里,
//     但马上下一子节(Mongoose and Apollo,line 198)就要换成 MongoDB
//   → 所以"数据 + 逻辑"在同一个文件只是**临时简化**,不是最终架构
let persons = [
  {
    name: 'Arto Hellas',
    phone: '040-123543',
    street: 'Tapiolankatu 5 A',
    city: 'Espoo',
    id: '3d594650-3436-11e9-bc57-8b80ba54c431',
  },
  {
    name: 'Matti Luukkainen',
    phone: '040-432342',
    street: 'Malminkaari 10 A',
    city: 'Helsinki',
    id: '3d599470-3436-11e9-bc57-8b80ba54c431',
  },
  {
    name: 'Venla Ruuska',
    street: 'Nallemäentie 22 C',
    city: 'Helsinki',
    id: '3d599471-3436-11e9-bc57-8b80ba54c431',
  },
]

// ⭐⭐⭐ resolvers 对象 — verbatim 课程 line 90-137 ⭐⭐⭐
//
// ⭐⭐⭐ 三个顶层块 ⭐⭐⭐
//   - Query 块(per part8i):personCount + allPersons(phone filter) + findPerson
//   - Person 块(per part8f):address resolver 把 flat street/city 拼成嵌套对象
//   - Mutation 块(per part8j):addPerson(per part8h,抛 GraphQLError)+ editNumber(per part8j,return null)
const resolvers = {
  // ⭐ Query 块 — verbatim 课程 line 91-102(per part8i 沿用)
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
      if (!args.phone) {
        return persons
      }
      const byPhone = (person) =>
        args.phone === 'YES' ? person.phone : !person.phone
      return persons.filter(byPhone)
    },
    findPerson: (root, args) => persons.find((p) => p.name === args.name),
  },
  // ⭐ Person 块 — verbatim 课程 line 103-110(per part8f 沿用)
  Person: {
    address: ({ street, city }) => {
      return {
        street,
        city,
      }
    },
  },
  // ⭐ Mutation 块 — verbatim 课程 line 111-136(per part8h/j 沿用)
  Mutation: {
    // ⭐ addPerson — verbatim 课程 line 112-125(per part8h 沿用)
    //   重复 name → 抛 GraphQLError + extensions.code BAD_USER_INPUT
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        throw new GraphQLError(`Name must be unique: ${args.name}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
          },
        })
      }

      const person = { ...args, id: uuid() }
      persons = persons.concat(person)
      return person
    },
    // ⭐ editNumber — verbatim 课程 line 126-135(per part8j 沿用)
    //   找不到 person → return null(per part8j)
    //   找到 → 创建新对象 { ...person, phone: args.phone } + persons.map immutable 更新
    editNumber: (root, args) => {
      const person = persons.find((p) => p.name === args.name)
      if (!person) {
        return null
      }

      const updatedPerson = { ...person, phone: args.phone }
      persons = persons.map((p) => (p.name === args.name ? updatedPerson : p))
      return updatedPerson
    },
  },
}

// ⭐⭐⭐ 默认导出 resolvers(per course line 139)⭐⭐⭐
//
// ⭐ 注意:不是 { persons, typeDefs, resolvers },就是 resolvers
//   part8j 那边导出聚合对象是因为单文件 all-in-one
//   part8r 每个文件只负责一件事:
//     - schema.js  → 导出 typeDefs(SDL 字符串)
//     - resolvers.js → 导出 resolvers(Query/Person/Mutation 三块)
//     - server.js → 导出 startServer(port) 工厂函数
//   persons 数组**不导出**,因为只有 resolvers 自己用(模块私有)
//
// ⭐ 验证:node -e "console.log(Object.keys(require('./resolvers')))"
//   应该打印 [ 'Query', 'Person', 'Mutation' ],证明拿到的是 resolvers 对象本身
module.exports = resolvers
