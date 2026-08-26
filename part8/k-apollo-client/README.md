# part8 k — Apollo client(verbatim 课程 Chapter 3 "Apollo client" 段)

> **本子项目作用**:把课程 Chapter 3 里的 **Apollo client** 段做成最小可跑的 demo — 一个 **Vite + React + Apollo Client** 的浏览器端 app,**发 GraphQL query 到 Chapter 2 的 server**(我们的 part8j),把响应 console.log 出来。
>
> **关键诚实声明**:课程本节 verbatim 改了 1 个文件:`src/main.jsx`(3 步递进的最终态 — Skeleton → 真实 query → ApolloProvider)。其他 4 个文件(`package.json` / `vite.config.js` / `index.html` / `src/App.jsx`)是 Vite 工程脚手架,**非课程原文**。
>
> **架构切换 — Chapter 2 → Chapter 3**:
> - Chapter 2(part8a-j):**服务端** Node.js + Apollo Server,`node index.js` 起 server
> - Chapter 3(part8k 起):**客户端** Vite + React + Apollo Client,`npm run dev` 起浏览器 app,**同时需要 part8j server 跑着**(否则 query 拿不到响应)

---

## 课程原文要点(verbatim 摘录)

> "We could take care of the communication between the React app and GraphQL by using Axios. However, most of the time, it is not very sensible to do so. It is a better idea to use a higher-order library capable of abstracting the unnecessary details of the communication."
>
> "At the moment, there are two good options: Relay by Facebook and Apollo Client, which is the client side of the same library we used in the previous section. Apollo is absolutely the most popular of the two, and we will use it in this section as well."
>
> "Let's create a new React app and install the necessary dependencies for Apollo client. `npm install @apollo/client graphql`"
>
> "The beginning of the code creates a new client object, which is then used to send a query to the server:
> ```js
> client.query({ query }).then((response) => console.log(response.data))
> ```"
>
> "The application can communicate with a GraphQL server using the client object. The client can be made accessible for all components of the application by wrapping the App component with ApolloProvider."

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 6 个)

### ⭐ Apollo 客户端架构 3 层

```
┌─────────────────────────────────┐
│  ApolloProvider(React Context)  │ ← 把 client 注入整棵组件树
├─────────────────────────────────┤
│  ApolloClient 主对象             │ ← 整个 app 一个 client 实例
│   ├── link:HttpLink             │ ← 怎么发请求(fetch)
│   └── cache:InMemoryCache       │ ← 缓存(query 响应放内存)
├─────────────────────────────────┤
│  GraphQL server(Chapter 2 的 part8j)│ ← 跑在 http://localhost:4000
└─────────────────────────────────┘
```

### ⭐ ApolloClient 实例化

```js
const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4000' }),
  cache: new InMemoryCache(),
})
```

| 字段 | 作用 | 类比 |
|---|---|---|
| `link` | Apollo 用来**发请求**的 transport | 像 axios 的 `instance` |
| `uri` | GraphQL server 地址 | 像 axios 的 `baseURL` |
| `cache` | 客户端缓存(默认 InMemoryCache)| 像 React Query 的 QueryClient |

⭐ **关键认知**:
- 整个 app **只能有一个 client 实例**(放在 main.jsx,所有组件共享)
- `link` 可以串多个(认证 link + HTTP link + retry link …)— 后续 chapter "Login" 会加 auth link
- `cache` 默认是 `InMemoryCache`,后续 chapter 会讲怎么手动更新缓存

### ⭐ gql 模板字符串 tag

```js
import { gql } from '@apollo/client'

const query = gql`
  query {
    allPersons {
      name
      phone
    }
  }
`
```

| 不用 gql | 用 gql |
|---|---|
| `const query = "query { ... }"` — 纯字符串,Apollo 不知道是 GraphQL | Apollo 在编译期校验语法,运行期生成 AST,IDE 智能提示 |
| 字段名写错 Apollo 不知道 | 字段名写错 Apollo 立即报错 |
| 没法跟 schema 联动 | 自动跟 schema 联动(后续 part8 接 codegen 可生成 TS 类型)|

