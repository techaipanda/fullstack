# part8 g — Mutations(verbatim 课程 Chapter 2 "Mutations" 段)

> **本子项目作用**:把课程 Chapter 2 里的 **Mutations** 段做成最小可跑的 demo + 兑现 part8f 末尾的伏笔("Mutations also require a resolver...")。
>
> **关键诚实声明**:课程本节 verbatim 改了 3 处:① typeDefs 新增 `type Mutation { addPerson(...) }`;② resolvers 新增 `Mutation.addPerson`(用 `uuid()` 生成 id + `persons.concat(person)`);③ `persons` 从 `const` 改成 `let`(mutation 要重赋值)。Query / Person 块 / Address 类型 沿用 part8f verbatim。

---

## 课程原文要点(verbatim 摘录)

> "Let's add a functionality for adding new persons to the phonebook. In GraphQL, all operations which cause a change are done with mutations. Mutations are described in the schema as the keys of type `Mutation`."
>
> ```graphql
> type Mutation {
>   addPerson(
>     name: String!
>     phone: String
>     street: String!
>     city: String!
>   ): Person
> }
> ```
>
> "The Mutation is given the details of the person as parameters. The parameter `phone` is the only one which is nullable. The Mutation also has a return value. The return value is type `Person`, the idea being that the details of the added person are returned if the operation is successful and if not, null. Value for the field `id` is not given as a parameter. Generating an id is better left for the server."
>
> "Mutations also require a resolver:"
>
> ```js
> const { v1: uuid } = require('uuid')
>
> const resolvers = {
>   Query: { /* ... */ },
>   Person: { /* ... */ },
>   Mutation: {
>     addPerson: (root, args) => {
>       const person = { ...args, id: uuid() }
>       persons = persons.concat(person)
>       return person
>     }
>   }
> }
> ```
>
> "The mutation adds the object given to it as a parameter `args` to the array `persons`, and returns the object it added to the array."
>
> "The `id` field is given a unique value using the uuid library."
>
> ```graphql
> mutation {
>   addPerson(
>     name: "Pekka Mikkola"
>     phone: "045-2374321"
>     street: "Vilppulantie 25"
>     city: "Helsinki"
>   ) {
>     name
>     phone
>     address { city street }
>     id
>   }
> }
> ```
>
> ```json
> {
>   "data": {
>     "addPerson": {
>       "name": "Pekka Mikkola",
>       "phone": "045-2374321",
>       "address": { "city": "Helsinki", "street": "Vilppulantie 25" },
>       "id": "2b24e0b0-343c-11e9-8c2a-cb57c2bf804f"
>     }
>   }
> }
> ```

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 3 个)

### ⭐ Mutation vs Query 的本质区别

| 维度 | Query | Mutation |
|---|---|---|
| 用途 | **读** — 取数据 | **写** — 修改数据 |
| Schema 类型 | `type Query` | `type Mutation` |
| 执行顺序 | **并行** | **串行**(保证一致性) |
| 返回值 | 请求的数据 | 修改后的对象(让客户端确认) |
| 副作用 | 应该有 none | 应该有 yes(否则用 Query)|

⭐ 关键认知:**所有"会改状态"的操作都用 mutation**(增删改)— 包括 addPerson、changePerson、deletePerson。GraphQL 通过 query/mutation 命名约定让客户端明确"这次操作会不会改 server 状态"。

### ⭐ Mutation 参数设计

```graphql
type Mutation {
  addPerson(
    name: String!     # ⭐ 必填(non-null)
    phone: String     # ⭐ nullable(可选)
    street: String!   # ⭐ 必填
    city: String!     # ⭐ 必填
  ): Person           # ⭐ 返回 Person(成功返对象,失败返 null)
}
```

⭐ 设计模式:
- **必填字段用 `!`** — 客户端忘传就报错,不要在 resolver 里手动 validate
- **`id` 不让客户端传** — 课程明示"Generating an id is better left for the server"(避免客户端造重复 id)
- **返回值 = 被改的对象** — 客户端不用再发一次 query 拿新对象

### ⭐ addPerson resolver 的 3 步模式

```js
addPerson: (root, args) => {
  const person = { ...args, id: uuid() }  // ① 拼对象(server 生成 id)
  persons = persons.concat(person)         // ② 加到数组(创建新数组)
  return person                            // ③ 返回新对象
}
```

⭐ 步骤拆解:
- **步骤 ①**:`...args` 把客户端传的 name/phone/street/city 平铺开,再加 `id: uuid()` 字段
- **步骤 ②**:`persons.concat(person)` **创建新数组** + 赋值回去(为什么 `persons` 必须是 `let`)
- **步骤 ③**:返回 person — Apollo 拿到这个对象后,**自动调用 `Person.address` resolver**(沿用 part8f)把 flat `street`/`city` 拼成嵌套 `address`

⭐⭐⭐ **关键**:`addPerson` 返回的是 flat 对象(有 `street`/`city`,没 `address`),**客户端 response 里看到嵌套 `address` 是 `Person.address` resolver 干的活**。所以 part8f 的 resolver 在 part8g 仍然必要。

