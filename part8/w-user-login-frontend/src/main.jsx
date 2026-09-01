// ⭐⭐⭐ main.jsx — part8w User login 客户端入口 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件是 part8w **新建** 客户端入口(per part8p main.jsx 模式)
//   课程 Chapter 5 "User login" 小节**未给 main.jsx 具体内容**(per part8p README
//   已明示:part8p 仅改 App.jsx + PersonForm.jsx + 新建 Notify.jsx)
//   但是 Vite 工程需要 main.jsx 才能编译,所以本文件 = part8p 的 main.jsx verbatim
//   沿用,只把头部注释改成 part8w
//
// ⭐ 跟 part8p main.jsx 的**唯一**差异:uri 改用 import.meta.env.VITE_BACKEND_URL
//   - part8p:硬编码 `'http://localhost:4000'`(per course Chapter 3 简化)
//   - part8w:用 env 变量读取(import.meta.env.VITE_BACKEND_URL || 兜底 'http://localhost:4000')
//   - 理由:part8w 已经引入 .env.example + VITE_BACKEND_URL,顺着用 env 是
//     minimum viable addition,不破坏 part8p 沿用
//
// ⭐⭐ 关键架构概念:本 main.jsx 决定了前端如何连后端 ⭐⭐
//   1. ApolloClient 是 Apollo 客户端的核心,所有 query/mutation 都通过它发
//   2. HttpLink 负责实际 HTTP 传输(底层是 fetch)
//      - uri 字段是 GraphQL endpoint 的完整 URL
//      - 本节**故意不**用 server.proxy(per vite.config.js 注释说明)
//      - 直接连后端:后端 part8u/v 已开 CORS(per part8o 已验证)
//   3. InMemoryCache 是 Apollo 自带的内存缓存
//      - 默认按 query operation name + variables 做 cache key
//      - Chapter 5 的"Updating the cache"小节会讲如何精确控制更新
//   4. ApolloProvider 是 React Context Provider,把 client 注入整棵组件树
//      - 子组件(LoginForm / App)用 useQuery / useMutation 才能拿到 client
//      - 没有 ApolloProvider → "Could not find Apollo Client context" 报错

// ⭐ React 核心 imports — verbatim 沿用 part8p
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// ⭐ App 组件 — 当前目录(per part8p 沿用)
import App from './App.jsx'

// ⭐ Apollo Client 核心 imports — verbatim 沿用 part8p
//
// ⭐ ApolloClient:Apollo Client 的"主类",整个客户端对象
// ⭐ HttpLink:Apollo 用来发请求的 transport(底层是 fetch)
// ⭐ InMemoryCache:Apollo 自带的内存缓存(后续 chapter 会讲更新策略)
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client'

// ⭐⭐⭐ Apollo Client 实例化(verbatim 沿用 part8p)⭐⭐⭐
//
// ⭐ 跟 part8p 的**微小**差异:uri 改用 import.meta.env.VITE_BACKEND_URL
//   - part8p:硬编码 `'http://localhost:4000'`(per course Chapter 3 简化)
//   - part8w:用 env 变量读取(import.meta.env.VITE_BACKEND_URL || 兜底 'http://localhost:4000')
//   - 理由:part8w 已经引入 .env.example + VITE_BACKEND_URL,顺着用 env 是
//     minimum viable addition,不破坏 part8p 沿用
//
// ⭐ import.meta.env.VITE_*:Vite 暴露给浏览器代码的 env 变量
//   - Vite 在 build 时把 .env 文件里的 VITE_* 注入到 import.meta.env
//   - 浏览器代码里可以直接读,不需要额外 polyfill
//   - 兜底 'http://localhost:4000':.env 缺失或没配 VITE_BACKEND_URL 仍能跑
const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
  }),
  cache: new InMemoryCache(),
})

// ⭐⭐⭐ React 渲染根(verbatim 沿用 part8p)⭐⭐⭐
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
)