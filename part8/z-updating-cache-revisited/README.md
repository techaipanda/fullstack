# part8z — Updating cache, revisited(Chapter 5 第 4 子节)

> **课程 URL**:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-5
>
> **本章小节**:User login → Adding a token to a header → Fixing validations → **Updating cache, revisited**(本子节)
>
> **本子节对应课程章节**:Chapter 5 "Updating cache, revisited"(第 4 个 H2)
>
> **架构延续**:本子节是 part8y library frontend 的延续(只改 1 个文件 — PersonForm.jsx)

## 子项目结构

```
z-updating-cache-revisited/
├── .env.example                (verbatim part8y 沿用 — VITE_BACKEND_URL 占位)
├── .gitignore                  (verbatim part8y 沿用 — node_modules + .env + dist)
├── index.html                  (verbatim part8y 沿用 — Vite 入口)
├── package.json                (verbatim part8y 沿用 — React 19.2 + Apollo 3.11 + Vite 7.2.4)
├── vite.config.js              (verbatim part8y 沿用 — react() plugin)
├── README.md                   (本文件)
└── src/
    ├── main.jsx                (verbatim part8y 沿用 — Apollo Link chain 自动加 Authorization)
    ├── App.jsx                 (verbatim part8y 沿用 — token + LoginForm + logout + notify)
    ├── queries.js              (verbatim part8y 沿用 — ALL_PERSONS + LOGIN + CREATE_PERSON + EDIT_NUMBER)
    └── components/
        ├── LoginForm.jsx       (verbatim part8y/w 沿用 — LOGIN mutation + localStorage) ⚠️ v1 漏 copy,已修复
        ├── Notify.jsx          (verbatim part8y 沿用 — 8 行错误展示)
        ├── Persons.jsx         (STUB — 渲染 "Persons here")
        ├── PersonForm.jsx      ⭐ **改** — 用 `update` callback 替代 `refetchQueries`(per part8z block 4)
        └── PhoneForm.jsx       (verbatim part8y 沿用 — try/catch 模式)
```

> ⚠️ **诚实声明 — v1 bug 修复**:最初创建 part8y/z 时,`Copy-Item` 只 copy 了 4 个 components(Notify / Persons / PersonForm / PhoneForm),漏了 `LoginForm.jsx`。导致 `npm run dev` 报 `Failed to resolve import "./components/LoginForm" from "src/App.jsx"`(per part8x App.jsx import)。**修复命令**:`Copy-Item w-user-login-frontend/src/components/LoginForm.jsx → z-updating-cache-revisited/src/components/`。part8y 同 bug 同样已修(part8y README 已记录)。

## 改造范围表

| 文件 | 状态 | 来源 |
|------|------|------|
| `.env.example` | 🔁 copy | verbatim part8y 沿用 |
| `.gitignore` | 🔁 copy | verbatim part8y 沿用 |
| `index.html` | 🔁 copy | verbatim part8y 沿用 |
| `package.json` | 🔁 copy | verbatim part8y 沿用(@apollo/client ^3.11.0)|
| `vite.config.js` | 🔁 copy | verbatim part8y 沿用 |
| `src/main.jsx` | 🔁 copy | verbatim part8y 沿用(setContext + authLink.concat(httpLink))|
| `src/App.jsx` | 🔁 copy | verbatim part8y 沿用(token + LoginForm + logout)|
| `src/queries.js` | 🔁 copy | verbatim part8y 沿用(4 个 GraphQL 操作)|
| `src/components/Notify.jsx` | 🔁 copy | verbatim part8y 沿用 |
| `src/components/Persons.jsx` | 🔁 copy | verbatim part8y 沿用(STUB)|
| `src/components/PersonForm.jsx` | ⭐ **改** | 改 useMutation options:`refetchQueries` → `update` callback(per part8z block 4 verbatim)|
| `src/components/PhoneForm.jsx` | 🔁 copy | verbatim part8y 沿用(try/catch 模式)|
| `README.md` | 🆕 新建 | 本文件 |

**改造核心**:12 文件 copy + 1 文件改 + 1 README 新写 = 13 文件。

## 课程原文摘要(Chapter 5 "Updating cache, revisited" — 13 blocks)

