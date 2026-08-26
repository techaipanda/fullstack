# part8 m — Named queries and variables(verbatim 课程 Chapter 3 "Named queries and variables" 段)

> **本子项目作用**:把课程 Chapter 3 的 **Named queries and variables** 段做成可跑的 demo — 给 GraphQL query 加**命名 + 变量** + 在 Persons 子组件里用 **`useState` + `useQuery(FIND_PERSON, { variables, skip })`** 实现"按需发请求"(点 "show address" 按钮才发请求)。
>
> **关键诚实声明**:课程本节**只改一个文件**:`src/components/Persons.jsx`(重写为 Container + Person 子组件)。其他 7 个文件(`package.json` / `vite.config.js` / `index.html` / `.gitignore` / `src/main.jsx` / `src/App.jsx` / 本 README)沿用 part8l verbatim。
>
> **part8l → part8m 的关键迁移**:
> - **part8l**:Persons 是纯 Presentational 组件 — 只接 `{ persons }` prop + map 渲染
> - **part8m**:Persons **变成 Container** — 内部 `useState(null)` 跟踪选中 + `useQuery(FIND_PERSON, { variables, skip })` 按需发请求 + 抽 `Person` 子组件展示详情
>
> **核心新增招式 — useQuery 的 `skip` 选项**:
> - `useQuery(QUERY, { variables, skip: !trigger })` — `skip=true` 完全不发请求
> - 配合 `useState(null)` 实现"按需发请求"(点 show address 按钮才发)

---

## 课程原文要点(verbatim 摘录)

> "Let's implement functionality for viewing the address details of a person. The findPerson query is well-suited for this."
>
> "The queries we did in the last chapter had the parameter hardcoded into the query:"
> ```graphql
> query {
>   findPerson(name: "Arto Hellas") {
>     phone
>     city
>     street
>     id
>   }
> }
> ```
>
> "When we do queries programmatically, we must be able to give them parameters dynamically."
>
> "GraphQL variables are well-suited for this. To be able to use variables, we must also name our queries. A good format for the query is this:"
> ```graphql
> query findPersonByName($nameToSearch: String!) {
>   findPerson(name: $nameToSearch) {
>     name
>     phone
>     address {
>       street
>       city
>     }
>   }
> }
> ```
>
> "The name of the query is findPersonByName, and it is given a string $nameToSearch as a parameter."
>
> "The useQuery hook is well-suited for situations where the query is done when the component is rendered. However, we now want to make the query only when a user wants to see the details of a specific person, so the query is done only as required."
>
> "One possibility for this kind of situations is the hook function useLazyQuery that would make it possible to define a query which is executed when the user wants to see the detailed information of a person."
>
> "However, in our case we can stick to useQuery and use the option skip, which makes it possible to do the query only if a set condition is true."
>
> "After the changes, the file Persons.jsx looks as follows:"
> ```jsx
> import { useState } from 'react'
> import { gql } from '@apollo/client'
> import { useQuery } from '@apollo/client/react'
>
> const FIND_PERSON = gql`
>   query findPersonByName($nameToSearch: String!) {
>     findPerson(name: $nameToSearch) {
>       name
>       phone
>       id
>       address {
>         street
>         city
>       }
>     }
>   }
> `
>
> const Person = ({ person, onClose }) => {
>   return (
>     <div>
>       <h2>{person.name}</h2>
>       <div>
>         {person.address.street} {person.address.city}
>       </div>
>       <div>{person.phone}</div>
>       <button onClick={onClose}>close</button>
>     </div>
>   )
> }
>
> const Persons = ({ persons }) => {
>   const [nameToSearch, setNameToSearch] = useState(null)
>   const result = useQuery(FIND_PERSON, {
>     variables: { nameToSearch },
>     skip: !nameToSearch,
>   })
>
>   if (nameToSearch && result.data) {
>     return (
>       <Person
>         person={result.data.findPerson}
>         onClose={() => setNameToSearch(null)}
>       />
>     )
>   }
>
>   return (
>     <div>
>       <h2>Persons</h2>
>       {persons.map((p) => (
>         <div key={p.id}>
>           {p.name} {p.phone}
>           <button onClick={() => setNameToSearch(p.name)}>
>             show address
>           </button>
>         </div>
>       ))}
>     </div>
>   )
> }
>
> export default Persons
> ```

