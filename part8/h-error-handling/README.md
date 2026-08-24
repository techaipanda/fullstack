# part8 h — Error handling(verbatim 课程 Chapter 2 "Error handling" 段)

> **本子项目作用**:把课程 Chapter 2 里的 **Error handling** 段做成最小可跑的 demo + 兑现 part8g Step 9 末尾铺垫的伏笔("如何在 resolver 里手动抛用户友好错误")。
>
> **关键诚实声明**:课程本节 verbatim 改了 1 处:① `Mutation.addPerson` resolver 加查重 + 抛 `GraphQLError` 带 `extensions.code = 'BAD_USER_INPUT'` + `invalidArgs`。Query / Person / Address / typeDefs 块沿用 part8g verbatim。

---

## 课程原文要点(verbatim 摘录)

> "However, GraphQL cannot handle everything automatically. For example, stricter rules for data sent to a Mutation have to be added manually. An error could be handled by throwing `GraphQLError` with a proper error code."
>
> "Let's prevent adding the same name to the phonebook multiple times:"
>
> ```js
> const { GraphQLError } = require('graphql')
>
> const resolvers = {
>   // ..
>   Mutation: {
>     addPerson: (root, args) => {
>       if (persons.find(p => p.name === args.name)) {
>         throw new GraphQLError(`Name must be unique: ${args.name}`, {
>           extensions: {
>             code: 'BAD_USER_INPUT',
>             invalidArgs: args.name
>           }
>         })
>       }
>       const person = { ...args, id: uuid() }
>       persons = persons.concat(person)
>       return person
>     }
>   }
> }
> ```
>
> "So if the name to be added already exists in the phonebook, throw `GraphQLError` error."

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 3 个)

### ⭐ GraphQL 校验的两层防线

| 层 | 校验什么 | 怎么做 | 出错响应 |
|---|---|---|---|
| **Schema 层**(自动)| 参数"格式" — 类型 / non-null | typeDefs 写 `name: String!` 即可 | Apollo 编译期拒绝,response 顶层 `errors` |
| **Resolver 层**(手动)| 参数"值" — 业务规则 | `throw new GraphQLError(...)` | response 顶层 `errors` + `extensions` 字段 |

⭐ 课程明示:"GraphQL cannot handle everything automatically ... stricter rules ... have to be added manually."

⭐ 例如"name 不能重复"是**业务规则**(取决于 persons 数组当前状态)— schema 看不到这个状态,所以**必须**手动查重。

### ⭐ GraphQLError 的两个参数

```js
throw new GraphQLError(
  `Name must be unique: ${args.name}`,   // 参数 1: 给"人"读的消息
  {
    extensions: {                          // 参数 2: 给"机器"读的字段
      code: 'BAD_USER_INPUT',              // 错误分类(GraphQL spec 标准)
      invalidArgs: args.name,              // 哪个参数错了(客户端可高亮)
    },
  }
)
```

⭐ 两个参数的职责分工:
- **参数 1 (message)** — 给开发者 / 用户看的中文/英文消息
- **参数 2 (extensions)** — 给客户端代码用的结构化数据(`code` / `invalidArgs` / 其他自定义字段)

⭐ 标准错误 code(GraphQL spec 定义):
| code | 含义 |
|---|---|
| `BAD_USER_INPUT` | 用户传了不合法值 |
| `UNAUTHENTICATED` | 未登录 |
| `FORBIDDEN` | 没权限 |
| `NOT_FOUND` | 资源不存在 |
| `INTERNAL_SERVER_ERROR` | server 自己挂了 |

### ⭐ 客户端 response 实际长啥样

跑重复 addPerson 后,客户端 response 是:

```json
{
  "data": {
    "addPerson": null         // ⭐ data 为 null(失败没返回值)
  },
  "errors": [
    {
      "message": "Name must be unique: Arto Hellas",
      "path": ["addPerson"],
      "extensions": {
        "code": "BAD_USER_INPUT",
        "invalidArgs": "Arto Hellas"
      }
    }
  ]
}
```

⭐ **关键认知**:
- ✅ GraphQL **不抛 HTTP 错误**(永远是 200 OK)— 错误信息在 `errors` 数组里
- ✅ `data` 字段仍然存在,只是对应字段是 `null`
- ✅ 客户端可以 if `result.errors` 判断成功失败
- ✅ Apollo Sandbox 默认会在右边面板展示这个 errors 数组(可点开看 details)

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要一个终端**。

