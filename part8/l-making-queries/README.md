# part8 l — Making queries(verbatim 课程 Chapter 3 "Making queries" 段)

> **本子项目作用**:把课程 Chapter 3 的 **Making queries** 段做成可跑的 demo — `useQuery` Hook 替代 part8k 的 `client.query()` 命令式 API,把 query 响应**渲染到 JSX**(显示 persons 列表)。
>
> **关键诚实声明**:课程本节 verbatim 改了 3 个文件:`src/main.jsx`(删 `client.query` 段)/ `src/App.jsx`(重写为 `useQuery` + Persons 引用)/ `src/components/Persons.jsx`(新建 — Presentational 子组件)。其他 4 个文件(`package.json` / `vite.config.js` / `index.html` / `.gitignore`)沿用 part8k verbatim。
>
> **part8k → part8l 的关键迁移**:
> - **part8k**:ApolloClient 创建后,顶层立即 `client.query(...).then(console.log)` — 数据只到 console,不到 UI
> - **part8l**:同样的 ApolloClient,在 React 组件里 `useQuery(ALL_PERSONS)` — 数据进 React 渲染流,自动 re-render

---

## 课程原文要点(verbatim 摘录)

> "We are ready to implement the main view of the application, which shows a list of person's name and phone number."
>
> "Apollo Client offers a few alternatives for making queries. Currently, the use of the hook function useQuery is the dominant practice."
>
> "The query is made by the App component, the code of which is as follows:"
> ```js
> import { gql } from '@apollo/client'
> import { useQuery } from '@apollo/client/react'
>
> const ALL_PERSONS = gql`
>   query {
>     allPersons {
>       name
>       phone
>       id
>     }
>   }
> `
>
> const App = () => {
>   const result = useQuery(ALL_PERSONS)
>   if (result.loading) {
>     return <div>loading...</div>
>   }
>   return (
>     <div>
>       {result.data.allPersons.map(p => p.name).join(', ')}
>     </div>
>   )
> }
>
> export default App
> ```
>
> "When called, useQuery makes the query it receives as a parameter. It returns an object with multiple fields. The field `loading` is true if the query has not received a response yet."
>
> "Separate the display of persons into its own component in the file `src/components/Persons.jsx`"

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 6 个)

### ⭐ useQuery Hook — Apollo 的 React 集成入口

```jsx
import { useQuery } from '@apollo/client/react'

const ALL_PERSONS = gql`
  query { allPersons { name phone id } }
`

const App = () => {
  const result = useQuery(ALL_PERSONS)
  // ...
}
```

| 特性 | `client.query({ query }).then(...)`(part8k 命令式)| `useQuery(query)`(本节 Hook)|
|---|---|---|
| 触发时机 | main.jsx 顶层,组件渲染前 | 组件渲染时(每次 mount)|
| 响应处理 | `.then(response => ...)` | 组件 re-render(`result.data` 自动可用)|
| 错误处理 | `.catch(error => ...)` | `result.error`(后续章节深入)|
| loading 态 | 自己设 isLoading state | `result.loading` |
| 缓存 | 手动 | Apollo 自动(基于 query 内容 + variables)|
| React 生命周期 | ❌ 无 | ✅ 跟组件生命周期联动 |

⭐ **关键认知**:`useQuery` 是 Apollo Client 的 React 适配层。它**内部还是调** `client.query()`,但加了:
- React Hook 语义(响应到达触发 re-render)
- 自动 loading/error/data 状态
- 自动 cache(同一 query 不重复发)
- 自动 cleanup(组件卸载时取消请求)

### ⭐ useQuery 返回的 `result` 对象

```jsx
const result = useQuery(ALL_PERSONS)
// result 形状:
{
  loading: boolean,         // 请求是否还在路上
  error: ApolloError | undefined, // 请求失败时的错误
  data: { allPersons: [...] } | undefined, // 响应数据
  refetch: () => Promise<...>, // 手动重新发请求
  networkStatus: number,     // Apollo 网络状态(1-8)
  variables: { ... },        // 当前 query 的 variables(本节没传)
  // 还有 startPolling / stopPolling / subscribeToMore / updateQuery 等
}
```

⭐ **关键认知**:
- 第一次渲染时:`loading: true, data: undefined, error: undefined`
- 响应到达后:`loading: false, data: { ... }, error: undefined`
- 请求失败时:`loading: false, data: undefined, error: ApolloError`
- 课程只用了 `loading` 字段做判断 — 严格来说**应该也判断 `error`**,但本章最简版本假设请求一定成功

### ⭐ 课程三步递进(本子项目复刻完整路径)

