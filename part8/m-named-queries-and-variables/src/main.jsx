// ⭐ main.jsx — part8m "Named queries and variables" 入口(verbatim 沿用 part8l)
//
// ⭐ 关键诚实声明:课程本子节**不改 main.jsx**
//   课程本节只改 src/components/Persons.jsx(增 useState + FIND_PERSON + Person 子组件)
//   main.jsx 的 ApolloClient / HttpLink / InMemoryCache / ApolloProvider 基础设施不动
//
// ⭐ 课程原文核心(逐字保留):
//   "Let's implement functionality for viewing the address details of a person.
//    The findPerson query is well-suited for this."
//   "GraphQL variables are well-suited for this. To be able to use variables,
//    we must also name our queries."

// ⭐ React 核心 imports — verbatim part8l(part8m 不改)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// ⭐ Apollo Client 核心 imports — verbatim part8l(part8m 不改)
import {
  ApolloClient, gql,
  HttpLink,
  InMemoryCache
} from '@apollo/client'

// ⭐ ApolloProvider 子路径 imports — verbatim part8l(part8m 不改)
import {
  ApolloProvider
} from '@apollo/client/react'

// ⭐⭐ ApolloClient 实例化 — verbatim part8l ⭐⭐
//
// ⭐ part8m 不动这部分:ApolloClient 实例 + ApolloProvider 包裹
//   - part8k 创建的 client 实例持续用(part8l/m/n/o/p/q/r 共用同一个 client)
//   - HttpLink 指向 part8j server(端口 4000)
//   - InMemoryCache 内存缓存 — 本节 H3 "Cache" 子段会讲 cache 行为
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000',
  }),
  cache: new InMemoryCache(),
})

// ⭐⭐⭐ ApolloProvider 包裹 — verbatim part8l ⭐⭐⭐
//
// 仍然必需 — Persons 组件里的 useQuery(FIND_PERSON) 内部通过 React Context 拿 client
// 没有 Provider,useQuery 报"Could not find Apollo Client context"
createRoot(document.getElementById('root')).render(
  (
    <StrictMode>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </StrictMode>
  ),
)