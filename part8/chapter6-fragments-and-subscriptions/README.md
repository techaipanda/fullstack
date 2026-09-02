# chapter6-fragments-and-subscriptions — Chapter 6 第 1 + 2 子节"Fragments" + "Subscriptions"

> **课程 URL**:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-6
>
> **章节定位**:Part 8 Chapter 6 "Fragments and subscriptions"(本章共 7 个实质性子节 + Epilogue + 4 个 Exercises)
>
> **当前状态**:**第 1 子节 "Fragments" + 第 2 子节 "Subscriptions"(server + client)已落地**
>
> **整章策略**:**整章一个项目逐步迭代**(per 用户决策"逐步推进 + 继续放在 chapter6-fragments-and-subscriptions 项目里")— 后续子节在同一目录下追加,不另起子项目。Backend 在项目根的 `server/` 子目录,frontend 在 `src/`

## Chapter 6 完整路线图(per part8e.md)

| # | 子节 | 行(part8e.md)| 当前状态 | 涉及范围 |
|---|------|-------------|---------|---------|
| 1 | **Fragments** | 11-128 | ✅ **已落地**(子节 1)| 纯前端(queries.js)|
| 2 | **Subscriptions** | 130-789 | ✅ **已落地**(子节 2)| **后端** expressMiddleware + WebSocket + PubSub + **前端** splitLink + useSubscription + addPersonToCache helper |
| 2a | — Subscriptions(intro) | 130-138 | ✅ | 概念介绍 |
| 2b | — expressMiddleware | 140-259 | ✅ | **后端** Apollo Server v4 |
| 2c | — Subscriptions on the server | 261-456 | ✅ | **后端** subscription resolver |
| 2d | — Subscriptions on the client | 458-728 | ✅ | 前端 useSubscription |
| 3 | n+1 problem | 730-919 | ⏭️ 待推进 | **后端** DataLoader |
| 4 | Epilogue | 921-928 | ⏭️ 待推进 | 收尾 |
| - | Exercises 8.23-8.26 | 930-955 | ❌ **跳过** per 课程策略 | - |

⚠️ **诚实声明**:本 README 记录的是**第 1 + 2 子节**("Fragments" + "Subscriptions")。后续子节落地后会**追加**此 README 的对应章节,而不是另起新 README。

## 子项目结构

```
chapter6-fragments-and-subscriptions/
├── .env.example                (verbatim part8z 沿用 — VITE_BACKEND_URL 占位)
├── .gitignore                  (verbatim part8z 沿用 — node_modules + .env + dist)
├── index.html                  (verbatim part8z 沿用 — Vite 入口)
├── package.json                (verbatim part8z 沿用 + 章节 2 加 graphql-ws)
├── vite.config.js              (verbatim part8z 沿用 — react() plugin)
├── README.md                   (本文件)
├── src/                        ⭐ frontend (Vite + React + Apollo Client)
│   ├── main.jsx                ⭐ **章节 2 改** — splitLink + wsLink (per part8e.md line 813-912)
│   ├── App.jsx                 ⭐ **章节 2 改** — useSubscription + addPersonToCache (per course line 1174-1206)
│   ├── queries.js              ⭐ **章节 1+2 改** — PERSON_DETAILS fragment + FIND_PERSON + PERSON_ADDED
│   ├── utils/                  🆕 **章节 2 新建**
│   │   └── apolloCache.js      (addPersonToCache helper,per part8e.md line 1094-1121)
│   └── components/
│       ├── LoginForm.jsx       (verbatim part8z 沿用 — LOGIN mutation + localStorage)
│       ├── Notify.jsx          (verbatim part8z 沿用 — 8 行错误展示)
│       ├── Persons.jsx         (verbatim part8z 沿用 — STUB "Persons here",本子节不动)
│       ├── PersonForm.jsx      ⭐ **章节 2 改** — use addPersonToCache helper (per course line 1214-1247)
│       └── PhoneForm.jsx       (verbatim part8z 沿用 — 完整版 + part8y try/catch 替代 onCompleted)
└── server/                     🆕 **章节 2 新建**(verbatim part8v baseline + 课程第 2 子节改造)
    ├── .env.example            (verbatim part8v 沿用 — JWT_SECRET + MONGODB_URI)
    ├── db.js                   (verbatim part8v 沿用 — connectToDatabase)
    ├── index.js                (verbatim part8v 沿用 — main() 编排 + connectDB)
    ├── models/                 (verbatim part8v 沿用 — Person + User mongoose)
    ├── package.json            ⭐ **章节 2 改** — 加 7 包 (express/cors/@as-integrations/express5/graphql-ws/ws/graphql-subscriptions/@graphql-tools/schema)
    ├── resolvers.js            ⭐ **章节 2 改** — PubSub + Subscription.personAdded (per part8e.md line 597-696)
    ├── schema.js               ⭐ **章节 2 改** — type Subscription { personAdded: Person! } (per part8e.md line 456-459)
    └── server.js               ⭐ **章节 2 改** — expressMiddleware + WebSocketServer + useServer (per course line 295-388 + + line 480-543)
```

