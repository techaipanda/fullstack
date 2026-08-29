# part8 o — Updating the cache(verbatim 课程 Chapter 3 "Updating the cache" 段)

> **本子项目作用**:解决 part8n "Doing mutations" 留下的"半成品"行为 —— mutation 成功但页面不刷新。本节用 **`refetchQueries`** 让 mutation 成功后自动重发 `ALL_PERSONS`,Persons 列表立即看到新 person。同时把 3 个 GraphQL 操作抽出到 **`src/queries.js`**,实现组件 / 查询分离。
>
> **关键诚实声明**:课程本节 verbatim **改了 3 个文件 + 新建 1 个文件**:
> - **新建** `src/queries.js`(导出 `ALL_PERSONS` / `FIND_PERSON` / `CREATE_PERSON`)
> - **改** `src/App.jsx`(删 inline `ALL_PERSONS` 定义,改 `import { ALL_PERSONS } from './queries'`,**移除不再使用的 `gql` import**)
> - **改** `src/components/Persons.jsx`(删 inline `FIND_PERSON` 定义,改 `import { FIND_PERSON } from '../queries'`,移除 `gql` import)
> - **改** `src/components/PersonForm.jsx`(删 inline `CREATE_PERSON` 定义,改 `import { ALL_PERSONS, CREATE_PERSON } from '../queries'`,加 `refetchQueries` option)
> - **沿用 verbatim**: `package.json` / `vite.config.js` / `index.html` / `.gitignore` / `src/main.jsx`
>
> **part8n → part8o 的关键迁移**:
> - **part8n(半成品)**:成功 add 后,Persons 列表**不变**,要按 F5 刷新才看到新 person
> - **part8o(完整)**:成功 add 后,Apollo 自动重发 `ALL_PERSONS`,Persons 列表**立即**出现新 person —— 无需手动刷新
>
> **核心新增招式 — refetchQueries**:
> ```jsx
> const [createPerson] = useMutation(CREATE_PERSON, {
>   refetchQueries: [{ query: ALL_PERSONS }],
> })
> ```
> mutation 成功后,Apollo 自动重发 `ALL_PERSONS` query,触发 Persons 列表 re-render
>
> **诚实边界**:本节**没**实现"他人修改自动同步" —— refetchQueries 只在**当前用户触发 mutation 后**才重发。其他用户的修改(其他浏览器、其他标签页)不会自动同步到本端。这是 part8p+ 才会用 GraphQL Subscription 或 polling 解决的。

---

## 课程原文要点(verbatim 摘录)

> "There are a few different solutions for this. One way is to make the query for all persons poll the server, or make the query repeatedly."
>
> "The change is small. Let's set the query to poll every two seconds:"
> ```jsx
> const App = () => {
>   const result = useQuery(ALL_PERSONS, {
>     pollInterval: 2000
>   })
>   // ...
> }
> ```
>
> "The downside of polling is, of course, the unnecessary network traffic it causes. In addition, the page may start to flicker, since the component is re-rendered with each query update and result.loading is true for a brief moment—so a loading... text flashes on the screen for an instant."
>
> "Another easy way to keep the cache in sync is to use the useMutation hook's refetchQueries parameter to define that the query fetching all persons is done again whenever a new person is created."
> ```jsx
> const [createPerson] = useMutation(CREATE_PERSON, {
>   refetchQueries: [{ query: ALL_PERSONS }],
> })
> ```
>
> "The pros and cons of this solution are almost opposite of the previous one. There is no extra web traffic because queries are not done just in case. However, if one user now updates the state of the server, the changes do not show to other users immediately."
>
> "If you want to do multiple queries, you can pass multiple objects inside refetchQueries."
> ```jsx
> const [createPerson] = useMutation(CREATE_PERSON, {
>   refetchQueries: [
>     { query: ALL_PERSONS },
>     { query: OTHER_QUERY },
>     { query: ANOTHER_QUERY },
>   ],
> })
> ```
>
> "There are other ways to update the cache. More about those later in this part."
>
> "At the moment, queries and components are defined in the same place in our code. Let's separate the query definitions into their own file src/queries.js:"
> ```js
> import { gql } from '@apollo/client'
>
> export const ALL_PERSONS = gql`
>   query {
>     allPersons {
>       name
>       phone
>       id
>     }
>   }
> `
>
> export const FIND_PERSON = gql`
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
> export const CREATE_PERSON = gql`
>   mutation createPerson(
>     $name: String!
>     $street: String!
>     $city: String!
>     $phone: String
>   ) {
>     addPerson(name: $name, street: $street, city: $city, phone: $phone) {
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
> ```
>
> "Each component then imports the queries it needs:"
> ```js
> import { ALL_PERSONS } from './queries'
>
> const App = () => {
>   const result = useQuery(ALL_PERSONS)
>   // ...
> }
> ```

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 4 个)

