# part8u — User and log in(Chapter 4 第四小节)

> 📚 本项目是 [Full Stack Open](https://fullstackopen.com/) Part 8 GraphQL Chapter 4 **"User and log in"** 子节的**严格 1:1 verbatim 落地**。
> 课程链接:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-4
> 前置子节:part8t "Validation"

## 🎯 本节核心目标(per course block 57-58)

> "Let's add user management to our application. For simplicity's sake, let's assume that all users have the same password which is hardcoded to the system."

**核心**:在 part8t Validation 的 GraphQL server 基础上,**新增用户系统**:
- 用户模型(User schema + 持久化到 MongoDB)
- 创建用户(`createUser` mutation)
- 登录拿 JWT token(`login` mutation)
- 当前用户 query(`me`)
- 通过 Apollo Server `context` 注入 `currentUser` 给所有 resolver

**关键简化**(per course verbatim 故意为之):
- 所有用户共用 password = `'secret'`(硬编码)
- **不**用 bcrypt、不存 passwordHash
- **不**做 addFriend(只预留 friends 字段)

## 📁 子项目结构

```
u-user-and-log-in/
├── package.json      ← name 改 "u-user-and-log-in",加 jsonwebtoken 依赖
├── package-lock.json (cp 自 part8t)
├── README.md         ← 本文件
├── schema.js         ← 加 type User / type Token / Query.me / Mutation.createUser / Mutation.login
├── resolvers.js      ← 加 Query.me / Mutation.createUser / Mutation.login
├── server.js         ← 加 jwt + User require + getUserFromAuthHeader + context
├── db.js             ← verbatim part8t(本节不改 db)
├── index.js          ← verbatim part8t(本节不改启动)
├── models/
│   ├── person.js     ← verbatim part8t
│   └── user.js       ⭐ NEW — verbatim 课程 block 59
└── .env.example      ← 加 JWT_SECRET 占位
```

## 🔧 改造范围(对比 part8t)

| 文件 | part8t 状态 | part8u 改造 |
|------|------------|------------|
| `models/user.js` | 不存在 | ⭐ **新建** — verbatim 课程 block 59(username required+minlength:3, friends ObjectId ref Person) |
| `package.json` | 5 deps | + `jsonwebtoken: ^9.0.2`(per course block 65-66) |
| `schema.js` | Person/Address/YesNo + 4 Query/Mutation | + `type User` + `type Token` + `Query.me` + `Mutation.createUser` + `Mutation.login` |
| `resolvers.js` (顶部) | GraphQLError + Person | + `const jwt` + `const User` |
| `resolvers.js` (Query) | personCount/allPersons/findPerson | + `me`(verbatim 课程 block 84)|
| `resolvers.js` (Mutation) | addPerson/editNumber(带 try/catch) | + `createUser`(.save().catch)+ `login` |
| `server.js` (顶部) | ApolloServer + startStandaloneServer | + `const jwt` + `const User` |
| `server.js` (新 helper) | 无 | + `getUserFromAuthHeader`(verbatim 课程 block 79)|
| `server.js` (startStandaloneServer) | 只 listen:{ port } | + `context: async ({req}) => {...}` |
| `.env.example` | MONGODB_URI + PORT | + `JWT_SECRET=replace-this-with-a-strong-random-secret` |
| `db.js` / `index.js` / `models/person.js` | verbatim part8t | **不动** — 本节不涉及连接/启动/person 数据 |

**改动代码量**:1 个新文件(`models/user.js` ~30 行)+ 5 个文件改动(schema/resolvers/server/package/env.example)

## 📚 课程原文摘要(per course block 57-87)

### 课程开篇(block 57)
> "Let's add user management to our application. For simplicity's sake, let's assume that all users have the same password which is hardcoded to the system. It would be straightforward to save individual passwords for all users following the principles from part 4, but because our focus is on GraphQL, we will leave out all that extra hassle this time."

**诚实声明**:password = 'secret' 硬编码,课程**明示**简化。这不是 bug,是设计选择。

### User schema(block 59)— models/user.js verbatim
```js
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person'
    }
  ],
})

module.exports = mongoose.model('User', schema)
```

### friends 字段说明(block 60)
> "Every user is connected to a bunch of other persons in the system through the friends field. The idea is that when a user, e.g. mluukkai, adds a person, e.g. Arto Hellas, to the list, the person is added to their friends list. This way, logged-in users can have their own personalized view in the application."

**注意**:friends 字段 schema 里**预留**了,但**本节不**实现 addFriend/addAsFriend mutation(留给 Friends list 子节)。

### Schema 扩展(block 63)— schema.js 新增
```graphql
type User {
  username: String!
  friends: [Person!]!
  id: ID!
}

type Token {
  value: String!
}

type Query {
  // ..
  me: User
}

type Mutation {
  // ...
  createUser(username: String!): User
  login(username: String!, password: String!): Token
}
```

### jwt 安装(block 65-66)
> "Let's install the jsonwebtoken library"
```bash
npm install jsonwebtoken
```

### Resolvers(block 68)— resolvers.js 新增
```js
const jwt = require('jsonwebtoken')
const User = require('./models/user')

Mutation: {
  // ..
  createUser: async (root, args) => {
    const user = new User({ username: args.username })

    return user.save()
      .catch(error => {
        throw new GraphQLError(`Creating the user failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error
          }
        })
      })
  },
  login: async (root, args) => {
    const user = await User.findOne({ username: args.username })

    if ( !user || args.password !== 'secret' ) {
      throw new GraphQLError('wrong credentials', {
        extensions: {
          code: 'BAD_USER_INPUT'
        }
      })
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    }

    return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
  },
},
```

### 登录机制(block 69)
> "The new user mutation is straightforward. The login mutation checks if the username/password pair is valid. And if it is indeed valid, it returns a jwt token familiar from part 4. **Note that the JWT_SECRET must be defined in the .env file.**"

### 例子 mutation(block 71, 73)
```graphql
mutation {
  createUser (
    username: "mluukkai"
  ) {
    username
    id
  }
}

