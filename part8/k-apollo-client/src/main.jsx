// ⭐ main.jsx — Apollo client 客户端入口(part8k verbatim 课程代码)
//
// ⭐ 关键诚实声明:本节是 Chapter 3 / "Apollo client" 子节的最终代码状态
//   课程这一节做了 3 步递进:
//   1. 骨架 main.jsx(空 query + console.log)
//   2. 把 query 换成真实 allPersons
//   3. 用 ApolloProvider 把 client 注入 React 树
//   本文件 = 第 3 步最终态(课程 line 188-268 verbatim)
//
// ⭐ 课程原文核心(逐字保留):
//   "The beginning of the code creates a new client object,
//    which is then used to send a query to the server:
//    client.query({ query }).then((response) => console.log(response.data))"
//   "The application can communicate with a GraphQL server using the client object.
//    The client can be made accessible for all components of the application by
//    wrapping the App component with ApolloProvider."

// ⭐ React 核心 imports — verbatim
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// ⭐ Apollo Client 核心 imports — verbatim 课程代码
// ⭐ ApolloClient:Apollo Client 的"主类",整个客户端对象
// ⭐ gql:GraphQL 模板字符串 tag(把模板字符串解析成 GraphQL AST)
// ⭐ HttpLink:Apollo 用来发请求的 transport(底层是 fetch)
// ⭐ InMemoryCache:Apollo 自带的内存缓存(后续 chapter 会讲更新策略)
import {
  ApolloClient, gql,
  HttpLink,
  InMemoryCache
} from '@apollo/client'

// ⭐ ApolloProvider 走单独的子路径 — verbatim 课程 imports
// ⭐ 课程用 '@apollo/client/react'(Apollo Client 3.10+ 引入的"按子包"导入)
// ⭐ 这是 Apollo 团队推荐的新写法(替代之前从 '@apollo/client' 一把导入)
// ⭐ 验证:看 Apollo 官方 https://www.apollographql.com/docs/react/get-started/
//        第 4 步"Connect your client to React"用了完全一致的子路径写法
import {
  ApolloProvider
} from '@apollo/client/react'

// ⭐⭐⭐ 核心概念:ApolloClient 实例化 ⭐⭐⭐
//
// 1. ApolloClient — Apollo 客户端的主类,每个 app 一个 client 实例
//    不用会怎样:没有 client 就没法发 GraphQL 请求 — 一切 Apollo 功能都基于 client
//    用会怎样:得到一个 client 对象,后面所有 query/mutation/subscription 都用它
//
// 2. `link` — Apollo Client 用来"发请求"的 transport(可以多个 link 串成 chain)
//    HttpLink 是 Apollo 内置的 HTTP transport(底层 fetch)
//    `uri: 'http://localhost:4000'` — 课程指向 Chapter 2 的 Apollo Server(我们的 part8j)
//    验证:打开 DevTools Network,看到对 http://localhost:4000 的 POST 请求
//
// 3. `cache` — Apollo Client 的缓存层(默认 InMemoryCache 内存缓存)
//    后续 chapter "Updating the cache" 会讲怎么手动更新它
//    验证:第一次 query 后,console.log client.cache 看缓存内容
//
// ⭐ 课程为什么用 `()` 包配置对象? — verbatim 课程写法,可写成 `{...}` 无 `()`
//   课程选了 `({...})` 风格,这是 Apollo 文档示例的常见风格(箭头函数 + 立即返回的错觉)
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000',
  }),
  cache: new InMemoryCache(),
})

// ⭐⭐⭐ 核心概念:gql 模板字符串 + client.query() ⭐⭐⭐
//
// 1. gql — 来自 @apollo/client 的模板字符串 tag
//    不用会怎样:`query` 就是个普通字符串,Apollo 不知道这是 GraphQL,没法校验
//    用会怎样:Apollo 在编译期校验语法(写错的字段名会报错),运行时生成 AST
//    验证:故意把 "allPersons" 写成 "allPerson",Vite 启动会在 console 报错
//
// 2. query 内容 — 跟 Chapter 2 服务端 schema 严格对应
//    allPersons(phone: YesNo):[Person!]! — 从 part8i 的 schema
//    这里不传 phone 参数,所以返全部 persons
//
// 3. client.query({ query }) — 课程用 imperative API(命令式调用)
//    课程这里**没有**用 Hook(用 useQuery 才是现代做法)
//    ⭐ 关键认知:这是 client 接入的"第一步验证手段" — 拿到响应就证明链路通
//    后续 chapter "Making queries" 会用 useQuery 替代 imperative 调用
//
// ⭐ 课程为什么同时定义 query + 立即发请求(而不是只 import 备用)?
//   因为这是"接入验证"阶段 — 还没用到 React,先用原始 API 验证能拿到数据
//   console.log(response.data) — 把 GraphQL 响应打到浏览器 console
const query = gql`
query {
  allPersons {
    name
    phone
    address {
      street
      city
    }
    id
  }
}
`

client.query({ query }).then((response) => {
  // ⭐ response.data 就是 GraphQL schema 顶层 query 字段的返回值
  // 这里就是 { allPersons: [{ name, phone, address, id }, ...] }
  console.log(response.data)
})

// ⭐⭐⭐ 核心概念:ApolloProvider ⭐⭐⭐
//
// 1. ApolloProvider 是 React Context Provider
//    把 ApolloClient 实例通过 Context 注入整个组件树
//    不用会怎样:子组件 useQuery 会报错"No Apollo Client instance can be found"
//    用会怎样:任何子组件都能通过 useQuery/useMutation 拿到 client,不用 prop drilling
//
// 2. <ApolloProvider client={client}> — client 是必传 prop
//    ⚠️ 注意:这里的 `client` 是上面 `const client = new ApolloClient(...)` 创建的实例
//             不是 Apollo 包本身 — 容易混淆
//
// 3. 包 <App /> 的位置 — 必须在所有"需要 Apollo"的组件的最外层
//    ⭐ 课程示范:Provider 包 <App />,<App /> 里的所有组件都能用 useQuery
//
// 4. StrictMode 包 ApolloProvider — 课程 verbatim,React 19 dev mode 双调用 hook
//    触发两次 client.query 是预期行为(只 console.log 不修改 state)
// ⭐ 课程原文 `</StrictMode>` 有个怪缩进(verbatim 保留),不影响功能
createRoot(document.getElementById('root')).render(
  (
    <StrictMode>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
      </StrictMode>
  ),
)
