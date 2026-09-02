// ⭐⭐⭐ main.jsx — part8x "Adding a token to a header" 客户端入口 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件是 part8x **改** 的客户端入口
//   课程 Chapter 5 "Adding a token to a header" 小节**改 main.jsx**(per course block 21):
//     1. 加 `import { setContext } from '@apollo/client/link/context'`(block 21 highlighted line 7)
//     2. 加 authLink = setContext(...) 设置 authorization header(block 21 highlighted lines 9-17)
//     3. 把 httpLink 拆成独立变量(block 21 highlighted line 19)
//     4. ApolloClient 的 link 改为 authLink.concat(httpLink)(block 21 highlighted lines 21-24)
//
// ⭐ 跟 part8w main.jsx 的差异:
//   - part8w:`link: new HttpLink({ uri: '...' })`(无 auth header)
//   - part8x:`link: authLink.concat(httpLink)`(auth header 自动加)
//
// ⭐⭐⭐ 关键 v3 vs v4 verbatim 冲突诚实声明 ⭐⭐⭐
//   - 课程 verbatim 用 `new SetContextLink(...)`(Apollo Client v4 API,2025+ 发布)
//   - 本项目 part8w 钉死 `@apollo/client: ^3.11.0`(per part8k 沿用)
//   - v3.11 的 @apollo/client/link/context 模块**只导出** setContext(工厂函数),
//     没有 SetContextLink(per 我从 npm tarball 解开的 index.d.ts 实测确认)
//   - 选型:用 v3.11 等价的 setContext 工厂函数,功能完全一致
//     (都是返回 ApolloLink,都是给每条 GraphQL 请求加 Authorization header)
//   - 验证:per 课程 block 22 "this time, however, it is modified using the
//     context defined by the authLink object so that, for each request, the
//     authorization header is set" — 描述功能,API 实现形式等价即可
//
// ⭐⭐⭐ 关键架构概念:Apollo Link chain(链路链)⭐⭐⭐
//   - link 字段不再是单个 link,而是一个链(可以 concat 多个 link)
//   - 数据流向:client → authLink → httpLink → 后端
//   - authLink 拦截每条请求,从 localStorage 读 token,塞到 Authorization header
//   - httpLink 拿到加了 header 的请求,实际发到后端
//   - 顺序很重要:authLink 必须**先于** httpLink(因为 httpLink 才是实际发请求的)
//
// ⭐⭐⭐ v4 SetContextLink vs v3 setContext 对照 ⭐⭐⭐
//   ┌────────────────────────────────┬────────────────────────────────┐
//   │ v4(课程 verbatim)             │ v3.11(本项目沿用)             │
//   ├────────────────────────────────┼────────────────────────────────┤
//   │ import { SetContextLink }     │ import { setContext }          │
//   │ const authLink = new          │ const authLink = setContext(   │
//   │   SetContextLink(({ headers })│   (_, { headers }) => ({...})  │
//   │   => ({...}))                 │ )                              │
//   │ authLink.concat(httpLink)     │ authLink.concat(httpLink)      │
//   │ (相同)                        │                                │
//   └────────────────────────────────┴────────────────────────────────┘
//
// ⭐⭐⭐ authorization 字段格式 ⭐⭐⭐
//   - HTTP 标准:`Authorization: Bearer <token>`(Bearer 大写 B + 空格 + token)
//   - per 课程 block 21 verbatim:`token ? \`Bearer ${token}\` : null`
//   - 后端 part8u/v 的 getUserFromAuthHeader 期望 Bearer 格式(per part8u README)
//   - token null 时不传(authorization: null),让后端 ctx.currentUser = null
//
// ⭐⭐⭐ localStorage 'phonebook-user-token' key ⭐⭐⭐
//   - 跟 LoginForm.jsx 写的 key 一致(per part8w LoginForm.jsx onCompleted)
//   - App.jsx 登出时 localStorage.clear() 也会清掉这个 key
//   - 注意:per 课程 setContext 是**同步**读 localStorage,
//     跟 server side rendering 场景可能有 SSR 不一致问题
//     (per Apollo docs 提过 SSR 应该用 ServerErrorLink 或别的方案)

// ⭐ React 核心 imports — verbatim 沿用 part8w
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// ⭐ App 组件 — 当前目录(per part8w 沿用)
import App from './App.jsx'

// ⭐ Apollo Client 核心 imports — verbatim 沿用 part8w
//
// ⭐ ApolloClient:Apollo Client 的"主类",整个客户端对象
// ⭐ HttpLink:Apollo 用来发请求的 transport(底层是 fetch)
// ⭐ InMemoryCache:Apollo 自带的内存缓存
// ⭐ ApolloProvider 是 React Context Provider,把 client 注入整棵组件树
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client'