### ⭐ pollInterval(方案 A —— 课程展示但最终态未采用)

```jsx
const result = useQuery(ALL_PERSONS, {
  pollInterval: 2000   // 每 2 秒重发一次
})
```

⭐ **核心思想**:让 useQuery **周期性**重新发请求,即使没有 mutation 也照发

⭐ **工作原理**:
- useQuery 内部启动一个定时器
- 每 `pollInterval` 毫秒,Apollo 自动重发这个 query
- 响应回来后 cache 更新 + 组件 re-render(loading 瞬间 true → 闪烁)

⭐ **缺点**(per course 原文):
1. **多余网络流量** —— 即使没有新数据也每 2 秒发 1 次请求
2. **页面闪烁** —— 每次重发时 `result.loading` 短暂变 true → `<div>loading...</div>` 闪一下

⭐ **适用场景**:实时仪表盘、股票行情等需要"拉"式更新的场景

### ⭐⭐⭐ refetchQueries(方案 B —— 本节最终态采用)

```jsx
const [createPerson] = useMutation(CREATE_PERSON, {
  refetchQueries: [{ query: ALL_PERSONS }],
})
```

⭐ **核心思想**:mutation **成功后**自动重发指定的 query —— 精准推送,无浪费

⭐ **工作原理**:
1. `createPerson({ variables })` 触发 mutation → server 处理 addPerson
2. server 返回新 person → Apollo **自动**重发 `ALL_PERSONS` query
3. ALL_PERSONS 响应 → Persons 列表 re-render → 用户看到新 person

⭐ **三大优势**(per course 原文):
1. **无多余网络流量** —— 没有 mutation 就不发请求
2. **无页面闪烁** —— 只在 mutation 后精确触发,loading 不会频繁切换
3. **多 query 同步** —— `refetchQueries: [{ query: A }, { query: B }, ...]` 一次 mutation 多处同步

⭐ **关键诚实:本方案不是万能**:
- 只在**当前用户**的 mutation 后自动同步
- **其他用户**的修改(其他浏览器、其他标签页)不会自动同步到本端
- 这是 refetchQueries 的"主动拉"本质决定的 —— 它不是订阅
- 课程明示:"if one user now updates the state of the server, the changes do not show to other users immediately"

### ⭐⭐ Apollo cache 三种更新策略对比(per course 总结)

| 策略 | 触发时机 | 网络流量 | 闪烁 | 多用户同步 | 适用场景 |
|---|---|---|---|---|---|
| **pollInterval**(方案 A) | 定时器 | 多 | 闪 | 自动 | 实时仪表盘 / 股票 |
| **refetchQueries**(方案 B) | mutation 后 | 少 | 不闪 | 仅当前用户 | 表单提交 / 创建更新 |
| **cache.modify / cache.updateQuery**(方案 C) | 手动编程 | 0 | 不闪 | 不会同步 | 复杂更新逻辑 |

课程明示方案 C "more about those later in this part" —— part8p+ 才会用 cache.modify 直接编程式更新。

### ⭐⭐⭐ src/queries.js 模块化(架构升级)

```js
// src/queries.js(verbatim 课程)
import { gql } from '@apollo/client'

export const ALL_PERSONS = gql`
  query { allPersons { name phone id } }
`

export const FIND_PERSON = gql`
  query findPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) { name phone id address { street city } }
  }
