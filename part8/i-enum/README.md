# part8 i — Enum(verbatim 课程 Chapter 2 "Enum" 段)

> **本子项目作用**:把课程 Chapter 2 里的 **Enum** 段做成最小可跑的 demo + 兑现 part8h "业务规则"的延伸(不是所有业务规则都该抛错,有时候应该让客户端通过参数来"问"不同的 view)。
>
> **关键诚实声明**:课程本节 verbatim 改了 2 处:① typeDefs 新增 `enum YesNo { YES NO }` + Query.allPersons 加 `phone: YesNo` 参数(nullable);② resolvers 改造 `Query.allPersons` 加 enum 过滤逻辑。Query.personCount / Query.findPerson / Person.address / Mutation.addPerson 沿用 part8h verbatim。

---

## 课程原文要点(verbatim 摘录)

> "Let's add a possibility to filter the query returning all persons with the parameter phone so that it returns only persons with a phone number"
>
> ```graphql
> query {
>   allPersons(phone: YES) {
>     name
>     phone 
>   }
> }
> ```
>
> "or persons without a phone number"
>
> ```graphql
> query {
>   allPersons(phone: NO) {
>     name
>   }
> }
> ```
>
> "The schema changes like so:"
>
> ```graphql
> enum YesNo {
>   YES
>   NO
> }
>
> type Query {
>   personCount: Int!
>   allPersons(phone: YesNo): [Person!]!
>   findPerson(name: String!): Person
> }
> ```
>
> "The type `YesNo` is a GraphQL enum, or an enumerable, with two possible values: `YES` or `NO`. In the query `allPersons`, the parameter `phone` has the type `YesNo`, but is nullable."
>
> "The resolver changes like so:"
>
> ```js
> Query: {
>   personCount: () => persons.length,
>   allPersons: (root, args) => {
>     if (!args.phone) {
>       return persons
>     }
>     const byPhone = (person) =>
>       args.phone === 'YES' ? person.phone : !person.phone
>     return persons.filter(byPhone)
>   },
>   findPerson: (root, args) =>
>     persons.find(p => p.name === args.name)
> },
> ```

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 3 个)

### ⭐ GraphQL Enum — 受限的字符串集合

```graphql
enum YesNo {
  YES
  NO
}
```

⭐ Enum 是一种**受限的字符串标量类型** — 字段值只能是枚举里列出的几个。

| 维度 | 字符串标量 `String` | 枚举 `enum YesNo` |
|---|---|---|
| 可选值 | 任意字符串 | **只能是 YES 或 NO** |
| schema 校验 | 类型对了就行 | 值必须命中枚举 |
| 客户端写错 | 不会报错(`"foo"` 合法) | **报错**("foo" 不是 YesNo 枚举值)|
| introspection | 看不出现实允许哪些值 | 能列出全部可选值(前端可生成下拉菜单)|

⭐ 关键认知:**enum 是给 schema 加"业务合法性约束"的最便宜方式** — 比在 resolver 里手动 if/else 校验好(那种只在 runtime 检查,schema 阶段不拦)。

### ⭐ Enum 在 runtime 是字符串

```js
allPersons: (root, args) => {
  if (!args.phone) return persons   // ⭐ args.phone 是 undefined 或 'YES' 或 'NO'
  const byPhone = (person) =>
    args.phone === 'YES' ? person.phone : !person.phone   // ⭐ 字符串比较
  return persons.filter(byPhone)
}
```

⭐ **认知**:GraphQL 在 server-client 传输时,enum **序列化成字符串**。所以 resolver 里 `args.phone === 'YES'` 是字符串字面量比较。

⭐ 客户端写法(Queries):
```graphql
allPersons(phone: YES)   # ⭐ 不加引号!enum 值是 enum type,不是 String
```

不是:
```graphql
allPersons(phone: "YES") # ✗ 错 — "YES" 是 String,不是 YesNo enum
```

### ⭐ 硬抛错 vs 软过滤 — 业务规则的两种处理方式

| 风格 | 何时用 | part8 例子 |
|---|---|---|
| **硬抛错**(throw)| **违反**业务规则时必须拒绝 | part8h:addPerson 重复 name → GraphQLError |
| **软过滤**(enum 参数)| 让客户端**挑**不同的 view | part8i:allPersons(phone: YES/NO) → 过滤 |

