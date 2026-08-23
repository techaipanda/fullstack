// ⭐ index.js — Apollo Server v4 启动入口(verbatim 课程代码 + 中文注释)
//
// 课程原文 (Chapter 2 - "Apollo Server"):
//   "Let's implement a GraphQL server with today's leading library: Apollo Server."
//   "The heart of the code is an ApolloServer, which is given two parameters: typeDefs and resolvers."
//
// 本文件包含 2 个 verbatim 块:
//   1) new ApolloServer({ typeDefs, resolvers })
//   2) startStandaloneServer(server, { listen: { port: 4000 } })

const { ApolloServer } = require('@apollo/server')
// ⭐ startStandaloneServer 是 Apollo Server v4 推荐的最小 standalone 模式
// 自带:HTTP server + CORS + body parsing + 默认路由 /
// 开发期访问 http://localhost:4000 自动跳到 Apollo Sandbox(原 Apollo Studio Explorer)
const { startStandaloneServer } = require('@apollo/server/standalone')

const { typeDefs, resolvers } = require('./schema')

// ⭐ new ApolloServer({ typeDefs, resolvers }) — verbatim 课程代码
// 两个参数:
//   typeDefs   → schema 定义(SDL 字符串,在 schema.js 里)
//   resolvers  → Query 字段实现(在 schema.js 里)
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

// ⭐ startStandaloneServer — verbatim 课程代码
// listen.port: 4000 是 Apollo Server 默认端口
// 启动后终端会打印 "🚀 Server ready at http://localhost:4000/"
startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
  console.log(`👉 Open ${url} in browser to test queries via Apollo Sandbox`)
})