### 课程 H3 "Cache" 子段(本节一并复刻)

> "When we do multiple queries, for example with the address details of Arto Hellas, we notice something interesting: the query to the backend is done only the first time around. After this, despite the same query being done again by the code, the query is not sent to the backend."
>
> "Apollo client saves the responses of queries to cache. To optimize performance if the response to a query is already in the cache, the query is not sent to the server at all."

⭐ **认知**:`InMemoryCache` 默认按 query 内容(含变量)做 cache key。同一个 `findPerson(name: "Arto Hellas")` 发第二次,**Apollo 不发网络请求**,直接从 cache 返回 — 这就是 part8m 末尾 H3 "Cache" 段落的精髓。

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 6 个)

### ⭐ GraphQL 命名 query(`query findPersonByName(...)`)

```graphql
query findPersonByName($nameToSearch: String!) {
  findPerson(name: $nameToSearch) {
    name phone id address { street city }
  }
}
```

| 组件 | 含义 |
|---|---|
| `query` | GraphQL 操作类型关键字 |
| `findPersonByName` | **operation name** — 这条 query 的名字(用于 cache key、调试、APM)|
| `($nameToSearch: String!)` | **变量声明** — `$变量名: 类型`;`!` 后缀 = 必填 |
| `findPerson(name: $nameToSearch)` | **变量使用** — query 内部用 `$变量名` 引用声明的变量 |

⭐ **关键认知**:
- **operation name 是 GraphQL 协议规范**,不是 Apollo 私有 — 不加也能跑,但加上好处多:
  - Apollo cache 按 `query name + variables` 做 key — 不加 name 时 cache 用 query 文本 hash(变量值变化时 cache miss)
  - 调试:Apollo DevTools / Network 请求的 operationName 字段
  - Server 端日志 / APM 追踪能看清"哪个 query"
- **变量命名约定**:camelCase `$nameToSearch`(全小写也行,但 camelCase 更常见)
- **`String!` 的 `!`**:GraphQL 的"必填"标记 — 不传就 schema validation 报错

### ⭐ useQuery 的 variables 选项

```jsx
const result = useQuery(FIND_PERSON, {
  variables: { nameToSearch },
  skip: !nameToSearch,
})
```

⭐ **关键认知**:
- `variables: { nameToSearch }` — Apollo 把这个对象序列化进 POST body 的 `variables` 字段
- 服务端 schema 知道 `$nameToSearch: String!` 是必填 — 客户端不传会 schema validation 报错
- `skip` 选项见下一个概念

### ⭐⭐⭐ useQuery 的 skip 选项(part8m 核心)

```jsx
const [nameToSearch, setNameToSearch] = useState(null)
const result = useQuery(FIND_PERSON, {
  variables: { nameToSearch },
  skip: !nameToSearch,
})
```

| `skip` 值 | useQuery 行为 |
|---|---|
| `true` | **不发请求**,`result` 里 `loading=false, data=undefined, error=undefined` |
| `false` | **正常发请求**,loading/data/error 按正常生命周期变化 |

⭐ **关键认知**:
- `skip` 是 Apollo 提供的"按需发请求"开关 — 比 part8k `client.query()` 命令式 API 更声明式
- 课程提到另一种方案 `useLazyQuery`(手动触发)— 但本节坚持 `useQuery + skip`,因为:
  - `useLazyQuery` 返回 `[lazyQuery, { loading, data, error }]`,要手动调 `lazyQuery()`
  - `useQuery + skip` 把"什么时候发请求"的条件编码在 props 里,更声明式
  - 课程明示:"in our case we can stick to useQuery and use the option skip"
