# part8 d — Parameters of a resolver(verbatim 课程 Chapter 2 "Parameters of a resolver" 段)

> **本子项目作用**:把课程 Chapter 2 里的 **Parameters of a resolver** 段做成最小可跑的 demo + 把 resolver 的 4 参数签名讲透。
>
> **关键诚实声明**:本节是**纯解释性小节**。课程 verbatim **没有新增 schema 或 resolver 代码块**。它只是把 part8a 的 `findPerson` resolver 单独拎出来,讲解 `(root, args)` 两个参数的含义,并预告 "all resolver functions are given **four** parameters"。
>
> 本子项目 = part8a 代码 + `schema.js` 顶部一段 ⭐ 中文 4 参数签名讲解 + README 详细 walkthrough。

---

## 课程原文要点(verbatim 摘录)

> "The query fetching a single person:"
>
> ```graphql
> query {
>   findPerson(name: "Arto Hellas") {
>     phone
>     city
>     street
>   }
> }
> ```

> "has a resolver which differs from the previous ones because it is given **two parameters**:"
>
> ```js
> (root, args) => persons.find(p => p.name === args.name)
> ```

> "The second parameter, `args`, contains the parameters of the query. The resolver then returns from the array `persons` the person whose name is the same as the value of `args.name`."

> "The resolver does not need the first parameter `root`."

> "In fact, all resolver functions are given [**four parameters**](https://www.graphql-tools.com/docs/resolvers#resolver-function-signature). With JavaScript, the parameters don't have to be defined if they are not needed. We will be using the first and the third parameter of a resolver later in this part."

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 1 个)

### ⭐ Resolver 的 4 参数签名 `(root, args, context, info)`

课程明示:**所有 resolver 函数都有 4 个参数**(GraphQL spec)。但 JS 允许只声明你用到的参数。

| # | 参数 | 类型 | 在本节用没用 | 含义 | 后续哪里会用到 |
|---|------|------|------|------|------|
| 1 | `root` | 任意 | ❌ 没用 | **父对象** / resolver 上一步的返回值。本节 Query 顶层 resolver 没"父对象",所以不用。| **part8e — Default resolver** — `Person.name` 等字段会用 root 拿 person 对象 |
| 2 | `args` | 对象 | ✅ 用了 | **GraphQL query 的参数**。key = 参数名,value = 参数值。`findPerson(name: "Arto")` → `args = { name: "Arto" }` | 后续 Mutation / 带参数的 query 都会用 |
| 3 | `context` | 任意 | ❌ 没用 | **跨 resolver 共享的数据**(当前登录用户、DB 连接、loaders 等)。通常由 server 启动时注入 | **part9 / part10 之后** — Login / 权限检查会用到 |
| 4 | `info` | GraphQLResolveInfo | ❌ 没用 | **GraphQL 执行元信息**(查询 AST、字段路径、返回类型)— 高级调试用 | 日常用不到 |

### ⭐ 为什么 JS 允许省略参数?

```js
// part8a/b/c/d 写法:只声明用到的
personCount: () => persons.length
allPersons: () => persons
findPerson: (root, args) => persons.find(p => p.name === args.name)

// 等价"全参数"写法 — JS 不报错,但代码冗余
personCount: (root, args, context, info) => persons.length
allPersons: (root, args, context, info) => persons
findPerson: (root, args, context, info) => persons.find(p => p.name === args.name)
```

课程原文:**"With JavaScript, the parameters don't have to be defined if they are not needed."**

⭐ 实践约定:
- 用不到的参数 → 不声明
- 用到第 2 个,但没用到第 1 个 → 用下划线占位:`(root, args)` / `(_root, args)`(课程用前者 `root`,**不**用下划线)
- TypeScript 用户 → `@apollo/server` 提供 `Resolver` 类型,IDE 会自动提示 4 参签名

### ⭐ "args" 的形状

```js
// GraphQL query:
//   findPerson(name: "Arto Hellas") { phone }

// Apollo 调用 resolver:
//   findPerson(root_value, { name: "Arto Hellas" }, context_value, info_object)

// args.name  ===  "Arto Hellas"
// args       ===  { name: "Arto Hellas" }
```

⭐ 如果 query 有多个参数:`myQuery(id: "1", flag: true, count: 5)` → `args = { id: "1", flag: true, count: 5 }`。

### ⭐ "root" 在本节为什么没用?