`

export const CREATE_PERSON = gql`
  mutation createPerson(
    $name: String! $street: String! $city: String! $phone: String
  ) {
    addPerson(name: $name, street: $street, city: $city, phone: $phone) {
      name phone id address { street city }
    }
  }
`
```

⭐ **三大收益**(per course 文本 "Each component then imports the queries it needs"):
1. **单一真理源** —— Apollo cache 按 `operation name + variables` 做 cache key,统一命名不会冲突
2. **复用** —— 同一个 ALL_PERSONS 在 App(useQuery)和 PersonForm(refetchQueries)都用,不用复制
3. **关注点分离** —— 组件只管 UI,queries.js 只管 GraphQL 文本

⭐ **import 路径差异**(per 文件位置):
| 文件 | import 路径 |
|---|---|
| `src/App.jsx`(src 根目录) | `import { ALL_PERSONS } from './queries'` |
| `src/components/Persons.jsx`(子目录) | `import { FIND_PERSON } from '../queries'` |
| `src/components/PersonForm.jsx`(子目录) | `import { ALL_PERSONS, CREATE_PERSON } from '../queries'` |

---

## ⭐⭐⭐ 真实运行时验证 — "加完后页面立即刷新"(part8n → part8o 行为对比)

| 维度 | part8n(半成品) | **part8o(完整)** |
|---|---|---|
| 提交表单后 | 表单立即清空 | 表单立即清空 |
| Persons 列表 | ⚠️ 不刷新,需手动 F5 | ✅ **立即出现新 person** |
| Network 标签 | 1 个 POST(mutation) | 1 个 POST(mutation) + **1 个 POST(refetch ALL_PERSONS)** |
| Apollo DevTools Cache | mutation 后 cache 有新数据 | mutation 后 cache 更新 + ALL_PERSONS 重新响应 |

**⭐ 验证步骤**:
1. 浏览器 DevTools → Network 标签打开
2. 在 PersonForm 填一个新名字 + 提交
3. 期望看到:
   - 第 1 个 POST:`http://localhost:4000/` payload 含 `mutation createPerson` —— mutation
   - 第 2 个 POST:**紧接着**同一个 URL,payload 含 `query { allPersons ... }` —— **refetchQueries 触发的重发**
4. 页面立即看到新 person 出现在 Persons 列表

**⭐ 关键对比 — polling 行为**(如果用方案 A 而不是 B):
- 不提交表单,每 2 秒也有 1 个 POST `query { allPersons }`
- Network 标签会看到稳定的 2 秒间隔的请求
- (本节最终态不采用,但可作为对比理解)

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**需要两个终端**。

### Step 1 — 启动 Chapter 2 server(终端 A)

```bash
# 终端 A
cd /Users/jiankang/workspace/github_workspace/fullstack/part8/j-changing-a-phone-number
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

### Step 2 — 安装 part8o 依赖(终端 B)

```bash
# 终端 B(新开)
cd /Users/jiankang/workspace/github_workspace/fullstack/part8/o-updating-the-cache
npm install
```

**期望**:依赖装好(与 part8n 完全一样,无新增)。

### Step 3 — 启动 Vite dev server(终端 B)

```bash
npm run dev
```

**期望**:`➜ Local: http://localhost:5173/`

### Step 4 — 浏览器打开页面,初识视图

访问 `http://localhost:5173`。

**期望看到**(与 part8n 完全一致):
```
Persons
Arto Hellas 040-123543 [show address]
Mary Popup 040-432342 [show address]
create new
name [        ]
phone [        ]
street [        ]
city [        ]
[add!]
```

⭐ part8o 的 UI 看起来**与 part8n 一样** —— 真正的差异在 submit 后的运行时行为

### Step 5 — ⭐⭐⭐ 关键铁证:submit 后立即刷新(对比 part8n)

填一个**唯一名字**:
```
name:   Cache Test
phone:  040-1111111
street: Cache Street
city:   Cache City
```

点 `add!`。

