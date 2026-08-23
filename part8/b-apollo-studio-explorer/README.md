# part8 b — Apollo Studio Explorer(verbatim 课程 Chapter 2 "Apollo Studio Explorer" 段)

> **本子项目作用**:把课程 Chapter 2 里的 **Apollo Studio Explorer** 段做成最小独立可跑 demo。
>
> **关键诚实声明**:这一节**没有新增代码**。课程原文只包含两步:(1) 在 `package.json` 加 dev/start scripts(已在 part8a 完成);(2) 启动后浏览器访问 `http://localhost:4000` → 自动跳到 **GraphOS Studio Explorer**(原名 Apollo Studio Explorer)。
>
> 本子项目 = part8a 的可运行 server + 一份专门讲 Apollo Studio Explorer 使用 walkthrough 的 README。

---

## 课程原文要点(verbatim 摘录)

> "Let's add the following scripts to `package.json` to run the application:"
> _(课程高亮显示 `package.json` 的 lines 4 to 5 — 即 `dev` 和 `start` 脚本)_

> "When Apollo server is run in development mode the page [http://localhost:4000](http://localhost:4000/) takes us to [GraphOS Studio Explorer](https://www.apollographql.com/docs/graphos/platform/explorer). This is very useful for a developer, and can be used to make queries to the server."

> "Let's try it out:" _(课程配图:Apollo Studio 截图,展示运行 allPersons query 后的效果)_

> "At the left side Explorer shows the API-documentation that it has automatically generated based on the schema."

---

## ⭐ 核心概念(本子项目演示的 3 个)

### ⭐ GraphOS Studio Explorer(原 Apollo Studio Explorer / Apollo Sandbox)
- 浏览器内嵌的 **GraphQL IDE**,由 Apollo 公司托管(`studio.apollographql.com`)
- Apollo Server v4 + `startStandaloneServer` 在**开发模式**下自动开启
- 访问 `http://localhost:4000` → HTTP response 自动重定向到 Sandbox URL
- 课程原文命名为 "GraphOS Studio Explorer"(新 MOOC.fi 叫法),功能上对应旧的 "Apollo Sandbox"

### ⭐ Sandbox 三大区域
| 区域 | 位置 | 功能 |
|------|------|------|
| Documentation(API 文档)| 左侧边栏 | 根据 schema 自动生成,可展开每个 type 看字段,点击字段会插入到中栏 query |
| Query Editor(查询编辑器)| 中栏 | 写 GraphQL query / mutation,按 `▶` 或 `Ctrl + Enter` 执行 |
| Response Viewer(响应查看器)| 右侧 | 显示 server 返回的 JSON 响应 + 错误信息 |

### ⭐ Schema 自动文档化
- 课程原文:"the left side Explorer shows the API-documentation that it has automatically generated based on the schema"
- **不需要**手写文档,Sandbox 直接读 schema 渲染
- 左栏展开 `Query` 类型 → 看到 `personCount` / `allPersons` / `findPerson(name: String!): Person`
- 左栏展开 `Person` 类型 → 看到 5 个字段 + Non-Null 标记

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要一个终端**。

### Step 1 — 安装依赖

```bash
cd D:\workspace\fullstack_workspace\fullstack\part8\b-apollo-studio-explorer
npm install
```

**期望**:`node_modules/@apollo/server/` + `node_modules/graphql/` 生成。

### Step 2 — 启动 server

```bash
npm start
```

**期望**(终端输出):

```
🚀 Server ready at http://localhost:4000/
👉 Open http://localhost:4000/ in browser → automatically redirects to GraphOS Studio Explorer
```

### Step 3 — 浏览器进 GraphOS Studio Explorer

浏览器访问 **`http://localhost:4000`**。

**期望**(按顺序发生):
1. 浏览器先到 `http://localhost:4000`(你 server 的地址)
2. Server 返回 HTTP 重定向到 `https://studio.apollographql.com/sandbox/explorer`(Apollo 托管的 Sandbox)
3. Sandbox 在 iframe 里连接到你的 `localhost:4000` GraphQL endpoint
4. 看到 3 大区域:左栏 Documentation / 中栏 Query Editor / 右侧 Response Viewer

