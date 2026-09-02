# part8x — Adding a token to a header(Chapter 5 第 2 子节)

> **课程 URL**:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-5
>
> **本章小节**:User login → **Adding a token to a header**(本子节)→ Fixing validations → Updating cache, revisited
>
> **本子节对应课程章节**:Chapter 5 "Adding a token to a header"(第 2 个 H2)
>
> **架构延续**:本子节是 part8w library frontend 的延续(只改 main.jsx)

## 子项目结构

```
x-adding-token-frontend/
├── .env.example                (verbatim part8w 沿用 — VITE_BACKEND_URL 占位)
├── .gitignore                  (verbatim part8w 沿用 — node_modules + .env + dist)
├── index.html                  (verbatim part8w 沿用 — Vite 入口)
├── package.json                (verbatim part8w 沿用 — React 19.2 + Apollo 3.11 + Vite 7.2.4)
├── vite.config.js              (verbatim part8w 沿用 — react() plugin)
├── README.md                   (本文件)
└── src/
    ├── main.jsx                ⭐ **改** — 加 setContext + authLink.concat(httpLink)(verbatim 课程 block 21)
    ├── App.jsx                 (verbatim part8w 沿用 — token + LoginForm + logout)
    ├── queries.js              (verbatim part8w 沿用 — LOGIN + ALL_PERSONS)
    └── components/
        ├── LoginForm.jsx       (verbatim part8w 沿用 — useMutation + localStorage)
        ├── Notify.jsx          (verbatim part8w 沿用 — 8 行错误展示)
        ├── Persons.jsx         (STUB — 渲染 "Persons here")
        ├── PersonForm.jsx      (STUB — 渲染 "PersonForm here")
        └── PhoneForm.jsx       (STUB — 渲染 "PhoneForm here")
```

## 改造范围表

| 文件 | 状态 | 来源 |
|------|------|------|
| `.env.example` | 🔁 copy | verbatim part8w 沿用 |
| `.gitignore` | 🔁 copy | verbatim part8w 沿用 |
| `index.html` | 🔁 copy | verbatim part8w 沿用 |
| `package.json` | 🔁 copy | verbatim part8w 沿用(@apollo/client ^3.11.0) |
| `vite.config.js` | 🔁 copy | verbatim part8w 沿用 |
| `src/main.jsx` | ⭐ **改** | verbatim 课程 block 21 + v3.11 API 适配(setContext 工厂函数)|
| `src/App.jsx` | 🔁 copy | verbatim part8w 沿用 |
| `src/queries.js` | 🔁 copy | verbatim part8w 沿用 |
| `src/components/LoginForm.jsx` | 🔁 copy | verbatim part8w 沿用 |
| `src/components/Notify.jsx` | 🔁 copy | verbatim part8w 沿用 |
| `src/components/Persons.jsx` | 🔁 copy | verbatim part8w 沿用(STUB)|
| `src/components/PersonForm.jsx` | 🔁 copy | verbatim part8w 沿用(STUB)|
| `src/components/PhoneForm.jsx` | 🔁 copy | verbatim part8w 沿用(STUB)|

**改造核心**:1 个文件改 + 12 个文件 copy + 1 个 README 新写。

## 课程原文摘要(Chapter 5 "Adding a token to a header" — 5 course-material-blocks)

| Block | 类型 | 内容摘要 |
|-------|------|---------|
| 19 | H2 | "Adding a token to a header" |
| 20 | 文字 | "After the backend changes, creating new persons requires that a valid user token is sent with the request. This requires changes to the Apollo Client configuration in the main.jsx file" |
| 21 | 代码 | `main.jsx` 完整版 verbatim,**高亮行 7, 9-17, 19, 21-24**(import { SetContextLink } + authLink + httpLink + authLink.concat(httpLink))|
| 22 | 文字 | "As before, the server URL is wrapped using the HttpLink constructor to create a suitable httpLink object. This time, however, it is modified using the context defined by the authLink object so that, for each request, the authorization header is set to the token that may be stored in localStorage" |
| 23 | 文字 | "Creating new persons and changing numbers works again" |

