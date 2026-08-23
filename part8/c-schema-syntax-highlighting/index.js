// ⭐ index.js — Apollo Server v4 启动入口(verbatim 课程代码 + 中文注释)
//
// 课程原文 (Chapter 2 - "Apollo Server"):
//   "Let's implement a GraphQL server with today's leading library: Apollo Server."
//   "The heart of the code is an ApolloServer, which is given two parameters: typeDefs and resolvers."
//
// ⭐ 说明:本子项目(part8c - Schema syntax highlighting in VS Code)的运行 server
//   与 part8a / part8b 完全一致 — 本节只关注 editor 侧的 schema 高亮配置。

const { ApolloServer } = require('@apollo/server')
// ⭐ startStandaloneServer 是 Apollo Server v4 推荐的最小 standalone 模式
const { startStandaloneServer } = require('@apollo/server/standalone')

const { typeDefs, resolvers } = require('./schema')

// ⭐ new ApolloServer({ typeDefs, resolvers }) — verbatim 课程代码
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

// ⭐ startStandaloneServer — verbatim 课程代码
startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
  console.log(`👉 Open ${url} in browser to test queries via Apollo Sandbox`)
})