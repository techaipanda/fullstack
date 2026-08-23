# part8 a — Apollo Server(v4 standalone,verbatim 课程 Chapter 2 "Apollo Server" 段)

> **本子项目作用**:把课程 Chapter 2 "GraphQL Server" 里的 **Apollo Server** 段(从 `npm init` 到 `startStandaloneServer` 启动)做成**最小可跑的 standalone Apollo Server v4 demo**。
>
> **运行方式**:**单终端** `npm start`(或 `npm run dev`,都是 `node index.js`),然后浏览器访问 `http://localhost:4000` 进入 Apollo Sandbox 测试 3 个 Query。

---

## 课程原文要点(verbatim 摘录)

> "Let's implement a GraphQL server with today's leading library: [Apollo Server](https://www.apollographql.com/docs/apollo-server/)."

> "Create a new npm project with `npm init` and install the required dependencies."

> "Also create a `index.js` file in your project's root directory. The initial code is as follows: ..."

> "The heart of the code is an [ApolloServer](https://www.apollographql.com/docs/apollo-server/api/apollo-server/), which is given two parameters:"

> "The first parameter, `typeDefs`, contains the GraphQL schema."

> "The second parameter is an object, which contains the [resolvers](https://www.apollographql.com/docs/apollo-server/data/resolvers/) of the server. These are the code, which defines *how* GraphQL queries are responded to."

> "When Apollo server is run in development mode the page [http://localhost:4000](http://localhost:4000/) takes us to [GraphOS Studio Explorer](https://www.apollographql.com/docs/graphos/platform/explorer). This is very useful for a developer, and can be used to make queries to the server."

---

## ⭐ 核心概念(本子项目演示的 5 个,均在代码 ⭐ 注释里)

### ⭐ Apollo Server v4 + standalone 模式
- 课程用 v4(2026 当前主版本)
- `startStandaloneServer`(来自 `@apollo/server/standalone`)是**最小可跑模式**,自带 HTTP server + CORS + body parsing + 默认路由,不用写 Express
- 与 v2/v3 的 `apollo-server` 包不同:v4 把 HTTP server 拆成 standalone / Express / Fastify / Fastify / Next.js 等独立 integration 包

### ⭐ typeDefs = SDL schema
- `typeDefs` 是一个**字符串**(GraphQL SDL = Schema Definition Language)
- 描述:
  - 1 个 Object type:`Person`(5 字段)
  - 1 个 Root type:`Query`(3 字段:`personCount` / `allPersons` / `findPerson`)
- `!` 标记 = Non-Null(必须有值);不加 `!` = nullable
- `ID!` = GraphQL 内置标量,字符串但保证唯一

### ⭐ resolvers = Query 字段的实现
- `resolvers` 是一个 **JS 对象**,键 = type 名,值 = 该 type 下每个字段的函数
- Apollo 把 schema 字段名和 resolver 函数名一一对应:
  - `Query.personCount` → `resolvers.Query.personCount`
  - `Query.allPersons` → `resolvers.Query.allPersons`
  - `Query.findPerson` → `resolvers.Query.findPerson`
- 函数返回什么,客户端就拿到什么

### ⭐ Apollo Sandbox(原 Apollo Studio Explorer)
- 启动后访问 `http://localhost:4000`,浏览器自动跳到 **Apollo Sandbox**
- 左栏:基于 schema 自动生成的 API 文档
- 中栏:写 query / mutation
- 右栏:看响应
- ⭐ 不用装 GraphQL Playground / Insomnia 就能测 query

### ⭐ Schema 与 resolver 解耦
- **schema** = "客户端能问什么问题"(合约)
- **resolver** = "怎么回答这些问题"(实现)
- 同一个 schema 可以用不同的 resolver 实现(in-memory / DB / REST / gRPC 后端)
- 课程后续小节会演示接 MongoDB

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要一个终端**。

### Step 1 — 安装依赖

```bash
cd D:\workspace\fullstack_workspace\fullstack\part8\a-apollo-server
npm install
```