⭐ **关键认知**:`gql` 是 Apollo 提供的**模板字符串 tag 函数** — 把反引号包起来的 GraphQL 字符串解析成 AST(Abstract Syntax Tree)。这是 Apollo 校验 + 缓存 + 优化的基础。

### ⭐ client.query() — imperative API

```js
client.query({ query }).then((response) => {
  console.log(response.data)
})
```

⭐ **关键认知**:**课程本章用的是 imperative API**(直接调用 client.query)— 不是 Hook!
- imperative:在 main.jsx 顶层立即发请求,响应 console.log(本节做法)
- declarative:用 `useQuery` Hook(后续 part8l "Making queries" 才教)

⭐ 为什么课程先教 imperative?
- **验证链路通**:Apollo Client 创建 → 服务端 → 响应回来,证明整个体系工作
- **不依赖 React 渲染**:可以在任何地方用(不只是组件里)
- **后续 Hook 只是 wrapper**:`useQuery` 内部还是调 `client.query`,加 React 生命周期

### ⭐ ApolloProvider — React Context Provider

```jsx
<ApolloProvider client={client}>
  <App />
</ApolloProvider>
```

⭐ **关键认知**:
- ApolloProvider 是**桥梁** — 把 client 注入 React 组件树
- 任何子组件都能用 `useQuery` / `useMutation`,**不用 prop drilling**
- ⚠️ **必须包住所有用 Apollo 的组件** — 否则 `useQuery` 报"No Apollo Client instance can be found"

### ⭐ 课程三段递进(本子项目复刻了完整路径)

| 阶段 | query 内容 | ApolloProvider | 用途 |
|---|---|---|---|
| 1. Skeleton | 空 `query { }` | ❌ 无 | 验证 client 创建不报错 |
| 2. 真实 query | `query { allPersons { ... } }` | ❌ 无 | 验证数据能从 server 拿到 |
| 3. **最终态**(本子项目)| 真实 query | ✅ 包 <App /> | 让 client 注入组件树,后续章节用 useQuery |

⭐ **认知**:**最终态是 part8l 的起点** — ApolloProvider 包好,client 注入完成,part8l 只需在组件里 `useQuery` 就能拿到数据。

### ⭐ Apollo Client 子包导入(`@apollo/client/react`)

```js
// 老写法(Apollo Client < 3.10)— 把所有东西一把导入
import { ApolloProvider } from '@apollo/client'

// 新写法(Apollo Client 3.10+)— ApolloProvider 走子路径
import { ApolloProvider } from '@apollo/client/react'
```

⭐ 课程用**新写法**(`@apollo/client/react`),这是 Apollo 团队从 v3.10 开始推广的"按需导入":
- 好处 1:减小 bundle(ApolloProvider 不在主 bundle 里)
- 好处 2:服务端渲染 / 测试环境可以选不同的 import 路径
- 兼容性:新写法完全等价老写法,新项目推荐用新写法

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**需要两个终端**。

### Step 1 — 启动 Chapter 2 server(终端 A)

part8k 是**客户端**,需要 part8j server 在跑(否则 query 拿不到响应)。

```bash
# 终端 A
cd D:\workspace\fullstack_workspace\fullstack\part8\j-changing-a-phone-number
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

如果看不到这个,先回去 part8j README 跑通。

### Step 2 — 安装 part8k 依赖(终端 B)

```bash
# 终端 B(新开)
cd D:\workspace\fullstack_workspace\fullstack\part8\k-apollo-client
npm install
```

**期望**:3-5 个包装好(`@apollo/client` / `graphql` / `react` / `vite` / `@vitejs/plugin-react`)。

### Step 3 — 启动 Vite dev server(终端 B)

```bash
npm run dev
```

**期望**(类似):
```
  VITE v7.2.4  ready in 500 ms
  ➜  Local:   http://localhost:5173/
```

⭐ Vite 默认端口 **5173**,**不是** 4000(4000 是 GraphQL server)。两个进程占两个端口,不冲突。

### Step 4 — 浏览器打开页面

浏览器访问 `http://localhost:5173`。

**期望看到**:
- 浏览器标题栏 `part8k — Apollo client`
- 页面中央显示 `part8k — Apollo client ready` + 一段提示文字