mutation {
  login (
    username: "mluukkai"
    password: "secret"
  ) {
    value
  }
}
```

### Authorization header + Apollo context(block 74-78)
> "Just like in the previous case with REST, the idea now is that a logged-in user adds a token they receive upon login to all of their requests. And just like with REST, the token is added to GraphQL queries using the Authorization header."

> "On the backend, the most convenient way to pass the token that arrives with the request to the resolvers is to use Apollo Server's context."

### server.js 修改(block 79)
```js
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const jwt = require('jsonwebtoken')


const resolvers = require('./resolvers')
const typeDefs = require('./schema')
const User = require('./models/user')


const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.startsWith('Bearer ')) {
    return null
  }
 
  const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
  return User.findById(decodedToken.id).populate('friends')
}


const startServer = (port) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })


  startStandaloneServer(server, {
    listen: { port },
    context: async ({ req }) => {
      const auth = req.headers.authorization
      const currentUser = await getUserFromAuthHeader(auth)
      return { currentUser }
    },
  }).then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
}


module.exports = startServer
```

### me resolver(block 84)
```js
Query: {
  // ...
  me: (root, args, context) => {
    return context.currentUser
  }
},
```

## ⭐ 9 个核心概念

### 1. 三层防御 vs 两层防御(part8t → part8u 升级)
- **GraphQL SDL 层** — `type User { username: String! }` 字段类型验证
- **Mongoose schema 层** — `username: { required, minlength: 3 }` 字段值验证
- **业务规则层** — `User.exists({ username })` 检查重复(虽然 createUser **不**做这检查,per course)
- 课程**故意**让 createUser 不做 exists 检查(per course block 69 "straightforward")— 简化聚焦 GraphQL

### 2. 错误处理两种风格并存
- **try/catch await** — part8t addPerson/editNumber 用的(ES7 async/await 风格)
- **.save().catch(...Promise chain)** — part8u createUser 用的
- 课程**两种都展示**,我不统一,严格 verbatim

### 3. JWT 流程
```
login(username, password)
  → User.findOne({ username })
  → password !== 'secret'? throw GraphQLError 'wrong credentials'
  → jwt.sign({ username, id }, JWT_SECRET)
  → return { value: token }