**期望**:
- `node_modules/@apollo/server/`(v4.x.x)
- `node_modules/graphql/`(v16.x.x)
- `package-lock.json` 生成

### Step 2 — 启动 server

```bash
npm start
```

**期望**(终端输出):

```
🚀 Server ready at http://localhost:4000/
👉 Open http://localhost:4000/ in browser to test queries via Apollo Sandbox
```

### Step 3 — 浏览器进 Apollo Sandbox

浏览器访问 `http://localhost:4000`。

**期望**:
- 自动跳转到 Apollo Sandbox(`https://studio.apollographql.com/sandbox/explorer`,embedded 在 iframe 里指向 localhost:4000)
- 左栏"Documentation"显示 schema 自动生成的文档,展开 `Query` 看到 `personCount` / `allPersons` / `findPerson`
- 中栏是 query 编辑区
- 右上角一个 ▶ 按钮(或者 `Ctrl + Enter` 跑 query)

### Step 4 — 跑 3 个 query

#### Query 1 — personCount

把 `requests/personCount.graphql` 内容粘到 Sandbox 中栏,点 ▶ 跑。

**期望响应**:

```json
{
  "data": {
    "personCount": 2
  }
}
```

(对应 `schema.js` 里 mock 的 2 个人)

#### Query 2 — allPersons

把 `requests/allPersons.graphql` 内容粘到 Sandbox 中栏,点 ▶ 跑。

**期望响应**(只返你声明的 `name` 和 `phone` 字段):

```json
{
  "data": {
    "allPersons": [
      { "name": "Arto Hellas", "phone": "040-123543" },
      { "name": "Mary Popup", "phone": "040-432342" }
    ]
  }
}
```

⭐ **关键观察**:`street` / `city` / `id` 字段 schema 有但 query 没写 → 响应里**没有**。这就是 GraphQL 字段级精度的威力。

#### Query 3 — findPerson

把 `requests/findPerson.graphql` 内容粘到 Sandbox 中栏,点 ▶ 跑。

**期望响应**:

```json
{
  "data": {
    "findPerson": {
      "name": "Arto Hellas",
      "phone": "040-123543",
      "street": "Tapiolankatu 5 A",
      "city": "Helsinki",
      "id": "3d594650-3436-11e9-bc57-8b80ba54c431"
    }
  }
}
```

### Step 5 — (可选) 测试 GraphQL 字段校验

在 Sandbox 中栏写:

```graphql
query {
  findPerson {
    name
  }
}
```

**期望响应**:GraphQL 校验失败,报错 `Field "findPerson" argument "name" of type "String!" is required but not provided.`

⭐ GraphQL schema 自动校验查询合法性,不用在 server 写参数检查。

### Step 6 — (可选) 测试不存在的参数名

在 Sandbox 中栏写:

```graphql
query {
  findPerson(name: "Arto Hellas") {
    name
    foo
  }
}
```

**期望响应**:GraphQL 校验失败,报错 `Cannot query field "foo" on type "Person".`

### 结束

终端按 `Ctrl + C` 停 server。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| Apollo Server | "today's leading library" | 主流 GraphQL 服务器库 | `index.js` 顶部 import |
| `startStandaloneServer` | (implicit,v4 standalone 模式) | v4 内置最小 standalone 启动器 | `index.js` 底部调用 |
| `typeDefs` | "contains the GraphQL schema" | GraphQL SDL schema 字符串 | `schema.js` 的 `typeDefs` 变量 |
| `resolvers` | "defines *how* GraphQL queries are responded to" | Query 字段的实现函数表 | `schema.js` 的 `resolvers` 对象 |
| `ID!` | (implicit) | GraphQL 内置标量,字符串但保证唯一 | `Person.id` 字段类型 |
| `String!` | (implicit) | Non-Null String,必须有值 | `Person.name` / `street` / `city` |
| Apollo Sandbox | "GraphOS Studio Explorer"(新 MOOC.fi 叫法) | 浏览器内 GraphQL IDE | `http://localhost:4000` 自动跳转 |

---

