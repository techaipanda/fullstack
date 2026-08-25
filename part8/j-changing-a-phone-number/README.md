# part8 j — Changing a phone number(verbatim 课程 Chapter 2 "Changing a phone number" 段)

> **本子项目作用**:把课程 Chapter 2 里的 **Changing a phone number** 段做成最小可跑的 demo + 兑现 part8i 末尾的"修改现有记录"伏笔(update semantics)。
>
> **关键诚实声明**:课程本节 verbatim 改了 2 处:① typeDefs `type Mutation` 块加 `editNumber(name: String!, phone: String!): Person`;② resolvers `Mutation` 块加 `editNumber` resolver(不可变 `persons.map` 更新 + 找不到 person 返回 null)。其他块沿用 part8i verbatim。

---

## 课程原文要点(verbatim 摘录)

> "Let's add a mutation for changing the phone number of a person. The schema of this mutation looks as follows:"
>
> ```graphql
> type Mutation {
>   addPerson(
>     name: String!
>     phone: String
>     street: String!
>     city: String!
>   ): Person
>   editNumber(
>     name: String!
>     phone: String!
>   ): Person
> }
> ```
>
> "and is done by a resolver:"
>
> ```js
> Mutation: {
>   // ...
>   editNumber: (root, args) => {
>     const person = persons.find(p => p.name === args.name)
>     if (!person) {
>       return null
>     }
>
>     const updatedPerson = { ...person, phone: args.phone }
>     persons = persons.map(p => p.name === args.name ? updatedPerson : p)
>     return updatedPerson
>   }   
> }
> ```
>
> "The mutation finds the person to be updated by the field name."

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 3 个)

### ⭐ Mutation 的三种语义

| 语义 | part8 例子 | resolver 行为 |
|---|---|---|
| **Create**(创建)| part8g/h/i: `addPerson` | 创建新对象 + 拼接到数组 |
| **Update**(修改)| **part8j: `editNumber`** | 找到旧对象 + 创建新对象 + 替换数组里那项 |
| **Delete**(删除)| (part8 课程里没讲)| 找到 + 数组 filter 掉 |

⭐ 关键认知:**Update 比 Create 复杂**:
- Create:无副作用风险(加新 id 不会冲突)— 但要查重(name 重复要拒)
- Update:有副作用风险 — 找不到 person 怎么办?课程选最简方案:**返回 null**,让客户端自己判

### ⭐ 不可变更新模式(immutable update)

```js
const updatedPerson = { ...person, phone: args.phone }
persons = persons.map(p => p.name === args.name ? updatedPerson : p)
```

⭐ **WRONG**(in-place mutation,反模式):
```js
const person = persons.find(p => p.name === args.name)
person.phone = args.phone  // ⭐ 改原对象!违反"不可变"原则
```

⭐ **CORRECT**(不可变模式,3 步):
1. `{ ...person, phone: args.phone }` — 创建新对象(spread 原对象 + 覆盖字段)
2. `persons.map(...)` — 创建新数组(找到匹配的就替换,其他保留)
3. 赋值回去 `persons = ...` — `let persons` 才能重赋值(沿用 part8g 改动)

⭐ 不可变模式的好处:
- ✅ 调试时旧版本/新版本可以共存(老引用还能用)
- ✅ Apollo 拿到 updatedPerson 后,response 里 Person.address 走自定义 resolver 重新计算嵌套 address(联动 part8f)
- ✅ 如果 update 中途出错(`throw`),persons 数组**没被改** — 数据一致

### ⭐ editNumber 的 schema 设计细节

```graphql
editNumber(
  name: String!
  phone: String!
): Person
```

⭐ 对照 addPerson 的 schema:

| 字段 | addPerson | editNumber | 原因 |
|---|---|---|---|
| `name` | `String!`(non-null)| `String!` | 必传(主键找记录)|
| `phone` | `String`(nullable)| **`String!`** | ⭐ **改 phone 必传 phone** — 没"省略"语义 |
| `street` | `String!` | ❌ 没 | edit 不改地址 |
| `city` | `String!` | ❌ 没 | edit 不改地址 |
| 返回类型 | `Person` | `Person` | 都可返回 null(找不到/查重失败)|