下次请求:
  → HTTP header: Authorization: Bearer <token>
  → server context 解析 header
  → getUserFromAuthHeader 调 jwt.verify
  → User.findById(decoded.id).populate('friends')
  → context.currentUser = user 文档

me resolver:
  → return context.currentUser
```

### 4. Apollo Server context — 请求级共享对象
- **生命周期**:每个 HTTP 请求都重新调一次 context 函数
- **入参**:`{ req, res }`(per Apollo Server v4 context API)
- **返回值**:任意对象,作为**第三个参数**传给所有 resolvers
- **本节用法**:返回 `{ currentUser }`,resolver 读 `context.currentUser`
- 课程原文(per course block 83):"The context value is passed to resolvers as the third parameter"

### 5. password = 'secret' 硬编码 — 课程故意简化
- 课程原文(per course block 57):"let's assume that all users have the same password which is hardcoded to the system"
- 课程明示"because our focus is on GraphQL, we will leave out all that extra hassle this time"
- **不**用 bcrypt、**不**存 passwordHash
- 课程**故意**给一个安全反模式(密码硬编码)用于教学聚焦

### 6. friends 字段 — 预留 schema,本节不兑现
- User schema 里 `friends: [ObjectId ref Person]`
- 课程原文(per course block 60):通过 friends 列表实现"个性化视图"
- 本节**只**在 schema 定义,**不**实现 addFriend/addAsFriend mutation
- populate('friends') 已经 work,但 friends 数组永远是空(因为没人加)
- Friends list 子节会兑现(per part8t README "下一步是 part8v — Friends list")

### 7. me resolver 的 signature 是 `(root, args, context)` 不是 `(root, args)`
- 第三个参数 context 由 Apollo 自动注入(per course block 84 verbatim)
- 课程**故意**不用 `context` 中间件,只用 Apollo Server 内置 context 机制

### 8. getUserFromAuthHeader 三分支
1. `auth` undefined(没 header)→ return null
2. `auth` 不以 `Bearer ` 开头(格式错)→ return null
3. 以 `Bearer ` 开头 → `jwt.verify(token, JWT_SECRET)` → `User.findById(id).populate('friends')`
- 课程**故意**只对情况 1/2 return null,情况 3 内部抛 jwt.verify 错误会冒泡(per course verbatim)

### 9. Authorization header 格式
- 完整格式:`Authorization: Bearer eyJhbGc...`(Bearer 后空格 + token)
- 课程原文(per course block 74-76):Apollo Explorer 加 HTTP HEADERS { Authorization: "Bearer <token>" }
- `auth.substring(7)` 切掉 `Bearer `(7 字符:6 字母 + 1 空格)

## ✅ 验证步骤(per course 隐含验收)

### Step 1 — 环境准备
```bash
# 终端 1:启动 Atlas / 本地 mongod
mongod