**期望**(⭐ part8o vs part8n 关键差异):
- ✅ **Persons 列表立即出现 Cache Test**(part8n 不出现)
- ✅ 表单立即清空(乐观 UI 沿用)
- F12 Network → 看到 2 个 POST:
  1. POST `mutation createPerson(...)` —— mutation
  2. POST **紧接着** `query { allPersons { name phone id } }` —— refetchQueries 触发

### Step 6 — ⭐⭐ 验证 Apollo cache 行为

打开 Apollo DevTools → Cache 标签。

**期望**:
- Root → allPersons 字段 → 看到包含 Cache Test 在内的最新 persons 列表
- (与 part8n 区别:part8n mutation 后 cache 也有新 person,但组件没收到新 props,所以列表不刷新)

### Step 7 — ⭐⭐⭐ 验证 refetchQueries 多 query 能力(可选)

打开浏览器 console,临时改 PersonForm.jsx(测试完恢复):
```jsx
// 测试改法(验证完立即恢复):
const [createPerson] = useMutation(CREATE_PERSON, {
  refetchQueries: [
    { query: ALL_PERSONS },
    { query: FIND_PERSON },   // ← 加上这个,验证多 query 同步重发
  ],
})
```

提交表单后,Network 标签应该看到 3 个 POST(1 mutation + 2 refetch)。

### Step 8 — ⭐ 验证"其他用户修改不会自动同步"边界

1. 浏览器开**两个标签页**都打开 `http://localhost:5173`
2. 在标签 A 提交一个新 person
3. 期望:标签 A 立即看到新 person(refetchQueries 触发)
4. 期望:**标签 B 不自动刷新** —— 因为本端没发起 mutation,refetchQueries 不会触发
5. 在标签 B **手动点浏览器的刷新按钮**(不是 F5,因为 Vite HMR)→ 看到新 person

⭐ 这是 refetchQueries 的关键边界 —— "推送式同步"只对触发者有效。要做"推送同步所有人",需要 GraphQL Subscription(part8 末尾 + part9)。

### Step 9 — ⭐⭐⭐ 验证 useQuery(ALL_PERSONS)不带 pollInterval

观察 Network 标签(几分钟内**不**做任何操作):
- **期望**:没有任何 `query { allPersons }` 请求
- (对比方案 A pollInterval:每 2 秒 1 个请求)

这是 part8o 最终态选择 refetchQueries 的关键证据 —— 无操作时零流量。

### Step 10 — 启动生产 build

```bash
npm run build
```

**期望**:Vite 输出 `dist/`,无报错。

---

## ⭐ part8n vs part8o 关键对比

| 维度 | part8n | part8o |
|---|---|---|
| 提交后 Persons 列表 | ⚠️ 不刷新(F5 才看到) | ✅ **立即刷新**(refetchQueries 触发) |
| 提交后 Network 请求数 | 1 个 POST(mutation) | 1 个 POST(mutation) + **1 个 POST(refetch)** |
| useMutation 配置 | `useMutation(CREATE_PERSON)` | `useMutation(CREATE_PERSON, { refetchQueries: [{ query: ALL_PERSONS }] })` |
| GraphQL 操作定义位置 | inline 在各组件文件 | **抽出**到 `src/queries.js` |
| App.jsx | `import { gql }` + inline ALL_PERSONS | `import { ALL_PERSONS } from './queries'`(无 `gql`) |
| Persons.jsx | `import { gql }` + inline FIND_PERSON | `import { FIND_PERSON } from '../queries'`(无 `gql`) |
| PersonForm.jsx | `import { gql }` + inline CREATE_PERSON | `import { ALL_PERSONS, CREATE_PERSON } from '../queries'`(无 `gql`)+ refetchQueries |
| queries.js | (不存在) | **新建** — 3 个 export |
| main.jsx / package.json / vite.config.js | verbatim | verbatim(同 part8n) |

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| polling | "make the query for all persons poll the server" | 周期性重发 | 方案 A(展示,未采用) |
| pollInterval | "Let's set the query to poll every two seconds" | useQuery option,毫秒 | 方案 A(展示) |
| refetchQueries | "the useMutation hook's refetchQueries parameter" | useMutation option,mutation 后重发指定 query | 方案 B(采用)在 PersonForm.jsx |
| Cache key | (隐含,per part8m Cache 子段) | Apollo 按 operation name + variables 做缓存 key | InMemoryCache 内部 |
| Flicker | "the page may start to flicker, since ... result.loading is true for a brief moment" | 闪烁 | 方案 A 的缺点 |
| Loading flash | "a loading... text flashes on the screen for an instant" | loading 文字瞬间闪一下 | 方案 A 的副作用 |
| Multiple queries | "you can pass multiple objects inside refetchQueries" | 一次 mutation 多 query 同步 | refetchQueries 数组写法 |
| Other ways | "There are other ways to update the cache" | cache.modify / cache.updateQuery | part8p+ 才会讲 |
| Separate file | "separate the query definitions into their own file src/queries.js" | 模块化 | 新建 src/queries.js |
| Component imports | "Each component then imports the queries it needs" | 各组件按需 import | App / Persons / PersonForm 各自 import |