## 关键诚实声明 — v4 SetContextLink → v3.11 setContext API 降级

**这是 part8x 唯一的"verbatim 偏差"**,必须明确:

| 项 | 课程 verbatim | 本项目实际 | 说明 |
|----|-------------|-----------|------|
| import | `import { SetContextLink } from '@apollo/client/link/context'` | `import { setContext } from '@apollo/client/link/context'` | 名字不同 |
| 用法 | `const authLink = new SetContextLink((...) => ({...}))` | `const authLink = setContext((...) => ({...}))` | class vs factory |
| 链接 | `authLink.concat(httpLink)` | `authLink.concat(httpLink)` | 相同 |
| 所属版本 | Apollo Client v4(2025+ 发布) | Apollo Client v3.11(per part8k 沿用) | 不同 |

### 为什么不能 verbatim SetContextLink?

- 课程官网 chapter-5 最近更新,用了 v4 的 `SetContextLink` class API
- 本项目 part8x 钉死 `@apollo/client: ^3.11.0`(per part8k 沿用,所有 part8w-r 都依赖这个版本)
- v3.11 的 `@apollo/client/link/context` 模块**实测只导出** `setContext` 工厂函数 + `ContextSetter` 类型
  - **验证方法**:解压 `@apollo/client-3.11.0.tgz` 看 `package/link/context/index.d.ts`:
    ```ts
    export type ContextSetter = (operation, prevContext) => Promise<...> | ...
    export declare function setContext(setter: ContextSetter): ApolloLink
    ```
  - **没有** `SetContextLink` 导出
- 直接 verbatim `new SetContextLink(...)` 在 v3.11 下会报 `SetContextLink is not defined`

### 选型理由

1. **不升 Apollo 到 v4**:v4 是 major 版本(2025+ 发布),可能影响后续 part8x+ 小节依赖,破坏 part8k-w 沿用一致性
2. **用 v3 等价 API**:`setContext` 工厂函数是 v3 标准,功能完全等价(都返回 ApolloLink,都用于注入 header context)
3. **诚实声明**:本 README + main.jsx 注释都明确标注这是"v4 课程 → v3.11 实现"的等价降级

### 对照表

```js
// v4(课程 verbatim,本项目不用)
import { SetContextLink } from '@apollo/client/link/context'
const authLink = new SetContextLink(({ headers }) => {
  // ...
})

// v3.11(本项目实际,功能等价)
import { setContext } from '@apollo/client/link/context'
const authLink = setContext((_, { headers }) => {
  // ...
})
```

## 7 个核心概念

1. **Apollo Link chain(链路链)**(本节**新概念**)— `link` 字段不再是单个 link,而是可以 `authLink.concat(httpLink)` 链接多个 link
2. **authLink 模式**(本节**新概念**)— 用 `setContext` 在每条 GraphQL 请求前注入 `Authorization` header
3. **localStorage 'phonebook-user-token'** 同步读取(per part8w LoginForm + App.jsx)— 同 key 一致
4. **`Bearer ${token}`** HTTP 标准格式— 后端 part8u/v `getUserFromAuthHeader` 期望这个格式
5. **link 顺序很重要**— `authLink.concat(httpLink)`,authLink 必须先于 httpLink
6. **headers spread 模式** `{ ...headers, authorization: ... }` — 保留其他 link 加的 header
7. **authorization 字段 null vs "Bearer ..."** — token 不存在时 `authorization: null`(Apollo 不传 header),让后端 ctx.currentUser = null

## 验证步骤(你需要自己跑命令)

per discipline "Claude 不替你跑任何命令":

```bash
cd part8/x-adding-token-frontend
cp .env.example .env
npm install   # 装 @apollo/client graphql react react-dom + dev @vitejs/plugin-react vite
npm run dev   # Vite dev server 默认 http://localhost:5173
```