# 终端 2:复制 .env.example 为 .env 并新增 JWT_SECRET
cd part8/u-user-and-log-in
cp .env.example .env
# 编辑 .env:
#   - 填 MONGODB_URI
#   - 填 JWT_SECRET=某个强随机字符串(per 课程 line 69 "must be defined in .env")
npm install
npm run dev
```

### Step 2 — 验证 createUser 成功路径
```graphql
mutation {
  createUser (
    username: "mluukkai"
  ) {
    username
    id
  }
}
```
**预期**:`data.createUser.username = "mluukkai"`,`data.createUser.id` 是 MongoDB ObjectId。

### Step 3 — 验证 createUser username 太短(<3 字符)
```graphql
mutation {
  createUser (username: "ab") {
    username
  }
}
```
**预期**:`errors[0].message = "Creating the user failed: User validation failed: username: Path \`username\` (\`ab\`) is shorter than the minimum length (3)"`,`extensions.code = 'BAD_USER_INPUT'`,`extensions.invalidArgs = 'ab'`

### Step 4 — 验证 login 成功路径
```graphql
mutation {
  login (username: "mluukkai", password: "secret") {
    value
  }
}
```
**预期**:`data.login.value` 是一段 JWT token(以 `eyJ` 开头的 base64)。**复制这段 token**给 Step 6 用。

### Step 5 — 验证 login 失败路径
```graphql
mutation {
  login (username: "nonexistent", password: "secret") {
    value
  }
}
```
**预期**:`errors[0].message = "wrong credentials"`,`extensions.code = 'BAD_USER_INPUT'`(无 invalidArgs)。

### Step 6 — 验证 me query with token
**Apollo Explorer HTTP HEADERS**(per course block 75-76):
```json
{
  "Authorization": "Bearer <paste-your-token-from-Step-4>"
}
```
**Query**:
```graphql
query {
  me {
    username
    id
    friends {
      name
    }
  }
}
```
**预期**:`data.me.username = "mluukkai"`,`data.me.friends = []`(per course 本节不实现 addFriend)。

### Step 7 — 验证 me query without token(未登录)
**Apollo Explorer**:把 HTTP HEADERS 的 Authorization **删掉**
**Query**:
```graphql
query {
  me {
    username
  }
}
```
**预期**:`data.me = null`(per course block 81:currentUser 找不到时 = null)。

### Step 8 — 验证 addPerson / editNumber 正常路径(part8t 回归)
- addPerson(name, phone, street, city)— 正常返回新 person
- editNumber(name, phone)— 正常更新 phone
- 这两个**不**受 part8u 影响,addPerson/editNumber 的 try/catch 沿用 part8t

### Step 9 — 验证 me query with invalid token
**Apollo Explorer HTTP HEADERS**:
```json
{
  "Authorization": "Bearer invalid-token-xxx"
}
```
**预期**:`errors[]` 包含 `JsonWebTokenError: invalid signature`(per course block 80 解释:"if the token is not valid ... the function returns null" — 但代码 verbatim 是 verify 抛异常不是 return null)

### Step 10 — 验证 JWT_SECRET 缺失启动失败
临时把 .env 的 JWT_SECRET 注释掉,重启 server
**预期**:`login` mutation 触发 server 抛 `JsonWebTokenError: secretOrPrivateKey must have a value`(per course block 69 "must be defined in the .env file")

## 📊 兑现的伏笔

| 来源 | 伏笔内容 | 兑现方式 |
|------|---------|---------|
| part8s README | "part8t — 补全 allPersons 的 phone filter" | ❌ **仍未兑现** — User and log in 节**不**包含 phone filter;`// filters missing` 占位仍保留 |
| part8t README | "下一步 part8u — User and log in" | ✅ **本节兑现** |
| part8p (前端) | "onError 接住 GraphQLError.message" | ✅ **沿用** — createUser / login 的 GraphQLError.message 可被前端 onError 接住 |
| part8a (前端) | "前端登录/Authorization header 流转" | ⏳ **本节后端 only** — 实际前端 token 注入留到后续前端子节 |
| part4 (REST) | "token + Authorization header 模式" | ✅ **直接复用** — per course block 61:"Logging in and identifying the user are handled the same way we used in part 4 when we used REST, by using tokens" |

## 🚫 故意不做(per part8u 范围限定)