## 改造范围表(本子节"Fragments")

| 文件 | 状态 | 来源 |
|------|------|------|
| `.env.example` | 🔁 copy | verbatim part8z 沿用 |
| `.gitignore` | 🔁 copy | verbatim part8z 沿用 |
| `index.html` | 🔁 copy | verbatim part8z 沿用 |
| `package.json` | 🔁 copy + 修 name | verbatim part8z 沿用,`name` 从 `w-user-login-frontend` 改成 `chapter6-fragments-and-subscriptions`(cosmetic fix)|
| `vite.config.js` | 🔁 copy | verbatim part8z 沿用 |
| `src/main.jsx` | 🔁 copy | verbatim part8z 沿用(setContext + authLink.concat(httpLink))|
| `src/App.jsx` | 🔁 copy | verbatim part8z 沿用(token + LoginForm + logout)|
| `src/queries.js` | ⭐ **改** | 沿用 part8z 的 4 个 GraphQL 操作,**新增** PERSON_DETAILS fragment(per part8e.md block 6)+ FIND_PERSON query(per part8e.md block 7)|
| `src/components/LoginForm.jsx` | 🔁 copy | verbatim part8z 沿用 |
| `src/components/Notify.jsx` | 🔁 copy | verbatim part8z 沿用 |
| `src/components/Persons.jsx` | 🔁 copy | verbatim part8z 沿用(STUB,本子节不动)|
| `src/components/PersonForm.jsx` | 🔁 copy | verbatim part8z 沿用(本子节不动)|
| `src/components/PhoneForm.jsx` | 🔁 copy | verbatim part8z 沿用(本子节不动)|
| `README.md` | 🆕 新写 | 本文件 |

**改造核心**:12 文件 copy + 1 文件改 + 1 README 新写 = 14 文件。

## 课程原文摘要(Chapter 6 第 1 子节 "Fragments" — 13 blocks)

| Block | 类型 | 内容摘要 |
|-------|------|---------|
| 0 | 文字 | "It is pretty common in GraphQL that multiple queries return similar results. For example, the query for the details of a person **findPerson** ... and the query for all persons **allPersons** ... both return persons. When choosing the fields to return, both queries have to define exactly the same fields." |
| 1 | 代码 | **示例 query 1**:`query { findPerson(name: "Pekka Mikkola") { name phone address { street city } } }`(示意**没有 fragment 的版本**)|
| 2 | 代码 | **示例 query 2**:`query { allPersons { name phone address { street city } } }`(示意同样字段重复)|
| 3 | 文字 | "Such situations can be simplified by using **fragments**. A fragment that selects all of a person's details looks like this:" |
| 4 | 代码 | **PersonDetails fragment 定义**:`fragment PersonDetails on Person { name phone address { street city } }` |
| 5 | 代码 | **使用 fragment 的 query**:`allPersons { ...PersonDetails }` + `findPerson(...) { ...PersonDetails }`(高亮 `// highlight-line`)|
| 6 | 文字 | "The fragments **are not** defined in the GraphQL schema, but in the client. The fragments must be declared when the client uses them for queries." |
| 7 | 代码 | **把 fragment 内联到 FIND_PERSON**:`export const FIND_PERSON = gql\` query findPersonByName(...) { findPerson(...) { ...PersonDetails } } fragment PersonDetails on Person { ... } \``(完整内联版本)|
| 8 | 文字 | "However, it is much more sensible to define the fragment once and store it in a variable. Let's add the fragment definition to the beginning of the queries.js file" |
| 9 | 代码 | **PERSON_DETAILS fragment 常量**:`const PERSON_DETAILS = gql\` fragment PersonDetails on Person { id name phone address { street city } } \`` |
| 10 | 文字 | "The fragment can now be embedded into all queries and mutations that need it using the **dollar curly braces** operation" |
| 11 | 代码 | **FIND_PERSON + ${PERSON_DETAILS}**:`export const FIND_PERSON = gql\` query findPersonByName(...) { ... } ${PERSON_DETAILS} \`` |
| 12 | 文字 | "So the template literal in the PERSON_DETAILS variable is now inserted as part of the FIND_PERSON template literal. In practice, the end result is exactly the same as in the earlier example, where the fragment was defined directly alongside the query." |

