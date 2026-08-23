// ⭐ schema.js — Apollo Server schema 定义(part8e "The default resolver")
//
// ⭐ 关键诚实声明(本子项目是 part8d 伏笔的兑现):
//   part8d 课程说:"We will be using the first parameter of a resolver later"
//   part8e 就是那个 "later" — 课程示范了 root 参数的真实用途:
//
//   当 Query.findPerson 返回一个 person 对象后,Apollo 用这个对象
//   作为 root,调用 Person 类型每个字段的 resolver。
//
//   课程给的是【显式 default resolvers】(5 个字段全部写出来) +
//   【可选示例】(把 street/city 硬编码为 Manhattan / New York)。
//
// ⭐ 本子项目相对 part8a 的差异:
//   1. resolvers 增加 Person 字段(可选 — Apollo 默认就会这么做)
//   2. README 提供两份代码:
//      a) Schema A — 5 字段全显式(对应课程 verbatim 代码块 1)
//      b) Schema B — 只覆盖 street/city 为 'Manhattan New York'(对应课程 verbatim 代码块 2)
//
// ⭐ 课程原文核心:
//   "Apollo has defined default resolvers for them. They work like the one shown below:
//      Person: {
//        name: (root) => root.name,
//        phone: (root) => root.phone,
//        street: (root) => root.street,
//        city: (root) => root.city,
//        id: (root) => root.id
//      }
//    The default resolver returns the value of the corresponding field of the object.
//    The object itself can be accessed through the first parameter of the resolver, root.
//    If the functionality of the default resolver is enough, you don't need to define
//    your own."

// ⭐ persons mock 数据(verbatim 课程代码 — 沿用 part8a)
const persons = [
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

// ⭐ typeDefs — GraphQL SDL schema(verbatim 课程代码 — 沿用 part8a)
const typeDefs = /* GraphQL */ `
  type Person {
    name: String!
    phone: String
    street: String!
    city: String!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
  }
`

// ⭐ resolvers — 课程本节 verbatim(关键新增: Person: { ... } 块)
//
// ⭐⭐⭐ 本节(part8e)讲解的"The default resolver" 核心 ⭐⭐⭐
//
// 课程 verbatim 代码块(原文,逐字保留,含 (root) 而非 _root):
//
//   const resolvers = {
//     Query: {
//       personCount: () => persons.length,
//       allPersons: () => persons,
//       findPerson: (root, args) => persons.find(p => p.name === args.name)
//     },
//     Person: {
//       name: (root) => root.name,
//       phone: (root) => root.phone,
//       street: (root) => root.street,
//       city: (root) => root.city,
//       id: (root) => root.id
//     }
//   }
//
// ⭐ 关键认知:即便**不写** Person 块,Apollo 也会自动用同样的方式
//   生成 default resolvers(因为 Person 是 plain object,字段名直接对应)。
//
//   写出来的目的:让你能**覆盖**个别字段(下面 README 会演示
//   "硬编码 street 为 Manhattan" 的玩法)。
//
// ⭐ root 参数在这里终于派上用场!
//   - Query 顶层 resolver(part8d):root 是 undefined,没意义
//   - Person 字段 resolver(part8e):root 是【父对象】 — 也就是
//     Query.findPerson 返回的那个 person 对象
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) =>
      persons.find((p) => p.name === args.name),
  },
  // ⭐ 课程本节新增 — Person 字段的【显式 default resolvers】(完全 verbatim)
  // ⭐ 注释掉也能跑出一样的结果(因为 default resolver 就是这样工作的)
  Person: {
    name: (root) => root.name,
    phone: (root) => root.phone,
    street: (root) => root.street,
    city: (root) => root.city,
    id: (root) => root.id,
  },
}

module.exports = { persons, typeDefs, resolvers }
