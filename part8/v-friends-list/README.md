# part8v — Friends list(Chapter 4 第五小节)

> 📚 本项目是 [Full Stack Open](https://fullstackopen.com/) Part 8 GraphQL Chapter 4 **"Friends list"** 子节的**严格 1:1 verbatim 落地**。
> 课程链接:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-4
> 前置子节:part8u "User and log in"

## 🎯 本节核心目标(per course block 88)

> "Let's complete the application's backend so that adding and editing persons requires logging in, and added persons are automatically added to the friends list of the user."

**核心**:在 part8u User 系统基础上,**实现 friends 列表的增删 + addPerson 加鉴权**:
- `Mutation.addPerson` 必须登录(per course block 91,鉴权失败抛 `UNAUTHENTICATED`)
- `addPerson` 成功后自动把新 person 加到 `currentUser.friends`
- 新增 `Mutation.addAsFriend(name: String!): User` 把已存在 person 加为朋友(per course block 94 + 96)

**关键简化**(per course verbatim 故意为之):
- **不**实现 `allPersons` 按 `currentUser.friends` 过滤(per course block 88 文字提"personalized view",但 block 91-103 不展示,留给后续章节)
- **不**给 `Mutation.editNumber` 加鉴权(per course block 88 文字提"adding and editing",但 block 91-103 只展示 addPerson,editNumber **不**加 — 留给后续章节)
- 错误消息 `"The name didn't found"` 严格 verbatim,即使英文别扭(per course block 96)
- `addAsFriend` 用 ES6 解构 `(root, args, { currentUser })`,与 part8u me resolver `(root, args, context)` 风格差异由课程故意展示

## 📁 子项目结构

```
v-friends-list/
├── package.json      ← verbatim part8u(本节无新依赖)
├── package-lock.json ← verbatim part8u
├── README.md         ← 本文件
├── schema.js         ← ⭐ 改 1 处:Mutation 块加 addAsFriend(name: String!): User
├── resolvers.js      ← ⭐ 改 2 处:addPerson 加 auth + 加 friends.concat;新增 addAsFriend resolver
├── server.js         ← verbatim part8u(context 注入已在 part8u 实现)
├── db.js             ← verbatim part8u
├── index.js          ← verbatim part8u
├── models/
│   ├── person.js     ← verbatim part8u
│   └── user.js       ← verbatim part8u(friends 字段已在 part8u 实现)
└── .env.example      ← verbatim part8u
```

## 🔧 改造范围(对比 part8u)

| 文件 | part8u 状态 | part8v 改造 |
|------|------------|------------|
| `schema.js` | Mutation 4 个(addPerson/editNumber/createUser/login) | ⭐ **+1**:在 editNumber 后插 `addAsFriend(name: String!): User`(per course block 94) |
| `resolvers.js` Mutation.addPerson | `(root, args)`,无 auth check | ⭐ **改**:签名 `(root, args, context)` + `currentUser = context.currentUser` + `if (!currentUser) throw UNAUTHENTICATED` + try 块加 `currentUser.friends.concat(person)` + `await currentUser.save()` |
| `resolvers.js` Mutation.addAsFriend | 不存在 | ⭐ **新增 ~30 行**:解构 currentUser + UNAUTHENTICATED 鉴权 + `nonFriendAlready` helper + `Person.findOne` + 不存在 throw + concat + save + return currentUser |
| `server.js` / `db.js` / `index.js` / `models/{person,user}.js` / `package.json` / `.env.example` | 已有 | **不动** |

**改动代码量**:0 新文件 + 2 文件改动(schema.js +1 行,resolvers.js 改 addPerson + 加 addAsFriend 约 60 行含注释)

## 📚 课程原文摘要(per course blocks 88-103)

### 课程开篇(block 88)
> "Let's complete the application's backend so that adding and editing persons requires logging in, and added persons are automatically added to the friends list of the user."

### 数据库清理(block 89)— **不是代码改动**
> "Let's first remove all persons not in anyone's friends list from the database."

**诚实声明**:这是 mongosh 一次性指令,不是代码改动。运行方式:
```js
// mongosh
use phonebook
db.persons.deleteMany({ _id: { $nin: await db.users.distinct('friends') } })
```

### addPerson 改造(block 91,highlighted lines 2-11 + 28-29)
```js
Mutation: {
  addPerson: async (root, args, context) => {
    const currentUser = context.currentUser
 
    if (!currentUser) {
      throw new GraphQLError('not authenticated', {
        extensions: {
          code: 'UNAUTHENTICATED',
        }
      })
    }


    const nameExists = await Person.exists({ name: args.name })


    if (nameExists) {
      throw new GraphQLError(`Name must be unique: ${args.name}`, {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: args.name,
        },
      })
    }


    const person = new Person({ ...args })


    try {
      await person.save()
      currentUser.friends = currentUser.friends.concat(person)  // ← NEW
      await currentUser.save()                                  // ← NEW
    } catch (error) {
      throw new GraphQLError(`Saving person failed: ${error.message}`, {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: args.name,
          error
        }
      })
    }

    return person
  },
  //...
}
```

### Schema 扩展(block 94,highlighted line 3)
```graphql
type Mutation {
  // ...
  addAsFriend(name: String!): User
}
```

### addAsFriend resolver(block 96)
```js
addAsFriend: async (root, args, { currentUser }) => {
    if (!currentUser) {
      throw new GraphQLError('not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      })
    }

    const nonFriendAlready = (person) =>
      !currentUser.friends
        .map((f) => f._id.toString())
        .includes(person._id.toString())

    const person = await Person.findOne({ name: args.name })

    if (!person) {
      throw new GraphQLError("The name didn't found", {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: args.name,
        },
      })
    }

    if (nonFriendAlready(person)) {
      currentUser.friends = currentUser.friends.concat(person)
    }

    await currentUser.save()

    return currentUser
  },
```

### 解构 vs 不解构(block 97-100)对比注解
```js
// 不解构:
addAsFriend: async (root, args, context) => {
  const currentUser = context.currentUser
  ...

// 解构(本节 verbatim 用):
addAsFriend: async (root, args, { currentUser }) => {
  ...
}
```

**课程原文**:"Note how the resolver destructures the logged-in user from the context. So instead of saving currentUser to a separate variable in a function it is received straight in the parameter definition of the function"

### 验证 query(block 102)
```graphql
query {
  me {
    username
    friends{
      name
      phone
    }
  }
}
```

### 后端代码 github 链接(block 103)
> "The code of the backend can be found on Github branch part8-5."

## ⭐ 9 个核心概念

### 1. addPerson 鉴权 — UNAUTHENTICATED 错误码
- 错误码 `UNAUTHENTICATED` 是 GraphQL 规范保留值(per [GraphQL Spec - Error Handling](https://spec.graphql.org/October2021/#sec-Errors))
- 区别于 part8u/part8t 的 `BAD_USER_INPUT`(用于输入校验)
- 前端 part8p 的 `onError` 接住后可以根据 `extensions.code` 区分"未登录"vs"输入错"

### 2. currentUser.friends 不可变追加
- `currentUser.friends = currentUser.friends.concat(person)` — 返回**新数组**,不修改原数组
- per mongoose 文档数组惯例(concat 是 JS Array 原生方法,返回新数组)
- 跟 part8t `persons = persons.concat(person)` 同样的不可变模式
- 然后 `await currentUser.save()` 持久化(Mongoose 文档实例方法)

### 3. ObjectId 字符串比较(nonFriendAlready)
- `currentUser.friends` 是 ObjectId 数组(per models/user.js schema)
- `.map(f => f._id.toString())` 把每个 ObjectId 转字符串
- `person._id.toString()` 同步转换
- `.includes(...)` 字符串相等比较
- **为什么不用 `===`?** ObjectId 对象之间 `===` 是引用比较,不靠谱;字符串值比较是稳的

### 4. 解构 vs 非解构 — 课程故意展示两种
- 解构:`(root, args, { currentUser }) => {...}` — 直接拿 currentUser
- 非解构:`(root, args, context) => { const currentUser = context.currentUser; ... }` — 多一行赋值
- 两种**功能完全等价**,只是 ES6 解构语法糖
- part8u me resolver 用非解构,本节 addAsFriend 用解构 — 课程故意对比

### 5. addPerson vs addAsFriend — 同一逻辑的两种入口
- 共同点:都需要鉴权 + 都最终调 `currentUser.friends.concat(person)` + `currentUser.save()`
- 区别:
  - addPerson 接收 person 参数 + 创建 Person 文档 + 把**新** person 加到 friends
  - addAsFriend 接收 person name + `Person.findOne({ name })` 查**已存在** person + 加到 friends
- addAsFriend 多一个 `nonFriendAlready` 查重(因为是手动加,**不能**重复)
- addPerson 不查重是因为 person 是新建的,**不可能**已经在 friends 里

### 6. `// filters missing` 占位仍未兑现
- allPersons resolver 里 `// filters missing` 注释仍保留
- 课程 block 88 文字提"personalized view",但 block 91-103 **不**展示过滤
- 真正的 friends filter 在后续章节(per part8u README "仍未兑现的伏笔")

### 7. editNumber 不加鉴权 — 课程故意留白
- 课程 block 88 文字说"adding and editing persons requires logging in"
- 但 block 91-103 **只**展示 addPerson 改造,**不**展示 editNumber 改造
- part8v 严格 verbatim — editNumber **不**加鉴权
- 这是课程**故意**留的伏笔,留给后续章节(可能是 Chapter 5 或后面的子节)
- 如果生产代码应该一致:editNumber 也应该加 UNAUTHENTICATED 检查(留给后续)

### 8. Apollo Server context.currentUser 复用(per part8u 沿用)
- server.js 的 `context: async ({ req }) => ({ currentUser })` 已在 part8u 实现
- part8v **不**改 server.js,只是新增的 resolver 读取 `context.currentUser`
- 课程原文(per course block 83):"The context value is passed to resolvers as the third parameter"

### 9. Block 89 数据清理 — 不是代码改动
- "Let's first remove all persons not in anyone's friends list from the database"
- 这是 mongosh 一次性清理指令(per course block 89)
- 用途:如果之前测试时 addPerson 加了一些没在任何 user.friends 里的 person,清掉
- 不属于本节代码改动,只是测试数据准备

## ✅ 验证步骤(per course 隐含验收)

### Step 1 — 环境准备(同 part8u)
```bash
# 终端 1:启动 mongod
mongod

# 终端 2:
cd part8/v-friends-list
cp .env.example .env
# 编辑 .env:填 MONGODB_URI + JWT_SECRET
npm install
npm run dev
```

### Step 2 — Block 89:数据库清理(可选)
```js
// mongosh
use phonebook
db.persons.deleteMany({ _id: { $nin: await db.users.distinct('friends') } })
```
**预期**:清理后,所有 persons 都在某个 user.friends 里

### Step 3 — 创建 user 并 login
```graphql
mutation { createUser(username: "mluukkai") { username id } }
mutation { login(username: "mluukkai", password: "secret") { value } }
```
**复制 token**给 Step 4+ 用

### Step 4 — 验证 addPerson 未鉴权失败
**Apollo Explorer HTTP HEADERS**:**不加** Authorization(或随便乱写)
```graphql
mutation {
  addPerson(name: "Test Person", phone: "123-456", street: "Test St", city: "Test City") {
    name
  }
}
```
**预期**:`errors[0].message = "not authenticated"`,`extensions.code = 'UNAUTHENTICATED'`

### Step 5 — 验证 addPerson 鉴权成功 + 自动加到 friends
**Apollo Explorer HTTP HEADERS**:`Authorization: Bearer <token>`
```graphql
mutation {
  addPerson(name: "Arto Hellas", phone: "045-123", street: "Tapiola", city: "Espoo") {
    name
    id
  }
}
```
**预期**:`data.addPerson.name = "Arto Hellas"`,person 创建成功

### Step 6 — 验证 me query 看到新朋友(block 102)
```graphql
query {
  me {
    username
    friends {
      name
      phone
    }
  }
}
```
**预期**:`data.me.friends` 数组里有刚加的 `Arto Hellas`(如果这是第一个 person)

### Step 7 — 验证 addAsFriend 鉴权失败
不带 Authorization:
```graphql
mutation {
  addAsFriend(name: "Some Person") { username }
}
```
**预期**:`errors[0].message = "not authenticated"`,`extensions.code = 'UNAUTHENTICATED'`

### Step 8 — 验证 addAsFriend 找不到人
带 token:
```graphql
mutation {
  addAsFriend(name: "Nonexistent Person") { username }
}
```
**预期**:`errors[0].message = "The name didn't found"`,`extensions.code = 'BAD_USER_INPUT'`(英文别扭但是课程原文)

### Step 9 — 验证 addAsFriend 成功 + 防重复
带 token,先 `Person.findOne({ name })` 找一个已存在但**不在** mluukkai.friends 的 person(比如用 mongo shell 手动 addPerson 后没经过 friends.concat 的,或者用其他 user 加过但 mluukkai 没加的):
```graphql
mutation {
  addAsFriend(name: "<existing-person-name>") {
    username
    friends { name }
  }
}
```
**预期**:`data.addAsFriend.friends` 包含此 person

**再调一次同样 mutation**:
**预期**:`nonFriendAlready(person)` 返回 false(已存在),**不**重复 concat,`friends` 数组不变

### Step 10 — 验证 addPerson 重复名(part8t 回归)
带 token:
```graphql
mutation {
  addPerson(name: "Arto Hellas", ...) { name }
}
```
**预期**:`errors[0].message = "Name must be unique: Arto Hellas"`,`extensions.code = 'BAD_USER_INPUT'`(part8t 行为)

### Step 11 — 验证 part8u 回归(me / createUser / login 正常)
- `me` 带 token 返回 user + friends
- `createUser` 新用户名 OK
- `login` valid token OK

### Step 12 — 验证 part8u password 简化仍在
```graphql
mutation { login(username: "mluukkai", password: "WRONG") { value } }
```
**预期**:`errors[0].message = "wrong credentials"`(per part8u password = 'secret' 简化)

## 📊 兑现的伏笔

| 来源 | 伏笔内容 | 兑现方式 |
|------|---------|---------|
| part8u README | "User.friends 数组增删(per block 60)" | ✅ **本节兑现** — addAsFriend 把 person 加到 friends + addPerson 自动加 |
| part8u README | "所有 user 共用 password = 'secret'" | ✅ **沿用** |
| part8t README | "Mutation 加鉴权" | ⚠️ **部分** — 只 addPerson 加,editNumber 故意不加(per 课程 block 88 文字 vs block 91-103 实际) |
| part8s README | "`// filters missing` phone filter" | ❌ **仍未兑现** — 课程 Friends list 段**不**包含 phone filter,本节**也不**补 |
| part8u README | "personalized view" | ❌ **仍未兑现** — allPersons **不**按 currentUser.friends 过滤,per course 留后续 |
| part8u README | "前端 form / localStorage token" | ❌ **仍未兑现** — 课程本节纯后端 |

## 🚫 故意不做(per part8v 范围限定)

1. **不改 editNumber** — 课程 block 88 文字说"adding and editing",但 block 91-103 **只**展示 addPerson 改动;editNumber 鉴权留后续章节
2. **不改 allPersons** — 课程 block 88 提"personalized view",但 block 91-103 不展示过滤;allPersons 仍返回全部 persons
3. **不修 "The name didn't found" 语法** — 严格 verbatim,即使英文别扭
4. **不改 server.js / models/user.js / models/person.js** — context 注入 + friends schema 字段都在 part8u 实现,本节复用
5. **不抽 nonFriendAlready 到 utility 文件** — 课程 verbatim 内嵌在 resolver 里
6. **不改 `// filters missing` 占位** — phone filter 仍未补
7. **不做前端** — 课程本节纯后端,前端 form / friends list UI 在后续前端子节
8. **不重写 addPerson 用 ES6 解构** — addPerson 用非解构 `(root, args, context)` + `const currentUser = ...`,addAsFriend 用解构 `(root, args, { currentUser })`,课程故意两种都展示

## 🛠 Troubleshooting

### 1. addPerson 报 `not authenticated` 即使带了 token
**原因**(三种):
1. HTTP HEADERS 没加 Authorization(Apollo Explorer 默认无)
2. Authorization header 不以 `Bearer ` 开头
3. JWT_SECRET 在 .env 里没配,导致 server 启动后 context 解 token 失败

**解决**:Step 1 加 header,Step 2 确认前缀,Step 3 确认 .env 有 `JWT_SECRET=...`

### 2. addAsFriend 报 `The name didn't found`
**原因**:person name 不存在数据库里
**解决**:
- 先用 `Person.find({}).then(console.log)` 看现有 persons
- 或者先用 addPerson 加一个(Step 5),然后再 addAsFriend 它

### 3. addAsFriend 重复加同一个人,friends 数组没变化
**原因**:`nonFriendAlready` 检查到 person 已在 friends 里,跳过 concat
**解决**:**预期行为** — nonFriendAlready 是防重复机制,验证 addAsFriend 应该先找一个**不在** friends 的人

### 4. me query 看不到新加的朋友
**原因**:JWT token 没带,context.currentUser = null → me return null
**解决**:带 `Authorization: Bearer <token>` header

### 5. addPerson 抛 `Saving person failed: E11000 duplicate key error`
**原因**:name 重复(per part8s `Person.exists` 检查)
**解决**:换一个 name 重试,或者删掉重复 person(mongosh)

### 6. addPerson 后 users.friends 没更新
**原因**:`await currentUser.save()` 没成功
**可能**:
- currentUser.save() 抛异常 → catch 包了 → 抛 GraphQLError
- 但 person.save() 成功了,user save 失败 → 数据库不一致(课程**故意**用 try 包整个块,所以 person 也会回滚)
- 验证:per course block 91 try 块**包含** person.save + friends.concat + currentUser.save,所以**三者一体**

### 7. addAsFriend 报 `not authenticated` 但 addPerson 没报
**原因**:两个 resolver 都有 `if (!currentUser)` 检查,但 addAsFriend 的解构 `(root, args, { currentUser })` 在没 context 时 `currentUser` 是 undefined
**解决**:确认 HTTP HEADERS 带了 `Authorization: Bearer <token>`

### 8. addPerson 报错说 `Cannot read property 'currentUser' of undefined`
**原因**:context 参数没传 → server.js context 配置丢失
**解决**:检查 server.js 是否有 `context: async ({ req }) => ({ currentUser })` 字段(per part8u server.js line 161)

## 📝 与 part8u 的核心差异对照

| 维度 | part8u | part8v |
|------|--------|--------|
| User 系统 | ✅ 已有 | ✅ 沿用 |
| JWT token | ✅ 已有 | ✅ 沿用 |
| Apollo context.currentUser | ✅ 已有 | ✅ 沿用 |
| addPerson 鉴权 | ❌ 无 | ✅ UNAUTHENTICATED check |
| addPerson 自动加到 friends | ❌ 无 | ✅ `currentUser.friends.concat(person)` + save |
| addAsFriend mutation | ❌ 无 | ✅ 新增 ~30 行 resolver |
| Person schema | 无 friends 字段 | 无 friends 字段(沿用)— 课程 Person 不存反向引用 |
| editNumber 鉴权 | ❌ 无 | ❌ **仍无**(per 课程故意,留后续) |
| allPersons filter by friends | ❌ 无 | ❌ **仍无**(per 课程故意,留后续) |
| 改动文件 | 5(schema/resolvers/server/package/env + 1 NEW user) | 2(schema.js +1 行 / resolvers.js 改 addPerson + 加 addAsFriend)|
| 新依赖 | jsonwebtoken | 无 |
| 新 GraphQL 节点 | 4(User/Token/me/createUser/login) | +1(addAsFriend) |
| 新 resolver | 3(me/createUser/login) | +1(addAsFriend)+ 改 addPerson |
| 错误码新增 | BAD_USER_INPUT | +UNAUTHENTICATED(per course block 91/96)|

## 🎓 课程原文逐字摘录(per block 88-103)

> Block 88: "Let's complete the application's backend so that adding and editing persons requires logging in, and added persons are automatically added to the friends list of the user."
> Block 89: "Let's first remove all persons not in anyone's friends list from the database."
> Block 90: "addPerson mutation changes like so:"
> Block 91: addPerson 完整代码(见上)
> Block 92: "If a logged-in user cannot be found from the context, an GraphQLError with a proper message is thrown. Creating new persons is now done with async/await syntax, because if the operation is successful, the created person is added to the friends list of the user."
> Block 93: "Let's also add the ability to add a person to your own friends list. The mutation schema is as follows:"
> Block 94: schema addAsFriend(见上)
> Block 95: "And the mutation's resolver:"
> Block 96: addAsFriend resolver(见上)
> Block 97: "Note how the resolver destructures the logged-in user from the context..."
> Block 98: 不解构版 addAsFriend
> Block 99: "it is received straight in the parameter definition of the function:"
> Block 100: 解构版 addAsFriend(本节 verbatim 用)
> Block 101: "The following query now returns the user's friends list:"
> Block 102: me with friends query(见上)
> Block 103: "The code of the backend can be found on Github branch part8-5."

## ⏭️ 下一步

- **Chapter 5 — Login and updating the cache**(课程下一章)
- **仍未兑现的伏笔**:
  - `// filters missing` phone filter(per part8s README + part8u README + part8v README 三处标注)
  - allPersons 按 currentUser.friends 过滤的 "personalized view"(per course block 88 文字提,block 91-103 不展示)
  - editNumber 鉴权(per course block 88 文字提"adding and editing",block 91-103 只展示 addPerson)
  - 前端 login form + localStorage token 持久化
  - 前端 friends list UI(`<Person>` 加 `<button>add as friend</button>`)
  - Chapter 6 — Fragments and subscriptions

## 🧪 必备前置

1. part8u server 能正常启动 + part8u 所有 Step 1-10 验证通过
2. mongod 跑着 / Atlas 集群 not paused
3. Apollo Studio 打开 GraphQL endpoint
4. JWT_SECRET 在 .env 里配好(随机字符串)
5. (可选)MongoDB Compass / mongosh 看 currentUser.friends 数组变化