⭐ 这只能证明 **React + Vite + App.jsx** 工作。**Apollo Client 还没验证**!

### Step 5 — 打开 DevTools Console

按 `F12` → Console 标签。

**期望看到**(类似):
```js
{
  allPersons: [
    { name: "Arto Hellas", phone: "040-123543", address: { street: "Tapiolankatu 5 A", city: "Helsinki" }, id: "3d594650-3436-11e9-bc57-8b80ba54c431" },
    { name: "Mary Popup", phone: "040-432342", address: { street: "Mannerheimintie 100", city: "Helsinki" }, id: "3d594670-3436-11e9-bc57-8b80ba54c431" }
  ]
}
```

⭐ ⭐ ⭐ **铁证**:
- Apollo Client 链路通(浏览器 5173 → server 4000 → 响应 → console.log)
- GraphQL 解析了嵌套 `address` 字段
- 数据来自 part8j 服务端 schema

### Step 6 — 看 Network 请求(证明链路细节)

F12 → Network 标签 → 过滤 `Fetch/XHR`。

**期望看到**:
- 1 个 POST 请求到 `http://localhost:4000/`(或 `/graphql`)
- Request body 是 JSON:
  ```json
  {
    "query": "query { allPersons { name phone address { street city } id } }",
    "variables": null
  }
  ```
- Response 是 GraphQL 响应 JSON

⭐ **铁证**:
- 浏览器真的发了 HTTP POST
- Body 里有 `query` 字段(GraphQL 标准协议)
- 验证 `gql` 模板字符串确实生成了正确的 GraphQL AST

### Step 7 — 双 console.log 验证(StrictMode 行为)

如果打开 DevTools Console,**第一次访问时可能看到 2 次 `allPersons` 数组**。

**原因**:React 19 的 `<StrictMode>` 在 dev mode 下**故意双调用 effect** — 验证 effect 幂等性。

⭐ **这是 React 的"严苛模式"行为,不是 bug**:
- 验证你的 effect 写对了(双调用不会出问题)
- 仅 dev mode,production build 只调一次
- 本子项目的 `client.query()` 在 main.jsx 顶层,不在 effect 里,但 Apollo 内部仍可能因 StrictMode 触发了重复

### Step 8 — 故意把 query 写错(验证 gql 报错机制)

把 `src/main.jsx` 第 75 行 `allPersons` 改成 `allPerson`:

```graphql
query {
  allPerson {   # ← 故意拼错
    name
  }
}
```

保存,刷新浏览器。

**期望**:
- console 显示**网络错误**(404 或 500)
- 报错信息里有 "Cannot query field 'allPerson'" 之类的 GraphQL 错误
- Vite 不报错(语法上 graphql string 是合法的)

⭐ **铁证**:`gql` tag **不会**校验字段名(只在运行时由 server 报错)。要编译期校验,需要后续章节接 codegen。

### Step 9 — 改回正确 query + 故意关掉 server(验证链路)

把 Step 8 改回正确的 `allPersons`,然后在终端 A `Ctrl+C` 杀掉 part8j server。

刷新浏览器。

**期望**:
- console 报错 "Failed to fetch" 或 "Network Error"
- F12 Network 显示红色失败请求

⭐ **铁证**:client → server 链路是真实 HTTP 请求,server 一停就断。**这就是为什么需要两个终端 + server 一直在跑**。

重新启动 part8j server(`npm start`),刷新应该恢复 console.log。

### Step 10 — 验证 ApolloProvider 注入(为 part8l 做准备)