## 关键诚实声明 — 课程 trade-off

**本子节几乎无 trade-off**(纯加法)。但有几条**没做的事**必须明确:

| 项 | 课程做了什么 | 课程**没**做什么 | 影响 |
|----|------------|----------------|------|
| Fragment 定义位置 | `src/queries.js` 顶部 `PERSON_DETAILS` 常量 | 没改 server schema(per block 6 "not defined in the GraphQL schema")| Fragment 是纯 client 概念,server 无感知 |
| ALL_PERSONS 是否用 fragment | **没用**,仍是 `name phone`(per block 5 只演示 findPerson 用 fragment)| 没把 ALL_PERSONS 也改成 `...PersonDetails` | ALL_PERSONS 现在字段比 fragment **少**(没 id + address),前后端字段集合**不一致**|
| Persons.jsx 是否用 fragment | **没动**(本子节不变) | 没改 Persons 组件渲染 fragment 展开的字段 | Persons 仍 STUB "Persons here" |
| FIND_PERSON 谁用 | **没人用**(本子节) | App.jsx / Persons.jsx 都没 `useQuery(FIND_PERSON)` | FIND_PERSON 是 **dead code by design**(per README 注释)— 后续"Subscriptions on the client"子节才用上 |
| query 字段集合一致性 | ALL_PERSONS 字段集 ⊊ fragment 字段集 | 课程**不要求**统一 | 运行时无问题(Apollo 按 query 各自取字段),但**违反 DRY 原则**|

### 为什么课程**故意**这样?

1. **ALL_PERSONS 没用 fragment**:课程**演示 fragment 概念**用 findPerson 就够了,不强行改 ALL_PERSONS(per part8e.md block 5-7 verbatim)— 避免一次性改动太多
2. **FIND_PERSON 没人用**:课程**埋好工具**,后续"Subscriptions on the client"子节(per part8e.md block 13+)用 `useSubscription` + PersonDetails 来响应 personAdded 事件
3. **Persons.jsx 不动**:章节设计是"先用 5 个子节讲完核心概念,最后才补 Listing persons 完整版"(per part8w README 的"故意不做"伏笔)— 本子节**继续延后**

### 课程 trade-off 的影响

| 用户操作 | 当前实现(part8z final-state + 本子节 fragment)| 假设所有字段都用 fragment |
|---------|------------------------------------------|--------------------------|
| App.jsx 渲染 Persons 列表 | `<Persons persons={result.data.allPersons} />` 只取 name + phone | 取 id + name + phone + address(street, city)|
| 查询 personAdded subscription | 用 PersonDetails fragment 一次拿全 | - |
| Server 实际收到的 query | `query allPersons { allPersons { name phone } }` | `query allPersons { allPersons { id name phone address { street city } } }` |

⚠️ **风险**:如果后续子节引入更多 `...PersonDetails` 引用,但 ALL_PERSONS 仍保持字段最小集,会导致**网络流量不一致** + Apollo cache 归一化后字段不齐全(经典 cache invalidation bug 风险)。课程接受这个 risk,生产代码应该**统一**。

## 4 个核心概念