- **典型陷阱**:skip=false 但 variables 里某个值是 null — 仍然会发请求,然后 GraphQL schema validation 报错。`skip: !nameToSearch` 模式保证 null 时不发

### ⭐⭐ useState(null) 模式 — "三态"切换器

```jsx
const [nameToSearch, setNameToSearch] = useState(null)
// null = 没选任何 person(列表视图)
// "Arto Hellas" = 选中某个 person(详情视图)
```

⭐ **关键认知**:
- `null` 在 React/JS 里是"明确表示'没值'" — 比 `""` (空字符串)或 `undefined` 更显式
- `useState` 的初值只读一次 — 后续 re-render 不会重置 state
- `setNameToSearch(p.name)` 触发 Persons 组件 re-render → useQuery 重跑 → 自动触发 UI 切换

### ⭐⭐ 视图切换 — 同一组件两个分支

```jsx
if (nameToSearch && result.data) {
  return <Person person={result.data.findPerson} onClose={() => setNameToSearch(null)} />
}

return <div><h2>Persons</h2>{persons.map(...)}</div>
```

⭐ **关键认知**:
- **早期 return 模式**(课程风格)— 命中条件先 return,不满足再走默认
- **注意顺序**:先判 `nameToSearch && result.data` — 如果先渲染 Person 但 `result.data` 还是 undefined,会报"Cannot read properties of undefined"
- **Person 子组件的职责分离** — `Person` 只负责展示一个 person,`Persons` 负责切换"列表 vs 详情"

### ⭐ Apollo Cache — 本节 H3 "Cache" 段伏笔

```
第一次点击 show address(Arto Hellas):
  Network:POST 200 → server 返回数据 → Apollo 缓存到 InMemoryCache
第二次点击 show address(Arto Hellas):
  Network:无 POST → Apollo 直接从 cache 返回 → result.data 立即可用
```

⭐ **关键认知**:
- Apollo cache key = `operation name + variables`(`findPersonByName + { nameToSearch: "Arto Hellas" }`)
- **刷新页面 cache 清空**(cache 只在内存中)
- 这是为什么 part8n "Doing mutations" 要讲"如何让 cache 同步 mutation 结果" — 因为 cache 不会自动失效

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**需要两个终端**(同 part8l)。

### Step 1 — 启动 Chapter 2 server(终端 A)

```bash
# 终端 A
cd D:\workspace\fullstack_workspace\fullstack\part8\j-changing-a-phone-number
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

### Step 2 — 安装 part8m 依赖(终端 B)

```bash
# 终端 B(新开)
cd D:\workspace\fullstack_workspace\fullstack\part8\m-named-queries-and-variables
npm install
```

**期望**:依赖装好(跟 part8l 一模一样,无新增)。

### Step 3 — 启动 Vite dev server(终端 B)

```bash
npm run dev
```

**期望**:`➜ Local: http://localhost:5173/`

### Step 4 — 浏览器打开页面,初识列表

访问 `http://localhost:5173`。

**期望看到**(跟 part8l 一样的初始态):
```
Persons
Arto Hellas 040-123543 [show address]
Mary Popup 040-432342 [show address]
```

⭐ **新观察**:每个 person 行末尾多了一个 **`show address`** 按钮 — 这就是 part8m 的入口。

### Step 5 — 点 "show address" 按钮触发 FIND_PERSON

点击任意一个 person 的 `show address` 按钮(比如 Arto Hellas 那行)。

**期望**:
- 页面**瞬间切换**到 Person 详情视图:
  ```
  Arto Hellas
  Tapiolankatu 5 A Helsinki
  040-123543
  [close]
  ```
  (注意地址 "Tapiolankatu 5 A Helsinki" — 这是 part8j server 里**真实的芬兰地址数据**,从 part8a 起就没变过。**不要**误以为应该是 "Manhattan New York" — 那是 part8e 那一节故意硬编码的实验数据,跟 part8j server 没关系)