| Block | 类型 | 内容摘要 |
|-------|------|---------|
| 0 | 文字 | "We have to update the cache of the Apollo client on creating new persons. We can update it using the mutation's refetchQueries option to define that the ALL_PERSONS query is done again" |
| 1 | 代码 | **回顾 part8o 现状**:`useMutation(CREATE_PERSON, { onError, refetchQueries: [{ query: ALL_PERSONS }] })` 高亮 line 6 |
| 2 | 文字 | "This approach is pretty good, **the drawback being that the query is always rerun** with any updates" |
| 3 | 文字 | "It is possible to optimize the solution by **updating the cache manually**. This is done by defining an appropriate update callback for the mutation **instead of** using the refetchQueries attribute. Apollo executes this callback after the mutation completes" |
| 4 | **代码** | **PersonForm 新增 update callback** 高亮行 6-12:`update: (cache, response) => { cache.updateQuery({ query: ALL_PERSONS }, ({ allPersons }) => ({ allPersons: allPersons.concat(response.data.addPerson) })) }` |
| 5 | 文字 | "The callback function is given a reference to the cache and the data returned by the mutation as parameters. For example, in our case, this would be the created person" |
| 6 | 文字 | "Using the function updateQuery the code updates the query ALL_PERSONS in the cache by adding the new person to the cached data" |
| 7 | 文字 | "In some situations, the only sensible way to keep the cache up to date is using the update callback" |
| 8 | 文字 | "When necessary, it is possible to disable cache for the whole application or single queries by setting the field managing the use of cache, fetchPolicy as no-cache" |
| 9 | 文字 | "Be diligent with the cache. Old data in the cache can cause hard-to-find bugs" |
| 10 | 文字 | "There are only two hard things in Computer Science: cache invalidation and naming things" |
| 11 | 文字 | (重复 10)|
| 12 | 文字 | "The current code of the application can be found on Github, branch part8-5" |

## 关键诚实声明 — 课程 trade-off(refetchQueries → update callback)

**这是 part8z 唯一的"策略替换",必须明确**:

| 项 | part8o/part8y(refetchQueries) | part8z(update callback) |
|----|------------------------------|-------------------------|
| useMutation options 字段 | `refetchQueries: [{ query: ALL_PERSONS }]` | `update: (cache, response) => cache.updateQuery(...)` |
| 网络请求 | **每次 mutation 都重发 ALL_PERSONS** | **0 网络请求**,直接修改 cache |
| 实现复杂度 | 1 行 | 7 行 callback |
| 正确性保证 | Apollo 自动重发 → **总是最新** | 手写 cache 更新 → **可能错**(字段名错 / 类型错 / 漏更新)|
| 字段名错后果 | 无(总是最新) | cache 与 server 不一致 → stale data → hard-to-find bug |
| 适用场景 | 简单 mutation | **复杂 mutation / 条件性更新**(per course block 7)|
| 课程推荐 | 简单场景 OK | **复杂场景必需** "the only sensible way"(per block 7)|

### 为什么课程做这个 trade-off?

1. **per course block 2**:"the drawback being that the query is always rerun with any updates" — refetchQueries 的"总是重发"在 mutation 频繁时浪费带宽
2. **per course block 7**:"In some situations, **the only sensible way** to keep the cache up to date is using the update callback" — 课程明示 update 在某些场景是**唯一可行**方案
3. **per course block 9-10**:"cache invalidation and naming things" — 课程强调 cache 更新是硬骨头,update callback 让程序员手动控制 → 风险自担

### 课程 trade-off 的影响

| 用户操作 | part8y(refetchQueries 模式) | part8z(update 模式) |
|---------|---------------------------|---------------------|
| 添加 person | Apollo 重发 ALL_PERSONS → cache 100% 最新 | update callback 直接改 cache → 0 网络请求 |
| update callback 字段名写错 | 无(总是最新) | **stale data** → Persons 列表显示旧数据(经典 cache invalidation bug)|
| 服务端推送给 person 修改 | cache 不刷新(必须 refetch 或 refresh) | cache 不刷新(必须 refetch 或 refresh)|
| 网络断开下 add person | mutation 失败 → onError | mutation 失败 → onError |

⚠️ **风险**:per course block 9-10 警告"Old data in the cache can cause hard-to-find bugs"。课程 commit 这一行 update callback 后,cache 与 server 完全依赖程序员手动同步,这是**真实生产风险**。

✅ **生产代码建议**:可以**同时用** `refetchQueries` + `update`(Apollo Client v3 允许两者并存)— refetch 保证 fallback 正确性,update 提供 0 网络请求优化。**课程不做**。

## 7 个核心概念

1. **Apollo InMemoryCache 自动归一化**(per part8q 沿用)— Person 按 ID 归一化,mutation 返回的 Person 自动归并到 cache
2. **refetchQueries vs update callback 二选一**(本节**新概念**)— 两种 cache 更新策略 trade-off(per 关键诚实声明章节)
3. **cache.updateQuery API**(本节**新概念**)— `cache.updateQuery({ query }, (prevData) => newData)` 接收 prevData 返回 newData
4. **Apollo mutation 响应数据结构**(本节**新概念**)— `response.data.<fieldName>` 是 mutation 返回的对象(本例 `response.data.addPerson`)
5. **不可变更新模式**(per part7 React)— `allPersons.concat(response.data.addPerson)` 而非 `allPersons.push(...)`(per part5 immutable 原则)
6. **onError 与 update 共存**(per part8p + part8z)— 两者不互斥,都可以在 useMutation options 里
7. **Apollo Cache 哲学**(per block 9-10)— "There are only two hard things in Computer Science: cache invalidation and naming things"