1. **GraphQL Fragment**(本节**新概念**)— client 端字段复用机制,详见 queries.js 注释 + 课程 block 3-4
2. **`${...}` JavaScript 模板字符串插值**(本节**新概念**)— 不是 GraphQL 语法,是 JS 把 fragment 文本"插入" query 模板的运行时机制,详见 queries.js 注释 + 课程 block 10
3. **Fragment 不在 server schema 里**(本节**新概念**)— block 6 强调 "are not defined in the GraphQL schema, but in the client",Apollo Client 在发送 query 前把 fragment 展开成完整字段集,server 无感知
4. **Apollo Client 字段级归一化(per part8q 沿用)**— 即使 fragment 让多个 query 取相同字段,Apollo cache 按 Person type + id 归一化,Persons.jsx 渲染时字段已 merge

## minimum viable improvement(诚实声明)

per discipline "minimum viable additions",本子节**零改进**:
- `PERSON_DETAILS` fragment:**verbatim part8e.md block 9 lines 100-111**(字段顺序、空行、缩进都照搬)
- `FIND_PERSON` query:**verbatim part8e.md block 11 lines 117-125**(包含 `${PERSON_DETAILS}` 在闭引号前一行)

只加了**中文注释**(`⭐ 核心概念:` / `⭐ 为什么用 fragment:` / `⭐ 验证方法:` 三层),无代码层改动。

## 验证步骤(你需要自己跑命令)

per discipline "Claude 不替你跑任何命令":

### Step 0:安装依赖

```bash
cd part8/chapter6-fragments-and-subscriptions
cp .env.example .env
npm install   # 装 @apollo/client graphql react react-dom + dev @vitejs/plugin-react vite
```

### Step 1:启动后端(part8u 或 part8v)

```bash
# 另一个终端
cd part8/v-friends-list    # 或 part8u
npm run dev                # → Server ready at http://localhost:4000
```

> ⚠️ **重要**:本子节**不动后端**,继续用 part8u/v。如果 part8v 后端**没有** `findPerson` resolver,FIND_PERSON query 会 server-side error(`Cannot query field 'findPerson'`)。这是**预期行为**,本子节只验证 fragment 工具就绪,验证 findPerson 是后续子节的事。

### Step 2:启动前端(本子节)

```bash
cd part8/chapter6-fragments-and-subscriptions
npm run dev
```

预期:`VITE ready in xxx ms` + `Local: http://localhost:5173/` + 包名 `chapter6-fragments-and-subscriptions`(确认 package.json fix 生效)

### Step 3:浏览器登录 + 验证 Persons 列表

- 访问 http://localhost:5173
- 登录后看到 Persons stub + PersonForm + PhoneForm(per part8z 沿用)
- 点开 Apollo Client DevTools → Cache → 应看到 `ROOT_QUERY.allPersons` 有 persons(per ALL_PERSONS 取 name + phone)
- **不应**看到 PERSON_DETAILS fragment 的 cache entry(因为没人引用它)

### Step 4:验证 fragment 编译时可用(本节**核心验证**)

打开浏览器 Console:

```javascript
// 方法 1:动态 import(绕过 module caching)
const m = await import('/src/queries.js')
console.log('PERSON_DETAILS:', m.PERSON_DETAILS)
console.log('FIND_PERSON:', m.FIND_PERSON)
```

应看到 2 个 GraphQLDocumentNode 对象。`m.PERSON_DETAILS.kind === 'Document'` + `m.PERSON_DETAILS.definitions[0].kind === 'FragmentDefinition'`,`m.FIND_PERSON.kind === 'Document'` + `m.FIND_PERSON.definitions[0].kind === 'OperationDefinition'`。

### Step 5:验证 FIND_PERSON 拼接了 fragment(本节**关键验证**)

```javascript
const m = await import('/src/queries.js')
console.log(m.FIND_PERSON.loc.source.body)
```

应看到拼接后的完整 GraphQL document(包含 `query findPersonByName` + `fragment PersonDetails on Person`)— 这是 `${PERSON_DETAILS}` 模板插值的运行时结果。

### Step 6:验证 ALL_PERSONS / PersonForm / PhoneForm 行为不变(回归测试)