### Step 1 — 安装依赖(无需新增,沿用 part8g)

```bash
cd D:\workspace\fullstack_workspace\fullstack\part8\h-error-handling
npm install
```

**期望**:`uuid` / `@apollo/server` / `graphql` 都装好。`GraphQLError` 不需要新包 — 它是 `graphql` 包的 named export。

### Step 2 — 启动 server(先杀 part8g 占的 4000)

```bash
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

如果看到 `EADDRINUSE :::4000` — 说明 part8g 的 server 还在跑,先 `Ctrl+C` 杀掉。

### Step 3 — 浏览器进 Apollo Sandbox

浏览器访问 `http://localhost:4000`。

### Step 4 — 验证 schema 层校验还在(非 null 参数)

跑 part8g Step 9 那个故意省略 name 的 mutation:

```graphql
mutation {
  addPerson(phone: "045-111", street: "Testikatu 2", city: "Testila") {
    name
    id
  }
}
```

**期望**:**响应里有 `errors` 字段**,message 类似:

```
"Variable "$name" of required type "String!" was not provided."
```

⭐ **铁证**:非 null 校验是 schema 层自动的,跟 resolver 抛错**完全独立** — 即使 `addPerson` resolver 没写查重,这个错也会报。

### Step 5 — 跑课程核心示例:重复 name → 抛 GraphQLError

```graphql
mutation {
  addPerson(
    name: "Arto Hellas"
    phone: "045-9999"
    street: "Testikatu 3"
    city: "Testila"
  ) {
    name
    id
  }
}
```

**期望响应**:

```json
{
  "data": {
    "addPerson": null
  },
  "errors": [
    {
      "message": "Name must be unique: Arto Hellas",
      "path": ["addPerson"],
      "extensions": {
        "code": "BAD_USER_INPUT",
        "invalidArgs": "Arto Hellas"
      }
    }
  ]
}
```

⭐ **铁证 4 件事**:
- ✅ `errors` 数组里有**结构化错误**
- ✅ `message` 是人话("Name must be unique: Arto Hellas")
- ✅ `extensions.code` = `'BAD_USER_INPUT'`(机器可读分类)
- ✅ `extensions.invalidArgs` = `"Arto Hellas"`(客户端知道是哪个参数错了)
- ✅ `data.addPerson` 是 `null`(mutation 没成功)

### Step 6 — 验证 addPerson 失败不会污染 persons 数组

```graphql
query {
  personCount
}
```

**期望**:`personCount: 2`(还是 Arto + Mary)。

⭐ **铁证**:`throw new GraphQLError(...)` 后,**resolver 函数立即停止执行**(没到 `persons = persons.concat(...)` 那行),persons 数组**没被修改**。如果错误抛在中间,数据一致性自动保证。

### Step 7 — 验证 addPerson 成功路径还能正常用(不重复的 name)

```graphql
mutation {
  addPerson(
    name: "New Person"
    phone: "045-1234"
    street: "Newkatu 3"
    city: "Newcity"
  ) {
    name
    id
  }
}
```

**期望**:**正常返回 person 对象**,没有 errors。

⭐ **铁证**:resolver 的"业务校验"只拦重复 name,不重复的照常通过。

### Step 8 — 跟 part8g 一样故意省略 phone(Schema 校验 nullable 成功)

```graphql
mutation {
  addPerson(
    name: "Another Person"
    street: "Testikatu 5"
    city: "Testila"
  ) {
    name
    phone
    id
  }
}
```

**期望**:`phone: null`,正常返回。

### Step 9 — 综合对比:三处"失败"的差异

| Step | 失败原因 | 校验层 | errors.code | data.addPerson |
|---|---|---|---|---|
| Step 4 | name 字段未传 | Schema 层 | (Apollo 自带 code) | null |
| Step 5 | name 重复 | Resolver 层 | `BAD_USER_INPUT` | null |
| Step 7 | 无失败 | — | (无 errors) | person 对象 |

⭐ **认知**:Schema 层错和 Resolver 层错**最终都进 `errors` 数组**,但 `extensions.code` 不同 — 客户端可以**根据 code 决定 UI 行为**(e.g. BAD_USER_INPUT → toast 提示;INTERNAL_SERVER_ERROR → 全屏错误页)。

### 结束