⭐ 课程本节 vs part8h 的对照:
- part8h "name 不能重复" — 是不变量,**违反就拒绝**(硬抛错)
- part8i "要只要有 phone 的" — 是查询条件,**让客户端挑**(软过滤)

⭐ 设计原则:**不变量用 throw,查询条件用参数**。两者不要混。

### ⭐ nullable 参数的双重作用

```graphql
allPersons(phone: YesNo): [Person!]!
#                       ^^^^^^^ 无 ! — 即 nullable
```

⭐ `phone: YesNo` 没加 `!` — 这意味着:
- 客户端**可以不传**这个参数
- resolver 看到 `args.phone === undefined`
- 走"全部返回"分支(`if (!args.phone) return persons`)

⭐ **认知**:**nullable = 默认值 / 全部行为**。如果设成 `phone: YesNo!`(non-null)— 客户端**必须传**,要么 YES 要么 NO,不能省略。这两种风格各有用途,看 API 设计意图。

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要一个终端**。

### Step 1 — 安装依赖(无新增,沿用 part8h)

```bash
cd D:\workspace\fullstack_workspace\fullstack\part8\i-enum
npm install
```

**期望**:3 个包装好。enum 是 graphql 包自带,不需要新依赖。

### Step 2 — 启动 server(先杀 part8h 占的 4000)

```bash
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

如果看到 `EADDRINUSE :::4000` — 说明 part8h 的 server 还在跑,先 `Ctrl+C` 杀掉。

### Step 3 — 浏览器进 Apollo Sandbox

浏览器访问 `http://localhost:4000`。看左边 schema 标签里 `enum YesNo` 出现。

### Step 4 — 不传 phone 参数(全部返回)

```graphql
query {
  allPersons {
    name
    phone
  }
}
```

**期望响应**:Arto + Mary 都出现(`!args.phone` 走"全部"分支)。

### Step 5 — 传 `phone: YES`(只返回有 phone 的)

```graphql
query {
  allPersons(phone: YES) {
    name
    phone
  }
}
```

**期望响应**:**Arto + Mary 都出现**(因为 mock 数据里两人都有 phone)— 过滤逻辑正确,但没"过滤掉"任何人。

### Step 6 — 验证 enum 校验:传错值应该报错

```graphql
query {
  allPersons(phone: MAYBE) {
    name
  }
}
```

**期望**:**响应里有 `errors` 字段**,message 类似:

```
"Value 'MAYBE' does not exist in 'YesNo' enum."
```

⭐ **铁证**:enum 校验在 schema 层就拦了 — 客户端写 `MAYBE`(不在枚举里)直接拒绝,**根本到不了 resolver**。这比在 resolver 里手动 if 校验好太多。

### Step 7 — 添加一个没 phone 的人,然后再测 NO 过滤

先用 mutation 加一个没 phone 的人:

```graphql
mutation {
  addPerson(
    name: "NoPhone Person"
    street: "Testikatu 7"
    city: "Testila"
  ) {
    name
    phone
  }
}
```

**期望**:`phone: null`,加成功。

然后再跑 NO 过滤:

```graphql
query {
  allPersons(phone: NO) {
    name
    phone
  }
}
```

**期望响应**:**只有 `NoPhone Person`** 出现(Arto + Mary 不出现)— 证明 enum `NO` 过滤生效(`!person.phone` 真值)。

⭐ **铁证**:args.phone 是 `'NO'`(不是 `'YES'`),走 `!person.phone` 分支,正确过滤出没 phone 的 person。

### Step 8 — 再跑 YES 过滤,这次应该只看到 Arto + Mary

```graphql
query {
  allPersons(phone: YES) {
    name
    phone
  }
}
```

**期望响应**:**Arto + Mary**,`NoPhone Person` 不出现。

⭐ **铁证**:三个 person 都在数组里,但 YES 过滤逻辑正确排除了没 phone 的那个。

### Step 9 — 综合对比:三种"phone 参数"行为

| Step | phone 参数 | resolver 分支 | 期望返回 |
|---|---|---|---|
| Step 4 | 不传 | `!args.phone` 全部 | 全部 3 人 |
| Step 5 / 8 | `YES` | `args.phone === 'YES'` | 有 phone 的(2 人)|
| Step 7 | `NO` | `args.phone === 'NO'`(`!person.phone`)| 没 phone 的(1 人)|

### Step 10 — 验证 part8h 的抛错和 addPerson 没受影响

