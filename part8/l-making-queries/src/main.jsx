// ⭐ main.jsx — part8l "Making queries" 入口(沿用 part8k + 删除 client.query 段)
//
// ⭐ 关键诚实声明:课程从 part8l 开始,把 query 从 main.jsx 顶层迁到 React 组件里
//   part8k:`client.query({ query }).then(response => console.log(response.data))` ← 这里
//   part8l:**删掉这段** — 用 `useQuery` Hook 在组件里发请求(下面 App.jsx 实现)
//
//   其他内容(ApolloClient/HttpLink/InMemoryCache/ApolloProvider/StrictMode/createRoot)
//   跟 part8k verbatim 一致 — 客户端基础设施不变,变的是**发请求的位置**。
//
// ⭐ 课程原文核心(逐字保留):
//   "We are ready to implement the main view of the application,
//    which shows a list of person's name and phone number."
//   "Apollo Client offers a few alternatives for making queries.
//    Currently, the use of the hook function useQuery is the dominant practice."

// ⭐ React 核心 imports — verbatim part8k
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// ⭐ Apollo Client 核心 imports — verbatim part8k
import {
  ApolloClient, gql,
  HttpLink,
  InMemoryCache
} from '@apollo/client'

// ⭐ ApolloProvider 子路径 imports — verbatim part8k
import {
  ApolloProvider
} from '@apollo/client/react'

// ⭐⭐ ApolloClient 实例化 — verbatim part8k ⭐⭐
//
// ⭐ part8l 不动这部分:整个 app 一个 client 实例,基础架构不变
//   - HttpLink(uri:'http://localhost:4000')指向 part8j server
//   - InMemoryCache 内存缓存 — 后续章节会讲怎么更新它
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000',
  }),
  cache: new InMemoryCache(),
})

// ⭐⭐⭐ 关键改动 ⭐⭐⭐ — part8k 里有这两行,part8l **删掉**
//
// part8k:
// ```
// const query = gql`
//   query {
//     allPersons { name phone address { street city } id }
//   }
// `
// client.query({ query }).then((response) => {
//   console.log(response.data)
// })
// ```
//
// 为什么不删会怎样?有什么问题?
// - 问题 1:在 main.jsx 顶层 console.log — 数据只到 console,不到 React 树
// - 问题 2:每次组件重新挂载都会重新发请求(无 React 生命周期管理)
// - 问题 3:没法利用 Apollo 的 loading/error 状态管理
//
// part8l 改的:把 query 定义 + 发请求 都挪到 App.jsx,改用 useQuery Hook
// (详见 src/App.jsx 的 ⭐ 注释)

// ⭐⭐⭐ ApolloProvider 包裹 — verbatim part8k ⭐⭐⭐
//
// 仍然必需 — useQuery 内部通过 React Context 拿 client,没有 Provider 就报错
createRoot(document.getElementById('root')).render(
  (
    <StrictMode>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
      </StrictMode>
  ),
)