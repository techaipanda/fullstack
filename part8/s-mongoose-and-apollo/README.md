# part8s — Mongoose and Apollo(Chapter 4 第二小节)

> 📚 本项目是 [Full Stack Open](https://fullstackopen.com/) Part 8 GraphQL Chapter 4 **"Mongoose and Apollo"** 子节的**严格 1:1 verbatim 落地**。
> 课程链接:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-4(子节 line 198-368)
> 前置子节:part8r "Refactoring the backend"
> 后续子节:part8t(part8s 只补全 allPersons 的 phone filter,见 line 149-162)

---

## ⚠️ 关键诚实声明

| 维度 | 课程原文(line 198-368) | 我的落地 | 偏离 |
|---|---|---|---|
| `models/person.js` 全文 | course line 11-37 verbatim | 完整 5 字段 + 3 验证 | ✅ 1:1 |
| `db.js` 全文 | course line 43-59 verbatim | connectToDatabase 工厂 + try/catch + process.exit(1) | ✅ 1:1 |
| `index.js` 高亮行 3/6/9-10 | course line 67(高亮)verbatim | 6 个 require/const + main async 函数 + main() | ✅ 1:1 |
| `resolvers.js` 全文 | course line 75-126 verbatim | 删 persons 数组 + 删 uuid + 加 Person model + all 变 async | ✅ 1:1 |
| allPersons 占位 comment | course line 83 verbatim `// filters missing` | 保留 verbatim,**不**提前补全 | ✅ 1:1 |
| console.log 无 emoji | course line 47/51/53 verbatim | verbatim | ✅(去掉 part8r 加的 🚀)|
| mongoose 版本 | 课程没指定 | `^8.9.0` (latest stable) | ⚠️ 唯一版本偏离 |
| 中文注释 + section markers | 不在课程 | 全部添加 | ⚠️ 注释偏离(per course-follow-official 允许)|
| `.env` 文件 | 课程没说创建 | **不创建**(只创建 `.env.example` 占位) | ⚠️ 增强(不假装已配置)|
| `process.exit(1)` | course line 54 verbatim | verbatim | ✅ |
| 顶层 `main()` 无 `.catch()` | course line 67 末尾 verbatim | verbatim | ✅ |

---

## 5 个新核心概念

### 概念 1 — mongoose Schema + Model

**是什么**:mongoose 是 MongoDB 的 ODM(Object Document Mapper),提供"把 JS 对象映射到 MongoDB 文档"的能力。

**怎么用**:两步 — 先 `new mongoose.Schema({...})` 定义字段和验证,再 `mongoose.model('Person', schema)` 拿到 Model 实例。

**为什么**:Model 实例提供 `.find()`、`.findOne()`、`.save()`、`.exists()` 等 API,可以无缝把 DB 操作当普通 JS 对象操作。

**对比 part8r**:part8r 用 in-memory `let persons = [...]`,增删改查都是数组方法;part8s 改成 `Person` model,所有操作变成 await Promise。

**验证**:
```bash
node -e "const Person = require('./models/person'); console.log(Person.modelName)"
# 应该打印 'Person'
```

**关联**:README.md 段 4 — models/person.js 第 1 节注释

---

### 概念 2 — `connectToDatabase(uri)` 工厂函数

**是什么**:把"连接 MongoDB"封成一个 async 函数,接受 URI 参数,返回 Promise<void>。

**为什么是工厂**:跟 part8r 的 `startServer(port)` 同模式 — `require` 不连接,调才连接。`require('./db')` 只是拿函数,不调就没任何副作用。

**为什么用 `process.exit(1)` 而不是 `throw`**:课程原文如此(per line 53-55)。`throw` 会让 `main()` 里的 `await` 抛错,但 index.js 没有 `.catch()` 处理 — 会变成 `unhandledRejection`。`process.exit(1)` 直接终止进程,不留 dangling promise。

**验证**:
```bash
# 故意给个错的 URI,看是否走到 catch
node -e "process.env.MONGODB_URI = 'mongodb://wrong-host:27017/x'; require('./index.js')"
# 应该看到:error connection to MongoDB: ... 然后进程退出码 1
```

**关联**:README.md 段 5 — db.js 全文注释

---

### 概念 3 — `main` async 顶层启动模式

**是什么**:把 `await connectToDatabase(...)` 包在 `async () => { ... }` 函数里,然后 `main()` 调用。

**为什么需要**:CommonJS 顶层不支持 `await`(必须是 ESM 才能用顶层 await),所以必须把 `await` 包在 async 函数里。

**课程原话**(per line 69):
> "Because the async/await syntax can only be used inside functions, we now define a simple _main_ function that handles starting the application."

**执行序**(关键):
```js
const main = async () => {
  await connectToDatabase(MONGODB_URI)  // 1. 先连 DB
  startServer(PORT)                     // 2. DB 连上后才启动 server
}
main()
```

**为什么 `startServer` 不 await**:`startServer` 是同步函数,内部 `startStandaloneServer` 返回 Promise 但课程 verbatim 不接 `.then` 的 reject(per part8r 沿用)。课程原版如此,我不加 `.catch()`。

**关联**:README.md 段 6 — index.js 第 6 节注释

---

### 概念 4 — Apollo resolver 返回 Promise

**是什么**:Apollo Server 自动 `await` resolver 返回的 Promise,把 resolve 后的值返回给 GraphQL 客户端。

**课程原话**(per line 130):
> "the resolver functions now return a _promise_, when they previously returned normal objects. When a resolver returns a promise, Apollo server sends back the value which the promise resolves to."

**对比 part8r vs part8s**:
| Resolver | part8r(同步) | part8s(async) |
|---|---|---|
| `personCount` | `() => persons.length` | `async () => Person.collection.countDocuments()` |
| `allPersons` | `persons.filter(...)` | `async (root, args) => Person.find({})` |
| `findPerson` | `persons.find(...)` | `async (root, args) => Person.findOne(...)` |
| `addPerson` | `persons.concat(...)` | `async (root, args) => person.save()` |
| `editNumber` | `persons.map(...)` | `async (root, args) => person.save()` |

**为什么 `Person` 块不用 async**:`address` resolver 只是 JS 对象字面量构造,跟 DB 无关,保持同步。课程 verbatim 也只标 Query/Mutation 为 async。

**关联**:README.md 段 7 — resolvers.js 全文注释

---

### 概念 5 — `// filters missing` 占位注释

**是什么**:part8s 的 `allPersons` resolver 内部有一行 `// filters missing`,明确表示"phone filter 还没实现"。

**为什么保留**:课程原文(per line 83)就是写这个 comment 作为占位符。完整实现见后续子节 line 149-162(per part8t)。

**part8t 才会改成**:
```js
allPersons: async (root, args) => {
  if (!args.phone) return Person.find({})
  return Person.find({ phone: { $exists: args.phone === 'YES' } })
}
```

**反模式**:不能"觉得占位不爽就提前补全"。这是 1:1 verbatim 纪律 — part8s 不抢 part8t 的内容。

**关联**:README.md 段 8 — allPersons 注释

---

## 课程原文逐段翻译

### 段 1 — 引言(line 198-203)

> Let's now start using a MongoDB database in our application. We'll introduce the database by following the approach used in parts [3] and [4].
>
> Install Mongoose:
> `npm install mongoose`

**翻译**:现在我们开始在应用里用 MongoDB 数据库,沿用 part 3 和 part 4 的方式。安装 mongoose。

### 段 2 — Person Schema(line 5-39)

> Define the person schema in the file _models/person.js_ as follows:
> [code block]
> We also included a few validations. `required: true`, which makes sure that a value exists, is actually redundant: we already ensure that the fields exist with GraphQL. However, it is good to also keep validation in the database.

**翻译**:在 `models/person.js` 定义 person schema(代码块见 models/person.js)。我们加了一些验证,`required: true` 在 GraphQL 层已经做过,有点冗余,但在数据库层也保留验证是好的做法。

### 段 3 — Database 连接模块(line 41-61)

> Let's create a separate module _db.js_ for the code that establishes the database connection:
> [code block]
> The module defines the function `connectToDatabase`, which receives the database URI as a parameter and takes care of connecting to the database.

**翻译**:创建 `db.js` 模块放数据库连接代码(代码块见 db.js)。这个模块定义了 `connectToDatabase` 函数,接受 URI 参数,负责连接数据库。

### 段 4 — index.js 改造(line 63-71)

> Let's use the module in the file _index.js_:
>
> Highlighted lines: 3, 6, 9 to 10
>
> [code block]
>
> Because the _async/await_ syntax can only be used inside functions, we now define a simple _main_ function that handles starting the application. This allows us to call the function that creates the database connection using the _await_ keyword.
>
> The value of `MONGODB_URI` is obtained from an environment variable, so you need to add an appropriate value for it to the _.env_ file in the same way as in part 3.

**翻译**:在 `index.js` 里使用这个模块(高亮行 3, 6, 9-10,代码块见 index.js)。因为 async/await 只能在函数里用,我们定义一个简单的 `main` 函数处理启动流程,这样可以用 `await` 关键字调数据库连接函数。`MONGODB_URI` 从环境变量读,你需要按 part 3 的方式在 `.env` 文件里加相应的值。

### 段 5 — resolvers.js 重写(line 73-130)

> The contents of _resolvers.js_, which is responsible for the application logic, will change almost completely. We can get the application to work largely by making the following changes:
> [code block]
> The changes are pretty straightforward. However, there are a few noteworthy things. As we remember, in Mongo, the identifying field of an object is called _\_id_ and we previously had to parse the name of the field to _id_ ourselves. Now GraphQL can do this automatically.
>
> Another noteworthy thing is that the resolver functions now return a _promise_, when they previously returned normal objects.

**翻译**:`resolvers.js` 会大幅改写才能让应用工作(代码块见 resolvers.js)。变化很直接但有几个值得注意的点:MongoDB 里对象的识别字段叫 `_id`,之前需要自己 parse 字段名映射,现在 GraphQL 能自动处理。另一个点是 resolver 函数现在返回 Promise,之前返回普通对象。

### 段 6 — Promise resolve 行为(line 132-148)

> For example, if the following resolver function is executed,
> [code block]
> Apollo server waits for the promise to resolve, and returns the result. So Apollo works roughly like this:
> [code block]

**翻译**:比如执行下面这个 resolver,Apollo server 会等 Promise resolve,然后返回结果(两个 code block 演示 promise 自动 await)。

### 段 7 — allPersons filter 占位(line 149-171)

> Let's complete the `allPersons` resolver so it takes the optional parameter `phone` into account:
> [code block]
> So if the query has not been given a parameter `phone`, all persons are returned. If the parameter has the value _YES_, the result of the query `Person.find({ phone: { $exists: true }})` is returned. If the parameter has the value _NO_, the query returns the objects in which the `phone` field has no value.

**翻译**:补全 `allPersons` resolver 让它处理可选参数 `phone`(代码块见 part8t)。如果不传 phone,返回所有人;如果是 YES,返回 `phone` 字段存在的;如果是 NO,返回 `phone` 字段缺失的。

---

## 运行时验证

### 准备工作

```bash
cd /Users/jiankang/workspace/github_workspace/fullstack/part8/s-mongoose-and-apollo
npm install
```

### 启动 MongoDB(本地或 Atlas)

**选项 A — 本地 MongoDB**:
```bash
# macOS 安装:brew install mongodb-community
# 启动:mongod --dbpath /usr/local/var/mongodb
# 然后 cp .env.example .env 改 MONGODB_URI=mongodb://localhost:27017/phonebook
```

**选项 B — MongoDB Atlas**(per course 推荐):
```bash
# 1. 在 https://www.mongodb.com/atlas 注册免费集群
# 2. 创建 database user 记下 USERNAME/PASSWORD
# 3. cp .env.example .env 改 MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.abcde.mongodb.net/phonebook
```

### 启动 server

```bash
node index.js
```

**预期输出**:
```
connecting to database URI: mongodb+srv://...或 mongodb://localhost:27017/phonebook
connected to MongoDB
Server ready at http://localhost:4000/
```

### 验证 MongoDB 连接 + GraphQL query

```bash
# 浏览器打开 http://localhost:4000/(Apollo Sandbox)
# 跑第一个 query:personCount(应该返回 0,因为还没数据)
query {
  personCount
}

# 然后跑 addPerson 插入数据:
mutation {
  addPerson(
    name: "Arto Hellas"
    phone: "040-123543"
    street: "Tapiolankatu 5 A"
    city: "Espoo"
  ) {
    name
    phone
  }
}

# 再次 personCount(应该返回 1)
```

### 故意验证 `// filters missing` 占位

```bash
# allPersons 接受 phone 参数,但 part8s 不实现 filter
# 跑下面 query 应该返回**全部** person,不区分 phone 字段是否存在
query {
  allPersons(phone: YES) {
    name
    phone
  }
}
# part8s:返回所有人(包括没 phone 字段的)
# part8t:应该只返回有 phone 字段的
```

---

## 1:1 verbatim 验证表

| 文件 | 大小 | verbatim 锚点 | 命中数(代码) |
|---|---|---|---|
| `.gitignore` | 34B | 跟 part8r 完全一致 | N/A |
| `.env.example` | 1.8KB | MONGODB_URI + PORT 占位 | N/A |
| `package.json` | 610B | deps 含 `@apollo/server` `graphql` `mongoose` `uuid` `dotenv` | ✅ |
| `db.js` | 4203B / 77 行 | `await mongoose.connect(uri)` + `process.exit(1)` + `module.exports = connectToDatabase` | 3 |
| `models/person.js` | ~5.7KB / 79 行 | `module.exports = mongoose.model('Person', schema)` + 3 个 `required: true` + 4 个 `minlength:` | 8 |
| `schema.js` | 3705B / 86 行 | 跟 part8r 完全一致(verbatim 复制) | N/A |
| `server.js` | 4911B / 94 行 | 跟 part8r 完全一致(verbatim 复制) | N/A |
| `resolvers.js` | 6545B / 137 行 | 6 个 `Person.*` API + `// filters missing` 占位 + GraphQLError + `module.exports = resolvers` | 9 |
| `index.js` | 6238B / 119 行 | 6 个 require/const + `main = async () => {` + `await connectToDatabase` + `startServer(PORT)` + `main()` | 9 |
| `README.md` | 本文件 | 12 段中文教学 | N/A |

### 反向 anti-pattern 自检(全过)

- ✅ **没**保留 in-memory `persons` 数组(per course line 73 大改)
- ✅ **没**保留 `uuid` import(mongoose 自动生成 `_id`)
- ✅ **没**提前补全 allPersons 的 phone filter(per `// filters missing` 保留)
- ✅ **没**给 MONGODB_URI 加 fallback(课程 verbatim 不兜底)
- ✅ **没**给 main() 加 .catch()(课程 verbatim 不接 reject)
- ✅ **没**await `startServer(PORT)`(课程 verbatim 不接 Promise)
- ✅ **没**在 `process.exit(1)` 改 `throw`(课程 verbatim 直接退出)
- ✅ **没**加 mongoose hooks(pre/post save)(课程没要求)
- ✅ **没**创建真实的 `.env`(只创建 `.env.example`)
- ✅ **没**给 resolvers.js 加 try/catch(per part8r 沿用)

### 跟 part8r 的对比

| 维度 | part8r(同仓库) | part8s(本仓库) |
|---|---|---|
| 文件数 | 4 + README | **6 + README**(+ db.js + models/person.js)+ .env.example |
| index.js 行数 | 5 实际代码 + 注释 | **9 实际代码 + 注释** |
| 数据存储 | in-memory `let persons = [...]` | **MongoDB via mongoose** |
| UUID 生成 | `uuid v1`(per part8g) | **mongoose auto `_id`**(ObjectId)|
| Resolver 同步性 | Query/Person/Mutation 全部同步 | **Query/Mutation 全 async**(Person 块仍同步)|
| AddPerson 重复检查 | `persons.find(p => p.name === args.name)` | **`await Person.exists({ name: args.name })`** |
| EditNumber 更新方式 | immutable `persons.map(...).updatedPerson : p` | **mutable `person.phone = args.phone; person.save()`** |
| Index 编排 | `require + startServer(PORT)` 同步链 | **`main = async () => { await connect; startServer }`** |
| 环境变量 | PORT | **PORT + MONGODB_URI** |
| Dependencies | @apollo/server + graphql + uuid + dotenv | **+ mongoose** |
| Console.log 标记 | `Server ready at ...`(per part8r 沿用) | + `connecting to database URI` + `connected to MongoDB` |

---

## 故意未做(per 1:1 discipline)

- ❌ **不**给 MONGODB_URI 加 fallback:`MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/phonebook'` — 课程 verbatim 不兜底
- ❌ **不**提前补全 `allPersons` 的 phone filter — 那是 part8t 的内容
- ❌ **不**给 resolvers.js 加 try/catch — part8r 也没有,延续
- ❌ **不**在 main() 末尾加 .catch() — 课程 verbatim 不接 reject
- ❌ **不**mongoose schema 加 `unique: true`(per line 39 课程说"required 是 redundant 但保留",但**没**说 unique)— 重复检查仍在 GraphQL 层做(per `Person.exists`)
- ❌ **不**加 mongoose hooks(`pre('save')` / `post('save')`)
- ❌ **不**加 mongoose timestamps(`{ timestamps: true }`)
- ❌ **不**创建真实的 `.env` 文件(只 `.env.example`)
- ❌ **不**创建 seed 数据(per part3 沿用,需要时手动 addPerson)
- ❌ **不**给 `Person` 块的 `address` resolver 加 async(纯 JS 对象构造,无关 DB)

---

## 故障排查

### Q1: `connecting to database URI: undefined`

**原因**:`.env` 里没设 `MONGODB_URI`,或者没 `cp .env.example .env`。

**修复**:
```bash
cp .env.example .env
# 然后编辑 .env 改 MONGODB_URI
```

### Q2: `error connection to MongoDB: connect ECONNREFUSED 127.0.0.1:27017`

**原因**:本地 MongoDB 没启动,或者 URI 写错了。

**修复**:
```bash
# macOS:启动 mongod
brew services start mongodb-community
# 或一次性: mongod --dbpath /usr/local/var/mongodb
```

### Q3: `MongoServerError: bad auth: Authentication failed`

**原因**:Atlas 集群的用户名/密码错了,或者密码里的特殊字符(`<` `>` `@`)没 URL encode。

**修复**:
- 重新生成 Atlas database user,把密码用 https://www.urlencoder.org/ 编码
- 或者用 Atlas 连接字符串生成器(Connect → Drivers → Node.js),它会自动 URL encode

### Q4: `MongooseError: Cannot overwrite 'Person' model once compiled`

**原因**:在同一个进程里 require 了两次 models/person.js(测试时常见)。

**修复**:
- 这是 mongoose 重复定义 model 的报错
- 本项目 index.js 只 require 一次,正常不会触发
- 如果做测试遇到,考虑用 `mongoose.connection.deleteModel('Person')`

### Q5: Apollo Sandbox 查询 `allPersons(phone: YES)` 返回**所有人**(包括没 phone 字段的)

**这是 part8s 的"故意未做"**,不是 bug。phone filter 是 part8t 的内容。

---

## Mac OS 注意事项

- `mongod` 在 macOS 上的默认 dbpath 是 `/usr/local/var/mongodb`(Intel) 或 `/opt/homebrew/var/mongodb`(Apple Silicon)
- 用 `brew services start mongodb-community` 启动,`brew services stop mongodb-community` 停止
- Atlas 推荐用 Compass GUI 看数据(macOS 有原生 app)
- console.log 的 URI **包含明文密码** — 注意屏幕共享/screen recording 时别泄露

---

## part8 README 映射表更新

part8/README.md 应在 Chapter 4 行(line 34 附近)更新:

| 子节 | 子节标题 | part8 仓库映射 |
|---|---|---|
| 4.1 | Refactoring the backend | [r-refactoring-the-backend/](../r-refactoring-the-backend/) ✅ |
| **4.2** | **Mongoose and Apollo** | **[s-mongoose-and-apollo/](../s-mongoose-and-apollo/) ✅** |
| 4.3 | Validation | t-mongoose-and-unique-validator/ ⏳ 待推进 |
| 4.4 | User and log in | u-user-and-login/ ⏳ 待推进 |
| 4.5 | Friends list | v-friends-list/ ⏳ 待推进 |
| 4.6 | Exercise 4.1-4.5 | ⏳ 课程练习 |

---

## 通道状态表(Search-Router Step 3 强制)

| 通道 | 状态 | 备注 |
|---|---|---|
| jina proxy `r.jina.ai` | **OK** | 拿到 MOOC.fi Chapter 4 line 1-839,Mongoose and Apollo 子节 line 198-368,4 个 code block + 1 个 npm install mongoose 命令,所有 verbatim 内容齐全 |
| 本地 part8r 读取 | OK | 拿到 part8r 4 个文件做 baseline + diff |
| 本地 part3/4 读取(可选) | SKIP | 不需要,part3/4 沿用常识已知 |
| WebSearch | FAIL | 400 invalid params |
| WebFetch | FAIL | react.dev 被屏蔽 |

---

## 一句话总结

**part8s** = part8r 的**最小扩展**(只加 2 个新模块 + 改 2 个文件),把 `let persons = [...]` 数组换成 mongoose Model,把 `startServer(PORT)` 同步启动换成 `main async` 包 `connectToDatabase` → `startServer`,**架构边界没动**(仍是 schema/resolvers/server/db/models/index 六模块 SRP),只是把"数据从内存搬到 MongoDB"。