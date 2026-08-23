# part8 e — The default resolver(verbatim 课程 Chapter 2 "The default resolver" 段)

> **本子项目作用**:把课程 Chapter 2 里的 **The default resolver** 段做成最小可跑的 demo + 兑现 part8d 的伏笔("We will be using the first parameter of a resolver later")。
>
> **关键诚实声明**:课程本节 verbatim 给的就是 **part8a 的 resolvers 块 + 一个 `Person: { ... }` 块**。即把课程代码完整搬过来运行,然后**手动注释掉 Person 块**(还是一样的响应)+ **覆盖 street/city 为 Manhattan** 来对比验证 default resolver 的工作机制。

---

## 课程原文要点(verbatim 摘录)

> "When we do a query, for example"
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
>
> "the server knows to send back exactly the fields required by the query. How does that happen?"
>
> "A GraphQL server must define resolvers for **each** field of each type in the schema. We have so far only defined resolvers for fields of the type `Query`, so for each query of the application."
>
> "Because we did not define resolvers for the fields of the type `Person`, Apollo has defined [default resolvers](https://www.graphql-tools.com/docs/resolvers/#default-resolver) for them. They work like the one shown below:"
>
> ```js
> const resolvers = {
>   Query: {
>     personCount: () => persons.length,
>     allPersons: () => persons,
>     findPerson: (root, args) => persons.find(p => p.name === args.name)
>   },
>   Person: {
>     name: (root) => root.name,
>     phone: (root) => root.phone,
>     street: (root) => root.street,
>     city: (root) => root.city,
>     id: (root) => root.id
>   }
> }
> ```
>
> "The default resolver returns the value of the corresponding field of the object. The object itself can be accessed through the first parameter of the resolver, `root`."
>
> "If the functionality of the default resolver is enough, you don't need to define your own. It is also possible to define resolvers for only some fields of a type, and let the default resolvers handle the rest."

> **课程 bonus 示例**:课程紧接其后给了一个"硬编码覆盖"示例:
>
> ```js
> Person: {
>   street: (root) => 'Manhattan',
>   city: (root) => 'New York'
> }
> ```

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 1 个)

### ⭐ Default resolver 是什么?

Apollo 默认会给 schema 里**每个 type 的每个 field** 生成一个 default resolver。

**默认行为**:对 plain object,default resolver 就是 `(root) => root.<fieldName>`,**完全等同于把对象字段值取出来**。

⭐ **所以"不写 Person 块"和"完整写 Person 块"对外行为完全一致**。本子项目 `schema.js` 里写了完整的 5 个字段,只是为了演示。

### ⭐ root 参数这次真的有用了!

part8d 里 `root` 是 `undefined`,因为 Query 顶层 resolver 没"父对象"。part8e 起,root 有意义:

| Resolver 类型 | root 值 | 含义 |
|---|---|---|
| `Query.*`(part8a-d)| `undefined` | 没父对象 |
| `Person.*`(part8e)| **父对象** | 也就是 `Query.findPerson` 返回的那个 person 对象 |
| `Address.*`(part8f)| Address 对象 | 上一步 resolver 返回的对象 |

⭐ 调用链示例(本子项目):

```
Query.findPerson(name: "Arto Hellas") → 返回 persons[0] = { name, phone, street, city, id }
  ↓ Apollo 自动拿这个对象当 root
Person.name(root = { name, phone, ... }) → root.name = "Arto Hellas"
Person.phone(root) → root.phone = "040-123543"
...
```

### ⭐ "显式写"和"隐式不写"行为对比

| 写法 | findPerson query 响应 | 区别 |
|---|---|---|
| 不写 Person 块(part8a-d) | 完全一样 | Apollo 用 **隐式 default resolver** |
| 写完整 Person 块(part8e 默认) | 完全一样 | 显式 default resolver,代码可读性更好 |
| 只写 street/city 覆盖(本节 bonus) | street/city 全是 'Manhattan' / 'New York' | **覆盖了** default resolver |