1. **不接 bcrypt** — 课程明示简化,所有用户 password = 'secret' 硬编码
2. **不存 passwordHash** — 同上,User schema 故意没 password 字段
3. **不实现 addFriend / addAsFriend** — 只在 schema 定义 friends 字段,实际增删留给 Friends list 子节
4. **不补 phone filter** — `// filters missing` 占位保留(同 part8t)
5. **不改 db.js / index.js** — 本节不涉及连接/启动
6. **不改 models/person.js** — 本节不动 Person 数据
7. **不接前端** — 课程 User and log in 节是**纯后端**子节,前端 form 在后续小节
8. **不抽 env 验证函数** — 课程没要求,直接 `process.env.JWT_SECRET` 用
9. **不重试 token 解析失败** — jwt.verify 抛异常就让 Apollo 默认处理(per course verbatim)
10. **不处理 token 过期** — jwt.sign 无 expiresIn,token 永不过期(per course 简化)
11. **不分离 User.input validation** — GraphQL SDL 的 `username: String!` 已经够(per course)

## 🛠 Troubleshooting

### 1. 启动报 `secretOrPrivateKey must have a value`
**原因**:.env 没配 JWT_SECRET
**解决**:在 .env 加 `JWT_SECRET=your-secret-string`

### 2. login 报 `JsonWebTokenError: invalid signature`
**原因**:JWT_SECRET 在签发后被改了,或者 token 不是这个 server 签的
**解决**:重新 login 拿新 token

### 3. login 报 `jwt malformed`
**原因**:Authorization header 没加 `Bearer ` 前缀,或者 token 本身被截断
**解决**:Apollo Explorer HTTP HEADERS 写 `Authorization: Bearer <完整 token>`,不能漏空格

### 4. me query 一直返回 null
**原因**(三种):
1. HTTP HEADERS 没加 Authorization(Apollo Explorer 默认无)
2. Authorization header 不以 `Bearer ` 开头
3. JWT_SECRET 不一致(签发/验证用不同 secret)

**解决**:Step 1 加 header,Step 2 确认前缀,Step 3 确认 .env 一致

### 5. me query 报 JsonWebTokenError 而不是返回 null
**原因**:课程**故意**让 jwt.verify 失败抛异常而不是 return null(per course verbatim block 79)
**解决**:如果想要 return null 行为(更友好),wrap jwt.verify 在 try/catch — 但**这不是 part8u 范围**,留给后续优化

### 6. createUser 报 `Creating the user failed: E11000 duplicate key error`
**原因**:username 已存在(虽然 schema 没 unique index,但 MongoDB 第一次存后第二次存会触发 unique constraint 异常?其实不会,除非加 unique index)
**实际**:课程 schema 没加 unique,所以**不会**自动触发 — 但如果同名被反复创建两次,User.findOne 找到第一个,第二个 save **不会**抛 duplicate 错
**真正的重复检测**:createUser 不做 exists 检查(per course "straightforward"),重复 username **会**成功创建两个 user 文档 — 这是已知简化

### 7. friends 永远是空数组
**原因**:本节**不**实现 addFriend,只在 schema 定义
**解决**:per course Friends list 子节会兑现(per part8t README "下一步是 part8v")

### 8. 报错说 `req.headers is undefined`
**原因**:Apollo Server v4 standalone 模式下 req 对象结构可能不同(per Apollo v3 → v4 breaking changes)
**解决**:课程用 v4 verbatim,如果用 v3 改成 `({ req: { headers: req.headers } })`

### 9. JWT token 暴露在 .env.example
**原因**:本文件**只**是模板,真实 `.env` 已被 .gitignore 排除
**解决**:生产用 `openssl rand -hex 32` 生成强 secret,**永远不要** commit 到 .env.example 真实值

### 10. me query 的 friends 字段报错 "Cannot read property 'populate' of null"
**原因**:User 没找到或 token 失效
**解决**:检查 jwt.verify 是否抛异常,User.findById 是否返回 null(per course block 80 verbatim,jwt.verify 失败会让 populate 不执行)

