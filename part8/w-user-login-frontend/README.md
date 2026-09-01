# part8w — User login(Chapter 5 第 1 子节)

> **课程 URL**:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-5
>
> **本章小节**:User login → Adding a token to a header → Fixing validations → Updating cache, revisited
>
> **本子节对应课程章节**:Chapter 5 "User login"(第 1 个 H2)
>
> **架构大切换**:这是 part8 **第一次进入前端范畴**(之前 part8k-q 是 phonebook 旧前端,part8r-v 是纯后端)

## 子项目结构

```
w-user-login-frontend/
├── .gitignore                  (verbatim part8p 沿用 — node_modules + .env + dist)
├── .env.example                (新 — VITE_BACKEND_URL 占位)
├── README.md                   (本文件)
├── index.html                  (verbatim part8k 沿用 — Vite 入口)
├── package.json                (verbatim part8k 沿用 — React 19.2 + Apollo 3.11 + Vite 7.2.4)
├── vite.config.js              (verbatim part8k 沿用 — react() plugin)
└── src/
    ├── main.jsx                (verbatim part8p 沿用 — ApolloProvider + uri 用 env)
    ├── App.jsx                 (verbatim 课程 block 7 + 12 — token state + LoginForm + logout)
    ├── queries.js              (LOGIN verbatim 课程 + ALL_PERSONS 最小 stub)
    └── components/
        ├── LoginForm.jsx       (verbatim 课程 block 3 — useMutation + onCompleted/onError + localStorage)
        ├── Notify.jsx          (verbatim part8p 沿用 — 8 行错误展示)
        ├── Persons.jsx         (STUB — 渲染 "Persons here")
        ├── PersonForm.jsx      (STUB — 渲染 "PersonForm here")
        └── PhoneForm.jsx       (STUB — 渲染 "PhoneForm here")
```

## 改造范围表

| 文件 | 状态 | 来源 |
|------|------|------|
| `.gitignore` | 🆕 新建 | verbatim part8p 沿用 |
| `.env.example` | 🆕 新建 | 引入 VITE_BACKEND_URL |
| `package.json` | 🆕 新建 | verbatim part8k 沿用(同版本号)|
| `vite.config.js` | 🆕 新建 | verbatim part8k 沿用 |
| `index.html` | 🆕 新建 | verbatim part8k 沿用 |
| `src/main.jsx` | 🆕 新建 | verbatim part8p 沿用 + uri 改用 env |
| `src/queries.js` | 🆕 新建 | LOGIN verbatim course + ALL_PERSONS 最小 stub |
| `src/components/Notify.jsx` | 🆕 新建 | verbatim part8p 沿用 |
| `src/components/LoginForm.jsx` | 🆕 新建 | **verbatim 课程 block 3** |
| `src/components/Persons.jsx` | 🆕 新建 | **STUB**(用户选择:全部 stub 占位)|
| `src/components/PersonForm.jsx` | 🆕 新建 | **STUB**(用户选择:全部 stub 占位)|
| `src/components/PhoneForm.jsx` | 🆕 新建 | **STUB**(用户选择:全部 stub 占位)|
| `src/App.jsx` | 🆕 新建 | verbatim 课程 block 7 + 12 合并 |

## 课程原文摘要(Chapter 5 "User login" — 14 course-material-blocks)

| Block | 类型 | 内容摘要 |
|-------|------|---------|
| 0 | 文字 | "Let's first define the mutation for logging in in the file src/queries.js" |
| 1 | 代码 | `LOGIN` mutation verbatim(username + password → Token.value)|
| 2 | 文字 | "Let's define the LoginForm component in src/components/LoginForm.jsx" |
| 3 | 代码 | `LoginForm` 完整组件 verbatim(useState × 2 + useMutation + onCompleted/onError + localStorage + form JSX)|
| 4 | 文字 | "The component receives the functions setError and setToken as props" |
| 5 | 文字 | "onCompleted callback ... stored in the application state and in localStorage" |
| 6 | 文字 | "Let's now use the LoginForm component in the App.jsx file. We add a token variable..." |
| 7 | 代码 | `App` 第一版(token 来自 localStorage + if (!token) render LoginForm)|
| 8 | 文字 | "The token is now initialized from a token value that may be found in localStorage" |
| 9 | 代码 | `const [token, setToken] = useState(localStorage.getItem('phonebook-user-token'))` 单行 |
| 10 | 文字 | "This way, the token is also restored when the page is reloaded, and the user stays logged in" |
| 11 | 文字 | "We also add a button that allows a logged-in user to log out" |
| 12 | 代码 | `App` 第二版(useApolloClient + onLogout + client.resetStore())|
| 13 | 文字 | "Clearing the cache is important, because some queries may have fetched data into the cache that only an authenticated user is allowed to access" |

## 9 个核心概念

