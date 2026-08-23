# part8 f — Object within an object(verbatim 课程 Chapter 2 "Object within an object" 段)

> **本子项目作用**:把课程 Chapter 2 里的 **Object within an object** 段做成最小可跑的 demo + 兑现 part8e 末尾的伏笔("嵌套 type 不适用 default resolver")。
>
> **关键诚实声明**:课程本节 verbatim 改了 2 处:① `typeDefs` 新增 `Address` 类型 + `Person.address: Address!` 字段(去掉 `street`/`city`);② `resolvers.Person` 只剩 `address` 自定义 resolver(从 `root.street` / `root.city` 拼装 Address 对象)。其余 Query 块沿用 part8a-e verbatim。

---

## 课程原文要点(verbatim 摘录)

> "Let's modify the schema a bit"
>
> ```graphql
> type Address {
>   street: String!
>   city: String!
> }
>
> type Person {
>   name: String!
>   phone: String
>   address: Address!
>   id: ID!
> }
> ```
>
> "so a person now has a field with the type `Address`, which contains the street and the city."
>
> "Because the objects saved in the array do not have an `address` field, the default resolver is not sufficient. Let's add a resolver for the `address` field of `Person` type:"
>
> ```js
> const resolvers = {
>   Query: {
>     personCount: () => persons.length,
>     allPersons: () => persons,
>     findPerson: (root, args) =>
>       persons.find(p => p.name === args.name)
>   },
>   Person: {
>     address: (root) => {
>       return {
>         street: root.street,
>         city: root.city
>       }
>     }
>   }
> }
> ```
>
> "So every time a `Person` object is returned, the fields `name`, `phone` and `id` are returned using their default resolvers, but the field `address` is formed by using a self-defined resolver. The parameter `root` of the resolver function is the person-object, so the street and the city of the address can be taken from its fields."
>
> "The queries requiring the address change into"
>
> ```graphql
> query {
>   findPerson(name: "Arto Hellas") {
>     phone 
>     address {
>       city 
>       street
>     }
>   }
> }
> ```
>
> "and the response is now a person object, which contains an address object."
>
> ```json
> {
>   "data": {
>     "findPerson": {
>       "phone": "040-123543",
>       "address": {
>         "city": "Helsinki",
>         "street": "Tapiolankatu 5 A"
>       }
>     }
>   }
> }
> ```

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 1 个)

### ⭐ 嵌套 type 不适用 default resolver

part8e 我们知道:plain object 的字段 Apollo 自动用 `root => root.<fieldName>`。但**嵌套 GraphQL type 不行**:

| 字段类型 | default resolver 行为 | 是否够用 |
|---|---|---|
| `String!` / `Int!` / `ID!` | `root => root.fieldName` | ✅ 直接够用 |
| 自定义 type(如 `Address!`)| Apollo 找不到 `root.address` 字段 | ❌ **必须自定义** |

⭐ 原因:`persons` 数组里每个对象长这样:
```js
{ name, phone, street, city, id }  // ← 没有 address!
```

Apollo 默认行为是 `root.address` — 但 `root.address === undefined`,返回不了 `{ street, city }` 结构。所以**必须自定义** `Person.address` resolver,把 `root.street` / `root.city` 手动拼成新对象。

### ⭐ schema 改动前后的字段对照

| 字段 | part8e schema | part8f schema | part8f resolver |
|---|---|---|---|
| `Person.name` | `String!` | `String!`(不变)| Apollo 默认 |
| `Person.phone` | `String` | `String`(不变)| Apollo 默认 |
| `Person.street` | `String!` | ❌ **删除** | — |
| `Person.city` | `String!` | ❌ **删除** | — |
| `Person.address` | ❌ 不存在 | `Address!`(新增)| **自定义** — 从 root 拼装 |
| `Person.id` | `ID!` | `ID!`(不变)| Apollo 默认 |

⭐ **数据从扁平变嵌套** — 客户端 query 写法变了,响应结构也变了:
```graphql
# part8e
query { findPerson(name: "Arto") { street city } }

# part8f
query { findPerson(name: "Arto") { address { street city } } }
```

### ⭐ Root 参数第三次出场

| 子项目 | root 值 | 用途 |
|---|---|---|
| part8d | `undefined` | 没父对象 |
| part8e | person 对象 | `root => root.fieldName`(取字段)|
| **part8f** | person 对象 | **`{ street: root.street, city: root.city }` — 从同一对象挑两个字段重新组装成新对象** |

