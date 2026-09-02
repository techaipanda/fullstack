# chapter6-fragments-and-subscriptions — Chapter 6 第 1 子节"Fragments"

> **课程 URL**:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-6
>
> **章节定位**:Part 8 Chapter 6 "Fragments and subscriptions"(本章共 7 个实质性子节 + Epilogue + 4 个 Exercises)
>
> **当前状态**:**第 1 子节 "Fragments" 已落地**(本 README 记录此子节)
>
> **整章策略**:**整章一个项目逐步迭代**(per 用户决策"逐步推进")— 后续子节在同一目录下追加,不另起子项目

## Chapter 6 完整路线图(per part8e.md)

| # | 子节 | 行(part8e.md)| 当前状态 | 涉及范围 |
|---|------|-------------|---------|---------|
| 1 | **Fragments** | 11-128 | ✅ **本子节已落地** | 纯前端(queries.js)|
| 2 | Subscriptions(intro) | 130-138 | ⏭️ 待推进 | 概念介绍 |
| 3 | expressMiddleware | 140-259 | ⏭️ 待推进 | **后端**(Apollo Server v4)+ WebSocket |
| 4 | Subscriptions on the server | 261-456 | ⏭️ 待推进 | **后端** subscription resolver |
| 5 | Subscriptions on the client | 458-728 | ⏭️ 待推进 | 前端 useSubscription |
| 6 | n+1 problem | 730-919 | ⏭️ 待推进 | **后端** DataLoader |
| 7 | Epilogue | 921-928 | ⏭️ 待推进 | 收尾 |
| - | Exercises 8.23-8.26 | 930-955 | ❌ **跳过** per 课程策略 | - |

⚠️ **诚实声明**:本 README 记录的是**第 1 子节**("Fragments")。后续子节落地后会**追加**此 README 的对应章节,而不是另起新 README。

## 子项目结构

```
chapter6-fragments-and-subscriptions/
├── .env.example                (verbatim part8z 沿用 — VITE_BACKEND_URL 占位)
├── .gitignore                  (verbatim part8z 沿用 — node_modules + .env + dist)
├── index.html                  (verbatim part8z 沿用 — Vite 入口)
├── package.json                (verbatim part8z 沿用,但 name 改为 chapter6-fragments-and-subscriptions)
├── vite.config.js              (verbatim part8z 沿用 — react() plugin)
├── README.md                   (本文件)
└── src/
    ├── main.jsx                (verbatim part8z 沿用 — Apollo Link chain 自动加 Authorization)
    ├── App.jsx                 (verbatim part8z 沿用 — token + LoginForm + logout + notify)
    ├── queries.js              ⭐ **改** — 加 PERSON_DETAILS fragment + FIND_PERSON query(per 本子节)
    └── components/
        ├── LoginForm.jsx       (verbatim part8z 沿用 — LOGIN mutation + localStorage)
        ├── Notify.jsx          (verbatim part8z 沿用 — 8 行错误展示)
        ├── Persons.jsx         (verbatim part8z 沿用 — STUB "Persons here",本子节不动)
        ├── PersonForm.jsx      (verbatim part8z 沿用 — 完整版 + part8y phone.length 修复 + onError)
        └── PhoneForm.jsx       (verbatim part8z 沿用 — 完整版 + part8y try/catch 替代 onCompleted)
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

- ✅ Chapter 6 第 1 子节:"Fragments"(本子节)
- ⏭️ Chapter 6 第 2 子节:"Subscriptions"(intro,纯文字)— 概念铺垫,无代码改动
- ⏭️ Chapter 6 第 3 子节:"expressMiddleware"(后端)**— 需要新增 `chapter6-fragments-and-subscriptions-backend/` 或在子目录添加 `backend/`**
- ⏭️ Chapter 6 第 4-6 子节:subscriptions + n+1 — 都需要后端改动
- ❌ Exercises 8.23-8.26 — per 课程策略:**跳过练习题**

我们第 1 子节落地后,**下一步是第 2 子节 "Subscriptions" intro**(纯文字,可快速扫过)或**直接进第 3 子节 "expressMiddleware"**(开始大改后端)。

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