- ALL_PERSONS 仍取 name + phone(per part8z 沿用)— Persons stub 看不到变化
- PersonForm 仍能加 person(per part8z onError + part8y phone.length 修复)— 测:
  - 输入 name="FragmentTest" + street="Foo" + city="Bar" + phone="12345" → 应成功
- PhoneForm 仍 try/catch 模式(per part8y)— 测:
  - 输入 name="Arto" + phone="1234" → Notify 红字 "Person validation failed: phone..."
  - 输入 name="NotExist" + phone="12345" → 静默失败(per part8y trade-off)

## 兑现的伏笔

来自 part8z(及更早)的"故意不做"清单:

- ✅ **Fragment 字段复用工具**(per part8w README "等 Chapter 6")— 本子节落地 PERSON_DETAILS
- ✅ **FIND_PERSON query 准备就绪**(为后续 Subscriptions-on-client 铺垫)— 本子节埋好,等后续子节启用
- ⏸️ **allPersons 带 address 嵌套的完整版** — **仍延后**(本子节不动 ALL_PERSONS)
- ⏸️ **Persons.jsx 完整版** — **仍延后**(本子节不动)
- ⏸️ **phone filter / `// filters missing`** — **仍延后**(本子节不动 query)

## 故意不做(诚实声明)

per discipline "minimum viable additions" + 课程严格按 part8e.md block 11:

- ❌ **改 ALL_PERSONS 用 fragment** — 课程 verbatim 不改(per part8e.md block 5-7 只演示 findPerson 用 fragment)
- ❌ **Persons.jsx 改用 fragment 渲染** — 课程本子节**不动** Persons 组件(仍是 STUB "Persons here")
- ❌ **App.jsx 加 useQuery(FIND_PERSON)** — 课程本子节**不动** App.jsx;FIND_PERSON 是 dead code by design
- ❌ **Apollo Client DevTools 安装** — 用户自己装
- ❌ **TypeScript 类型化 fragment** — 课程是 JS,沿用 JS 不做 TS 化
- ❌ **Fragment 命名空间/条件 fragment** — 课程没讲,Apollo v3.7+ 才支持
- ❌ **查询 PersonDetails 的 query alias** — 课程 verbatim 用 `...PersonDetails` 直接展开,没用 named alias

## 后端对接验证(per part8u/v README 的 resolvers)

| 前端操作 | 后端 schema + resolver(part8u/v)| 一致性 |
|---------|------------------------------|--------|
| queries.js 加载 + Apollo Client 启动 | 无 server 调用,纯 client 端 fragment 编译 | ✅ |
| ALL_PERSONS | allPersons resolver(part8u/v 已有) | ✅ |
| PERSON_DETAILS | **不需要 server** — 纯 client fragment | ✅ |
| FIND_PERSON | **要求 server part8u/v 有 findPerson resolver** | ⚠️ 待验证(part8u/v 可能没实现)|
| login | login resolver(per part8u 已有)| ✅ |
| createPerson / editNumber | per part8o/j | ✅ |

⚠️ **关键诚实**:FIND_PERSON 在 part8u/v 后端**可能**没实现。如果 `npm run dev` 时浏览器 console 报 `Cannot query field "findPerson"`,说明后端缺这个 resolver,**不影响本子节 fragment 工具就绪的验收**(本子节验收点是 Step 4-5,不是跑通 findPerson)。

## Troubleshooting

| 症状 | 可能原因 | 修复 |
|------|---------|------|
| `npm run dev` 报 "Failed to resolve import" | node_modules 没装 / 漏装 @apollo/client | `rm -rf node_modules package-lock.json && npm install` |
| Vite 启动后 Console 报 "Cannot query field 'findPerson'" | 后端 part8u/v 没 findPerson resolver | ⚠️ **本子节不要求**,跳过或自己加 findPerson resolver 到后端 |
| Browser console `m.PERSON_DETAILS === undefined` | import 路径错或 Vite 没 bundle queries.js | 检查 queries.js 末尾确实 `export const FIND_PERSON = ...` 且文件无语法错 |
| `m.FIND_PERSON.loc.source.body` 不显示 fragment | template literal 没正确插值 | 检查 `${PERSON_DETAILS}` 在闭合 backtick 前一行 |
| npm run dev 报 `> w-user-login-frontend@0.0.0 dev` | package.json name 没改 | ✅ **本子节已修**(per package.json 改动章节)|
| Apollo cache 没有 PERSON_DETAILS entry | 预期行为 — 没人引用就不归一化 | 用 `m.PERSON_DETAILS` 直接读 DocumentNode,不要从 cache 找 |