⭐ **认知**:`editNumber.phone: String!` 是**业务语义**强制 —"改 phone 就要给一个新 phone 值",没有"省略 = 不改"的语义。如果允许省略 phone,就要写更复杂的逻辑(读旧 phone 值)。

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要一个终端**。

### Step 1 — 安装依赖(无新增,沿用 part8i)

```bash
cd D:\workspace\fullstack_workspace\fullstack\part8\j-changing-a-phone-number
npm install
```

**期望**:3 个包装好。editNumber 无新依赖。

### Step 2 — 启动 server(先杀 part8i 占的 4000)

```bash
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

如果看到 `EADDRINUSE :::4000` — 说明 part8i 的 server 还在跑,先 `Ctrl+C` 杀掉。

### Step 3 — 浏览器进 Apollo Sandbox

浏览器访问 `http://localhost:4000`。

### Step 4 — 看初始 phone(基线)

```graphql
query {
  findPerson(name: "Arto Hellas") {
    name
    phone
    address { city street }
  }
}
```

**期望响应**:`phone: "040-123543"`(Arto 的旧 phone)。

### Step 5 — 跑 editNumber 改 Arto 的 phone

```graphql
mutation {
  editNumber(name: "Arto Hellas", phone: "040-999111") {
    name
    phone
    address { city street }
    id
  }
}
```

**期望响应**:`phone: "040-999111"`,其他字段(name / address / id)**不变**。

⭐ **铁证 4 件事**:
- ✅ phone 真的被改了
- ✅ `name` / `address` / `id` 都没变(spread 时其他字段保留)
- ✅ `address` 仍然是嵌套对象(`Person.address` resolver 在 mutation response 上也跑)
- ✅ `id` 不变(不是新增 person,只是改字段)

### Step 6 — 跑 query 验证 persons 数组被实际修改

```graphql
query {
  findPerson(name: "Arto Hellas") {
    name
    phone
  }
}
```

**期望**:`phone: "040-999111"`(Step 5 改的真的写回数组了,不是只改了 response)。

⭐ **铁证**:`persons = persons.map(...)` 真的更新了内存数组 — 下次 query 拿到的是新值。

### Step 7 — 跑 editNumber 找不存在的人 → 返回 null

```graphql
mutation {
  editNumber(name: "Nobody", phone: "040-000") {
    name
    phone
  }
}
```

**期望响应**:

```json
{
  "data": {
    "editNumber": null
  }
}
```

⭐ **铁证**:schema 返回类型 `Person`(没加 `!`)— 允许 null,所以 `editNumber: null` 是合法 response。
⭐ **注意**:**没 errors 字段** — 这是课程选的最简方案,客户端必须检查 `data.editNumber === null` 来判断"没找到人"。

### Step 8 — 验证不存在的 person 不污染 persons 数组

```graphql
query {
  personCount
}
```

**期望**:`personCount: 2`(没变成 3)— Step 7 没改数组。

⭐ **铁证**:返回 null 的分支没走 `persons.map(...)`,所以没加项、没改项。

### Step 9 — 故意省略 phone(editNumber 的 phone 是 non-null,**应当失败**)

```graphql
mutation {
  editNumber(name: "Arto Hellas") {
    name
  }
}
```

**期望**:**响应里有 `errors` 字段**,message 类似:

```
"Variable "$phone" of required type "String!" was not provided."
```

⭐ **铁证**:editNumber 的 phone 是 `String!` — schema 层校验,不能省略。这跟 addPerson 的 `phone: String`(可空)对比鲜明。

### Step 10 — 综合对比:三种 mutation 的 schema

| Mutation | 必填 phone? | 找不到 person 时 | 数组变化 |
|---|---|---|---|
| `addPerson` | nullable(`String`) | — | `persons.concat(person)` 加 1 |
| `editNumber` | **`non-null`(`String!`)** | `return null` | `persons.map(...)` 替换那项 |

### Step 11 — 验证前面所有功能没被破坏

跑一次:

```graphql
query {
  allPersons(phone: NO) {
    name
  }
}
```

**期望**:**返回空数组**(Step 5 改完后 Arto 仍有 phone = `040-999111`,Mary 也有 phone)— 没"没 phone"的人。

跑一次:

```graphql
mutation {
  addPerson(name: "Arto Hellas", street: "x", city: "y") {
    name
  }
}
```