---

## ⭐ 关键 takeaway(6 条)

1. **Apollo cache 不自动触发 re-render** —— mutation 成功 + cache 更新 ≠ 组件重渲染(part8n 展示的"半成品")
2. **refetchQueries 是首选解法** —— mutation 成功后精准重发指定 query,Persons 列表立即更新
3. **polling 是另一种解法但有缺点** —— 多余流量 + 闪烁(per course 文本)
4. **queries.js 模块化是架构升级** —— 单一真理源 + 复用 + 关注点分离
5. **三种 cache 更新策略各有适用场景** —— pollInterval / refetchQueries / cache.modify
6. **refetchQueries 不能跨用户同步** —— 只对触发 mutation 的本端有效,他人修改需手动刷新(per course 原文)

---

## ⭐⭐ Troubleshooting(出问题了看这里)

### 问题 1 — submit 后 Persons 列表还是不刷新

**原因**:cache 没更新或 refetchQueries 没生效。

**解决**:
- 检查 PersonForm.jsx:
  ```jsx
  const [createPerson] = useMutation(CREATE_PERSON, {
    refetchQueries: [{ query: ALL_PERSONS }],   // ← 关键
  })
  ```
- 检查 PersonForm.jsx 是否正确 import 了 `ALL_PERSONS`(从 `'../queries'`)
- 检查 `src/queries.js` 里有 `export const ALL_PERSONS = gql\`...\``
- Network 标签看是否有 2 个 POST(1 mutation + 1 refetch)
- 如果只有 1 个 POST:refetchQueries 没触发,检查 import 路径
- 如果有 2 个 POST 但列表不刷新:cache 响应内容不对,检查 ALL_PERSONS 字段名是否匹配

### 问题 2 — Console 报 "ALL_PERSONS is not defined"

**原因**:PersonForm.jsx import 路径错了。

**解决**:
- PersonForm.jsx 在 `src/components/`,queries.js 在 `src/`
- 正确路径:`import { ALL_PERSONS, CREATE_PERSON } from '../queries'`
- ❌ 错:`from './queries'`(会找到 src/components/queries.js,不存在)
- ❌ 错:`from '/queries'`(绝对路径在 Vite 不行)

### 问题 3 — Console 报 "Could not find Apollo Client context"

**原因**:ApolloProvider 没包 `<App />`。

**解决**:
- 检查 `src/main.jsx` 有 `<ApolloProvider client={client}><App /></ApolloProvider>`
- main.jsx 路径引用 `./App.jsx` 是否正确

### 问题 4 — submit 后 Network Error

**原因**:Chapter 2 server 没起。

**解决**:
- 终端 A 跑 `cd part8/j-changing-a-phone-number && npm start`
- 看到 `🚀 Server ready at http://localhost:4000/`

### 问题 5 — Persons 列表有时刷新有时不刷新

**原因**:**这是 refetchQueries 的预期行为** —— 只有当前用户的 mutation 才触发重发。

**解决**:
- 其他用户修改不会自动同步(per course 原文)
- 这是 part8 末尾 + part9 用 Subscription 解决的问题
- 临时方案:开 2 个标签页,在标签 A 提交,标签 B 不刷新是正常的