- F12 Network 标签 → 看到**新增**一个 POST 请求到 `http://localhost:4000/`,payload 是:
  ```json
  {
    "query": "query findPersonByName($nameToSearch: String!) { ... }",
    "variables": { "nameToSearch": "Arto Hellas" }
  }
  ```

⭐ **铁证**:
- 之前的 part8l 永远只发 1 个 POST(ALL_PERSONS)
- 现在 part8m **动态**发了第 2 个 POST,body 里带 `variables`
- "按需发请求" 兑现

### Step 6 — 点 "close" 按钮回到列表

点详情页的 `close` 按钮。

**期望**:回到列表视图。

⭐ **认知**:`onClose={() => setNameToSearch(null)}` 把 state 重置为 null → `skip: true` → 不再触发 FIND_PERSON。

### Step 7 — ⭐⭐⭐ 验证 Apollo cache(H3 "Cache" 段)

重复点同一个人的 `show address` 按钮 2 次(比如 Arto Hellas 两次):

1. 列表 → 点 Arto Hellas 的 show address → 详情
2. 点 close → 列表
3. 再点 Arto Hellas 的 show address → 详情

**期望**:
- 第二次点 show address 时,**Network 标签看不到新的 POST 请求**
- 详情页**瞬间显示**(无 loading 闪)

⭐ **铁证**:Apollo cache 命中 — 同一个 `findPersonByName + { nameToSearch: "Arto Hellas" }` 走 cache。

⭐ **认知**:
- 第一次点 → 发请求 → 缓存到 InMemoryCache
- close 后 setNameToSearch(null) → useQuery skip=true → cache 还在内存
- 第二次点 → setNameToSearch("Arto Hellas") → skip=false → Apollo 检查 cache 命中 → 不发 POST

### Step 8 — 验证 cache 只对相同变量生效

点完 Arto Hellas 后,**不刷新**,点 Mary Popup 的 show address:

**期望**:看到**新的 POST 请求**(因为 `nameToSearch: "Mary Popup"` 是新 cache key,没命中)。

⭐ **认知**:cache key 含 variables — 不同的变量值就是不同的 cache entry。

### Step 9 — ⭐⭐⭐ 验证 "Mary Popup 不存在" 的特殊情况

如果 part8j server 里 Mary Popup 存在,正常显示;如果她不存在,Apollo 返回 `findPerson: null`。

⭐ **认知**:
- 课程说"if the query result `data.editNumber` is null" 是 "no error" 情况(GraphQL 不算 error,只是返回 null)
- part8m 没处理 `findPerson: null` 的情况 — `Person` 组件会崩在 `person.address.street` 上(null deref)
- **预期**:浏览器 console 报红:`TypeError: Cannot read properties of null (reading 'address')`
- 这是 part8q "Updating a phone number" 末尾才讲到的"onCompleted 处理 null"模式

### Step 10 — ⭐⭐⭐ 验证 skip 选项(关键铁证)

打开 `src/components/Persons.jsx`,把 `skip: !nameToSearch` 改成 `skip: false`(故意):

```jsx
const result = useQuery(FIND_PERSON, {
  variables: { nameToSearch },
  skip: false,  // 故意改
})
```

保存。

**期望**:
- **页面加载时立即看到** Network 发了 2 个 POST(ALL_PERSONS + FIND_PERSON)
- 第二个 POST 的 variables 是 `{ nameToSearch: null }`
- 服务器报 GraphQL error:`Variable "$nameToSearch" of required type "String!" was not provided`(因为 String! 必填但传了 null)

⭐ **铁证**:`skip: true` 是必须的 — 否则 useQuery 一上来就发请求,而初始 `nameToSearch=null` 会触发 schema validation 报错。