打开 `src/main.jsx`,把 `<ApolloProvider client={client}>` 注释掉:

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <ApolloProvider client={client}> */}   ← 注释掉
    <App />
    {/* </ApolloProvider> */}
  </StrictMode>
)
```

保存。

**期望**:
- 浏览器仍然能渲染 App.jsx 的内容(因为 main.jsx 顶层的 `client.query()` 不依赖 Provider)
- console 仍然有 allPersons 响应(同上)

⭐ **认知**:这**只能证明** ApolloProvider 在本章"没被用到"。要真正验证 Provider 必须有子组件用 `useQuery`(part8l 才会讲)。先恢复 Provider。

### Step 11 — 启动生产 build(综合验证)

```bash
npm run build
```

**期望**:Vite 输出 `dist/` 目录,无报错。

⭐ **铁证**:
- 全部代码能 production 构建
- 没有未定义的 import / 语法错误
- 生产 bundle 大小合理(Apollo Client 一般 ~50KB gzip)

### Step 12 — 重要预告:part8l "Making queries" 会做什么

本章在 main.jsx 顶层用 imperative API 发 query,把响应 console.log。

**part8l 会改的**:
- 把 `client.query()` 移到组件里
- 改用 `useQuery` Hook(declarative)
- 把响应数据渲染到 JSX(列表展示 persons)
- 处理 loading / error 状态

⭐ **本章是 part8l 的"前置"** — 链路通了,part8l 才能聚焦在 React Hook 数据流。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| Apollo client | "Let's create a new React app and install the necessary dependencies for Apollo client" | Apollo 团队出的 GraphQL 客户端库 | `@apollo/client` 依赖 |
| `npm install @apollo/client graphql` | 课程原文 | 装 Apollo Client + GraphQL runtime | `package.json` deps |
| ApolloClient | "The beginning of the code creates a new client object" | Apollo 客户端的主类 | `new ApolloClient({ link, cache })` |
| HttpLink | (隐含)Apollo 用来发 HTTP 请求的 transport | Apollo 用来发 HTTP 请求的 transport | `new HttpLink({ uri: 'http://localhost:4000' })` |
| InMemoryCache | (隐含)Apollo 默认的内存缓存 | Apollo 默认的内存缓存 | `cache: new InMemoryCache()` |
| gql | "A `gql` tag is added before the template literal that forms the query" | GraphQL 模板字符串 tag | `import { gql } from '@apollo/client'` |
| client.query() | "client.query({ query }).then((response) => console.log(response.data))" | imperative API 发 query | `client.query({ query }).then(...)` |
| ApolloProvider | "wrapping the App component with ApolloProvider" | React Context Provider 注入 client | `<ApolloProvider client={client}>` |
| `@apollo/client/react` | 课程 import 路径 | Apollo Client v3.10+ 的子包导入 | `import { ApolloProvider } from '@apollo/client/react'` |
| Apollo Studio Sandbox | 课程上下文(Chapter 2 用过)| GraphQL 测试 IDE | 替代品 — 浏览器 DevTools Console |

---

## ⭐ 关键 takeaway(7 条)

1. **Apollo Client 是 Apollo Server 的"客户端版"** — 同一团队,同一生态(讲师明示"the same library we used in the previous section")
2. **架构 3 层**:`ApolloClient` 主对象 → `link`/`cache` 配置 → `ApolloProvider` 注入 React 树
3. **gql 模板字符串 tag 是基础** — Apollo 所有功能(query/mutation/cache)都基于它解析的 AST
4. **本章用 imperative API**(`client.query`)— 后续章节用 declarative Hook(`useQuery`)
5. **ApolloProvider 必须在最外层包住用 Apollo 的组件** — 否则子组件 `useQuery` 报"No Apollo Client instance"
6. **`@apollo/client/react` 是新写法**(Apollo Client 3.10+)— 优于老写法的按需导入
7. **Chapter 3 需要 Chapter 2 server 在跑** — 两个进程两个端口,不冲突但要双终端

---

## ⭐⭐ Troubleshooting(出问题了看这里)

### 问题 1 — Console 报 `Failed to fetch` / `Network Error`

**原因**:part8j server 没起,或者端口 4000 被别的进程占了。

**解决**:
- 终端 A `npm start` 启动 part8j server
- 看终端 A 输出 `🚀 Server ready at http://localhost:4000/`
- 如果 `EADDRINUSE :::4000` — 别的进程占着,先 `Ctrl+C` 杀掉再重启

### 问题 2 — Console 报 `CORS error`

**原因**:Apollo Server v4 standalone 默认开了 CORS,但部分场景可能挡住 `localhost:5173 → localhost:4000` 的请求。