| 阶段 | 内容 | 本子项目哪里 |
|---|---|---|
| 1. **基础版** | App 里 useQuery + 内联 JSX 渲染(姓名逗号分隔)| 课程 verbatim 演示 |
| 2. **抽组件版** | Persons 子组件抽出来,App 只传 persons prop | `src/components/Persons.jsx` + App 改 `<Persons persons={...} />` |
| 3. **最终态**(本子项目)| App 用 useQuery,Persons 渲染列表 | `src/App.jsx` 最终态 |

⭐ **认知**:**最终态是 Container/Presentational 雏形**:
- `App` = Container(管数据 — useQuery)
- `Persons` = Presentational(管 UI — map 渲染)

### ⭐ Persons 子组件 — Presentational 组件样板

```jsx
const Persons = ({ persons }) => {
  return (
    <div>
      <h2>Persons</h2>
      {persons.map(p =>
        <div key={p.id}>
          {p.name} {p.phone}
        </div>
      )}
    </div>
  )
}

export default Persons
```

⭐ **关键认知**:
- 接 props `{ persons }` — 解构 props,只取 persons 字段
- **不调 useQuery** — Persons 不发请求,纯 UI 组件
- `key={p.id}` — React list 必须 unique key(用 backend id 比 index 稳)
- 后续 part8 章节会改样式,本节课程最简

### ⭐ ApolloProvider 仍然必需(part8k 已有,本节继续)

```jsx
// main.jsx — verbatim part8k
<ApolloProvider client={client}>
  <App />
</ApolloProvider>
```

⭐ **关键认知**:useQuery 内部通过 React Context 拿 client。**没有 Provider,useQuery 报** "No Apollo Client instance can be found"。本节 main.jsx 仍然包 ApolloProvider — 客户端基础设施不变。

### ⭐ ALL_PERSONS 命名 + query 简化

```graphql
const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`
```

⭐ **关键认知**:
- **ALL_PERSONS**(全大写下划线)— GraphQL 社区"operation name"约定,类似常量命名
- **删了 address 字段** — 课程本节只显示 name + phone,address 字段暂时不需要
- `id` 字段保留 — 给 React list key 用,后续章节也用于 cache 标识

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**需要两个终端**(同 part8k)。

### Step 1 — 启动 Chapter 2 server(终端 A)

```bash
# 终端 A
cd D:\workspace\fullstack_workspace\fullstack\part8\j-changing-a-phone-number
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

### Step 2 — 安装 part8l 依赖(终端 B)

```bash
# 终端 B(新开)
cd D:\workspace\fullstack_workspace\fullstack\part8\l-making-queries
npm install
```

**期望**:依赖装好(跟 part8k 一模一样,无新增)。

### Step 3 — 启动 Vite dev server(终端 B)

```bash
npm run dev
```

**期望**:`➜ Local: http://localhost:5173/`

### Step 4 — 浏览器打开页面

访问 `http://localhost:5173`。

**期望看到**:
- 短暂显示 `loading...`(可能闪一下,如果网络快可能看不到)
- 然后页面显示 `Persons` 标题 + 两行:
  ```
  Persons
  Arto Hellas 040-123543
  Mary Popup 040-432342
  ```

⭐ **铁证**:
- 数据从 part8j server → ApolloClient → useQuery → React 渲染
- 整个链路是**声明式**(declarative)— useQuery 知道当前状态,自动渲染对应 JSX

### Step 5 — 看 Network 请求(对比 part8k)

F12 → Network 标签 → 过滤 Fetch/XHR。

**期望看到**:**1 个** POST 请求到 `http://localhost:4000/`(同 part8k)。

⭐ **认知**:跟 part8k **一样的 HTTP 请求**。区别是 part8k 在 main.jsx 顶层发,part8l 在 App 组件渲染时发 — 但底层 HTTP POST 是一样的。

### Step 6 — 验证 ApolloProvider 必要性

