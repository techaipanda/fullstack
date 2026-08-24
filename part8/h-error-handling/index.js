// ⭐ index.js — Apollo Server v4 启动入口(verbatim 课程代码 + 中文注释)
//
// ⭐ 说明:本子项目(part8h - Error handling)的运行 server
//   与 part8a / part8g 完全一致 — 课程本节改的是 schema
//   (resolvers.Mutation.addPerson 加查重 + 抛 GraphQLError),
//   server 启动代码不变。

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