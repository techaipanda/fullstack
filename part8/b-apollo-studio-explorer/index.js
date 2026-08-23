// ⭐ index.js — Apollo Server v4 启动入口(verbatim 课程代码 + 中文注释)
//
// 课程原文 (Chapter 2 - "Apollo Server"):
//   "Let's implement a GraphQL server with today's leading library: Apollo Server."
//   "The heart of the code is an ApolloServer, which is given two parameters: typeDefs and resolvers."
//
// ⭐ 说明:本子项目(part8b - Apollo Studio Explorer)的运行 server
//   与 part8a 完全一致 — Apollo Studio Explorer 是一个"使用工具"小节
//   课程原文: "When Apollo server is run in development mode the page http://localhost:4000
//              takes us to GraphOS Studio Explorer."

const { ApolloServer } = require('@apollo/server')
// ⭐ startStandaloneServer 是 Apollo Server v4 推荐的最小 standalone 模式
// 自带:HTTP server + CORS + body parsing + 默认路由 /
// 开发期访问 http://localhost:4000 自动跳到 Apollo Sandbox / GraphOS Studio Explorer
const { startStandaloneServer } = require('@apollo/server/standalone')

const { typeDefs, resolvers } = require('./schema')

// ⭐ new ApolloServer({ typeDefs, resolvers }) — verbatim 课程代码
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

// ⭐ startStandaloneServer — verbatim 课程代码
// 启动后终端会打印 "🚀 Server ready at http://localhost:4000/"
// 浏览器访问 http://localhost:4000 → 自动跳转到 GraphOS Studio Explorer(本节重点)
startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
  console.log(`👉 Open ${url} in browser → automatically redirects to GraphOS Studio Explorer`)
})