## ⭐ 关键 takeaway(5 条)

1. **Apollo Server v4 ≠ v3** — v3 的 `apollo-server` 单包模式已 deprecated,v4 拆成 `@apollo/server` + 各 integration 包
2. **standalone 模式省一个 Express** — 学习 / demo / MVP 用 standalone;真实生产往往接 Express / Fastify 共享 HTTP server
3. **schema 与 resolver 解耦** — schema 是合约,resolver 是实现,后续接 MongoDB 时只换 resolver 不改 schema
4. **GraphQL 字段级精度** — 客户端写啥字段服务端返啥,不再"多返少返"纠结
5. **GraphQL 内置校验** — 类型不匹配的 query 在跑 resolver 之前就被 schema 校验拒绝

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| 文件结构 | 课程把 typeDefs + resolvers + persons 全部塞在 `index.js` | 抽到 `schema.js`,`index.js` 只剩 server 启动 | 单一职责,方便后续 part8b/8c/... 演进(Mutations / Enum / DB)时 schema 文件不动,只追加 resolver |
| `requests/` 目录 | 课程没要求 | 3 个 `.graphql` 文件对应 3 个 Query | 不替你跑命令,但提供可粘贴的 query 文本(降低 Step 4 操作成本) |
| `.gitignore` | 课程没演示 git | 标准 `node_modules/` + log + env | 实际项目需要,演示忽略 lock 文件以外的内容 |
| Apollo Server 版本 | 课程未指定具体版本 | `@apollo/server@^4.11.0`(v4 latest stable)| 课程示例默认 v4,版本号对齐 2026 latest |
| `graphql` 版本 | 课程未指定 | `^16.9.0`(v16 latest stable)| Apollo Server v4 兼容 graphql v16 |
| `package.json` name | 课程用 default | `apollo-server-basics` | 标识清楚,避免多 subproject 名字撞车 |
| 注释 | 课程用英文注释或无注释 | 中文 ⭐ 注释 + ⭐ 注释引用课程原文 | ⭐ memory:`part7/8 学习代码必须含中文注释` |
| `/* GraphQL */` 标记 | 课程后续小节 "Schema syntax highlighting in VS Code" 才讲到 | **本子项目已经在 schema.js 里加了**(在 `typeDefs` 字符串前) | 提前应用,让 VS Code 用户立刻看到语法高亮(课程讲的是技巧,但用了无副作用)|
| Mock 数据 | 课程用 Arto Hellas + Mary Popup(原示例)| **保留** verbatim | 不改 |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **Node.js 版本**:Apollo Server v4 需要 Node.js `^18.0.0 || >=20.0.0`。你的机器上 nvm 装的 `v22.22.3` 满足要求,**无需**额外操作
- **没有 cross-env 问题**:本子项目不用 `NODE_ENV=...`(standalone 模式默认就是开发模式 + Apollo Sandbox)
- **端口冲突**:如果 4000 端口被占,改 `index.js` 里 `listen: { port: 4000 }` → 比如 4001,然后重启。终端会明确报 `EADDRINUSE`
- **npm install 慢**:`@apollo/server` 有依赖图,首次 install 几十秒正常。可以用 `npm install --prefer-offline` 加速
- **Apollo Sandbox 加载**:首次访问 `http://localhost:4000` 会跳到 `studio.apollographql.com/sandbox/explorer` —— **需要联网**(Sandbox 是 Apollo 的托管 IDE)。**断网时仍能直接 POST `http://localhost:4000/`**(GraphQL endpoint),只是没有 UI

---

## 后续子段

- part8a **Apollo Server 已完结**(Chapter 2 第一个有实操的小节)
- Chapter 2 后续还有 6 个小节(Parameters of a resolver / Default resolver / Object within an object / Mutations / Error handling / Enum / Changing a phone number / More on queries)
- 后续 part8b/8c/... 会按"一次只推进一小节"纪律逐个落地
- Chapter 3-6 是 React Apollo Client / DB / Login / Fragments — 还没规划
- 本节**不** commit / push
- 本节**不** 跑任何命令