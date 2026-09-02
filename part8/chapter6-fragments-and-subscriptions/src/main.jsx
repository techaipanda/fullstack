// ⭐⭐⭐ main.jsx — Chapter 6 子节 2 "Subscriptions on the client" 完整版 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件基于 part8x 改造,新增内容**完全 verbatim 课程 Chapter 6 子节 2**
//   - 课程原文(per part8e.md line 794-799):
//     "In order to use subscriptions in our React application, we have to do
//      some changes, especially to its configuration"
//   - 改造范围:本文件**完全替换**(per course line 813-912)
//   - 关键变更 4 处:
//     1. 加 imports: ApolloLink + getMainDefinition + createClient + GraphQLWsLink
//     2. 加 wsLink — WebSocket transport for subscriptions
//     3. 加 splitLink — ApolloLink.split(...) 根据 operation kind 分流
//     4. ApolloClient.link 从 authLink.concat(httpLink) 改为 splitLink
//
// ⭐⭐ 跟 part8x baseline 的对比:
//   ┌─────────────────────┬───────────────────────────┬─────────────────────────────────────────┐
//   │ 维度                │ part8x baseline            │ Chapter 6 子节 2(verbatim 改后)         │
//   ├─────────────────────┼───────────────────────────┼─────────────────────────────────────────┤
//   │ transport 数        │ 1 (HTTP)                  │ 2 (HTTP + WebSocket)                    │
//   │ ApolloLink.split?   │ 无                        │ 有 — 根据 operation kind 分流           │
//   │ ApolloClient.link   │ authLink.concat(httpLink) │ splitLink (内部分流 wsLink vs HTTP)     │
//   │ graphql-ws import?  │ 无                        │ 有 — createClient({ url: 'ws://...' })  │
//   └─────────────────────┴───────────────────────────┴─────────────────────────────────────────┘
//
// ⭐ 课程安装命令(verbatim):
//   - npm install graphql-ws    (per part8e.md line 805-807)
//
// ⭐⭐⭐ 关键概念:HTTP vs WebSocket 传输分流 ⭐⭐⭐
//   - 课程原文(per part8e.md line 914-918):
//     "The new configuration is due to the fact that the application must have
//      an HTTP connection as well as a WebSocket connection to the GraphQL server"
//   - query / mutation:HTTP POST(短连接,server 立即响应)
//   - subscription:WebSocket(长连接,server 推送)
//   - 必须用 splitLink 根据 operation kind 决定走哪个 transport
//
// ⭐⭐⭐ 关键概念:ApolloLink.split(per course line 875-891)⭐⭐⭐
//   - 课程原文(per part8e.md line 875-891):
//     "const splitLink = ApolloLink.split(
//        ({ query }) => {
//          const definition = getMainDefinition(query)
//          return (
//            definition.kind === 'OperationDefinition' &&
//            definition.operation === 'subscription'
//          )
//        },
//        wsLink,
//        authLink.concat(httpLink),
//      )"
//   - split 是 ApolloLink 的静态方法
//   - 第 1 个参数:test function — 返回 true → 走 leftLink(wsLink);返回 false → 走 rightLink
//   - 第 2 个参数:leftLink — subscription 走 wsLink
//   - 第 3 个参数:rightLink — 其他走 authLink.concat(httpLink)(HTTP + auth header)
//   - test function 拆解:
//     - getMainDefinition(query) 拿到顶层 GraphQL AST
//     - definition.kind === 'OperationDefinition' → 是 query/mutation/subscription
//     - definition.operation === 'subscription' → 是 subscription
//   - 组合:只有 kind 是 OperationDefinition 且 operation 是 subscription 才返回 true
//
// ⭐⭐⭐ 关键概念:GraphQLWsLink(per course line 864-870)⭐⭐⭐
//   - 课程原文(per part8e.md line 864-870):
//     "const wsLink = new GraphQLWsLink(
//        createClient({
//          url: 'ws://localhost:4000',
//        }),
//      )"
//   - createClient 来自 graphql-ws 库,接受 { url: 'ws://...' }
//   - GraphQLWsLink 是 Apollo Client 适配这个 client 的 link
//   - 当 ApolloLink.split 决定走 wsLink 时:
//     → Apollo Client 把 operation 转成 graphql-ws 协议消息
//     → graphql-ws client 通过 WebSocket 发到 server
//     → server 端 useServer 收到后路由到 Subscription resolvers
//   - 注意:wsLink **不需要** authLink — subscriptions 当前课程不做认证(per course 未涉及)

