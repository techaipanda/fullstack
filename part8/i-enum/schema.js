// ⭐ schema.js — Apollo Server schema 定义(part8i "Enum")
//
// ⭐ 关键诚实声明(本子项目 = part8h 的扩展,实现"软过滤"而非"硬抛错"):
//   part8h:addPerson resolver 里抛 GraphQLError(硬抛错 — name 重复不让加)
//   part8i:Query.allPersons 加 phone enum 过滤(软过滤 — 让客户端挑要不要 phone)
//   — 兑现 part8h 末尾"业务规则"的延伸:不是所有业务规则都该抛错,有时候
//     应该让客户端通过参数来"问"不同的 view。
//
// ⭐ 课程原文核心(逐字保留):
//   "Let's add a possibility to filter the query returning all persons with
//    the parameter phone so that it returns only persons with a phone number"
//   ```graphql
//   query {
//     allPersons(phone: YES) { name phone }
//   }
//   ```
//   "or persons without a phone number"
//   ```graphql
//   query {
//     allPersons(phone: NO) { name }
//   }
//   ```
//   "The schema changes like so:"
//   ```graphql
//   enum YesNo { YES NO }
//   type Query {
//     personCount: Int!
//     allPersons(phone: YesNo): [Person!]!
//     findPerson(name: String!): Person
//   }
//   ```
//   "The type YesNo is a GraphQL enum, or an enumerable, with two possible
//    values: YES or NO. In the query allPersons, the parameter phone has the
//    type YesNo, but is nullable."
//
//   "The resolver changes like so:"
//   ```js
//   Query: {
//     personCount: () => persons.length,
//     allPersons: (root, args) => {
//       if (!args.phone) {
//         return persons
//       }
//       const byPhone = (person) =>
//         args.phone === 'YES' ? person.phone : !person.phone
//       return persons.filter(byPhone)
//     },
//     findPerson: (root, args) =>
//       persons.find(p => p.name === args.name)
//   },
//   ```

// ⭐ uuid v1 用于生成 id(沿用 part8g/h)
const { v1: uuid } = require('uuid')

// ⭐ GraphQLError 沿用 part8h(本节未改,保留以备未来用)
const { GraphQLError } = require('graphql')

// ⭐ persons mock 数据
// ⭐ 沿用 part8a-h,但本节特别有用 — 课程示例"persons without a phone number"
//   需要 person.phone === undefined,所以 Mary 那种"没 phone 字段"的 person
//   (其实本数据每个人都有 phone,所以要自己加一个没 phone 的来测试 NO 过滤)
// ⭐ verbatim 课程数据(沿用 part8a-h) — 仍是 flat street/city
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

// ⭐ typeDefs — GraphQL SDL schema(verbatim 课程本节代码改动)
// ⭐ 相对 part8h 的 2 处改动:
//   1. 新增 enum YesNo { YES NO }
//   2. Query.allPersons 加 phone: YesNo 参数(nullable,不传 =全部)
const typeDefs = /* GraphQL */ `
  # ⭐ 课程本节新增 — enum YesNo(verbatim)
  # ⭐ GraphQL enum 的值在 schema 里不需要引号,但在 resolver 里运行时是字符串
  enum YesNo {
    YES
    NO
  }

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
    # ⭐ 课程本节改 — Query.allPersons 加 phone: YesNo(nullable)
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
  }
`

// ⭐ resolvers — 课程本节 verbatim(改 Query.allPersons,加 enum 过滤)
//
// ⭐ 课程 line 1450-1470 原文(逐字保留 `(root, args)` 而非 `_root, _args`):
//
//   Query: {
//     personCount: () => persons.length,
//     allPersons: (root, args) => {
//       if (!args.phone) {
//         return persons
//       }
//       const byPhone = (person) =>
//         args.phone === 'YES' ? person.phone : !person.phone
//       return persons.filter(byPhone)
//     },
//     findPerson: (root, args) =>
//       persons.find(p => p.name === args.name)
//   }
//
// ⭐⭐⭐ 关键认知 ⭐⭐⭐
// - `args.phone` 在 resolver 里运行时是字符串 'YES' / 'NO'(GraphQL enum 序列化)
// - 客户端不发 phone 参数时,`args.phone === undefined`,走"全部"分支
// - 客户端发 'YES' 时,过滤有 phone 的(person.phone 真值)
// - 客户端发 'NO' 时,过滤没 phone 的(!person.phone 真值)
const resolvers = {
  // ⭐ Query 块 — 课程本节改了 allPersons(personCount / findPerson 沿用)
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
      // ⭐ 课程本节新增 — args.phone 是 enum 值(字符串 'YES' / 'NO'/undefined)
      // ⭐ 没传 phone 参数时,返全部
      if (!args.phone) {
        return persons
      }
      // ⭐ 课程本节新增 — 按 YES / NO 过滤
      // ⭐ args.phone === 'YES' 时:person.phone 真值 → 有 phone
      // ⭐ args.phone !== 'YES' 时(就是 'NO'):!person.phone 真值 → 没 phone
      const byPhone = (person) =>
        args.phone === 'YES' ? person.phone : !person.phone
      return persons.filter(byPhone)
    },
    findPerson: (root, args) =>
      persons.find((p) => p.name === args.name),
  },
  // Person 块沿用 part8h(address resolver 仍然必要)
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      }
    },
  },
  // Mutation 块沿用 part8h(addPerson 查重 + GraphQLError 不动)
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
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
      const person = { ...args, id: uuid() }
      persons = persons.concat(person)
      return person
    },
  },
}

module.exports = { persons, typeDefs, resolvers }