## minimum viable improvement(诚实声明)

per discipline "minimum viable additions",personForm.jsx 沿用 part8y 的 1 处改进:
- `setError(error.graphQLErrors[0]?.message || error.message)` — 优先 GraphQLError.message(per part8y 沿用)
- 课程 verbatim 用 `setError(error.message)`,改进是**纯 fallback 兼容**,行为向后兼容

## 验证步骤(你需要自己跑命令)

per discipline "Claude 不替你跑任何命令":

```bash
cd part8/z-updating-cache-revisited
cp .env.example .env
npm install   # 装 @apollo/client graphql react react-dom + dev @vitejs/plugin-react vite
npm run dev   # Vite dev server 默认 http://localhost:5173
```

预期:`VITE ready in xxx ms` + `Local: http://localhost:5173/`

然后**开两个终端**(同 part8y/x,后端相同):

**终端 1(后端,part8u/v)**:
```bash
cd part8/v-friends-list    # 或者 part8u
npm run dev                # → Server ready at http://localhost:4000
```

**终端 2(前端,part8z)**:
```bash
cd part8/z-updating-cache-revisited
npm run dev                # → http://localhost:5173
```

### Step 1:浏览器登录(per part8w Step 1-5)
- 访问 http://localhost:5173
- 在 GraphQL Explorer 创建用户(per part8x Step 3)
- 用 username + password='secret' 登录
- 登录后看到 Persons stub + PersonForm + PhoneForm

### Step 2:验证 addPerson 仍然成功(本节**核心验证 1**)
- 在 PersonForm 输入 name="Cache Test" + street="Foo" + city="Bar" + phone="12345"
- 点 "add!"
- 应该:成功添加 person
- ⭐ 跟 part8y 的**关键差异**:DevTools Network → **应该看不到** ALL_PERSONS query 的 GET(per part8y 是 refetchQueries 自动重发;per part8z 是 update 直接改 cache)
- 准确点:refetchQueries 触发的是 Apollo 内部 query 重新执行,会**有**网络请求(POST GraphQL endpoint)— 这点跟 update 模式难区分(都需要发 GraphQL endpoint),但 update 不依赖服务器响应内容

### Step 3:验证 Persons 列表立即显示新 person(本节**核心验证 2**)
- addPerson 后 → Persons stub(占位 "Persons here")看不到内容
- 但打开 Apollo Client DevTools(浏览器扩展)/ React DevTools → Apollo cache → 应该看到 `allPersons` 数组里**立即**有新新 Cache entry(per update callback)

### Step 4:验证 update callback 字段名错误的 stale data bug(本节**关键诚实验证**)
- 故意改 PersonForm.jsx:`response.data.addPerson` → `response.data.wrongField`(制造字段名错)
- 重启 Vite,刷新页面
- 添加 person → mutation 成功(response.data.addPerson 是正确字段)— 但 update callback 用 wrongField → cache 不更新
- ⚠️ cache 与 server 不一致 → 经典 cache invalidation bug(per course block 9-10 警告)
- 验证后**恢复**正确字段名

### Step 5:DevTools Network 抓包对比(本节**核心验证 3**)
- 触发 addPerson 成功 → DevTools Network → 看到 mutation POST 请求
- 课程 part8z 模式下:**没有**额外的 ALL_PERSONS GET 请求(refetchQueries 模式会有)— Apollo Client v3 把 refetchQueries 实现为额外 POST(不是 GET)— 实际生产中差异不大,主要看 cache 是否更新

### Step 6:PhoneForm 仍然 try/catch 模式(per part8y 沿用)
- PhoneForm 不受 part8z 改造影响,仍然用 try/catch(per part8y block 10)
- 验证 phone="1234" 仍然能捕获 server GraphQLError(per part8y Step 5)

### Step 7:验证 PhoneForm trade-off 仍然存在(per part8y 沿用)
- PhoneForm name="NotExist" → **静默失败**(per part8y trade-off)— part8z 不修这个

## 兑现的伏笔

来自 part8w/x/y 的"故意不做"清单:

- ✅ **update callback 精确控制 cache 更新**(per part8o/y 升级版)— part8z 实现 update callback(per block 4)
- ✅ **零网络请求更新 cache**(per part8o/y "总是重发 ALL_PERSONS" 缺点)— part8z 不重发
- ✅ **Apollo Client cache invalidation 哲学**(per block 9-10)— part8z 文档化这个理念