**解决**(两个选一个):
- **方案 A(简单)** — 在 `part8/j-changing-a-phone-number/index.js` 的 `startStandaloneServer` 配置里加 `cors: { origin: '*' }`(课程后续章节会讲)
- **方案 B(推荐)** — 用 Vite proxy,把 `/graphql` 代理到 `localhost:4000`(避免跨域)。改 `vite.config.js` 加 `server: { proxy: { '/graphql': 'http://localhost:4000' } }`,然后 main.jsx 把 `uri: 'http://localhost:4000'` 改成 `uri: '/graphql'`。**但这是偏离课程原写法**,后续章节会正式讲。

⭐ **本章课程没解决 CORS** — 大概率你的 part8j server 默认配置就够用,看不到这个错。如果真的看到,优先选 A。

### 问题 3 — Console 报 `No Apollo Client instance can be found`

**原因**:你在 main.jsx 之外的地方(组件里)用了 `useQuery` 但没包 `<ApolloProvider>`。**本章不会出现**(没用 useQuery),part8l 才可能出。

### 问题 4 — 页面渲染空白

**原因**:main.jsx 报 JS 错误,Vite 没接住。

**解决**:
- 看 Vite dev server 终端输出(终端 B)— 通常有红色报错
- 看浏览器 console(F12)— 通常有红色 `Uncaught`
- 常见错误:`ApolloProvider is not exported from '@apollo/client'` — 检查 main.jsx import 路径,应该是 `'@apollo/client/react'`

### 问题 5 — console 重复打印 2 次 allPersons

**原因**:React 19 `<StrictMode>` 在 dev mode 下双调用。

**解决**:**这不是 bug**。production build 只有 1 次。要"消除"重复,把 `<StrictMode>` 包去掉 — 但失去 dev-time 校验,得不偿失。

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `src/main.jsx` 三段递进最终态 | 课程 verbatim | **完全 verbatim**(ApolloClient/HttpLink/InMemoryCache/gql/ApolloProvider 全部按课程)| 严格遵循 |
| `src/App.jsx` 内容 | **课程未给** | **非课程原文** — Vite 最小占位(返回带说明文字的 div)| Vite 工程需要 App.jsx 才能编译;明确标注"part8l 落地" |
| `package.json` | 课程无 verbatim(`npm install @apollo/client graphql`)| **非课程原文** — Vite + React 完整工程依赖 | Vite scaffold 标准 |
| `vite.config.js` | 课程无 | **非课程原文** — Vite React plugin | Vite scaffold 标准 |
| `index.html` | 课程无 verbatim | **非课程原文** — Vite 标准入口 HTML | Vite scaffold 标准 |
| `.gitignore` | 课程无 | **非课程原文** — 标准忽略(node_modules/dist/log/env/OS)| 工程惯例 |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |
| Apollo Client 版本 | 课程无 | `^3.11.0`(支持 `@apollo/client/react` 子路径)| 跟随官方推荐 |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **Node.js 版本**:Vite 7 需要 Node.js `^18.0.0 || >=20.0.0`,你的 `v22.22.3` 满足
- **两个端口**:`4000`(Chapter 2 server,part8j)/ `5173`(Chapter 3 client,part8k)— 不冲突
- **两个终端**:**必须** — 终端 A 跑 part8j server(`Ctrl+C` 才停),终端 B 跑 Vite dev
- **`@apollo/client/react` 子路径**:`npm install @apollo/client` 会装整个包,包含子路径 — 不用单独装
- **Step 5 双 console.log**:React 19 StrictMode 在 dev mode 双调用,production build 单次
- **Step 8 写错 query 后恢复**:改回 `allPersons` 后**必须重启浏览器**(刷新不够,Apollo 可能缓存了错误 query 的网络错误)
- **重启 Vite dev = ApolloClient 重建 = cache 清空** — 这是预期行为

---

## 后续子段

- part8k **Apollo client 已完结**(链路通 + ApolloProvider 就位)
- Chapter 3 下一个子节:**part8l — Making queries**(`useQuery` Hook + 数据渲染到 JSX)
- 后续 part8l 会按"一次只推进一小节"纪律落地
- **不** commit / push
- **不** 跑任何命令