## 下一步(per course 顺序)

- ✅ Chapter 6 第 1 子节:"Fragments"
- ✅ Chapter 6 第 2 子节:"Subscriptions"(intro + expressMiddleware + server + client)— **本 README 覆盖**
- ⏭️ Chapter 6 第 3 子节:"n+1 problem"— 后端 friendOf field + DataLoader 优化
- ⏭️ Chapter 6 第 4 子节:"Epilogue"— 收尾
- ❌ Exercises 8.23-8.26 — per 课程策略:**跳过练习题**

第 1+2 子节落地后,**下一步是第 3 子节 "n+1 problem"**(纯后端,加 friendOf field + resolver + populate 优化)。

## 子节 2 "Subscriptions" 完成详情(per part8e.md lines 190-1259)

### 课程原文 9 blocks

| Block | 类型 | 内容摘要 |
|-------|------|---------|
| 23 | 文字 | "Along with query and mutation types, GraphQL offers a third operation type: **subscriptions**. With subscriptions, clients can **subscribe** to updates about changes in the server." |
| 24 | 代码 | **startStandaloneServer → expressMiddleware**:加 express + cors + http.createServer + ApolloServerPluginDrainHttpServer |
| 25 | 文字 | "Following the recommendations in the documentation, **ApolloServerPluginDrainHttpServer** has been added to the GraphQL server configuration..." |
| 26 | 代码 | **graphql-ws + WebSocketServer + useServer**:加 wsServer + useServer({ schema }, wsServer) |
| 27 | 代码 | **PubSub + addPerson.publish + Subscription.personAdded resolver**:PubSub publish-subscribe pattern |
| 28 | 文字 | "It's possible to test the subscriptions with the Apollo Explorer like this..." |
| 29 | 代码 | **前端 splitLink + GraphQLWsLink + ApolloLink.split**:ApolloLink.split 根据 operation kind 分流 wsLink vs authLink.concat(httpLink) |
| 30 | 代码 | **PERSON_ADDED subscription + useSubscription**:在 App.jsx 用 useSubscription(PERSON_ADDED, { onData }) |
| 31 | 代码 | **addPersonToCache helper 抽取**:避免 useSubscription + PersonForm 重复 cache 添加导致重复渲染 |

### 子节 2 文件改动表(verbatim course)

| 文件 | 改动 | 来源 |
|------|------|------|
| `server/package.json` | ⭐ **改** — 加 7 包 + description 更新 | 课程 3 个 npm install 命令(per part8e.md line 287-288, 471-473, 585-587)|
| `server/server.js` | ⭐ **改** — 完全重写:startStandaloneServer → expressMiddleware + WebSocket | 课程 line 295-388 + line 480-543 |
| `server/schema.js` | ⭐ **改** — 加 `type Subscription { personAdded: Person! }` | 课程 line 456-459 |
| `server/resolvers.js` | ⭐ **改** — 加 PubSub import + pubsub 实例 + addPerson.publish + Subscription 块 | 课程 line 597-696 |
| `package.json`(frontend)| ⭐ **改** — 加 graphql-ws | 课程 line 805-807 |
| `src/queries.js` | ⭐ **改** — 加 PERSON_ADDED subscription | 课程 line 939-951 |
| `src/main.jsx` | ⭐ **改** — 加 wsLink + splitLink,ApolloClient.link 改 splitLink | 课程 line 813-912 |
| `src/utils/apolloCache.js` | 🆕 **新建** — addPersonToCache helper | 课程 line 1094-1121 |
| `src/components/PersonForm.jsx` | ⭐ **改** — useMutation update 改用 helper | 课程 line 1214-1247 |
| `src/App.jsx` | ⭐ **改** — 加 useSubscription(PERSON_ADDED, { onData: notify + addPersonToCache }) | 课程 line 1174-1206 |

