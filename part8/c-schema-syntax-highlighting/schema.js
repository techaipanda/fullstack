// ⭐ schema.js — Apollo Server schema 定义
// ⭐ 包含课程 Chapter 2 - "Apollo Server" 段的 3 个 verbatim 代码块:
//   1) persons mock 数据
//   2) typeDefs (GraphQL SDL schema 字符串)
//   3) resolvers (Query 字段实现)
//
// 课程原文:
//   "The initial code is as follows: ..."
//   "The heart of the code is an ApolloServer, which is given two parameters:"
//   "The first parameter, typeDefs, contains the GraphQL schema."
//   "The second parameter is an object, which contains the resolvers of the server."
//
// ⭐ 本节(part8c - Schema syntax highlighting in VS Code)的关键 verbatim 改动:
//   课程原文: "We'll do it now by adding the type-indicating comment /* GraphQL */
//             before the template literal string."
//   已应用在下面的 typeDefs 定义前(见 const typeDefs = /* GraphQL */ `...`)

// ⭐ persons mock 数据(verbatim 课程代码)
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

// ⭐ typeDefs — GraphQL SDL schema(verbatim 课程代码)
// ⭐ 本节重点:`/* GraphQL */` 注释让 VS Code + GraphQL: Language Feature Support 扩展识别为 GraphQL
//   课程原文: "The comment helps the installed extension recognize the string as GraphQL
//             and provide intelligent editor features, but it does not affect the
//             application's runtime. Prettier can now also format the schema."
//
// ⭐ 启用的功能(装好扩展后):
//   1) GraphQL SDL 语法高亮(type / String / ! / ID 颜色区分)
//   2) IntelliSense 自动补全(type Person 后回车自动缩进)
//   3) Prettier 能格式化 SDL 内容(默认不行)
//   4) Schema 校验(类型拼错会红线)
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

// ⭐ resolvers — Query 字段实现(verbatim 课程代码)
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) =>
      persons.find((p) => p.name === args.name),
  },
}

module.exports = { persons, typeDefs, resolvers }