// ⭐⭐⭐ 新增(per course block 21 highlighted line 7):setContext⭐⭐⭐
//
// ⭐ 课程原文(verbatim,per course block 21):
//   import { SetContextLink } from '@apollo/client/link/context'
//
// ⭐⭐⭐ v3.11 等价 API 降级诚实声明 ⭐⭐⭐
//   - 课程 verbatim 是 v4 API (new SetContextLink(...))
//   - 本项目钉死 ^3.11.0,只支持 v3 的 setContext 工厂函数
//   - 功能完全等价(都返回 ApolloLink,都用于注入 header context)
//   - 验证:per 我解压 @apollo/client-3.11.0.tgz 看 package/link/context/index.d.ts:
//     ```
//     export type ContextSetter = (operation, prevContext) => Promise<...> | ...
//     export declare function setContext(setter: ContextSetter): ApolloLink
//     ```
//   - 所以本项目用 setContext 工厂函数(没有 class 形态)
//   - 见 README "关键诚实声明" 章节详细说明
import { setContext } from '@apollo/client/link/context'

// ⭐⭐⭐ authLink(per course block 21 highlighted lines 9-17)⭐⭐⭐
//
// ⭐ 课程原文(verbatim,per course block 21):
//   const authLink = new SetContextLink(({ headers }) => {
//     const token = localStorage.getItem('phonebook-user-token')
//     return {
//       headers: {
//         ...headers,
//         authorization: token ? `Bearer ${token}` : null,
//       }
//     }
//   })
//
// ⭐⭐⭐ v3.11 适配 ⭐⭐⭐
//   - v3.11 setContext 签名:setContext((request, prevContext) => newContext | Promise<newContext>)
//   - 跟 v4 SetContextLink 签名基本一致,只是工厂函数 vs class 区别
//   - 第一个参数是 GraphQLRequest(用 _ 表示不读),第二个是 prevContext(读 headers)
//   - 返回的对象会被合并到 operation context
//
// ⭐⭐⭐ localStorage 同步读取 ⭐⭐⭐
//   - getItem('phonebook-user-token') 是同步 API,React 渲染时调用没问题
//   - 如果 key 不存在返回 null(per MDN)
//   - 课程 verbatim:token ? `Bearer ${token}` : null
//     - 有 token → "Bearer eyJhbGc..."
//     - 没 token → null(Apollo 会去掉这个 header)
//
// ⭐⭐⭐ headers spread 模式 ⭐⭐⭐
//   - ...headers:保留之前 link 链上其他 link 加的 header(比如 locale header)
//   - authorization 覆盖:本 authLink 最后说了算
//
// ⭐⭐⭐ "Bearer ${token}" vs "bearer ${token}" ⭐⭐⭐
//   - HTTP 标准是 Bearer(大写 B),但实际大部分后端 case-insensitive
//   - 课程 verbatim 用 Bearer 大写,本项目 verbatim 沿用
//   - 后端 part8u/v 的 getUserFromAuthHeader(per part8u README)也期望 Bearer
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('phonebook-user-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    }
  }
})

// ⭐⭐⭐ httpLink 拆成独立变量(per course block 21 highlighted line 19)⭐⭐⭐
//
// ⭐ 课程原文(verbatim,per course block 21):
//   const httpLink = new HttpLink({ uri: 'http://localhost:4000' })
//
// ⭐ 跟 part8w 的差异:
//   - part8w:`link: new HttpLink({ uri: '...' })`(内联)
//   - part8x:把 httpLink 抽成独立 const(因为 link 字段要 .concat(httpLink))
//   - 本项目适配:用 env 变量(per part8w 沿用)+ 兜底 'http://localhost:4000'
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
})

// ⭐⭐⭐ ApolloClient 实例化(per course block 21 highlighted lines 21-24)⭐⭐⭐
//
// ⭐ 课程原文(verbatim,per course block 21):
//   const client = new ApolloClient({
//     cache: new InMemoryCache(),
//     link: authLink.concat(httpLink)
//   })
//
// ⭐⭐⭐ link.concat() 用法 ⭐⭐⭐
//   - ApolloLink 实例有 .concat(nextLink) 方法,把 nextLink 接到自己后面
//   - 数据流向:client → authLink → httpLink → fetch → 后端
//   - authLink 改 context(operation.getContext() 拿到的是 authLink 改完的)
//     → httpLink 拿到 authorization header → 实际发请求
//   - 顺序错会怎样?authLink 在 httpLink 后 → httpLink 先发请求,fetch 已发出
//     authLink 来不及改 header → 后端拿不到 token
//
// ⭐⭐⭐ link 顺序错误的常见反模式 ⭐⭐⭐
//   - 错:link: httpLink.concat(authLink) → authLink 永远赶不上 fetch
//   - 对:link: authLink.concat(httpLink) → authLink 先加 header,httpLink 再发
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
})

// ⭐⭐⭐ React 渲染根(verbatim 沿用 part8w)⭐⭐⭐
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
)