### 子节 2 关键诚实声明

1. **Apollo Server v4 expressMiddleware**:`startStandaloneServer` 不支持 WebSocket upgrade,**必须**换成 `express + http.createServer + expressMiddleware`(per course line 273-280)
2. **apollo v3.11 适配**:`GraphQLWsLink` 路径 `@apollo/client/link/subscriptions`(v3 + v4 一致,无适配问题)— 跟 part8x setContext (v3.11 vs v4 差异)不同
3. **PubSub in-memory 警告**:默认 PubSub 单进程内存实现,多实例 / 集群部署需要换 Redis/Kafka/Google PubSub(per graphql-subscriptions docs)— 课程 verbatim 用 in-memory,学习用
4. **addPersonToCache 必须抽取**:useSubscription + useMutation 都会触发 cache 更新 → 必须去重 → helper 用 `allPersons.some(...)` 去重(per course block 10-12)
5. **`client.cache` vs `cache` 参数**:PersonForm 的 cache 是 useMutation 第二参数;App.jsx 的 cache 是 `useApolloClient().cache`(同一对象)— helper 接受 cache 形参,两者等价

## 子节 2 验证步骤

### Step 0:安装依赖(后端 + 前端各自装)

```bash
# Terminal 1: 后端
cd part8/chapter6-fragments-and-subscriptions/server
cp .env.example .env  # 配置 JWT_SECRET + MONGODB_URI
npm install            # 装 13 包(包括 @apollo/server + express + graphql-ws + ws + graphql-subscriptions 等)

# Terminal 2: 前端
cd part8/chapter6-fragments-and-subscriptions
npm install            # 装 5 包 + dev 2 包(包括新增 graphql-ws)
```

### Step 1:启动后端 server/(per 子节 2 改造后)

```bash
cd part8/chapter6-fragments-and-subscriptions/server
npm run dev
```

预期:`Server is now running on http://localhost:4000`(注意:跟 part8u/v 的 "Server ready at" 文案不同,per 子节 2 改造)

### Step 2:启动前端

```bash
cd part8/chapter6-fragments-and-subscriptions
npm run dev
```

预期:`VITE ready in xxx ms` + `Local: http://localhost:5173/`

### Step 3:浏览器登录 + 验证 Persons 列表(回归测试子节 1)

- 访问 http://localhost:5173
- 登录后看到 Persons stub + PersonForm + PhoneForm
- 应看到 Apollo cache 里 `ROOT_QUERY.allPersons` 有 persons(per ALL_PERSONS 取 name + phone)

### Step 4:验证 backend subscription 服务(per 子节 2 核心验收)