打开 `src/main.jsx`,把 `<ApolloProvider client={client}>` 注释掉(同 part8k README Step 10):

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <ApolloProvider client={client}> */}
    <App />
    {/* </ApolloProvider> */}
  </StrictMode>
)
```

保存。

**期望**:
- 浏览器 console 报红:`Invariant Violation: Could not find Apollo Client context...`
- 页面卡在 `loading...`(因为 useQuery 找不到 client)

⭐ **铁证**(对比 part8k):part8k 注释掉 ApolloProvider 还能 console.log(因为 main.jsx 顶层的 client.query 不依赖 Provider)。part8l 注释掉就**直接挂** — useQuery 强依赖 Provider。这就是 Hook 版本的核心差异。

恢复 Provider。

### Step 7 — 故意把 useQuery 注释掉(验证 Hook 必要性)

把 `src/App.jsx` 第 50 行 `const result = useQuery(ALL_PERSONS)` 改成 `const result = { loading: false, data: { allPersons: [] } }`(手动 mock):

保存。

**期望**:
- 浏览器显示 `Persons` 标题但**下面没内容**(空数组)

⭐ **认知**:这验证了 useQuery 是数据源 — 拿掉就只剩 UI 壳子。

恢复 useQuery。

### Step 8 — 故意写错 query 字段(对比 part8k)

把 `src/App.jsx` 的 query 改成 `allPerson`(拼错):

```graphql
const ALL_PERSONS = gql`
  query {
    allPerson {
      name
      phone
      id
    }
  }
`
```

保存。

**期望**:
- 浏览器 console 报 GraphQL 错误 "Cannot query field 'allPerson'"
- 页面可能显示 loading... 然后一直卡(因为 result.data 是 undefined)

⭐ **铁证**:错误处理 — `useQuery` 把 server error 包装到 `result.error`,但**课程本章没判断 error 字段**,所以页面看起来像"还在 loading"。

恢复 `allPersons`。

### Step 9 — 验证 StrictMode 双调用(对比 part8k)

打开 F12 → Network,刷新页面。

**期望看到**:**2 个** `POST http://localhost:4000/` 请求(连续两次)。

⭐ **原因**:React 19 `<StrictMode>` 在 dev mode 下故意双调用 useQuery。
- 第一次:组件 mount → useQuery 发请求
- 立即 unmount → cleanup(取消订阅)
- 第二次 mount → useQuery 再发一次
- **dev-only**,production build 只发一次

这是 React 的"严苛模式",验证你的组件 cleanup 写对了。

### Step 10 — 验证 Apollo cache(下一个 step 铺垫)

打开浏览器访问页面,看到 persons 列表。

然后**改 part8j server**(终端 A)里某个人的 phone,刷新浏览器。

**期望**:`useQuery` 重新发请求,显示新 phone — Apollo 默认**不主动监听后端变化**,只能通过刷新或 refetch 拿新数据。

⭐ **认知**:这给下一节 "Updating the cache"(part8o?) 埋伏 — 怎么让 Apollo 自动同步后端变化。

### Step 11 — 启动生产 build(综合验证)

```bash
npm run build
```

**期望**:Vite 输出 `dist/`,无报错。

⭐ **铁证**:useQuery 的 tree-shaking 工作 — production bundle 不包含 dev 调试代码。

### Step 12 — 重要预告:part8m "Named queries and variables"

本章用 inline query:`query { allPersons { ... } }`(无名字、无变量)。

**part8m 会改的**:
- 给 query 加名字:`query AllPersons { ... }`
- 给 query 加 variables:`query AllPersons($name: String!) { findPerson(name: $name) { ... } }`
- useQuery 接 `variables` 选项 + 动态传值

⭐ **本章是 part8m 的"前置"** — useQuery 基础用法到位,part8m 加 query name + variables 选项。

---

## ⭐ part8k vs part8l 关键对比

| 维度 | part8k | part8l |
|---|---|---|
| 发请求位置 | main.jsx 顶层 | App 组件里 |
| API | `client.query({ query }).then(...)` | `useQuery(ALL_PERSONS)` |
| 响应处理 | console.log | 渲染到 JSX |
| 子组件 | 无(只有占位 App)| `src/components/Persons.jsx` |
| loading 态 | 无(同步 console.log) | `result.loading` 判 `<div>loading...</div>` |
| ApolloProvider | 必需(章末预备)| **必需**(本章直接依赖)|
| 新增 import | 无 | `import { useQuery } from '@apollo/client/react'` |
| query 字段 | allPersons + name + phone + address | allPersons + name + phone + id(简化)|

⭐ **认知**:part8l 相比 part8k 的核心转变是 **命令式 → 声明式**。part8k 写"做什么",part8l 写"什么状态渲染什么 UI"。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| Making queries | "We are ready to implement the main view of the application" | 课程子节名:用 useQuery 发请求 | 本子项目主题 |
| useQuery | "the use of the hook function useQuery is the dominant practice" | Apollo 的 React Hook | `import { useQuery } from '@apollo/client/react'` |
| `@apollo/client/react` | 课程 import 路径 | Apollo Client v3.10+ 的 React 集成子路径 | 同上 |
| result.loading | "The field loading is true if the query has not received a response yet" | 请求还在路上的标志 | `if (result.loading) return <div>loading...</div>` |
| result.data | "the result of the allPersons query can be found in the data field" | 响应数据(请求完成才有)| `result.data.allPersons` |
| `ALL_PERSONS` | 课程示例名 | GraphQL operation name 约定 | `const ALL_PERSONS = gql\`...\`` |
| Persons component | "Separate the display of persons into its own component" | Presentational 子组件 | `src/components/Persons.jsx` |
| key={p.id} | (隐含 React 最佳实践)| React list 必须 unique key | `persons.map(p => <div key={p.id}>{p.name}</div>)` |

