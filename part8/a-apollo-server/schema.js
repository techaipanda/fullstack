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

// ⭐ persons mock 数据(verbatim 课程代码)
// 课程原本在 index.js 里硬编码,本子项目抽到 schema.js(见 README "偏离课程原文")
// 数据来源:课程 Chapter 2 初始示例
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
// 描述一个 Person 类型(5 字段)+ 一个 Query 类型(3 字段)
// ! 标记 Non-Null,意味着这个字段必须给值
// Person.phone 没有 !,所以允许 null(phone nullable)
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
// Apollo 看到 schema 里有 Query.personCount / allPersons / findPerson
// 就来这里找同名 resolver,然后把 schema 字段和 resolver 字段连起来
//
// ⚠️ 注意:本子项目只引入 findPerson 第二个参数 args
//   详细 args 解释见 Chapter 2 后续小节 "Parameters of a resolver"
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) =>
      persons.find((p) => p.name === args.name),
  },
}

module.exports = { persons, typeDefs, resolvers }