```graphql
mutation {
  addPerson(
    name: "Arto Hellas"
    street: "Test"
    city: "Test"
  ) {
    name
  }
}
```

**期望**:**响应里 `errors` 数组有 `BAD_USER_INPUT` 错误**(name 重复)。

⭐ **铁证**:part8h 的查重逻辑在 part8i 里仍然跑 — 没破坏 part8h 行为。

### 结束

终端 `Ctrl + C` 停 server。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| enum | "The type YesNo is a GraphQL enum, or an enumerable" | 受限的字符串集合 | `enum YesNo { YES NO }` |
| enumerable | "or an enumerable" | enum 的另一种说法(可枚举的) | typeDefs 里 `enum YesNo` |
| nullable parameter | "the parameter phone has the type YesNo, but is nullable" | 参数可省略(`phone: YesNo` 无 `!`)| typeDefs.Query.allPersons.phone |
| filter | "filter the query returning all persons with the parameter phone" | 按条件过滤结果 | `persons.filter(byPhone)` |
| `args.phone === 'YES'` | (课程 resolver 原文)| runtime 比较 enum 字符串值 | `allPersons` resolver |
| `!person.phone` | (课程 resolver 原文)| person.phone 为 undefined / null / "" 都算"没 phone" | `byPhone` 函数 |

---

## ⭐ 关键 takeaway(5 条)

1. **enum 是 schema 层校验** — 客户端传错值直接在编译期拒绝
2. **enum runtime 是字符串** — `args.phone === 'YES'` 而不是 `args.phone === YES_ENUM.YES`
3. **enum 值不加引号** — `phone: YES` 不是 `phone: "YES"`
4. **nullable 参数 = 默认行为** — `phone: YesNo`(无 `!`)可以不传,走"全部"分支
5. **硬抛错 vs 软过滤** — 不变量用 throw,查询条件用 enum 参数

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `enum YesNo { YES NO }` | 课程 verbatim | **完全 verbatim** | 严格遵循 |
| `Query.allPersons(phone: YesNo): [Person!]!` | 课程 verbatim | **完全 verbatim** | 严格遵循 |
| `Query.allPersons` resolver | 课程 verbatim | **完全 verbatim**(含 `(root, args)` 而非 `_root, _args`)| 严格遵循 |
| `Query.personCount` / `Query.findPerson` | 课程未改 | verbatim 沿用 part8h | 课程本节不动这两个 |
| `Person.address` resolver | 课程未改 | verbatim 沿用 part8h | 课程本节不动 |
| `Mutation.addPerson` 查重 + GraphQLError | 课程未改 | verbatim 沿用 part8h | 课程本节不动 |
| `persons` 数据 | 课程 verbatim | **完全 verbatim**(沿用 part8a-h,都是 2 人都有 phone)| 课程本节不动 mock 数据 |
| `index.js` | 课程无 verbatim 改动 | verbatim 沿用 part8a/h | server 启动本节没变 |
| `package.json` | 课程无 verbatim 改动 | 沿用 part8h(无新增依赖 — enum 是 graphql 包自带)| 无依赖变更 |
| `.gitignore` | 课程无 | 标准 `node_modules/` + log + env | 沿用 part8a-h |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **Node.js 版本**:Apollo Server v4 需要 Node.js `^18.0.0 || >=20.0.0`,你的 `v22.22.3` 满足要求
- **端口冲突**:**part8h 的 server 占着 4000** — 跑 part8i 前先 `Ctrl+C` 杀 part8h。或者改 index.js `port: 4000` → 4001(但会偏离课程)。
- **enum 无新包** — graphql v16 自带 enum 支持
- **Step 7 必须先 addPerson 再过滤** — 不然没"没 phone"的人可以测
- **Step 6 报错是预期** — 故意写错 enum 值,GraphQL 在 schema 层拒绝 — 这是 enum 的**优势**,不是 bug

---

## 后续子段

- part8i **Enum 已完结**(兑现 part8h 伏笔:不是所有业务规则都该抛错,有时候应该软过滤)
- Chapter 2 后续小节:
  - part8j — **Changing a phone number**(changeNumber mutation)— 有代码
  - part8k — **More on queries**(combined queries + aliases)— 有代码
- 后续 part8j/8k 会按"一次只推进一小节"纪律逐个落地
- Chapter 3-6 是 React Apollo Client / DB / Login / Fragments — 还没规划
- 本节**不** commit / push
- 本节**不** 跑任何命令