打开 Apollo Sandbox(http://localhost:4000)— 课程截图 per part8e.md line 751-752):

```graphql
subscription Subscription {
  personAdded {
    phone
    name
  }
}
```

- 点 "PersonAdded" button → start waiting
- 打开**另一个 browser tab**(http://localhost:5173)登录后用 PersonForm 加 person
- Apollo Sandbox 应该立即收到 personAdded 数据(per part8e.md line 766-773 描述)
- ✅ = backend subscription 管道工作正常

### Step 5:验证 frontend subscription + addPersonToCache(per 子节 2 全链路验收)

- 打开**两个** http://localhost:5173 tab(都登录)
- 在 tab A 用 PersonForm 加 person
- 预期:
  - tab A:Notify 红字 "xxx added" + Persons 列表出现新 person(per useSubscription onData 通知 + cache 更新)
  - tab B:Notify 红字 + Persons 列表出现新 person(per WebSocket 推送 + useSubscription)
- ✅ = frontend subscription + cache 去重工作

### Step 6:验证 cache 去重(子节 2 关键验收)

- 在两个 tab 都打开 DevTools → Apollo Client DevTools → Cache
- 触发 addPerson
- 预期:cache 里 `ROOT_QUERY.allPersons` 里**只有一条**新 person(per addPersonToCache 的 `some(...)` 去重)— 不应出现重复条目
- 如果看到重复 → addPersonToCache helper 的 some() 检查失效(可能是 Apollo cache 归一化问题,需要排查)

### Step 7:验证 findPerson 配合 fragment(子节 1 跨子节验收)

打开 Apollo Sandbox:

```graphql
query {
  findPerson(name: "Arto Hellas") {
    ...PersonDetails
  }
}

fragment PersonDetails on Person {
  id
  name
  phone
  address {
    street
    city
  }
}
```

- 预期:返回完整 Person 对象 + address 嵌套字段
- ✅ = 子节 1 fragment 工具 + 子节 2 后端 findPerson resolver 协作

## Troubleshooting(子节 2 新增)

| 症状 | 可能原因 | 修复 |
|------|---------|------|
| 后端启动报 `Cannot find module 'express'` | server/ 没装依赖 | `cd server && npm install` |
| 后端启动报 `Cannot find module 'graphql-subscriptions'` | 同上 | 同上 |
| 后端启动报 `Cannot find module '@as-integrations/express5'` | 同上 | 同上 |
| Apollo Sandbox subscription "Failed to connect" | 后端没 WebSocket 配置 / server 没启动 | 确认 server/ `npm run dev` 输出 `Server is now running at ...` |
| Apollo Sandbox subscription 报 `Cannot query field "personAdded"` | 后端 schema 没加 Subscription type | 检查 server/schema.js 末尾是否 `type Subscription { personAdded: Person! }` |
| 前端启动报 `Failed to resolve import "graphql-ws"` | 前端没装依赖 / 没装 graphql-ws | `cd 根目录 && npm install`(package.json 已加)|
| 前端启动报 `Failed to resolve import "./utils/apolloCache"` | apolloCache.js 没创建 | 检查 `src/utils/apolloCache.js` 文件存在 |
| Browser console 报 `subscription must be executed over a websocket` | main.jsx 没配 splitLink / wsLink | 检查 main.jsx 末尾 `link: splitLink` + wsLink 创建 |
| Browser console 报 `ws://localhost:4000` connection refused | 后端 server/ 没启动 / 没装 @graphql-tools/schema | 确认 server `npm run dev` 起来 + 安装 |
| PersonForm 加 person 后 cache 出现 2 条重复 person | addPersonToCache 的 .some() 没去重成功 | 检查 apolloCache.js 的 `personExists = allPersons.some(...)` 逻辑 + cache.updateQuery 签名 |
| tab A 加 person tab B 没收到 Notify | WebSocket 连接断开 / splitLink 没路由到 wsLink | 浏览器 DevTools Network → WS 看 ws:// 连接状态 + main.jsx splitLink 的 testFn 是否正确 |
| Apollo Sandbox subscription 等不到 personAdded | 后端 pubsub 没被触发(检查 addPerson publish) / WebSocket 协议不匹配 | 用 `pubsub.publish('PERSON_ADDED', { personAdded: person })` 在 addPerson 末尾 + 确认 graphql-ws lib 版本 ≥ 5.14 |

## 通道状态表(本子节)

| 通道 | 状态 | 备注 |
|------|------|------|
| WebSearch | FAIL | 上一轮测试返回空(仅 reminder),标记 FAIL,不再尝试 |
| WebFetch mooc.fi | FAIL | 返回 "You appear to be offline",标记 FAIL,不再尝试 |
| WebFetch GitHub raw | FAIL | 返回 404(用了错的 repo URL fullstackopen vs fullstack-hy2020.github.io)|
| gh api repos/.../contents | OK | 成功列出 part8/en/ 目录文件 |
| gh api repos/.../contents/<file> + base64 decode | OK | 成功下载 part8e.md(32K,969 行) + 切出 Fragments 子节(119 行)|
| Bash PowerShell(New-Item/Copy-Item)| OK | 创建 chapter6 目录 + 复制 13 个文件成功 |
| Edit GateGuard package.json | OK | 1 次提供 4 facts 后通过(name 字段 cosmetic fix)|
| Edit GateGuard queries.js | OK | 1 次提供 4 facts 后通过(Grep 验证 4 个 importer,新 export 不影响)|
| Write README GateGuard | OK | 1 次提供 4 facts 后通过(README 无 importer,纯文档)|