⭐ 自定义 resolver 的本质 = **重新构造返回对象**。可以用 root 任意组合,不限于取字段,还能做计算(`name.toUpperCase()`)、加字段(`{ ...root, fullName: root.name + '!' }`)、查 DB、调外部 API 等。

### ⭐ 课程没改的部分(沿用 part8e)

- ✅ `Query.personCount` / `Query.allPersons` / `Query.findPerson` — verbatim
- ✅ `persons` mock 数组 — verbatim(还是 `street`/`city` 平铺)
- ✅ `typeDefs` 里的 `Query` 块 — verbatim
- ✅ `index.js` — verbatim 沿用 part8a

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要一个终端**。

### Step 1 — 安装依赖

```bash
cd D:\workspace\fullstack_workspace\fullstack\part8\f-object-within-an-object
npm install
```

### Step 2 — 启动 server

```bash
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

### Step 3 — 浏览器进 Apollo Sandbox

浏览器访问 `http://localhost:4000`。

### Step 4 — 跑课程核心 query(address 嵌套)

```graphql
query {
  findPerson(name: "Arto Hellas") {
    phone 
    address {
      city 
      street
    }
  }
}
```

**期望响应**(完全 verbatim 课程示例):

```json
{
  "data": {
    "findPerson": {
      "phone": "040-123543",
      "address": {
        "city": "Helsinki",
        "street": "Tapiolankatu 5 A"
      }
    }
  }
}
```

⭐ **关键验证**:
- `phone` 是 string(Apollo 默认行为)
- `address` 是嵌套对象(`{ city, street }` 结构)— 证明自定义 resolver 工作了
- 数据来源于 `persons[0].street` / `persons[0].city` — 证明 root 真的是 person 对象

### Step 5 — 跑全字段 query(name/phone/address/id)

```graphql
query {
  findPerson(name: "Mary Popup") {
    name
    phone
    address {
      city
      street
    }
    id
  }
}
```

**期望响应**:

```json
{
  "data": {
    "findPerson": {
      "name": "Mary Popup",
      "phone": "040-432342",
      "address": {
        "city": "Helsinki",
        "street": "Mannerheimintie 100"
      },
      "id": "3d594670-3436-11e9-bc57-8b80ba54c431"
    }
  }
}
```

⭐ `name` / `phone` / `id` 走 Apollo default resolver,`address` 走自定义 resolver — 两个机制在同一响应里和平共处。

### Step 6 — 对比实验:验证不加自定义 resolver 会怎样

把 `Person.address` resolver 整段**注释掉**(改成 `Person: { /* address: ... */ }`),重启 server,再跑 Step 4 的 query。

**期望**:**响应里 `address: null`**(或者 `phone` 字段还在,但 `address` 是 null)。

```json
{
  "data": {
    "findPerson": {
      "phone": "040-123543",
      "address": null
    }
  }
}
```

⭐ **铁证**:
- Apollo 默认找 `root.address` — 但 person 对象里没这个 key
- 返回 null(GraphQL 不报错,因为 schema `Address!` 用了 non-null,但实际上 Apollo 还是会尝试 fallback — 这要看版本;在 v4 standalone 大多数情况是返回 null 而不是抛 GraphQLError)
- 这就是为什么**嵌套类型必须自定义 resolver**

改回去。

### Step 7 — 加 console.log 看 root

把 `Person.address` resolver 改成:

```js
Person: {
  address: (root) => {
    console.log('=== Person.address called ===')
    console.log('root:', root)
    return {
      street: root.street,
      city: root.city,
    }
  },
},
```

重启 server,跑 Step 4 的 query。

**期望**(终端输出):

```
=== Person.address called ===
root: {
  name: 'Arto Hellas',
  phone: '040-123543',
  street: 'Tapiolankatu 5 A',
  city: 'Helsinki',
  id: '3d594650-3436-11e9-bc57-8b80ba54c431'
}
```

⭐ **铁证**:`root` 是 person 对象(有 `street` / `city`,但**没有** `address`)。这是为什么 default resolver 不能用 — 必须自定义来组装 Address。验证完改回去。

### Step 8 — allPersons 也走 address resolver

```graphql
query {
  allPersons {
    name
    address {
      street
    }
  }
}
```

**期望**:`Person.address` resolver 会被调用 2 次(Arto + Mary 各 1 次),响应数组里每个人都有嵌套 address。

### Step 9 —(可选)看 schema

跑 introspection query:

```graphql
query {
  __schema {
    types {
      name
    }
  }
}
```