### ⭐ const → let 的必要性

| 字段类型 | part8f | part8g | 原因 |
|---|---|---|---|
| `persons` | `const persons = [...]` | **`let persons = [...]`** | mutation 要 `persons = persons.concat(person)` 重赋值,`const` 不允许 |

⭐ 这是 part8a-f 都没遇到的"运行时修改状态"诉求。改 `let` 是最小破坏性的调整。

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要一个终端**。

### Step 1 — 安装依赖(part8g 多装一个 `uuid`)

```bash
cd D:\workspace\fullstack_workspace\fullstack\part8\g-mutations
npm install
```

**期望**:`uuid` 包出现在 `node_modules/uuid/`,且 `package-lock.json` 有 uuid 条目。

### Step 2 — 启动 server(先确保 4000 端口空着 — part8f 杀干净)

```bash
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

如果看到 `EADDRINUSE :::4000` — 说明 part8f 的 server 还在跑。先 Ctrl+C 杀掉(或换端口,见下"⚠️ Windows 注意事项")。

### Step 3 — 浏览器进 Apollo Sandbox

浏览器访问 `http://localhost:4000`。

### Step 4 — 先确认初始状态(2 个人)

```graphql
query {
  personCount
  allPersons {
    name
    phone
    address { city street }
  }
}
```

**期望响应**:

```json
{
  "data": {
    "personCount": 2,
    "allPersons": [
      { "name": "Arto Hellas", "phone": "040-123543", "address": { "city": "Helsinki", "street": "Tapiolankatu 5 A" } },
      { "name": "Mary Popup", "phone": "040-432342", "address": { "city": "Helsinki", "street": "Mannerheimintie 100" } }
    ]
  }
}
```

⭐ **基线**:`personCount === 2`(只有 Arto + Mary)。

### Step 5 — 跑 addPerson mutation(课程核心 verbatim 示例)

在 Apollo Sandbox 的 Operation 类型选 **Mutation**,然后输入:

```graphql
mutation {
  addPerson(
    name: "Pekka Mikkola"
    phone: "045-2374321"
    street: "Vilppulantie 25"
    city: "Helsinki"
  ) {
    name
    phone
    address { city street }
    id
  }
}
```

**期望响应**(完全 verbatim 课程示例,id 会不同因为 uuid() 是动态生成的):

```json
{
  "data": {
    "addPerson": {
      "name": "Pekka Mikkola",
      "phone": "045-2374321",
      "address": { "city": "Helsinki", "street": "Vilppulantie 25" },
      "id": "2b24e0b0-343c-11e9-8c2a-cb57c2bf804f"
    }
  }
}
```

⭐ **关键验证 3 件事**:
- ✅ `address` 是嵌套对象(`{ city, street }` 结构)— 证明 `Person.address` resolver 在 mutation response 路径上也跑了
- ✅ `id` 是合法 UUID v1 格式(`xxxxxxxx-xxxx-1xxx-xxxx-xxxxxxxxxxxx` 第 13 位是 `1`)
- ✅ 新 person 被加进了内存数组(`personCount` 现在是 3,见 Step 6)

### Step 6 — 验证 persons 数组被修改(personCount 增加)

回到 **Query** 类型,跑:

```graphql
query {
  personCount
  allPersons {
    name
    id
  }
}
```

**期望**:`personCount` 从 2 → **3**,allPersons 数组里有 Pekka Mikkola(及其他两人)。

⭐ **铁证**:`persons = persons.concat(person)` 真的修改了内存数组 — 下次 query 拿到的就是新状态。

### Step 7 — 再 addPerson 一次,id 必不一样

再跑一次 Step 5 的 mutation(可以改 name,也可以不改)。

**期望**:返回的 `id` 和上次**完全不同** — 因为 `uuid()` 每次调用生成新值。

⭐ **铁证**:id 是 server 生成的,不是客户端算的(课程明示"Generating an id is better left for the server")。

### Step 8 — 故意省略 phone(mutation 仍应成功)

phone 是 nullable,可以省略:

```graphql
mutation {
  addPerson(
    name: "No Phone Person"
    street: "Testikatu 1"
    city: "Testila"
  ) {
    name
    phone
    id
  }
}
```

**期望**:`phone: null`(因为没传)。

⭐ 验证 typeDefs 里 `phone: String`(无 `!`)的设计正确 — 客户端可以省略。

### Step 9 — 故意省略 name(mutation **应当失败**)

name 是 non-null,省略会报错:

```graphql
mutation {
  addPerson(
    phone: "045-111"
    street: "Testikatu 2"
    city: "Testila"
  ) {
    name
    id
  }
}
```

**期望**:**响应里有 `errors` 字段**(GraphQL error),message 类似:

```
"Variable "$name" of required type "String!" was not provided."
```

⭐ **铁证**:non-null 参数必须传 — typeDefs 编译期就检查,不是 resolver 里手动 check。

### 结束

终端 `Ctrl + C` 停 server。