// ⭐ React 核心 imports — verbatim 沿用 part8w
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// ⭐ App 组件 — 当前目录(per part8w 沿用)
import App from './App.jsx'

// ⭐⭐⭐ Apollo Client 核心 imports(per course line 821-829)⭐⭐⭐
//
// ⭐ ApolloClient + HttpLink + InMemoryCache + ApolloProvider(per part8w 沿用)
// ⭐⭐⭐ 新增 ApolloLink(per course line 822 highlighted):⭐⭐⭐
//   - 用于 splitLink(per course line 875)
//   - ApolloLink.split 是静态方法,接收 (testFn, leftLink, rightLink)
//   - 跟 GraphQLWsLink / authLink / httpLink 同级 link 实例
import {
  ApolloClient,
  ApolloLink, // highlight-line
  HttpLink,
  InMemoryCache,
} from '@apollo/client'

// ⭐ ApolloProvider 用 v4 API 走 @apollo/client/react(per part8p 沿用)
//   - 课程 verbatim(per course line 830-831)同位置
//   - ⭐ 修复(per 编译报错 "The symbol ApolloProvider has already been declared"):
//     我之前误把 ApolloProvider 留在第一个 import 块里又单独 import 一次,
//     跟 part8x baseline 的旧 import path (`@apollo/client`)冲突
//   - 正确做法:**只**在第二个 import 块里 import(per course verbatim line 821-831)
//     → 第一个 import 块只导 ApolloClient/ApolloLink/HttpLink/InMemoryCache
//     → 第二个 import 块只导 ApolloProvider
import { ApolloProvider } from '@apollo/client/react'

// ⭐⭐⭐ 新增(per course line 832-833):SetContextLink(已被 part8x 用 setContext 替代)⭐⭐⭐
//
// ⭐⭐⭐ 关键诚实声明(per part8x verbatim 沿用):v3.11 适配 ⭐⭐⭐
//   - 课程 verbatim 用 `new SetContextLink(...)`(Apollo Client v4 API)
//   - 本项目 part8x 钉死 `@apollo/client: ^3.11.0`
//   - v3.11 的 @apollo/client/link/context **只导出** setContext(工厂函数)
//   - 选型:用 v3.11 等价的 setContext 工厂函数(per part8x README 关键诚实声明)
//   - 完整注释见 part8x README,这里只 import
import { setContext } from '@apollo/client/link/context'

// ⭐⭐⭐ 新增(per course line 835-841 highlighted):GraphQLWsLink + createClient + getMainDefinition ⭐⭐⭐
//
// ⭐ GraphQLWsLink:来自 @apollo/client/link/subscriptions
//   - 课程 verbatim(per course line 836)用 `@apollo/client/link/subscriptions` 路径
//   - 跟 part8x 已有的 `@apollo/client/link/context` 同级
//
// ⭐ getMainDefinition:来自 @apollo/client/utilities
//   - 课程 verbatim(per course line 838-839)用 `@apollo/client/utilities` 路径
//   - 用来从 GraphQL AST 拿顶层 operation(per course line 879)
//
// ⭐ createClient:来自 graphql-ws 库
//   - 课程 verbatim(per course line 840-841)用 `graphql-ws` 直接 import
//   - 返回 graphql-ws Client 实例
//   - 接受 { url: 'ws://...' } 配置
//
// ⭐ v3.11 vs v4 路径差异:GraphQLWsLink 的 import 路径在两个大版本都是
//   `@apollo/client/link/subscriptions`,所以本节**没有** v3/v4 适配问题
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'

