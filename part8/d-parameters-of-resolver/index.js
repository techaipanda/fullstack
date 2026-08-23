// ⭐ index.js — Apollo Server v4 启动入口(verbatim 课程代码 + 中文注释)
//
// ⭐ 说明:本子项目(part8d - Parameters of a resolver)的运行 server
//   与 part8a 完全一致 — 本节纯解释性,没有 schema 或 resolver 改动。

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