## 📝 与 part8t 的核心差异对照

| 维度 | part8t | part8u |
|------|--------|--------|
| User 系统 | 无 | ✅ 新增 — User schema + createUser/login/me |
| Token 系统 | 无 | ✅ JWT(jsonwebtoken 库)|
| Context 注入 | 无 | ✅ Apollo Server context.currentUser |
| Password 处理 | 无 | 'secret' 硬编码(per course 简化)|
| Bcrypt | 无 | ❌ 不用(per course 简化)|
| friends 字段 | 无 | ✅ schema 定义但未兑现 |
| 改动文件 | 1(resolvers.js)| 5(schema/resolvers/server/package/env.example + 1 NEW models/user.js) |
| 新依赖 | 无 | + `jsonwebtoken: ^9.0.2` |
| 新 GraphQL 节点 | 0 | 4(User/Token types + me + createUser + login)|
| 错误处理风格 | try/catch await | createUser 用 .save().catch(login 用 if throw)|
| resolvers 新增 | 0 | 3(me/createUser/login) |
| 前端需求 | 不需要 | Apollo Explorer 加 Authorization header |

## 🎓 课程原文逐字摘录(per block 57-86)

> Block 57: "Let's add user management to our application..."
> Block 58: "Let's create the user schema in the file models/user.js:"
> Block 59: User schema 代码(见上)
> Block 60: "Every user is connected to a bunch of other persons..."
> Block 61: "Logging in and identifying the user are handled the same way we used in part 4 when we used REST, by using tokens."
> Block 62: "Let's extend the GraphQL schema like so:"
> Block 63: User/Token type + Query.me + Mutation.createUser + Mutation.login SDL
> Block 64: "The query me returns the currently logged-in user..."
> Block 65: "Let's install the jsonwebtoken library"
> Block 66: `npm install jsonwebtoken`
> Block 67: "The resolvers of the new mutations are as follows:"
> Block 68: createUser + login resolver 代码(见上)
> Block 69: "Note that the JWT_SECRET must be defined in the .env file"
> Block 70-73: createUser + login mutation examples
> Block 74: "the token is added to GraphQL queries using the Authorization header"
> Block 75-76: Apollo Explorer HTTP HEADERS 说明
> Block 77: "the most convenient way to pass the token ... is to use Apollo Server's context"
> Block 78: "let's create a helper function getUserFromAuthHeader"
> Block 79: server.js 完整代码(见上)
> Block 80: "if the token is not valid or the user cannot be found, the function returns null"
> Block 81: "the context field currentUser is set to the user object..."
> Block 82: context 代码(highlighted line 4)
> Block 83: "The context value is passed to resolvers as the third parameter"
> Block 84: me resolver 代码(见上)
> Block 85: "If the header contains a valid token, the query returns the details of the user..."
> Block 86: me query 返回示例截图
> Block 87: 下一节 "Friends list"

## ⏭️ 下一步

- **part8v — Friends list**(课程下一小节,per course 当前章节 line 16111 + block 87):addAsFriend mutation + Person.friends 字段(对称于 User.friends)+ allPersons filter by currentUser 的 friends — Chapter 4 第五小节
- **仍未兑现的伏笔**:
  - `// filters missing` 占位 — phone filter(per part8s README)留到某个后续小节
  - User.friends 数组增删(per block 60)— 本节只预留 schema
  - 前端 login form + localStorage token 持久化 — 后续前端子节

## 🧪 必备前置

1. part8t server 能正常启动(`.env` 配 MONGODB_URI)
2. mongod 跑着 / Atlas 集群 not paused
3. Apollo Studio(https://studio.apollographql.com/sandbox/explorer)打开 GraphQL endpoint
4. JWT_SECRET 在 .env 里配好(随机字符串)
5. (可选)postman / curl 验证 HTTP header 格式