import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

// ⭐⭐⭐ authLink(per part8x verbatim 沿用,block 21)⭐⭐⭐
//
// ⭐ 沿用 part8x 课程 block 21 verbatim:
//   - 用 setContext 工厂函数(v3.11 适配,见上)
//   - 读 localStorage 'phonebook-user-token' + Bearer 格式
//   - 完整注释见 part8x main.jsx
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('phonebook-user-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    }
  }
})

// ⭐⭐⭐ httpLink(per part8x verbatim 沿用)⭐⭐⭐
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
})

// ⭐⭐⭐ 新增(per course line 864-870 verbatim):wsLink ⭐⭐⭐
//
// ⭐ 课程原文(per part8e.md line 864-870):
//   "const wsLink = new GraphQLWsLink(
//      createClient({
//        url: 'ws://localhost:4000',
//      }),
//    )"
// ⭐ ws://(per course verbatim) — 不是 wss://(无 TLS)
//   - 本地开发用 ws://,生产环境必须 wss://(TLS)
//   - 端口跟 HTTP 同(4000)— server 端用同一 httpServer 升级
// ⭐ createClient({ url }) 还可以传:
//   - retryAttempts:重连次数
//   - connectionParams:连接时传给 server 的认证信息(本节不用)
//   - onConnecting / onConnected 等 callback
//   - 课程 verbatim 只传 url,本项目 verbatim 沿用
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000',
  }),
)

// ⭐⭐⭐ 新增(per course line 875-891 verbatim):splitLink ⭐⭐⭐
//
// ⭐ 课程原文(per part8e.md line 875-891):
//   "const splitLink = ApolloLink.split(
//      ({ query }) => {
//        const definition = getMainDefinition(query)
//        return (
//          definition.kind === 'OperationDefinition' &&
//          definition.operation === 'subscription'
//        )
//      },
//      wsLink,
//      authLink.concat(httpLink),
//    )"
//
// ⭐ testFn({ query }):
//   - ApolloLink.split 在每个 operation 时调 testFn
//   - 传入当前 operation 的 query(AST)
//   - 返回 boolean:true → leftLink(wsLink);false → rightLink
//
// ⭐ getMainDefinition(query):
//   - Apollo Client utilities 提供
//   - 从 query AST 拿顶层 OperationDefinition
//   - query/mutation/subscription 都属于 OperationDefinition
//
// ⭐ 关键判断:definition.operation === 'subscription'
//   - 'subscription' 字符串来自 GraphQL AST
//   - 课程没考虑 fragment — 但 fragment 不影响顶层 operation
//   - fragment 只在 selection set 里展开,不决定顶层 operation kind
//
// ⭐ wsLink vs authLink.concat(httpLink):
//   - subscription → wsLink(无 auth header)
//   - query / mutation → authLink.concat(httpLink)(带 Authorization header)
const splitLink = ApolloLink.split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink),
)

// ⭐⭐⭐ ApolloClient 实例化(per course line 894-900 verbatim)⭐⭐⭐
//
// ⭐ 课程原文(per part8e.md line 894-900):
//   "const client = new ApolloClient({
//      cache: new InMemoryCache(),
//      link: splitLink, // highlight-line
//    })"
// ⭐ 跟 part8x 的对比:
//   - part8x: link: authLink.concat(httpLink)
//   - Chapter 6 子节 2: link: splitLink(内部分流)
//   - splitLink 本身是一个 ApolloLink,放 link 字段 OK
//
// ⭐ InMemoryCache 沿用 part8w — 默认 cache 实现
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink, // highlight-line
})

// ⭐ React 渲染根(verbatim 沿用 part8w)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
)