⭐ 实际用途:用 `Person: { street: () => 'Manhattan' }` 这种写法,可以做**字段重写**、**字段计算**、**字段转换**(比如 `name: (root) => root.name.toUpperCase()`)。

### ⭐ Apollo 自动生成 default resolver 的条件

- ✅ type 是 `Object`(plain JS object 或 array)
- ✅ field 是 simple value(string / number / boolean)
- ❌ type 是另一个 GraphQL type(嵌套,需要**自定义 resolver** — 见 part8f "Object within an object")

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要一个终端**。

### Step 1 — 安装依赖

```bash
cd D:\workspace\fullstack_workspace\fullstack\part8\e-the-default-resolver
npm install
```

### Step 2 — 启动 server

```bash
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

### Step 3 — 浏览器进 Apollo Sandbox

浏览器访问 `http://localhost:4000`。

### Step 4 — Schema A(默认):5 字段全显式 default resolver

跑这个 query:

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

**期望响应**(应该跟 part8d 一模一样 — 因为 Apollo 默认行为就是这个):

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

⭐ **关键认知验证**:5 个字段全写出来 + Apollo 默认行为 = **完全相同的响应**。

### Step 5 — 对比实验 A:注释掉 Person 块

打开 `schema.js`,把 `Person: { ... }` 整块注释掉(用 `/* ... */` 包起来),重启 server。再跑 Step 4 的 query。

**期望响应**:**完全一样**。Apollo 用隐式 default resolver,跟显式写一模一样。

✅ 这就是课程说的"If the functionality of the default resolver is enough, you don't need to define your own."

### Step 6 — Schema B(覆盖示例):只覆盖 street/city

把 `Person` 块改成:

```js
Person: {
  street: (root) => 'Manhattan',
  city: (root) => 'New York',
},
```

(其他字段不写,让 Apollo 用默认行为;name/phone/id 仍然从 root 取)

重启 server,跑:

```graphql
query {
  findPerson(name: "Arto Hellas") {
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
    "findPerson": {
      "name": "Arto Hellas",
      "phone": "040-123543",
      "street": "Manhattan",     // ← 被覆盖了
      "city": "New York"          // ← 被覆盖了
    }
  }
}
```

⭐ **这就是 partial override 的威力**:
- `name` / `phone` → Apollo 自动用 default resolver → 取自 persons[0]
- `street` / `city` → 自定义 → 硬编码 "Manhattan" / "New York"
- 即便 `findPerson(name: "Mary Popup")` 也一样返回 Manhattan/New York — 因为覆盖不看入参,只看 schema

### Step 7 — 加 console.log 看 root

把 Schema A 的 `Person` 块改成:

```js
Person: {
  name: (root) => {
    console.log('=== Person.name called ===')
    console.log('root:', root)
    return root.name
  },
  phone: (root) => root.phone,
  street: (root) => root.street,
  city: (root) => root.city,
  id: (root) => root.id,
},
```

重启 server,跑 Step 4 的 query。

**期望**(终端输出):

```
=== Person.name called ===
root: {
  name: 'Arto Hellas',
  phone: '040-123543',
  street: 'Tapiolankatu 5 A',
  city: 'Helsinki',
  id: '3d594650-3436-11e9-bc57-8b80ba54c431'
}
```

⭐ **铁证**:`root` 就是 `Query.findPerson` 返回的那个 person 对象 — 这是 part8e 真正的核心。验证完改回去。

### Step 8 —(可选)看 Apollo 对 array 的 default resolver

跑:

```graphql
query {
  allPersons {
    name
    phone
  }
}
```

`allPersons` 返回 `persons` 数组,Apollo 对数组每个元素用同样的 default resolver — `Person.name` / `Person.phone` 会被**调用 2 次**(每人 1 次)。

### 结束