> ⚠️ **Windows 注意事项**:
> - 这个重定向到 studio.apollographql.com **需要联网**
> - 断网时仍能 `curl -X POST http://localhost:4000/ -H "Content-Type: application/json" -d '{"query":"{ personCount }"}'`,只是没有图形 UI

### Step 4 — 看左侧 Documentation 面板

**期望**:左栏自动展开 schema 文档树。

操作:点击左栏根部的 `Query` 类型前面的 `▶`。

**期望看到**(verbatim schema 文档):
- `personCount: Int!`
- `allPersons: [Person!]!`
- `findPerson(name: String!): Person`

继续点击 `Person` 类型前的 `▶`。

**期望看到**:
- `name: String!`
- `phone: String`
- `street: String!`
- `city: String!`
- `id: ID!`

⭐ **关键观察**:`phone: String` 没有 `!`,所以是 nullable — 跟 schema.js 里 `phone: '040-123543'`(有值)或后续可能 `phone: null` 一致。

### Step 5 — 用中栏跑 query(看右侧响应)

#### Query 1 — personCount

中栏输入:

```graphql
query {
  personCount
}
```

按 `▶` 按钮(或 `Ctrl + Enter`)。

**期望响应**(右侧):

```json
{
  "data": {
    "personCount": 2
  }
}
```

#### Query 2 — allPersons(课程截图演示的就是这个)

中栏输入:

```graphql
query {
  allPersons {
    name
    phone
    street
    city
  }
}
```

**期望响应**:

```json
{
  "data": {
    "allPersons": [
      {
        "name": "Arto Hellas",
        "phone": "040-123543",
        "street": "Tapiolankatu 5 A",
        "city": "Helsinki"
      },
      {
        "name": "Mary Popup",
        "phone": "040-432342",
        "street": "Mannerheimintie 100",
        "city": "Helsinki"
      }
    ]
  }
}
```

> 课程原文里 Apollo Studio 的截图就是展示这个 query 的结果(配图: "apollo studio Example Query with response allPersons")。

#### Query 3 — findPerson(带参数)

中栏输入:

```graphql
query {
  findPerson(name: "Arto Hellas") {
    name
    phone
    street
    city
    id
  }
}
```

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

### Step 6 — 看 Sandbox 自动补全(IntelliSense)

操作:
1. 把中栏 query 改成:

   ```graphql
   query {
     allPersons {
     }
   }
   ```

2. 在 `allPersons { ... }` 的花括号里,光标停在 `{` 后按 `Ctrl + Space`。

**期望**:弹出字段列表提示(`name` / `phone` / `street` / `city` / `id`),选择 `name` 会自动插入。

⭐ Sandbox 跟 IDE 一样,根据 schema 字段类型提示自动补全 — 这就是 GraphQL 的强类型优势。

### 结束

终端按 `Ctrl + C` 停 server。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| GraphOS Studio Explorer | "GraphOS Studio Explorer"(新 MOOC.fi 叫法) | Apollo 托管的浏览器内 GraphQL IDE | `http://localhost:4000` 自动跳转目标 |
| Apollo Sandbox | (旧叫法,2024 之前) | 同 GraphOS Studio Explorer | 同上 |
| `package.json` scripts | "Highlighted lines: 4 to 5" | `dev` 和 `start` 启动命令 | `package.json` lines 6-9 |
| HTTP redirect | (implicit) | server 返回 302 重定向到 Apollo 托管 Sandbox | `startStandaloneServer` 内置 |
| Documentation panel | "the left side Explorer shows the API-documentation" | 左栏自动生成的 schema 文档 | Apollo Sandbox 左栏 |
| IntelliSense / autocomplete | (implicit, 但 Step 6 演示) | 根据 schema 字段类型提示自动补全 | Sandbox 中栏 `Ctrl + Space` |

---

## ⭐ 关键 takeaway(4 条)