恢复 `skip: !nameToSearch`。

### Step 11 — 验证 useState 必要性

把 `const [nameToSearch, setNameToSearch] = useState(null)` 改成 `const nameToSearch = null`(去掉 state):

保存。

**期望**:
- 列表显示正常
- 点 show address 按钮**无效**(因为 nameToSearch 永远是 null,无法切换)
- React DevTools 警告:"Assignments to the 'nameToSearch' variable from inside React Hook useState will be lost"(实际上这里因为没有 set 调用,不报错,但按钮 onclick 调用的 setNameToSearch 也无效)

⭐ **认知**:state 是触发 re-render 的唯一方式 — 没 state 就没"用户交互 → UI 更新"。

恢复 useState。

### Step 12 — 启动生产 build

```bash
npm run build
```

**期望**:Vite 输出 `dist/`,无报错。

---

## ⭐ part8l vs part8m 关键对比

| 维度 | part8l | part8m |
|---|---|---|
| Persons 角色 | Presentational(只接 persons)| **Container + Presentational 混合** |
| Persons 内部状态 | 无 | `useState(null)` 管 nameToSearch |
| Persons 发的请求 | 无 | `useQuery(FIND_PERSON, { variables, skip })` |
| 子组件 | 无 | 新增 `Person` 展示单条详情 |
| 查询方式 | 父组件 App useQuery(ALL_PERSONS)| App + Persons **两个** useQuery |
| GraphQL 命名 | 无(ALL_PERSONS 也可加 name)| **加 name + variables** |
| 按需发请求 | ❌ 不存在(一直发) | ✅ skip 选项 |
| ApolloProvider | 必需 | 必需 |
| main.jsx | verbatim part8k | verbatim part8l(无改动)|
| App.jsx | useQuery(ALL_PERSONS)+ <Persons /> | **verbatim part8l**(无改动)|

⭐ **认知**:part8m 的核心转变是 **"single useQuery" → "双 useQuery + skip 选项"** — 同一个 hook 通过不同 options 实现不同行为。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| Named query | "we must also name our queries" | GraphQL query 加 operation name | `query findPersonByName(...)` |
| Variable | "GraphQL variables" | query 里的动态参数 | `$nameToSearch: String!` |
| Required field | `String!` 的 `!` 后缀 | 必填字段 | `$nameToSearch: String!` |
| as required | "the query is done only as required" | 按需发请求 | `useQuery + skip` 模式 |
| skip option | "use the option skip" | useQuery 的"不发请求"开关 | `skip: !nameToSearch` |
| useLazyQuery(备选)| "hook function useLazyQuery" | 另一种按需发请求方式 | 课程本节**没用**(用了 useQuery + skip)|
| InMemoryCache | "Apollo client saves the responses of queries to cache" | Apollo 内存缓存 | ApolloClient 实例化时的 `cache: new InMemoryCache()` |
| cache key | (隐含) | query 名 + variables 决定 cache | "nameToSearch: Arto Hellas" 是一条 cache entry |

---

## ⭐ 关键 takeaway(8 条)

1. **GraphQL query 命名是规范**:`query findPersonByName(...)` 不是装饰,是协议规范
2. **变量是 GraphQL 头等公民**:`$nameToSearch: String!` + `findPerson(name: $nameToSearch)` 实现动态参数
3. **`String!` 的 `!` 是必填标记** — 客户端不传就 schema validation 报错
4. **useQuery 的 `skip` 选项** 是"按需发请求"的官方方案 — 比 useLazyQuery 更声明式
5. **useState(null)** + useQuery 的 skip 选项配合 = "三态切换器"(没选/选中/数据到位)
6. **Apollo cache 按 `query name + variables` 做 key** — 同 key 第二次不发网络请求
7. **课程打破 part8l 的 Container/Presentational 纯洁度** — Persons 现在既是 Container 又是 Presentational
8. **App.jsx 完全不动** — 课程的精妙之处:在子组件层加 state + useQuery,不污染父组件