### 问题 6 — 想用 polling 但不知道怎么加

**说明**:per course 原文 polling 是"另一种方案",不是 part8o 最终态。

**方案**(如果你想实验,临时改 App.jsx):
```jsx
const result = useQuery(ALL_PERSONS, {
  pollInterval: 2000,   // ← 加上这个
})
```

**预期**:
- Network 标签每 2 秒看到 1 个 `query { allPersons }` 请求
- 即使没操作也会发请求
- 偶尔看到 `<div>loading...</div>` 闪一下
- 验证后**立即恢复**(per course 最终态不用 pollInterval)

### 问题 7 — 想多 query 同步刷新怎么写

**参考**:per course 文本展示:
```jsx
const [createPerson] = useMutation(CREATE_PERSON, {
  refetchQueries: [
    { query: ALL_PERSONS },
    { query: OTHER_QUERY },
    { query: ANOTHER_QUERY },
  ],
})
```

注意 `OTHER_QUERY` 和 `ANOTHER_QUERY` 需要先在 `src/queries.js` 里 export。

### 问题 8 — 只想改 cache 不发请求

**说明**:per course "There are other ways to update the cache. More about those later in this part."

**方案**:`cache.modify` / `cache.updateQuery` —— part8p+ 才会讲。本节不涉及。

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `src/queries.js` | verbatim 课程(3 个 export) | **完全 verbatim** | 严格遵循 |
| `src/App.jsx` 的 useQuery | `useQuery(ALL_PERSONS)` 不带 pollInterval(per course final snippet) | **verbatim 不带 pollInterval** | 课程最终态推断:refetchQueries 是"better way",polling 是对比演示 |
| `src/App.jsx` 的 imports | 课程 final snippet `import { ALL_PERSONS } from './queries'` | 同 + **删除** `import { gql } from '@apollo/client'` | inline ALL_PERSONS 已抽出,gql 不再使用 → 删掉避免 ESLint `no-unused-vars` warning |
| `src/components/Persons.jsx` | inline FIND_PERSON → `import { FIND_PERSON } from '../queries'` | verbatim(无 pollInterval)| 严格遵循 |
| `src/components/PersonForm.jsx` | useMutation 加 refetchQueries | verbatim refetchQueries | 严格遵循 |
| `package.json` / `vite.config.js` / `index.html` / `.gitignore` / `src/main.jsx` | 课程无 | 沿用 part8n verbatim | 同 part8n 工程脚手架 |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |

---

## ⚠️ Mac OS 注意事项(只对你这台机器有效)

- **同 part8n** — Node v22.22.3 满足要求 / 两个端口(4000 + 5173)/ 两个终端
- **新增注意**:
  - refetchQueries 触发后,Network 标签的 2 个 POST 时间戳**很接近**(毫秒级)—— 用 DevTools 的 "Waterfall" 视图能看清楚先后顺序
  - StrictMode 下 dev server 会**故意双调用** hook(React 18+ 行为),所以 refetch 在 StrictMode 下可能看到 2 次 —— 这是 React 调试机制,不是 bug
  - Apollo DevTools 必须**装 Chrome 扩展**才能看到 Cache 标签 —— 没装的话只能靠 Network 标签验证

---

## 后续子节

- part8o **Updating the cache 已完结**(refetchQueries + src/queries.js 抽出 + Apollo cache 三种策略对比)
- ⚠️ **故意未做**:part8p "Handling mutation errors"(onError handler + Notify 组件 + setError prop 链)
- ⚠️ **故意未做**:part8q "Updating a phone number"(EDIT_NUMBER mutation + PhoneForm + onCompleted 处理 null)
- ⚠️ **故意未做**:part8r "Apollo Client and the applications state"(理论段,无新代码)
- ⚠️ **故意未做**:part8 末尾 "Exercises 8-12"(跳过,与 part7 练习策略一致)
- **一次只推进一小节** — 等用户确认 part8o 后再进 part8p
- **不** commit / push
- **不** 跑任何命令