1. **Apollo Server v4 + standalone = 自动 Sandbox** — 你不需要写一行 frontend 代码,`npm start` 完就有一个浏览器内 GraphQL IDE 可用,极大降低本地开发门槛
2. **Schema = 自动文档** — 写好 `typeDefs`,Sandbox 自动渲染可读文档(免去 Swagger / OpenAPI 维护成本)
3. **课程原文里这一节是观察性小节** — 没有新增代码,核心是"认识工具" — 这种节奏在 GraphQL 课程里很常见(先认识 schema,再深入 resolver)
4. **后续小节依赖 Sandbox** — 课程接下来讲 parameters / mutations / error handling 都要在 Sandbox 里实操验证,本节建立的访问习惯是后续所有小节的前提

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| 文件结构 | 课程在 Apollo Server 段把 typeDefs + resolvers + persons 全部塞在 `index.js` | **本子项目(part8b)复制 part8a 的结构** — 抽到 `schema.js`,`index.js` 只剩 server 启动 | 沿用 part8a 的解耦结构(单子项目内部一致),不动 verbatim |
| `package.json` scripts | 课程 "Highlighted lines 4 to 5" = `dev` + `start` | 已包含在 `package.json` lines 6-9 | 严格 verbatim |
| `requests/` 目录 | 课程没要求 | **本子项目未创建**(用户可复用 part8a 的 3 个 .graphql 文件) | 本节是 Explorer walkthrough,Step 5 的 query 内容已直接写在 README 里,不需要单独 .graphql 文件 |
| `.gitignore` | 课程没演示 git | 标准 `node_modules/` + log + env | 沿用 part8a |
| Apollo Server 版本 | 课程未指定具体版本 | `@apollo/server@^4.11.0`(v4 latest stable) | 沿用 part8a |
| `graphql` 版本 | 课程未指定 | `^16.9.0`(v16 latest stable) | 沿用 part8a |
| 注释 | 课程用英文注释或无注释 | 中文 ⭐ 注释 + 标注"本子项目无新增代码" | ⭐ memory:`part7/8 学习代码必须含中文注释` + 诚实标注本节性质 |
| `/* GraphQL */` 标记 | 课程后续小节才讲到 | **本子项目 schema.js 已加**(提前应用) | 沿用 part8a |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **Node.js 版本**:Apollo Server v4 需要 Node.js `^18.0.0 || >=20.0.0`。你的机器上 nvm 装的 `v22.22.3` 满足要求,**无需**额外操作
- **没有 cross-env 问题**:本子项目不用 `NODE_ENV=...`(standalone 模式默认就是开发模式 + Apollo Sandbox 自动开启)
- **端口冲突**:如果 4000 端口被占,改 `index.js` 里 `listen: { port: 4000 }` → 比如 4001,然后重启。终端会明确报 `EADDRINUSE`
- **Apollo Sandbox 联网**:重定向到 `studio.apollographql.com/sandbox/explorer` 需要联网。**断网时仍能 POST `http://localhost:4000/`**(GraphQL endpoint),只是没有 UI
- **浏览器缓存**:Apollo Sandbox 在浏览器里有缓存,如果 schema 改了但 Sandbox 显示老 schema,按 `Ctrl + Shift + R` 硬刷新

---

## 后续子段

- part8b **Apollo Studio Explorer 已完结**(Chapter 2 第一个"使用工具"小节)
- 课程 Chapter 2 后续还有这些**有实操代码**的小节:
  - part8c — **Schema syntax highlighting in VS Code**(装 GraphQL 扩展 + 加 `/* GraphQL */` 标记)
  - part8d — **Parameters of a resolver**(findPerson 的 args 参数详细解释)
  - part8e — **The default resolver**(Apollo 自动给 Person 字段生成的 default resolver)
  - part8f — **Object within an object**(Address 嵌套类型)
  - part8g — **Mutations**(addPerson)
  - part8h — **Error handling**(GraphQLError + BAD_USER_INPUT)
  - part8i — **Enum**(YesNo 过滤 phone 是否有值)
  - part8j — **Changing a phone number**(changeNumber mutation)
  - part8k — **More on queries**(combined queries + aliases)
- 后续 part8c/8d/... 会按"一次只推进一小节"纪律逐个落地
- Chapter 3-6 是 React Apollo Client / DB / Login / Fragments — 还没规划
- 本节**不** commit / push
- 本节**不** 跑任何命令