终端 `Ctrl + C` 停 server。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| default resolver | "Apollo has defined default resolvers for them" | Apollo 自动给 type 每个 field 生成的 resolver,行为是 `root => root.<fieldName>` | `schema.js` 的 `Person: { ... }` 块 |
| `root` | "The object itself can be accessed through the first parameter of the resolver, root" | 父对象 — 上一步 resolver 的返回值 | `Person.name: (root) => root.name` |
| "don't need to define your own" | "If the functionality of the default resolver is enough, you don't need to define your own" | Apollo 已经做对了,写不写都一样 | Schema A vs 注释掉 Person 块对比 |
| partial override | "It is also possible to define resolvers for only some fields of a type" | 只覆盖部分字段,剩下的让 Apollo 用默认 | Schema B 的 street/city 覆盖 |
| Object within an object | (下一节,part8f) | 嵌套 GraphQL type 需要自定义 resolver(plain object 默认行为不适用)| 见 part8f |

---

## ⭐ 关键 takeaway(5 条)

1. **Apollo 默认每个字段都有 default resolver** — 行为是 `root => root.<fieldName>`,等同于把对象字段取出来
2. **`root` 在 part8e 终于有用了** — 它是 Query 字段返回的对象,被自动注入到 Person 字段的 resolver
3. **写不写 Person 块都一样** — 显式写只是为了覆盖或可读性,行为等价
4. **partial override 是关键模式** — 只对需要的字段写 resolver,其他让 Apollo 默认 — Schema B 演示
5. **嵌套 type 不适用 default resolver**(铺垫 part8f)— plain object 上找不到 `address` 字段,Apollo 不能凭空构造,需要自定义

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `resolvers.Person` 块 | 课程 verbatim line 1036-1057 | **完全 verbatim**(包括 `(root)` 而非 `_root`)| 严格遵循 verbatim |
| typeDefs | 课程本节未改 | 沿用 part8a(完全 verbatim) | 本节只是 resolvers 改动,schema 没改 |
| `index.js` | 课程无 | verbatim 沿用 part8a | server 启动代码本节没变 |
| `package.json` | 课程无 verbatim | 同 part8a 结构 + name 改 `the-default-resolver` | 标识清楚 |
| `.gitignore` | 课程无 | 标准 `node_modules/` + log + env | 沿用 part8a |
| `/* GraphQL */` 标记 | part8c 讲到 | 已在 typeDefs 前加 | 提前应用 |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |
| Step 6 partial override | 课程本节 bonus 给了硬编码示例代码块 | 在 README Step 6 用 **运行验证** 形式呈现,而不是另写一份 schema | 节省代码冗余(同一份 schema,改几行就行) |

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

- **Node.js 版本**:Apollo Server v4 需要 Node.js `^18.0.0 || >=20.0.0`,你的 `v22.22.3` 满足要求
- **端口冲突**:如果 4000 被占,改 `index.js` 里 `port: 4000` → 4001,重启即可
- **Step 5/6/7 改 schema.js 后记得重启 server** — Apollo Server 不会热重载
- **Step 7 的 console.log** 是临时调试用,验证完记得改回去

---

## 后续子段

- part8e **The default resolver 已完结**(兑现 part8d 伏笔:root 在嵌套 resolver 派上用场)
- Chapter 2 后续小节:
  - part8f — **Object within an object**(Address 嵌套类型,plain object 默认 resolver 不够用,需要自定义)— 有代码
  - part8g — **Mutations**(addPerson)— 有代码
  - part8h — **Error handling**(GraphQLError + BAD_USER_INPUT)— 有代码
  - part8i — **Enum**(YesNo 过滤)— 有代码
  - part8j — **Changing a phone number**(changeNumber mutation)— 有代码
  - part8k — **More on queries**(combined queries + aliases)— 有代码
- 后续 part8f/8g/... 会按"一次只推进一小节"纪律逐个落地
- Chapter 3-6 是 React Apollo Client / DB / Login / Fragments — 还没规划
- 本节**不** commit / push
- 本节**不** 跑任何命令