---

## ⭐ 关键 takeaway(8 条)

1. **`useQuery` 是 Apollo 在 React 里的"声明式数据 Hook"** — 课程明示"the dominant practice"
2. **useQuery 内部仍调 `client.query`** — 但加 React Hook 语义 + 自动状态 + 自动 cache
3. **`result.loading` 是最常用的判断字段** — 简单 `if (result.loading) return <div>loading...</div>` 即可
4. **`result.data` 只在请求完成时有值** — 首次渲染时是 undefined(配合 loading 一起判断)
5. **ApolloProvider 在本章变成"必需"** — useQuery 强依赖它,注释掉就挂
6. **Container/Presentational 雏形** — App 拿数据,Persons 渲染 UI
7. **`ALL_PERSONS` 命名约定** — 全大写下划线,GraphQL operation name 标准
8. **课程最简版本** — 只判 loading,不判 error(严格说应该判,但本节假设一定成功)

---

## ⭐⭐ Troubleshooting(出问题了看这里)

### 问题 1 — Console 报 `Could not find "Apollo Client" context`

**原因**:ApolloProvider 被注释掉 / 没包住 App。

**解决**:恢复 `src/main.jsx` 的 `<ApolloProvider client={client}>` 包裹。

### 问题 2 — Console 报 `Cannot query field "allPerson"`

**原因**:Step 8 故意把 query 字段名写错了,改回去就行。

**解决**:`allPerson` → `allPersons`。

### 问题 3 — Network 看到 0 个请求

**原因**:App 组件没渲染,或 import 路径错。

**解决**:
- 检查 `src/main.jsx` 的 `import App from './App.jsx'` 路径
- 看浏览器 console 有没有红字 import error
- F12 → Sources 标签 → 看 main.jsx 是否真的加载

### 问题 4 — 页面卡在 `loading...`

**原因**:part8j server 没起 / GraphQL query 报错 / Apollo 缓存了错误状态。

**解决**:
- 终端 A `npm start` 启动 part8j
- F12 → Network 看 POST 是否真发出去
- F12 → Console 看是否有 GraphQL 报错
- **强制刷新**(`Ctrl+F5`)清掉 Apollo 错误缓存

### 问题 5 — F12 Network 看到 2 个 POST 请求

**原因**:StrictMode 双调用,正常。

**解决**:**这不是 bug**。production build 只发一次。

### 问题 6 — `React: Each child in a list should have a unique key`

**原因**:故意删了 `key={p.id}`(没删就跳过)。

**解决**:把 `key={p.id}` 加回去。验证:看 `src/components/Persons.jsx` 第 22 行。

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `src/main.jsx` 删除 client.query 段 | 课程明示删除 | **完全 verbatim 课程删除操作** | 课程本节明确删 |
| `src/App.jsx` 三段递进最终态 | 课程 verbatim | **完全 verbatim**(useQuery/loading 判断/Persons 引用)| 严格遵循 |
| `src/components/Persons.jsx` | 课程 verbatim | **完全 verbatim**(含 `</div>  )` 末尾怪空格)| 严格遵循 |
| `package.json` | 课程无 verbatim 改动 | 沿用 part8k(无新增依赖)| useQuery 已包含在 `@apollo/client/react` 子路径 |
| `vite.config.js` / `index.html` / `.gitignore` | 课程无 | 沿用 part8k verbatim | 同 part8k 工程脚手架 |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **同 part8k** — Node v22.22.3 满足要求 / 两个端口(4000 + 5173)/ 两个终端
- **新增注意**:`useQuery` 在 dev 模式被 StrictMode 双调用,**正常** — production build 单次
- **Step 6 注释 ApolloProvider**:记得测完**立即恢复**,否则后续步骤都跑不通
- **Step 8 改 query 后**:恢复 `allPersons` + **强制刷新** `Ctrl+F5`(Apollo 可能缓存错误)
- **重启 Vite dev**:`useQuery` 自动重发请求,cache 自动重建 — 不需要手动清

---

## 后续子段

- part8l **Making queries 已完结**(useQuery + Persons 子组件 + Container/Presentational 雏形)
- Chapter 3 下一个子节:**part8m — Named queries and variables**(query 名字 + variables + useQuery variables 选项)
- 后续 part8m 会按"一次只推进一小节"纪律落地
- **不** commit / push
- **不** 跑任何命令