终端 `Ctrl + C` 停 server。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| GraphQLError | "An error could be handled by throwing GraphQLError" | GraphQL 标准错误类(graphql 包导出)| schema.js 顶部 `const { GraphQLError } = require('graphql')` |
| error code | "with a proper error code" | extensions.code 字段 — 错误分类(BAD_USER_INPUT 等)| `extensions.code: 'BAD_USER_INPUT'` |
| stricter rules | "stricter rules for data sent to a Mutation have to be added manually" | schema 表达不了的业务规则 | addPerson 里的 `if (persons.find...)` |
| GraphQL validation | "some of the error handling can be automatically done with GraphQL validation" | schema 层自动校验(non-null / 类型)| typeDefs `name: String!` |
| extensions | (课程本节 schema 改动里的对象字段)| 给客户端的"机器可读"错误字段 | `extensions: { code, invalidArgs }` |
| `BAD_USER_INPUT` | (课程明示)| GraphQL spec 标准的"用户输入不合法"错误码 | extensions.code |
| `invalidArgs` | (课程明示)| 哪个参数错了(客户端可高亮)| extensions.invalidArgs |

---

## ⭐ 关键 takeaway(5 条)

1. **GraphQL 校验分两层** — Schema 层(自动)+ Resolver 层(手动,业务规则)
2. **GraphQLError 两个参数** — message(人读)+ extensions(机器读)
3. **`extensions.code` 用 GraphQL spec 标准** — `BAD_USER_INPUT` / `UNAUTHENTICATED` / `FORBIDDEN` 等
4. **HTTP status 永远是 200** — 错误在 `errors` 数组里,不在 HTTP status
5. **`throw` 中断 resolver** — 后面的代码不执行,数据自动一致(不用手动 rollback)

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `const { GraphQLError } = require('graphql')` | 课程 verbatim | **完全 verbatim** | 严格遵循 |
| `Mutation.addPerson` 查重 + 抛错 | 课程 verbatim | **完全 verbatim**(含 `(root, args)` 而非 `_root, _args`)| 严格遵循 |
| `extensions.code: 'BAD_USER_INPUT'` | 课程 verbatim | **完全 verbatim** | 严格遵循 |
| `extensions.invalidArgs: args.name` | 课程 verbatim | **完全 verbatim** | 严格遵循 |
| `persons` 数据 / `typeDefs` / `Query` / `Person` 块 | 课程本节未改 | verbatim 沿用 part8g | 课程本节不动这些 |
| `uuid` import | 课程本节未显式 | 沿用 part8g(在顶部)| resolver 仍需 uuid 生成 id |
| `index.js` | 课程无 verbatim 改动 | verbatim 沿用 part8g | server 启动本节没变 |
| `package.json` | 课程无 verbatim 改动 | 沿用 part8g(无新增依赖 — GraphQLError 是 graphql 包自带)| 无依赖变更 |
| `.gitignore` | 课程无 | 标准 `node_modules/` + log + env | 沿用 part8a-g |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **Node.js 版本**:Apollo Server v4 需要 Node.js `^18.0.0 || >=20.0.0`,你的 `v22.22.3` 满足要求
- **端口冲突**:**part8g 的 server 占着 4000** — 跑 part8h 前先 `Ctrl+C` 杀 part8g。或者改 index.js `port: 4000` → 4001(但会偏离课程)。
- **`GraphQLError` 不需要新包** — 它是 `graphql` v16 自带的 named export(本子项目无新增 npm 依赖)
- **Step 4 和 Step 5 都"失败",但错来源不同** — Schema 层错(`String!` violation)vs Resolver 层错(BAD_USER_INPUT)— 客户端根据 `extensions.code` 区分
- **HTTP 永远是 200** — 即使 addPerson 抛错,response 仍然 HTTP 200,错误在 body 的 `errors` 字段

---

## 后续子段

- part8h **Error handling 已完结**(兑现 part8g Step 9 伏笔:如何在 resolver 里抛结构化错误)
- Chapter 2 后续小节:
  - part8i — **Enum**(YesNo 过滤)— 有代码
  - part8j — **Changing a phone number**(changeNumber mutation)— 有代码
  - part8k — **More on queries**(combined queries + aliases)— 有代码
- 后续 part8i/8j/... 会按"一次只推进一小节"纪律逐个落地
- Chapter 3-6 是 React Apollo Client / DB / Login / Fragments — 还没规划
- 本节**不** commit / push
- 本节**不** 跑任何命令