在返回的 types 列表里能看到 `Address`(课程本节新增)。

### 结束

终端 `Ctrl + C` 停 server。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| Object within an object | "Let's modify the schema a bit ... so a person now has a field with the type Address" | GraphQL type 嵌套 — Person 里有 Address | `Person.address: Address!` |
| `Address!` | "type Address { street: String! city: String! }" | 新的 GraphQL type,non-null | `typeDefs` 里 `type Address` |
| `Address!` non-null | "address: Address!" | Person.address 必有值(不能为 null) | `typeDefs.Person.address` |
| default resolver 不足 | "the default resolver is not sufficient" | plain object 上找不到 `address` 字段,Apollo 默认行为不能凭空构造嵌套对象 | Step 6 验证 |
| self-defined resolver | "the field address is formed by using a self-defined resolver" | `Person.address: (root) => ({ street, city })` 自定义返回 Address 对象 | `resolvers.Person.address` |
| root | "the parameter root of the resolver function is the person-object" | 父对象 person | `address: (root) => ...` |

---

## ⭐ 关键 takeaway(5 条)

1. **嵌套 type 必须自定义 resolver** — 因为 plain object 没有那个 key,Apollo 不能凭空构造
2. **课程数据故意保留平铺**(`street`/`city` 在顶层)— 体现"resolver 就是把扁平数据重新组装成嵌套结构"的工作
3. **root 参数可以任意组合** — `root => ({ street: root.street, ... })` 是核心模式,不止取字段,还能做 transform
4. **schema 字段名 ≠ 数据字段名** — `Person.address` 是 schema 字段,数据里叫 `street`/`city`,resolver 负责桥接
5. **嵌套多层怎么办**(铺垫)— 比如 `Address.country` / `Address.zip` — 同样的逻辑,**必须**给每个嵌套 type 字段写 resolver(或在数据里就有对应结构)

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `type Address` | 课程 verbatim line 1087-1097 | **完全 verbatim**(含 `String!` 而非 `String`)| 严格遵循 |
| `Person.address: Address!` | 课程 verbatim line 1109-1111 | **完全 verbatim** | 严格遵循 |
| `Person` 块移除 street/city | 课程 verbatim 改了 | **完全 verbatim** | 严格遵循 |
| `Person.address` resolver | 课程 verbatim line 1182-1197 | **完全 verbatim**(含 `(root)` 而非 `_root`)| 严格遵循 |
| `Query` 块 | 课程本节未改 | 沿用 part8a-e verbatim | 本节 Query 没改 |
| `persons` mock 数组 | 课程本节未改 | 沿用 part8a-e verbatim(仍无 `address` 字段) | 数据故意保留扁平 |
| `index.js` | 课程无 | verbatim 沿用 part8a | server 启动代码本节没变 |
| `package.json` | 课程无 verbatim | 同 part8a-e 结构 + name 改 `object-within-an-object` | 标识清楚 |
| `.gitignore` | 课程无 | 标准 `node_modules/` + log + env | 沿用 part8a |
| `/* GraphQL */` 标记 | part8c 讲到 | 已在 typeDefs 前加 | 提前应用 |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **Node.js 版本**:Apollo Server v4 需要 Node.js `^18.0.0 || >=20.0.0`,你的 `v22.22.3` 满足要求
- **端口冲突**:如果 4000 被占,改 `index.js` 里 `port: 4000` → 4001,重启即可
- **Step 6/7 改 schema.js 后记得重启 server** — Apollo Server 不会热重载
- **Step 7 的 console.log** 是临时调试用,验证完记得改回去
- **Step 9 introspection** — Apollo Sandbox 默认会自动给你 schema tab,不用手写

---

## 后续子段

- part8f **Object within an object 已完结**(兑现 part8e 末尾伏笔:嵌套 type 必须自定义 resolver)
- Chapter 2 后续小节:
  - part8g — **Mutations**(addPerson)— 有代码
  - part8h — **Error handling**(GraphQLError + BAD_USER_INPUT)— 有代码
  - part8i — **Enum**(YesNo 过滤)— 有代码
  - part8j — **Changing a phone number**(changeNumber mutation)— 有代码
  - part8k — **More on queries**(combined queries + aliases)— 有代码
- 后续 part8g/8h/... 会按"一次只推进一小节"纪律逐个落地
- Chapter 3-6 是 React Apollo Client / DB / Login / Fragments — 还没规划
- 本节**不** commit / push
- 本节**不** 跑任何命令