1. **Apollo Client + Vite + React 标准前端工程组合**(per part8k 引入,part8w 沿用)— ApolloProvider 包裹 + InMemoryCache 默认 + HttpLink 直连后端
2. **GraphQL operation 集中到 src/queries.js**(per part8o 模式,part8w 加 LOGIN)— 单一来源 + import 共享
3. **useMutation 的两个回调**(per part8p onError + part8w onCompleted 双模式)— onCompleted 成功 / onError 失败
4. **localStorage 持久化 token**(本节**新概念**)— `localStorage.setItem('phonebook-user-token', token)` + 启动时 `useState(localStorage.getItem(...))` 恢复
5. **token 是登录状态唯一来源**(per App.jsx)— `if (!token)` 走 LoginForm / 否则走 Persons+logout
6. **useApolloClient hook 拿 client 实例**(本节**新概念**)— `const client = useApolloClient()` + `client.resetStore()` 清 cache
7. **Apollo cache resetStore 用法**(per course block 11-13)— logout 时清整个 cache,防止 user A 的数据泄露给 user B
8. **course block 拆分多个代码块**(block 3 / 7 / 9 / 12)— 课程刻意拆分展示过程,part8w 合并到单一文件
9. **stub 占位组件策略**(用户选择)— Persons/PersonForm/PhoneForm 暂用字面文本,等 Chapter 5 后续小节替换

## 验证步骤(你需要自己跑命令)

per discipline "Claude 不替你跑任何命令":

```bash
cd part8/w-user-login-frontend
cp .env.example .env
# .env 里 VITE_BACKEND_URL 默认是 http://localhost:4000
npm install   # 装 @apollo/client graphql react react-dom + dev @vitejs/plugin-react vite
npm run dev   # Vite dev server 默认 http://localhost:5173
```

预期:`VITE ready in xxx ms` + `Local: http://localhost:5173/`

然后**开两个终端**:

**终端 1(后端,part8u/v)**:
```bash
cd part8/v-friends-list    # 或者 part8u
cp .env.example .env       # 配 MONGODB_URI + JWT_SECRET
npm run dev                # → Server ready at http://localhost:4000
```

**终端 2(前端,part8w)**:
```bash
cd part8/w-user-login-frontend
npm run dev                # → http://localhost:5173
```

### Step 1:打开浏览器
- 访问 http://localhost:5173
- 应该看到 "Login" h2 + username/password 输入框 + login 按钮
- 应该看到 "Notify here" 之类的占位文字 — 等等,实际上 Notify 只在有 errorMessage 时才渲染
- 应该看到 "Persons here" / "PersonForm here" / "PhoneForm here" 占位 — 不对,这些只在**已登录态**才显示

### Step 2:首次访问(未登录)
- 浏览器应该渲染 LoginForm
- localStorage 里没有 'phonebook-user-token' → token state 是 null → 进入未登录分支
- DevTools → Application → Local Storage → http://localhost:5173 → 应该有 `phonebook-user-token` 为 null