---

## ⭐⭐ Troubleshooting(出问题了看这里)

### 问题 1 — 点 show address 后页面没反应

**原因**:useState 没正确触发,或 skip 选项写错。

**解决**:
- 检查 `src/components/Persons.jsx` 第 65 行 `const [nameToSearch, setNameToSearch] = useState(null)`
- 检查 `skip: !nameToSearch`(注意是 `!nameToSearch`,不是 `nameToSearch`)

### 问题 2 — Console 报 `Variable "$nameToSearch" of required type "String!" was not provided`

**原因**:`skip: false` 但 `nameToSearch: null`,query 还是发了。

**解决**:恢复 `skip: !nameToSearch`。

### 问题 3 — Console 报 `TypeError: Cannot read properties of null (reading 'address')`

**原因**:`findPerson` 返回 null(那个人不存在)。

**解决**:课程本节没处理 null — 这是 part8q 才讲的 `onCompleted` 处理。如果你确信 part8j 里 Arto Hellas/Mary Popup 应该存在,检查 server 数据。

### 问题 4 — 第二次点 show address 还是发 POST

**原因**:Cache 没命中,或者 variables 变了。

**解决**:
- 检查 Network 标签 — 看 variables 字段的值
- 如果两次 variables 不一样(比如含其他 state 变化),cache key 不同
- 如果确定是同 variables 还是发 POST,可能是 Apollo cache 被关掉 — 但本节用 `new InMemoryCache()` 默认开着

### 问题 5 — 详情页面没显示

**原因**:`result.data` 还没到位,或 `nameToSearch` 是 null。

**解决**:
- 检查 Network 标签 — 第二次 POST 是否 200
- 检查 `result.data.findPerson` 是否真的是对象(不是 undefined)
- F12 Console 看是否有错误

### 问题 6 — 想用 useLazyQuery 替代 useQuery + skip(好奇)

**课程明示**:"in our case we can stick to useQuery and use the option skip"。本节不用 useLazyQuery。如果你非要用:
```jsx
const [getPerson, result] = useLazyQuery(FIND_PERSON)
// 点按钮时调:
const handleClick = () => getPerson({ variables: { nameToSearch: p.name } })
```
但这**违反 course-follow-official 纪律**,不做。

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `src/components/Persons.jsx` | verbatim 课程最终态 | **完全 verbatim**(useState/FIND_PERSON/Person 子组件/skip 选项/if 分支/列表+show address 按钮)| 严格遵循 |
| `src/App.jsx` | 课程明示不改 | **完全 verbatim part8l** | 课程明示 |
| `src/main.jsx` | 课程明示不改 | **完全 verbatim part8l** | 课程明示 |
| `package.json` / `vite.config.js` / `index.html` / `.gitignore` | 课程无 | 沿用 part8l verbatim | 同 part8l 工程脚手架 |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **同 part8l** — Node v22.22.3 满足要求 / 两个端口(4000 + 5173)/ 两个终端
- **新增注意**:`skip: !nameToSearch` 的 `!` 别漏写 — 漏写会导致 null state 时发请求报错
- **Step 10 故意改 skip**:记得测完**立即恢复** + **强制刷新** `Ctrl+F5`
- **StrictMode 双调用**:开发模式下,首次 mount 仍会发 2 个 POST(ALL_PERSONS) — 这是 part8l 的延续行为,不是 part8m 引入的

---

## 后续子段

- part8m **Named queries and variables 已完结**(FIND_PERSON + variables + skip 选项 + Apollo cache 伏笔)
- Chapter 3 下一个子节:**part8n — Doing mutations**(CREATE_PERSON mutation + useMutation Hook + PersonForm 子组件)
- 后续 part8n 会按"一次只推进一小节"纪律落地
- **不** commit / push
- **不** 跑任何命令