- `personCount` / `allPersons` / `findPerson` 都是 **Query 顶层字段**
- 顶层 resolver **没有"父对象"**(前面没有别的 resolver 调用它)
- 所以 `root` 是 `undefined`,或者更准确说:**root 在 Query 顶层没有意义**
- ⭐ `root` 真正派上用场是在 **嵌套 resolver** 里(part8e 会演示):
  - `Query.findPerson` 返回 person 对象
  - Apollo 自动用这个对象作为 `root`,调用 `Person.name` / `Person.phone` 等字段的 resolver
  - 这就是 part8e "The default resolver" 的内容

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要一个终端**。

### Step 1 — 安装依赖

```bash
cd D:\workspace\fullstack_workspace\fullstack\part8\d-parameters-of-resolver
npm install
```

### Step 2 — 启动 server

```bash
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

### Step 3 — 浏览器进 Apollo Sandbox

浏览器访问 `http://localhost:4000`。

### Step 4 — 跑 args 演示 query(核心)

把下面 query 粘到 Sandbox 中栏,点 ▶ 跑:

```graphql
query {
  findPerson(name: "Arto Hellas") {
    phone
    city
    street
  }
}
```

**期望响应**(说明 `args.name` === "Arto Hellas" 匹配到了):

```json
{
  "data": {
    "findPerson": {
      "phone": "040-123543",
      "city": "Helsinki",
      "street": "Tapiolankatu 5 A"
    }
  }
}
```

⭐ 这个响应**证明**了:
- `args` 参数被 Apollo 自动注入 `{ name: "Arto Hellas" }`
- `persons.find(p => p.name === args.name)` 找到了匹配项
- `root` 没用上(返回值是一个 person 对象,Apollo 自动用默认 resolver 处理其字段 — 见 part8e)

### Step 5 — 跑 args 不匹配 query

```graphql
query {
  findPerson(name: "Nobody") {
    name
  }
}
```

**期望响应**(说明 `persons.find` 返回 `undefined`,Apollo 把 `null` 返回):

```json
{
  "data": {
    "findPerson": null
  }
}
```

⭐ **没有报错**,只是返回 `null`。这是 GraphQL schema 的设计:
- `findPerson(name: String!): Person` — 返回类型 `Person` **可空**(没 `!`),所以查询找不到人时返回 null,合法。
- 这跟 part8h "Error handling" 段会讲到的 `GraphQLError` 不同 — 那个是故意抛异常。

### Step 6 — 跑 args 校验演示

```graphql
query {
  findPerson {
    name
  }
}
```

**期望响应**:GraphQL 校验失败,报错 `Field "findPerson" argument "name" of type "String!" is required but not provided.`

⭐ 这说明 **schema 已经做了参数必传校验**(`String!` 的 `!`),根本走不到 resolver,自然也没 `args` 可用。

### Step 7 — 跑 personCount(对比 — 没 args)

```graphql
query {
  personCount
}
```

**期望响应**:

```json
{
  "data": {
    "personCount": 2
  }
}
```

⭐ **对比意义**:
- `personCount` 的 resolver 是 `() => persons.length` — **完全没参数**,因为 query 不需要参数
- `findPerson` 的 resolver 是 `(root, args) => ...` — **用到 args**,因为 query 有参数
- ⭐ 课程教的"省略用不到的参数"在这里一目了然

### Step 8 — 跑 allPersons(对比 — 没 args)

```graphql
query {
  allPersons {
    name
    phone
  }
}
```

**期望响应**:

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

⭐ **对比意义**:
- `allPersons` 的 resolver 是 `() => persons` — **完全没参数**,因为 query 不需要参数
- 客户端写啥字段服务端返啥(`street` / `city` / `id` 没写就不返 — 这是 GraphQL 字段级精度,跟本节"参数"无关,但对比之下更突出本节重点)

### Step 9 — (可选) 加 console.log 看 args

打开 `schema.js`,临时把 `findPerson` 改成:

```js
findPerson: (root, args) => {
  console.log('=== resolver called ===')
  console.log('root:', root)    // undefined(顶层 Query resolver 没"父对象")
  console.log('args:', args)    // { name: "Arto Hellas" }
  return persons.find((p) => p.name === args.name)
},
```

重启 server,再跑 Step 4 的 query。

**期望**(终端输出):

```
=== resolver called ===
root: undefined
args: { name: 'Arto Hellas' }
```

⭐ **铁证**:`root` 是 `undefined`,`args` 是带 `name` 键的对象。验证完毕记得改回去。

### 结束