## 故意不做(诚实声明)

per discipline "minimum viable additions" + 课程严格按 block 4 + 后续文字段落:

- ❌ **refetchQueries + update 双保险** — 课程**故意**用 update 替代(per block 3 "instead of"),生产代码可以同时用
- ❌ **Persons 完整版** — per part8w README:等"Listing persons"小节
- ❌ **allPersons 完整版**(带 address 嵌套)— per part8w README:等"Listing persons"小节
- ❌ **cache.modify API**(per Apollo Client v3)— 课程只讲 cache.updateQuery,cache.modify 是更精细的 API,文档化在 block 8 文字但**不演示**
- ❌ **fetchPolicy: 'no-cache'**(per block 8)— 课程文字提及但不演示
- ❌ **fetchPolicy: 'cache-and-network' / 'cache-first' / 'network-only' 等其他策略** — 课程不演示
- ❌ **Persons/PhoneForm 的 cache 更新** — 课程只演示 PersonForm 的 update callback,PhoneForm 不涉及 cache 更新(editNumber 单 person 自动归一化,不需要 update)
- ❌ **Apollo Client DevTools 安装** — 用户自己装(https://chrome.google.com/webstore/detail/apollo-client-developer-tools/jdkknkkbebbapilgoecccglkdmbanhki)

## 后端对接验证(per part8u/v README 的 resolvers)

| 前端操作 | 后端 schema + resolver(part8u/v) | 一致性 |
|---------|----------------------------------|--------|
| PersonForm addPerson | addPerson resolver(per part8v 鉴权)→ mongoose person.save → 返回 Person | ✅ |
| update callback | 用 `response.data.addPerson`(mutation 返回字段)| ✅ |
| PhoneForm editNumber | editNumber resolver(per part8j 无鉴权)→ mongoose person.save → 返回 Person | ✅ |

✅ **结论**:前端 part8z update callback + 后端 part8u/v 解锁了"零网络请求精确更新 cache"。

## Troubleshooting

| 症状 | 可能原因 | 修复 |
|------|---------|------|
| addPerson 成功但 Persons 列表没显示新 person | update callback 写错 / `response.data.addPerson` 字段名错 | 看 PersonForm.jsx update callback 是否正确 |
| cache 与 server 不一致 | update callback 字段名错 / 类型错 / 漏更新 | 用 Apollo Client DevTools 检查 cache + 必要时 client.resetStore() |
| DevTools Network 看到 ALL_PERSONS 重新请求 | 这是 Apollo Client v3 内部行为(update 也可能触发)— 不是 bug | 用 Apollo Client DevTools 确认 cache 正确更新 |
| 浏览器报错 "cache.updateQuery is not a function" | Apollo Client 版本不对(per package.json `^3.11.0`)| `npm install` 重新装 |
| Persons stub 看不到内容(per part8w 沿用)| Persons 是 STUB 渲染字面 "Persons here",不是 bug | 等"Listing persons"小节 |
| PhoneForm 改不存在的人没反应 | per part8y trade-off(per 关键诚实声明)| 接受或加 onCompleted 双保险 |
| addPerson 提示 "not authenticated" | 没登录 / token 失效 / Authorization header 没加 | 重新登录(per part8x Step 5 验证 Authorization header)|
| 浏览器缓存了 part8y 老版 PersonForm.jsx | Vite HMR 没刷新 main.jsx 引用链 | Ctrl+Shift+R 强刷 / 重启 Vite |

## 下一步(per course 顺序)

- ✅ part8w User login
- ✅ part8x Adding a token to a header
- ✅ part8y Fixing validations
- ✅ part8z Updating cache, revisited(本子节)
- ⏭️ Exercises 18-24(library app 的 6 个练习题)— per 课程策略:**跳过练习题**
- ⏭️ Chapter 6: Fragments and subscriptions(待映射 part8 字母)— `gql\`fragment PersonDetails on Person { ... }\`` + `subscription { bookAdded }` 等

我们 part8z 落地后,**Chapter 5 完结**。下一步是 Chapter 6 — Fragments and subscriptions。

## 通道状态表(本子节)

| 通道 | 状态 | 备注 |
|------|------|------|
| chrome-devtools MCP evaluate_script | OK | 抓 Updating cache, revisited 13 blocks(idx 0-12)|
| PowerShell Copy-Item | OK | 创建 z-updating-cache-revisited/ + copy 12 verbatim 文件 |
| Write GateGuard | OK | 1 次 Write 提供 facts 后通过(PersonForm.jsx)|
| Bash mkdir | OK | 创建 src/components/ 子目录 |
| AskUserQuestion | OK | 用户选"新建 part8z-updating-cache-revisited/ (Recommended)" |
| WebSearch / WebFetch | SKIP | per 硬约束 |