### Step 3:尝试登录(后端要先 createUser)
在 GraphQL Explorer (http://localhost:4000) 先创建一个用户:
```graphql
mutation {
  createUser(username: "alice") {
    username
    friends { name }
    id
  }
}
```
成功 → 返回 User 对象。

### Step 4:回到前端输入用户名 + 任意密码
- username: alice
- password: secret(per part8u 简化,任意值都行,但用 'secret' 语义最清晰)
- 点 login 按钮
- 应该立即跳到 "已登录" 界面:
  - logout 按钮
  - "Persons here" 占位
  - "PersonForm here" 占位
  - "PhoneForm here" 占位
- DevTools → Local Storage → 应该有 `phonebook-user-token` 是 JWT 字符串(eyJ 开头)

### Step 5:刷新页面
- 浏览器应该**保持已登录态**(token 从 localStorage 恢复)
- 不应该重新跳回 LoginForm

### Step 6:点 logout 按钮
- 应该立即跳回 LoginForm
- DevTools → Local Storage → `phonebook-user-token` 应该消失
- Apollo cache 应该被清空(下次刷新时 ALL_PERSONS 重新请求)

### Step 7:错误路径(per course block 5 + part8p onError 模式)
- username 输入不存在的人(比如 "ghost")
- 提交 → 后端 part8u login resolver:`if (!user || args.password !== 'secret') throw GraphQLError('wrong credentials')`
- 前端 LoginForm 的 onError 回调 → setError → notify → Notify 红字 "wrong credentials"
- 10 秒后红字自动消失

## 兑现的伏笔

来自 part8 系列之前的"待待做"清单:

- ✅ **前端 login form** — LoginForm.jsx 新建(per course block 3)
- ✅ **localStorage token 持久化** — LoginForm.jsx onCompleted + App.jsx useState(localStorage.getItem...)(per course block 7-10)
- ✅ **客户端拿到 Apollo client 实例** — useApolloClient hook(per course block 12)
- ✅ **logout 时清 Apollo cache** — client.resetStore()(per course block 12-13)
- ✅ **errorMessage 自动 10s 清除**(per part8p)— notify 函数 setTimeout(10000)沿用

## 故意不做(诚实声明)

per discipline "minimum viable additions" + 用户选择:

- ❌ **Persons 完整组件**(per part8l)— stub 占位,等 Chapter 5 "Listing persons"小节(part8x,待映射字母)
- ❌ **PersonForm 完整组件**(per part8n)— stub 占位,等 Chapter 5 "Doing mutations"小节
- ❌ **PhoneForm 完整组件**(per part8q)— stub 占位,等 Chapter 5 "Doing mutations"小节
- ❌ **完整 ALL_PERSONS query**(带 address + id)— 最小版本 only name + phone,等 Chapter 5 "Listing persons"小节补
- ❌ **修改密码 hashing**(per part8u 简化)— 课程硬编码 'secret',前端任意 password 都能登录
- ❌ **token 过期处理** — per part8u 简化,jwt.sign 无 expiresIn
- ❌ **自动添加 Authorization header** — Chapter 5 下一小节 "Adding a token to a header" 才做(per course block 14+)
- ❌ **fixing validations** — Chapter 5 第三小节才做(per course block 18+)
- ❌ **updating cache 精确控制** — Chapter 5 第四小节才做(per course block 25+)
- ❌ **课程源码原文搬运** — 课程 Chapter 5 "User login" 是 library app frontend(books/authors),我们延用 phonebook backend(part8u/v),所以代码是"verbatim 课程结构 + 适配 phonebook backend 字段"

## 跟 part8u/v 后端的对接验证

| 前端字段 | 后端 schema(part8u/v) | 一致性 |
|---------|---------------------|--------|
| `LOGIN` 字段 `username: String!` | `Mutation.login(username, password): Token` | ✅ |
| `LOGIN` 字段 `password: String!` | 同上 | ✅ |
| `LOGIN` 返回 `value: String!` | `type Token { value: String! }` | ✅ |
| `ALL_PERSONS` 返回 `name phone` | `type Person { name, phone, address, id }` | ✅(可只取子集)|

✅ **结论**:前端可以无缝对接后端 part8u/v(也兼容 part8u,因为 login + allPersons 两个 mutation/query 都从 part8u 开始就有)。

## Troubleshooting

| 症状 | 可能原因 | 修复 |
|------|---------|------|
| 浏览器 Network tab 报 CORS error | 后端 part8u/v 没启 CORS | per part8o README:Apollo Server v4 startStandaloneServer 默认开 CORS;如果手动改过,加 `cors: { origin: '*' }` |
| `Could not find Apollo Client context` | 没用 ApolloProvider 包裹 | per main.jsx:确认 `<ApolloProvider client={client}>` 包了 `<App />` |
| `login failed: wrong credentials` 红字 | username 不存在 | 先在 GraphQL Explorer 跑 createUser mutation(per Step 3)|
| token 拿到了但 ALL_PERSONS 失败 | 后端没启动或 MONGODB_URI 没配 | 检查后端终端 `Server ready at http://localhost:4000` + .env 配 Atlas URI |
| 刷新后跳回 LoginForm | localStorage 没存上 | DevTools → Application → Local Storage → 看 'phonebook-user-token' 是否存在 |
| 点了 logout 但 token 还在 localStorage | `localStorage.clear()` 没执行 | 检查 onLogout 函数(per App.jsx line 95-99)|
| 点 logout 后 Persons 仍显示旧数据 | `client.resetStore()` 没执行 | 刷新页面或 DevTools → Apollo Client DevTools 查 cache |

## 下一步(per course 顺序)

- **Chapter 5 第 2 小节**:"Adding a token to a header"(per course H2)— 把 localStorage 的 token 自动加到 Apollo Client 的请求 header(`Authorization: Bearer <token>`)
- **Chapter 5 第 3 小节**:"Fixing validations"(per course H2)— server-side validation 错误如何前端友好处理
- **Chapter 5 第 4 小节**:"Updating cache, revisited"(per course H2)— `update` callback 精确控制 cache 更新
- **Chapter 5 第 5-11 小节**:"Exercises 18-24"(library app 的 6 个练习题)— per 课程策略:**跳过练习题**

我们 part8w 落地后,**下一步是 part8x "Adding a token to a header"**(待映射字母)。

## 通道状态表(本子节)

| 通道 | 状态 | 备注 |
|------|------|------|
| chrome-devtools MCP navigate_page | OK | chapter-4 → chapter-5 |
| chrome-devtools MCP evaluate_script | OK | 抓 User login 14 个 course-material-block |
| WebSearch / WebFetch | SKIP | per 硬约束 |
| 本地 Bash mkdir | OK | 创建 w-user-login-frontend/ 目录 |
| 本地 Bash cp / Write | OK | 13 个文件写入 |
| Edit GateGuard | OK | 每次 Write 提供 facts 后通过 |