**期望**:**响应里 `errors` 数组有 `BAD_USER_INPUT` 错误** — part8h 查重逻辑没被破坏。

### 结束

终端 `Ctrl + C` 停 server。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| editNumber | "Let's add a mutation for changing the phone number of a person" | 修改某人的 phone number 的 mutation | `Mutation.editNumber` |
| update mutation | (隐含 — 改现有记录)| GraphQL mutation 三大类之一(Create / Update / Delete)| `Mutation.editNumber` |
| `name: String!` | (editNumber schema 必填)| 用 name 作为查找的"主键" | typeDefs.Mutation.editNumber.name |
| `phone: String!` | (editNumber schema 必填)| 改 phone 必传 phone 值(非空) | typeDefs.Mutation.editNumber.phone |
| `persons.map(...)` | 课程 resolver 原文 | 不可变更新 — 创建新数组 | `editNumber` resolver body |
| `{ ...person, phone: args.phone }` | 课程 resolver 原文 | spread 原对象 + 覆盖字段 | `editNumber` resolver body |
| `return null` | "if (!person) { return null }" | 找不到 person → 返回 null(课程选最简方案) | `editNumber` resolver body |
| `Person` (nullable return) | schema 原文 `): Person`(无 `!`)| 返回类型允许 null | typeDefs.Mutation.editNumber 返回 |

---

## ⭐ 关键 takeaway(5 条)

1. **Mutation 三大类** — Create(addPerson) / Update(editNumber)/ Delete(课程没讲)
2. **不可变更新模式** — spread 创建新对象 + map 创建新数组 + 赋值回去
3. **editNumber 的 phone 是 non-null** — 改 phone 必传新值(对比 addPerson 的 phone 可空)
4. **找不到人返回 null**(课程最简方案)— schema 返回类型不加 `!`,客户端用 `data.editNumber === null` 判断
5. **part8h/i/j 共存** — 查重 + enum 过滤 + update edit 共用同一个 schema

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `Mutation.editNumber` schema | 课程 verbatim | **完全 verbatim** | 严格遵循 |
| `Mutation.editNumber` resolver | 课程 verbatim | **完全 verbatim**(含 `(root, args)` 而非 `_root, _args`)| 严格遵循 |
| `Query` / `Person.address` / `enum YesNo` / `Mutation.addPerson` | 课程未改 | verbatim 沿用 part8h/i | 课程本节不动这些 |
| `persons` 数据 | 课程 verbatim | **完全 verbatim**(沿用 part8a-i)| 课程本节不动 mock 数据 |
| `index.js` | 课程无 verbatim 改动 | verbatim 沿用 part8a/i | server 启动本节没变 |
| `package.json` | 课程无 verbatim 改动 | 沿用 part8i(无新增依赖)| 无依赖变更 |
| `.gitignore` | 课程无 | 标准 `node_modules/` + log + env | 沿用 part8a-i |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **Node.js 版本**:Apollo Server v4 需要 Node.js `^18.0.0 || >=20.0.0`,你的 `v22.22.3` 满足要求
- **端口冲突**:**part8i 的 server 占着 4000** — 跑 part8j 前先 `Ctrl+C` 杀 part8i。或者改 index.js `port: 4000` → 4001(但会偏离课程)。
- **editNumber 无新包** — 沿用 part8i 依赖
- **Step 7 返回 null 不是错** — 课程本节没要求"找不到人抛错",客户端需要 `data.editNumber === null` 判断
- **Step 9 报错是预期** — 故意省略必填的 phone,GraphQL 在 schema 层拒绝 — 这是 schema 层校验的**价值**,不是 bug
- **重启 server = persons 回到初始 2 人 + 旧 phone** — in-memory 数组的固有限制

---

## 后续子段

- part8j **Changing a phone number 已完结**(兑现 part8i 伏笔:update semantics + 不可变模式 + 找不到返回 null)
- Chapter 2 最后一节:
  - **part8k — More on queries**(combined queries + aliases)— 客户端侧的查询技巧(怎么在一个 query 里发多个请求 / 怎么重命名字段避免冲突)
- 后续 part8k 会按"一次只推进一小节"纪律落地
- Chapter 3-6 是 React Apollo Client / DB / Login / Fragments — 还没规划
- 本节**不** commit / push
- 本节**不** 跑任何命令