⭐⭐⭐ 注意:**personCount/persons 状态是内存的** — 杀掉 server 就回到初始 2 人(Arto + Mary),重启后所有 Pekka 都消失。这是 in-memory 数组的限制,不是 bug。**DB 集成在 part8 数据库章节(Chapter 4)**。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| Mutation | "all operations which cause a change are done with mutations" | GraphQL 里所有修改 server 状态的操作 | `type Mutation { addPerson(...) }` |
| `type Mutation` | "Mutations are described in the schema as the keys of type Mutation" | GraphQL schema 里写 mutation 的位置(跟 `type Query` 平级) | typeDefs 末尾 |
| `addPerson(name, phone, street, city): Person` | "The Mutation is given the details of the person as parameters" | mutation 函数签名 — 4 参数 + 返回 Person | typeDefs.Mutation.addPerson |
| `phone: String` (no `!`) | "The parameter phone is the only one which is nullable" | mutation 参数的可空性 | typeDefs.Mutation.addPerson.phone |
| "Generating an id is better left for the server" | 同上 | id 不让客户端传,server 用 uuid 生成 | `id: uuid()` |
| `uuid()` | "The id field is given a unique value using the uuid library" | uuid npm 包生成的 v1 格式字符串 | schema.js 顶部 `const { v1: uuid } = require('uuid')` |
| `args` | "given to it as a parameter args" | GraphQL 传给 resolver 的客户端入参对象 | `addPerson: (root, args) =>` |
| `persons.concat(person)` | "adds the object ... to the array persons" | 不可变追加 — 创建新数组,返回 person | `Mutation.addPerson` resolver body |

---

## ⭐ 关键 takeaway(5 条)

1. **Mutation = 写,Query = 读** — GraphQL 用类型关键字让客户端明确"这次会不会改状态"
2. **必填参数用 `!`** — 让 GraphQL 在 schema 层校验,不要在 resolver 里手动检查
3. **id 留给 server** — 客户端造 id 会重复;server 用 uuid 生成保证唯一
4. **mutation 返回被改的对象** — 客户端不用再发 query 拿新数据
5. **in-memory 状态会丢** — 重启 server 后 Pekka 都消失;DB 持久化在 Chapter 4 解决

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `type Mutation { addPerson }` | 课程 verbatim | **完全 verbatim** | 严格遵循 |
| `Mutation.addPerson` resolver | 课程 verbatim | **完全 verbatim**(含 `(root, args)` 而非 `_root, _args`)| 严格遵循 |
| `const { v1: uuid } = require('uuid')` | 课程 verbatim | **完全 verbatim** | 严格遵循 |
| `persons` 从 const → let | 课程隐含(必改) | **已改** | mutation 要重赋值,这是课程示例能跑的最低必要改动 |
| `persons` 数据 | 课程 verbatim | **完全 verbatim**(沿用 part8a-f) | 课程本节未改 mock 数据 |
| `Query` 块 / `Person` 块 / `type Address` | 课程本节未改 | 沿用 part8f verbatim | 课程本节不动 Query / Person |
| `index.js` | 课程无 verbatim 改动 | verbatim 沿用 part8a/f | server 启动本节没变 |
| `package.json` | 课程无 verbatim | 加 `uuid` 依赖(课程明示 "uuid library") | uuid 必须装 |
| `.gitignore` | 课程无 | 标准 `node_modules/` + log + env | 沿用 part8a-f |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **Node.js 版本**:Apollo Server v4 需要 Node.js `^18.0.0 || >=20.0.0`,你的 `v22.22.3` 满足要求
- **端口冲突**:**part8f 的 server 占着 4000** — 跑 part8g 前先 `Ctrl+C` 杀 part8f。或者改 index.js `port: 4000` → 4001(但会偏离课程)。
- **uuid 包**:`npm install uuid` 会装 v9(默认最新);课程示例用的是 v1 风格(`xxxxxxxx-xxxx-1xxx-...`),`v1: uuid` 解构确保用 v1 生成函数。
- **Step 9 报错是预期**:故意省略必填参数,GraphQL 报 error 是**预期行为**,不是 server 出问题。
- **重启 server = 状态清零** — 内存数组的固有限制,Course 后续 Chapter 4 引入 mongoose 解决。

---

## 后续子段

- part8g **Mutations 已完结**(兑现 part8f 末尾伏笔:Mutation 需要 resolver + 用 uuid 生成 id + persons 重赋值)
- Chapter 2 后续小节:
  - part8h — **Error handling**(GraphQLError + BAD_USER_INPUT)— 有代码
  - part8i — **Enum**(YesNo 过滤)— 有代码
  - part8j — **Changing a phone number**(changeNumber mutation)— 有代码
  - part8k — **More on queries**(combined queries + aliases)— 有代码
- 后续 part8h/8i/... 会按"一次只推进一小节"纪律逐个落地
- Chapter 3-6 是 React Apollo Client / DB / Login / Fragments — 还没规划
- 本节**不** commit / push
- 本节**不** 跑任何命令