预期:`VITE ready in xxx ms` + `Local: http://localhost:5173/`

然后**开两个终端**(同 part8w,后端相同):

**终端 1(后端,part8u/v)**:
```bash
cd part8/v-friends-list    # 或者 part8u
npm run dev                # → Server ready at http://localhost:4000
```

**终端 2(前端,part8x)**:
```bash
cd part8/x-adding-token-frontend
npm run dev                # → http://localhost:5173
```

### Step 1:打开浏览器 + DevTools Network
- 访问 http://localhost:5173
- 打开 DevTools → Network tab → 勾选 "Preserve log"

### Step 2:首次访问(未登录)
- 应该看到 LoginForm(per part8w 沿用)
- **不应该**看到 GraphQL 请求(localStorage 没 token,ALL_PERSONS 没触发?实际 App.jsx useQuery(ALL_PERSONS) 立即触发,所以会有 1 条请求)
- 点开请求 → Headers → **应该有** `authorization: null` 或**没有** authorization 字段
  - token null → setContext 返回 `{ headers: { ...headers, authorization: null } }` → Apollo 把 null 当作不传

### Step 3:登录前先 createUser
打开 GraphQL Explorer(http://localhost:4000),跑:
```graphql
mutation {
  createUser(username: "alice") {
    username
    id
  }
}
```

### Step 4:登录拿 token
- username: alice
- password: secret(per part8u 硬编码)
- 点 login → 拿到 JWT → 写入 localStorage 'phonebook-user-token'

### Step 5:验证 Authorization header(本节**核心验证**)
- DevTools Network → 触发任意 GraphQL 请求(可以刷新页面 → ALL_PERSONS 自动触发)
- 点开请求 → Headers → **应该有** `authorization: Bearer eyJhbGc...`(Bearer 大写 B + 空格 + JWT)
- **如果没看到 Authorization header → setContext 没生效**,可能 import 路径错或 v4 API 被误用

### Step 6:后端 console 验证(可选,更可靠)
后端终端(part8u/v)打 console.log(`currentUser: ${currentUser?.username}`),触发 ALL_PERSONS 请求时应该看到 `currentUser: alice`(说明 token 被后端解出 user 了)

### Step 7:logout 后验证
- 点 logout → localStorage 清空 + Apollo cache reset
- 触发新请求 → Headers 里 authorization 应该**不传**(token null → authorization: null → 不传 header)
- 后端 console 应该看到 `currentUser: null`

### Step 8:跨请求验证
- 当前步骤不需要主动 mutation/personForm,但**课程 block 23 说**:"Creating new persons and changing numbers works again"
- 即:本节是 part8u/v 后端强制 addPerson/editNumber 需要 Authorization 的**前端解封**
- 验证:用 GraphQL Explorer 直接打(没 header)→ `Bad authentication`(per part8u README 风格)
- 通过前端(有 header)→ 成功

## 兑现的伏笔

来自 part8w 的"故意不做"清单:

- ✅ **后端强制 addPerson 需要 Authorization**(per part8u)— 现在前端 part8x 自动加 header,addPerson 可以成功
- ✅ **后端强制 editNumber 需要 Authorization**(per part8u)— 同上
- ✅ **自动添加 Authorization header**(per part8w README "故意不做"清单)— 现在做

## 故意不做(诚实声明)

per discipline "minimum viable additions" + 课程严格按 block 21:

- ❌ **token 过期处理** — 课程 block 21 没做;`setContext` 不知道 token 是否过期,只管加 header
- ❌ **token 刷新逻辑** — 没 refresh token 概念
- ❌ **登出时主动清 Apollo HttpLink 缓存** — setContext 不持有 ref,改不动
- ❌ **setContext 异步版本** — 课程用同步 localStorage,如果要"调用 /refresh 后再发"需要 async setContext,per Apollo docs 支持但课程不演示
- ❌ **ApolloErrorLink**(401 自动 logout)— 课程不演示;课程 block 22/23 只描述功能
- ❌ **服务端渲染 SSR 适配** — 课程用纯 CSR(浏览器环境,localStorage 可用);SSR 需要 server-side link

## 后端对接验证(per part8u README 的 getUserFromAuthHeader)

| 前端字段 | 后端处理(part8u/v) | 一致性 |
|---------|---------------------|--------|
| `Authorization: Bearer eyJ...` | `getUserFromAuthHeader(auth)` → `jwt.verify(token, JWT_SECRET)` → `User.findById` → `ctx.currentUser` | ✅ |
| `Authorization: null` 或**无 header** | `ctx.currentUser = null` | ✅ |
| 错的 token / 过期 token | `jwt.verify` 抛 TokenError → `currentUser = null` | ✅ |

✅ **结论**:前端 part8x 自动加 header 后,后端 part8u/v 的 `me` query + addPerson/editNumber 鉴权才能正常工作。

## Troubleshooting

| 症状 | 可能原因 | 修复 |
|------|---------|------|
| `SetContextLink is not defined` | 用了课程 v4 API verbatim,但项目钉死 v3.11 | 改用 `setContext` 工厂函数(per 本 README "关键诚实声明")|
| `setContext is not a function` | 用了 v4 `import { setContext } from 'apollo-link-context'`(老路径)| 用 `@apollo/client/link/context`(v3 标准路径) |
| DevTools Network 看不到 Authorization header | setContext 没生效 / Apollo cache hit(没真发请求)| 强制刷新 + 勾 Network "Disable cache" |
| header 是 `authorization: null` 不是 `Bearer ...` | token 没存到 localStorage | DevTools → Application → Local Storage 看 'phonebook-user-token' |
| header 是小写 `bearer ...` 不是 `Bearer ...` | 课程 verbatim 用 Bearer 大写,改小写会失败 | 恢复 `Bearer ${token}`(大写 B)|
| 后端说 "Bad authentication" | JWT_SECRET 没配 / token 过期 / token 格式错 | 检查后端 .env JWT_SECRET + 看后端 console log |
| 改了 main.jsx 但前端没刷新 | Vite HMR 没触发 / 浏览器缓存 | Ctrl+Shift+R 强刷 + 重启 `npm run dev` |
| ALL_PERSONS loading... 一直不结束 | 后端没启 / VITE_BACKEND_URL 配错 | 看后端 terminal + check .env |

## 下一步(per course 顺序)

- ✅ part8w User login
- ✅ part8x Adding a token to a header(本子节)
- ⏭️ **Chapter 5 第 3 小节**:"Fixing validations"(per course H2)— server-side validation 错误如何前端友好处理
- ⏭️ Chapter 5 第 4 小节:"Updating cache, revisited"(per course H2)— `update` callback 精确控制 cache 更新
- ⏭️ Exercises 18-24(library app 的 6 个练习题)— per 课程策略:**跳过练习题**

我们 part8x 落地后,**下一步是 part8y "Fixing validations"**(待映射字母)。

## 通道状态表(本子节)

| 通道 | 状态 | 备注 |
|------|------|------|
| chrome-devtools MCP navigate_page | OK | 已在 chapter-5 页面 |
| chrome-devtools MCP evaluate_script | OK | 抓 Adding token 5 个 course-material-blocks(19-23)|
| Context7 MCP query-docs | OK | 确认 SetContextLink 是 v4 API |
| npm registry API(Bash curl)| OK | 拉 @apollo/client-3.11.0 metadata |
| 解压 tarball 验证 API(Bash tar)| OK | 验证 v3.11 只有 setContext 没有 SetContextLink |
| WebFetch npm/github | FAIL | 403/404 多平台屏蔽 |
| WebSearch | SKIP | per 硬约束 |
| 本地 Bash mkdir + PowerShell Copy-Item | OK | 创建 x-adding-token-frontend/ + copy 13 文件 |
| Write GateGuard | OK | 每次 Write 提供 facts 后通过 |
| Edit GateGuard | OK | 3 次 Edit 都提供 facts 后通过 |
