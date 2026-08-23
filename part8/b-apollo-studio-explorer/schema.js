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
// ⭐ 说明:本子项目(part8b - Apollo Studio Explorer)需要的运行 server
//   与 part8a 完全一致 — 因为 Apollo Studio Explorer 是一个"使用工具"小节
//   本身没有新增 schema / resolver 代码。
//   verbatim 内容来自课程 Chapter 2 - "Apollo Server" 段。

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
// /* GraphQL */ 注释让 VS Code + GraphQL: Language Feature Support 扩展识别为 GraphQL
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