// ⭐ schema.js — Apollo Server schema 定义(part8h "Error handling")
//
// ⭐ 关键诚实声明(本子项目 = part8g 的扩展,兑现 part8g Step 9 末尾铺垫的伏笔):
//   part8g Step 9:"Variable $name of required type String! was not provided"
//   — 那是非 null 参数校验(schema 层 GraphQL 自动处理)。
//   part8h 解决另一个场景:**业务规则校验**(schema 表达不了的)
//     e.g. "name 不能重复" — 必须在 resolver 里手动查重 + 抛错。
//
// ⭐ 课程原文核心(逐字保留):
//   "However, GraphQL cannot handle everything automatically. For example,
//    stricter rules for data sent to a Mutation have to be added manually.
//    An error could be handled by throwing GraphQLError with a proper
//    error code."
//
//   "Let's prevent adding the same name to the phonebook multiple times:"
//
//   const { GraphQLError } = require('graphql')
//
//   const resolvers = {
//     // ..
//     Mutation: {
//       addPerson: (root, args) => {
//         if (persons.find(p => p.name === args.name)) {
//           throw new GraphQLError(`Name must be unique: ${args.name}`, {
//             extensions: {
//               code: 'BAD_USER_INPUT',
//               invalidArgs: args.name
//             }
//           })
//         }
//         const person = { ...args, id: uuid() }
//         persons = persons.concat(person)
//         return person
//       }
//     }
//   }
//
//   "So if the name to be added already exists in the phonebook, throw
//    GraphQLError error."

// ⭐ uuid v1 用于生成 id(沿用 part8g)
const { v1: uuid } = require('uuid')

// ⭐⭐ 本节新增 ⭐⭐ — GraphQLError 从 graphql 包的 named export
// ⭐ 不要写成 `require('graphql').GraphQLError`(能跑但丑)
// ⭐ 解构更清晰,且课程原文就是解构
const { GraphQLError } = require('graphql')

// ⭐ persons mock 数据(沿用 part8a-g,仍为 flat street/city)
let persons = [
  {
    name: 'Arto Hellas',
    phone: '040-123543',
    street: 'Tapiolankatu 5 A',
    city: 'Helsinki',
    id: '3d594650-3436-11e9-bc57-8b80ba54c431',
  },
  {
    name: 'Mary Popup',
    phone: '040-432342',
    street: 'Mannerheimintie 100',
    city: 'Helsinki',
    id: '3d594670-3436-11e9-bc57-8b80ba54c431',
  },
]

// ⭐ typeDefs — 完全 verbatim 沿用 part8g(本节未改 schema 定义)
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

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
  }
`

// ⭐ resolvers — 课程本节 verbatim(只改 Mutation.addPerson,加查重 + 抛 GraphQLError)
//
// ⭐ 课程 line 1380-1395 原文(逐字保留 `(root, args)` 而非 `_root, _args`):
//
//   const resolvers = {
//     // ..
//     Mutation: {
//       addPerson: (root, args) => {
//         if (persons.find(p => p.name === args.name)) {
//           throw new GraphQLError(`Name must be unique: ${args.name}`, {
//             extensions: {
//               code: 'BAD_USER_INPUT',
//               invalidArgs: args.name
//             }
//           })
//         }
//         const person = { ...args, id: uuid() }
//         persons = persons.concat(person)
//         return person
//       }
//     }
//   }
//
// ⭐⭐⭐ 关键认知 ⭐⭐⭐
// - schema 层只能校验"参数格式"(non-null / 类型)— 校验不了"参数值"
//   (e.g. name 不能重复 — 取决于 persons 数组当前状态,schema 看不到)
// - 业务规则必须在 resolver 里手动查重 + 抛错
// - GraphQLError 第二参数 `extensions` 是给客户端用的"机器可读"信息:
//   - code: 错误分类(BAD_USER_INPUT / UNAUTHENTICATED / FORBIDDEN ...)
//   - invalidArgs: 哪个参数错了(客户端可以高亮显示)
const resolvers = {
  // Query 块沿用 part8a-g(本节未改)
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) =>
      persons.find((p) => p.name === args.name),
  },
  // Person 块沿用 part8g(address resolver 仍然必要)
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      }
    },
  },
  // Mutation 块沿用 part8g,**只改 addPerson** 加查重 + 抛 GraphQLError
  Mutation: {
    addPerson: (root, args) => {
      // ⭐⭐ 本节新增 ⭐⭐ — 业务规则校验(查重)
      // schema 层 `name: String!` 只校验"传了没",不校验"重复没"
      // 必须手动 persons.find 检查
      if (persons.find((p) => p.name === args.name)) {
        // 抛 GraphQLError(课程明示)
        // 第二参数 extensions 是给客户端用的"机器可读"错误信息
        //   - code: 错误分类(BAD_USER_INPUT 表达"用户传了不合法值")
        //   - invalidArgs: 哪个参数错了(让客户端高亮显示)
        throw new GraphQLError(
          `Name must be unique: ${args.name}`,
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
            },
          }
        )
      }
      // 下面沿用 part8g 的 3 步不变
      const person = { ...args, id: uuid() }
      persons = persons.concat(person)
      return person
    },
  },
}

module.exports = { persons, typeDefs, resolvers }