终端 `Ctrl + C` 停 server。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| `(root, args)` | "given two parameters" | Resolver 函数的前 2 个参数(JS 允许省略,GraphQL spec 传 4 个) | `schema.js` 的 `findPerson` |
| `args` | "The second parameter, args, contains the parameters of the query" | GraphQL query 的参数对象 | `findPerson: (root, args) => ...` |
| `root` | "The resolver does not need the first parameter root" | Resolver 的"父对象"(顶层 resolver 是 undefined) | `findPerson: (root, args) => ...` 中**没用** |
| four parameters | "all resolver functions are given four parameters" | 完整签名 `(root, args, context, info)` | `schema.js` 顶部 ⭐ 注释 |
| `context` | "We will be using ... the third parameter of a resolver later" | 第 3 参数,跨 resolver 共享数据(登录用户、DB 连接) | 本节**没用**,part9+ 才会用到 |
| `info` | (本节未明示,GraphQL spec) | 第 4 参数,GraphQL 执行元信息 | 本节**没用**,日常用不到 |

---

## ⭐ 关键 takeaway(5 条)

1. **Resolver 签名 = `(root, args, context, info)`** — 4 个参数永远是这 4 个,只是顺序和名字固定。课程只讲了前 2 个 + 预告第 3 个
2. **JS 允许省略参数** — 用不到的参数**不声明**,最干净。课程原文:"the parameters don't have to be defined if they are not needed"
3. **`args` 是 plain object** — key = GraphQL query 里的参数名,value = 参数值,自动注入
4. **`root` 在顶层 resolver 是 undefined** — 顶层 Query 字段没有"父对象",嵌套字段(part8e 演示)才有意义
5. **课程埋的伏笔**:"We will be using the first and the third parameter of a resolver later in this part." — 这是后续 part8e / Login 章节的预告。遇到不懂的先跳,后面会回来

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| 代码改动 | **本节 verbatim 没有新增代码块** | **本子项目 schema.js 与 part8a 完全一致** | 严格遵循 verbatim — 课程本节纯解释性,代码沿用 part8a |
| `schema.js` 顶部注释 | 课程无 | **新增 ⭐⭐⭐ 中文讲解 4 参数签名块** | 课程是 prose 解释,本子项目把 4 参数表 + 类型 + 用没用画成表格,方便回查 |
| `package.json` | 课程无 verbatim(沿用 part8a) | 同 part8a 结构 + name 改 `parameters-of-resolver` | 标识清楚,避免多 subproject 名字撞车 |
| `findPerson` 写法 | `(root, args) => persons.find(p => p.name === args.name)` | **完全 verbatim**(包括 `root` 而非 `_root`)| 课程刻意保留 `root`(虽然不用)— 暗示未来 part8e 会用到。坚持 verbatim |
| `requests/` 目录 | 课程无 | **本子项目未创建** | 4 个 query 都贴 README 里了,不分散到文件 |
| `.gitignore` | 课程无 | 标准 `node_modules/` + log + env | 沿用 part8a |
| `/* GraphQL */` 标记 | part8c 讲到 | 已在 typeDefs 前加 | 提前应用,见 part8a README 说明 |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **Node.js 版本**:Apollo Server v4 需要 Node.js `^18.0.0 || >=20.0.0`,你的 `v22.22.3` 满足要求
- **端口冲突**:如果 4000 被占,改 `index.js` 里 `port: 4000` → 4001,重启即可
- **Step 9 的 console.log** 是临时调试用,验证完记得改回去 — 否则终端输出污染
- **本节不需要 VS Code 扩展**(schema 没改)— 沿用 part8a 即可

---

## 后续子段

- part8d **Parameters of a resolver 已完结**(Chapter 2 解释性小节,讲透 resolver 4 参数签名)
- Chapter 2 后续小节(代码量逐渐增加):
  - part8e — **The default resolver**(Apollo 自动给 Person 字段生成 default resolver,会演示 `root` 参数)— 有代码
  - part8f — **Object within an object**(Address 嵌套类型)— 有代码
  - part8g — **Mutations**(addPerson)— 有代码
  - part8h — **Error handling**(GraphQLError + BAD_USER_INPUT)— 有代码
  - part8i — **Enum**(YesNo 过滤)— 有代码
  - part8j — **Changing a phone number**(changeNumber mutation)— 有代码
  - part8k — **More on queries**(combined queries + aliases)— 有代码
- 后续 part8e/8f/... 会按"一次只推进一小节"纪律逐个落地
- Chapter 3-6 是 React Apollo Client / DB / Login / Fragments — 还没规划
- 本节**不** commit / push
- 本节**不** 跑任何命令