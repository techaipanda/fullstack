// ⭐ schema.js — Apollo Server schema 定义(part8g "Mutations")
//
// ⭐ 关键诚实声明(本子项目 = part8f 的扩展,兑现 part8f 末尾铺垫的伏笔):
//   part8f 末尾:"Mutations also require a resolver..."
//   part8g 兑现:
//     1. typeDefs 新增 type Mutation { addPerson(...) }
//     2. resolvers 新增 Mutation.addPerson
//     3. persons 从 const 改成 let(mutation 需要重新赋值)
//     4. 新增 uuid 包作为 id 生成器
//
// ⭐ 课程原文核心(逐字保留):
//   "Let's add a functionality for adding new persons to the phonebook.
//    In GraphQL, all operations which cause a change are done with
//    mutations. Mutations are described in the schema as the keys of
//    type Mutation."
//
//   type Mutation {
//     addPerson(
//       name: String!
//       phone: String
//       street: String!
//       city: String!
//     ): Person
//   }
//
//   "The Mutation is given the details of the person as parameters. The
//    parameter phone is the only one which is nullable. The Mutation also
//    has a return value. The return value is type Person, the idea being
//    that the details of the added person are returned if the operation is
//    successful and if not, null. Value for the field id is not given as a
//    parameter. Generating an id is better left for the server."
//
//   const { v1: uuid } = require('uuid')
//
//   const resolvers = {
//     Query: { ... },
//     Person: { ... },
//     Mutation: {
//       addPerson: (root, args) => {
//         const person = { ...args, id: uuid() }
//         persons = persons.concat(person)
//         return person
//       }
//     }
//   }
//
//   "The mutation adds the object given to it as a parameter args to the
//    array persons, and returns the object it added to the array."

// ⭐ uuid v1 用于生成 id(课程明文要求)
// ⭐ 课程用 v1 — 因为 v1 包含时间戳(课程示例 "3d594650-3436-11e9-..." 是 v1 风格)
const { v1: uuid } = require('uuid')

// ⭐ persons mock 数据
// ⭐ 关键改动:part8f 是 `const persons`,part8g **必须**改成 `let persons`
// 因为 addPerson resolver 要 `persons = persons.concat(person)`(重新赋值)
// ⭐ verbatim 课程数据(沿用 part8a-f) — 仍是 flat street/city
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
// ⭐ 相对 part8f 的 1 处改动:新增 type Mutation { addPerson(...) }
// ⭐ Query / Address / Person 块沿用 part8f verbatim
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

  # ⭐ 课程本节新增 — Mutation 类型(verbatim)
  # addPerson 接收 name/phone/street/city(phone nullable,其余 non-null)
  # 返回 Person — 课程明示 "the details of the added person are returned
  # if the operation is successful and if not, null"
  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
  }
`

// ⭐ resolvers — 课程本节 verbatim(新增 Mutation 块)
// ⭐ 课程 line 1300-1320 原文(逐字保留 `(root, args)` 而非 `_root, _args`):
//
//   const resolvers = {
//     Query: { ... },
//     Person: { ... },
//     Mutation: {
//       addPerson: (root, args) => {
//         const person = { ...args, id: uuid() }
//         persons = persons.concat(person)
//         return person
//       }
//     }
//   }
//
// ⭐⭐⭐ 关键认知 ⭐⭐⭐
// - addPerson resolver 把 args (name/phone/street/city) + uuid() id 拼成新对象
// - 用 `persons.concat(person)` 创建新数组 → 赋值回 `persons`(不修改原数组)
// - 返回 person 对象 — 客户端 mutation response 就是这个对象
//   (再走 Person.address resolver 把 flat street/city 拼成嵌套 Address)
const resolvers = {
  // Query 块沿用 part8a-f(本节未改)
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) =>
      persons.find((p) => p.name === args.name),
  },
  // Person 块沿用 part8f(address resolver 仍然必要 — 看下面的解释)
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      }
    },
  },
  // 课程本节新增 — Mutation 块(完全 verbatim)
  Mutation: {
    addPerson: (root, args) => {
      // args 包含 name/phone/street/city(按 typeDefs Mutation.addPerson 的参数定义)
      // uuid() 生成唯一 id(课程原文 "Generating an id is better left for the server")
      const person = { ...args, id: uuid() }
      // concat 创建新数组并赋值回去(为什么 persons 必须是 let)
      // 不用 push,因为 push 会修改原数组 — 不符合"创建新对象"原则
      persons = persons.concat(person)
      return person
    },
  },
}

module.exports = { persons, typeDefs, resolvers }