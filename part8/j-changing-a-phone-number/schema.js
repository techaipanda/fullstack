// ⭐ schema.js — Apollo Server schema 定义(part8j "Changing a phone number")
//
// ⭐ 关键诚实声明(本子项目 = part8i 的扩展,兑现 part8i 末尾的"修改现有记录"伏笔):
//   part8h:addPerson — 硬抛错(name 重复)
//   part8i:allPersons(phone: YesNo) — 软过滤(让客户端挑 view)
//   part8j:editNumber — 修改现有记录(update semantics)
//     — 兑现 part8i 末尾预告的"修改现有记录"路线
//
// ⭐ 课程原文核心(逐字保留):
//   "Let's add a mutation for changing the phone number of a person.
//    The schema of this mutation looks as follows:"
//   ```graphql
//   type Mutation {
//     addPerson(...)
//     editNumber(
//       name: String!
//       phone: String!
//     ): Person
//   }
//   ```
//   "and is done by a resolver:"
//   ```js
//   Mutation: {
//     // ...
//     editNumber: (root, args) => {
//       const person = persons.find(p => p.name === args.name)
//       if (!person) {
//         return null
//       }
//
//       const updatedPerson = { ...person, phone: args.phone }
//       persons = persons.map(p => p.name === args.name ? updatedPerson : p)
//       return updatedPerson
//     }
//   }
//   ```
//   "The mutation finds the person to be updated by the field name."

// ⭐ uuid v1 用于生成 id(沿用 part8g-i)
const { v1: uuid } = require('uuid')

// ⭐ GraphQLError 沿用 part8h/i(本节未用,但保留以备未来用)
const { GraphQLError } = require('graphql')

// ⭐ persons mock 数据(verbatim 沿用 part8a-i,仍是 flat street/city)
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
// ⭐ 相对 part8i 的 1 处改动:Mutation 块加 editNumber(name, phone): Person
// ⭐ 其他块(Query / Address / Person / enum YesNo)verbatim 沿用 part8i
const typeDefs = /* GraphQL */ `
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
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
  }

  # ⭐ 课程本节改动 — Mutation 块加 editNumber
  # ⭐ editNumber 的 phone 是 **non-null**(跟 addPerson 的 phone 可空不同)
  #   — 改 phone 必传 phone 值,没有"省略"语义
  # ⭐ 返回类型 Person(没加 !)— 所以返回 null 是合法的(对应"找不到 person"情况)
  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(
      name: String!
      phone: String!
    ): Person
  }
`

// ⭐ resolvers — 课程本节 verbatim(Mutation 块加 editNumber)
//
// ⭐ 课程 line 1500-1520 原文(逐字保留 `(root, args)` 而非 `_root, _args`):
//
//   Mutation: {
//     // ...
//     editNumber: (root, args) => {
//       const person = persons.find(p => p.name === args.name)
//       if (!person) {
//         return null
//       }
//
//       const updatedPerson = { ...person, phone: args.phone }
//       persons = persons.map(p => p.name === args.name ? updatedPerson : p)
//       return updatedPerson
//     }
//   }
//
// ⭐⭐⭐ 关键认知 ⭐⭐⭐
// - 找不到 person → `return null`(课程选择最简方案,**不抛 GraphQLError**)
//   课程本节没要求做"找不到人抛错",留作后续可扩展点(part8k 之后可能有)
// - 找到 person → 创建新对象 `{ ...person, phone: args.phone }`(覆盖 phone 字段)
// - 用 `persons.map(p => p.name === args.name ? updatedPerson : p)` 创建新数组
//   (符合 immutable 原则 — 不要 `persons.find` 然后 `person.phone = args.phone`)
// - 返回 updatedPerson — Apollo 拿到对象后,自动调用 Person.address resolver
//   (沿用 part8f)把 flat street/city 拼成嵌套 address
const resolvers = {
  // Query 块 verbatim 沿用 part8i(本节未改)
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
    findPerson: (root, args) =>
      persons.find((p) => p.name === args.name),
  },
  // Person 块 verbatim 沿用 part8f-h-i
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      }
    },
  },
  // ⭐ Mutation 块 — 课程本节加 editNumber(addPerson 沿用 part8h)
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
    // ⭐⭐ 本节新增 ⭐⭐ — editNumber resolver(完全 verbatim 课程)
    editNumber: (root, args) => {
      // ⭐ 课程:用 name 字段查找要更新的 person
      const person = persons.find((p) => p.name === args.name)
      // ⭐ 找不到 → 返回 null(课程选最简方案,不抛错)
      if (!person) {
        return null
      }
      // ⭐ 找到 → 创建新对象(覆盖 phone 字段,其他字段不变)
      // ⭐ 用 spread `...person` 平铺原对象,再覆盖 phone
      const updatedPerson = { ...person, phone: args.phone }
      // ⭐ 用 map 创建新数组(找到 name 匹配的就替换,其他保留)
      // ⭐ 符合 immutable 原则 — 不要 in-place 修改
      persons = persons.map((p) =>
        p.name === args.name ? updatedPerson : p
      )
      // ⭐ 返回 updatedPerson — Apollo 自动调用 Person.address resolver
      return updatedPerson
    },
  },
}

module.exports = { persons, typeDefs, resolvers }