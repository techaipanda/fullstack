# part8t — Validation(Chapter 4 第三小节)

> 📚 本项目是 [Full Stack Open](https://fullstackopen.com/) Part 8 GraphQL Chapter 4 **"Validation"** 子节的**严格 1:1 verbatim 落地**。
> 课程链接:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-4(Validation 子节)
> 前置子节:part8s "Mongoose and Apollo"

## 🎯 本节核心目标(per course Validation 段 line 1-3)

> "As well as in GraphQL, the input is now validated using the validations defined in the mongoose schema."

**核心**:mongoose schema 验证失败时(字段太短/缺字段),通过 GraphQLError 透传给前端,前端 part8p `onError` callback 接住展示红字。

## 📁 子项目结构

```
t-validation/
├── package.json      ← name 改 "t-validation",描述加 Validation 段说明
├── package-lock.json (cp 自 part8s)
├── README.md         ← 本文件
├── schema.js         ← verbatim part8s(本节不改 schema)
├── resolvers.js      ← ⭐ 本节唯一改动:addPerson + editNumber 加 try/catch
├── server.js         ← verbatim part8s
├── db.js             ← verbatim part8s
├── index.js         ← verbatim part8s
├── models/
│   └── person.js     ← verbatim part8s(schema 验证 minlength 5/3 + required 已在 part8s 配好)
└── .env.example      ← verbatim part8s
```

## 🔧 改造范围(对比 part8s)

| 文件 | part8s 状态 | part8t 改造 |
|------|------------|------------|
| `resolvers.js` (Mutation 块) | addPerson/editNumber 直接 `return person.save()` | 两个 save() 包 try/catch,catch 抛 GraphQLError + extensions.code 'BAD_USER_INPUT' + invalidArgs + error |
| `resolvers.js` (Query 块) | personCount/allPersons/findPerson verbatim | **不动** |
| `resolvers.js` (Person 块) | address resolver verbatim | **不动** |
| `schema.js` | String!/String 字段类型 | **不动** |
| `models/person.js` | 5 字段 + minlength 5/3 + required true | **不动** — 验证规则已在 part8s 配好 |
| `db.js` / `server.js` / `index.js` | mongoose 连接 + Apollo Server v4 standalone | **不动** |

**改动代码量**:`resolvers.js` 新增 ~24 行(两个 try/catch 块 + extensions 配置)

## 📚 课程原文摘要(per course Validation 段)

### 改造前(part8s 状态)— course line 14-15
> "The code of the backend can be found on GitHub, branch part8-3."

### 改造要点 1(course line 5-9)
> "For handling possible validation errors in the schema, we must add an error-handling `try/catch` block to the `save` method. When we end up in the catch, we throw an exception GraphQLError with error code"

### addPerson 改造(course line 16-28,高亮提示)
```js
const person = new Person({ ...args })
try {
  await person.save()
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
```

### editNumber 改造(course line 39-51,高亮提示)
```js
person.phone = args.phone
try {
  await person.save()
} catch (error) {
  throw new GraphQLError(`Saving number failed: ${error.message}`, {
    extensions: {
      code: 'BAD_USER_INPUT',
      invalidArgs: args.name,
      error
    }
  })
}
return person
```

### 课程结语(course line 53-54)
> "We have also added the Mongoose error and the data that caused the error to the `extensions` object that is used to convey more info about the cause of the error to the caller. The frontend can then display this information to the user, who can try the operation again with a better input."

**前后端呼应**:
- 后端 part8t:GraphQLError 抛 + extensions 三字段(`code`/`invalidArgs`/`error`)
- 前端 part8p:useMutation 的 `onError: (error) => setError(error.message)` 接住
- 前端 part8q:用 `onCompleted` 替代 `onError` 处理 success-but-null(`editNumber` 找不到 person)

## ⭐ 6 个核心概念

### 1. 双重防线 — GraphQL SDL vs Mongoose Schema
- **GraphQL 层**(schema.js):SDL 声明 `String!` / `String`,自动验证字段类型和必需性
- **Mongoose 层**(models/person.js):`minlength: 5/3` + `required: true`,验证字段值长度和存在
- **为什么需要两层**:per course line 41-44 verbatim 暗示 — 即使有人绕过 GraphQL(server 端 `new Person({})`),mongoose 也兜底

### 2. 错误传播链
```
mongoose ValidationError
  → resolver catch block
  → throw new GraphQLError(message, { extensions: { code, invalidArgs, error }})
  → Apollo Server 把 errors[] 序列化
  → 前端 onError 接 error.graphQLErrors[0].message
  → setError(error.message) → Notify 红字
```

### 3. extensions 三字段设计
- **`code: 'BAD_USER_INPUT'`**:标准化错误码,前端按 code 分流(per part8p onError 思路)
- **`invalidArgs: args.name`**:告诉前端哪个参数错了(per part8h 沿用)
- **`error`**:mongoose 原始 error 对象,前端 console.log 可调试用

### 4. try/catch 只包 save()
- `Person.findOne` / `Person.exists` / `Person.find` 都是查询,不校验字段
- `person.save()` 才会触发 mongoose schema 验证,必须 catch
- 课程精准防御,不滥包

### 5. addPerson vs editNumber catch message 不同
- `Saving person failed: ...`(per course line 19)
- `Saving number failed: ...`(per course line 42)
- 课程明示两段不同,我严格 verbatim

### 6. 不兑现 `// filters missing`
- part8s 占位 `// filters missing` 仍保留 — Validation 节**不**包含 phone filter
- phone filter 是 part8s README 提到的 line 149-162,但**课程实际把
  这部分放到了 Validation 节之后**(Login / Friends list 等后续小节)
- 验证:course Validation 段只有 try/catch,**没有** phone filter

## ✅ 验证步骤(per course Validation 段隐含验收)

### Step 1 — 环境准备
```bash
# 终端 1:启动 Atlas 集群或本地 mongod
mongod

# 终端 2:复制 .env.example 为 .env,填 Atlas URI
cd part8/t-validation
cp .env.example .env
# 编辑 .env 填 MONGODB_URI=...
npm install
npm run dev
```

### Step 2 — 验证 name 太短触发 addPerson 错误
```graphql
mutation {
  addPerson(
    name: "Ab"           # 太短,<5 字符
    phone: "1234567"
    street: "Teststreet"
    city: "Testcity"
  ) {
    name
  }
}
```
**预期**:
```json
{
  "errors": [{
    "message": "Saving person failed: Person validation failed: name: Path `name` (`Ab`) is shorter than the minimum length (5)",
    "extensions": {
      "code": "BAD_USER_INPUT",
      "invalidArgs": "Ab",
      "error": { /* mongoose 原始 error */ }
    }
  }],
  "data": { "addPerson": null }
}
```

### Step 3 — 验证 street 太短触发 addPerson 错误
```graphql
mutation {
  addPerson(
    name: "Validname"
    street: "No"          # 太短,<5 字符
    city: "Testcity"
  ) { name }
}
```
**预期**:error.message 含 "street: ... shorter than the minimum length (5)"

### Step 4 — 验证 city 太短触发 addPerson 错误
```graphql
mutation {
  addPerson(
    name: "Validname"
    street: "Validstreet"
    city: "AB"             # 太短,<3 字符
  ) { name }
}
```
**预期**:error.message 含 "city: ... shorter than the minimum length (3)"

### Step 5 — 验证 phone 太短触发 editNumber 错误
```graphql
mutation {
  editNumber(
    name: "Arto Hellas"   # 已有 person
    phone: "1234"          # 太短,<5 字符
  ) { name phone }
}
```
**预期**:error.message 含 "Saving number failed: ... phone: ... shorter than the minimum length (5)"

### Step 6 — 验证前端 part8q 集成(part8q setError prop 链复用)
1. 启动 part8q Vite dev server(`cd part8/q-updating-a-phone-number && npm run dev`)
2. 在 PhoneForm 输入 name="Ab" phone="1234" 提交
3. **预期**:
   - 页面顶部显示红字 Notify:`Saving number failed: Person validation failed: phone: ...`
   - 表单 input **保留输入**(part8q 失败不清空)— 等等,part8q 实际是 setName/setPhone 立即清空,需要在 onCompleted 里区分 data.editNumber 真假

**注**:前端表单失败时 input 不清空,课程 part8p 末尾 "Note to self: form fields cleared immediately, but should only clear on success" — 课程**故意不做**,作为后续优化留

### Step 7 — 验证正常路径未坏(part8s 既有功能回归)
1. 提交正常 person(全部字段 ≥5 字符)
2. **预期**:`data.addPerson.name` 返回成功,Person 列表立即看到(per part8o refetchQueries 链)
3. editNumber 正常路径:`phone: "123456"` 返回成功,phone 更新

### Step 8 — 验证 name 重复(part8h 既有错误处理未坏)
1. 重复提交同名 person(字段都合法)
2. **预期**:`Name must be unique: ...`(per part8h GraphQLError 沿用)

## 📊 兑现的伏笔

| 来源 | 伏笔内容 | 兑现方式 |
|------|---------|---------|
| part8s README | "part8t — 补全 allPersons 的 phone filter" | ❌ **未兑现** — Validation 节不包含 phone filter;`// filters missing` 占位仍保留 |
| part8h | "GraphQLError 抛错用,前端 part8p onError 接住" | ✅ **部分兑现** — part8t 复用 GraphQLError 模式,但触发场景从"name 重复"扩展到"mongoose schema 验证失败" |
| part8p | "前端 setError prop 链接 server GraphQLError.message" | ✅ **双向打通** — part8t 后端抛的 error.message 走 part8p setError → Notify 红字 |
| part8q | "editNumber 找不到 person 时用 onCompleted 处理 null" | ✅ **保留** — part8t 的 editNumber try/catch **不**影响 null 返回路径(null 在 try 之前 return) |

## 🚫 故意不做(per part8t 范围限定)

1. **不补 phone filter** — `// filters missing` 占位保留
2. **不改 schema.js** — SDL 类型声明已足够
3. **不改 models/person.js** — minlength/required 已在 part8s 配好
4. **不改 db.js / server.js / index.js** — Validation 段不涉及连接/启动
5. **不创建真实 .env** — 沿用 part8s `.env.example`,用户自填
6. **不接前端 onError 重构** — 课程 Validation 段是纯后端小节,前端不动
7. **不抓 ValidationError 子类型** — 课程只用通用 catch,把所有 mongoose error 一并处理
8. **不把 error.message 转 i18n** — 课程原文用英文错误消息,前端按英文展示

## 🛠 Troubleshooting

### 1. 启动报 `MONGODB_URI is not defined`
**原因**:没有 `.env` 文件或 `.env` 里没填
**解决**:`cp .env.example .env`,然后填 Atlas URI

### 2. 启动报 `MongooseServerSelectionError: connect ECONNREFUSED`
**原因**:本地 mongod 没启动或 Atlas 集群 paused
**解决**:`mongod` 启动本地 / Atlas 网页点 "Resume" 按钮

### 3. GraphQL Playground 提交后没看到 errors[]
**原因**:Apollo Studio 默认隐藏 errors[] 折叠
**解决**:点 errors[] 旁的箭头展开,或切到 Response 面板

### 4. 前端 part8p Notify 没红字
**原因**:part8p 的 onError 用了 `error.message`,但 GraphQLError.message 被 extensions.code 截断
**解决**:用 `error.graphQLErrors[0].message` — part8p onError 已正确处理

### 5. catch 块里 error 字段打印成 `[object Object]`
**原因**:`extensions.error` 是 mongoose ValidationError 对象,不是字符串
**解决**:前端 console.log 整段 error 看 stack

### 6. 提交同名 person 触发 "Saving person failed" 而不是 "Name must be unique"
**原因**:Server 端 await Person.exists 异步检查有 race condition(理论上罕见)
**解决**:同时存在的并发 mutation 可能都通过 exists 检查再都失败 — 加 unique index 到 MongoDB schema(per course 后段)

### 7. part8p Notify 红字显示英文 mongoose 内部错误
**原因**:error.message 透传了 mongoose 内部消息 "Person validation failed: name: Path `name` ..."
**解决**:课程故意这么做,前端按英文展示;如需本地化,在前端 onError 里 replace / i18n(超出 part8t 范围)

## 📝 与 part8s 的核心差异对照

| 维度 | part8s | part8t |
|------|--------|--------|
| addPerson 错误处理 | 仅 name 重复抛 GraphQLError | name 重复 **+** save 失败抛 GraphQLError |
| editNumber 错误处理 | 仅找不到 person return null | 找不到 null **+** save 失败抛 GraphQLError |
| extensions 字段 | code + invalidArgs(2 字段) | code + invalidArgs + error(3 字段,加 mongoose 原 error) |
| 防御范围 | 仅业务规则重复 | 业务规则重复 + mongoose schema 验证 + DB 异常 |
| catch 块数量 | 0 | 2(addPerson + editNumber 各一个) |

## 🎓 课程原文逐字摘录(per Validation 段 0-54 行)

> Line 1: "Validation"
> Line 3: "As well as in GraphQL, the input is now validated using the validations defined in the mongoose schema."
> Line 5: "For handling possible validation errors in the schema, we must add an error-handling `try/catch` block to the `save` method."
> Line 7: "When we end up in the catch, we throw an exception GraphQLError with error code :"
> Line 14: "Highlighted lines: 16 to 28, 39 to 51"
> Line 16-28: addPerson 的 try/catch(见上文)
> Line 39-51: editNumber 的 try/catch(见上文)
> Line 53: "We have also added the Mongoose error and the data that caused the error to the `extensions` object"
> Line 54: "The frontend can then display this information to the user, who can try the operation again with a better input."

## ⏭️ 下一步

- **part8u — User and log in**(课程下一小节,per course 当前章节 line 16111):user schema + bcrypt 密码哈希 + jsonwebtoken token 签发 + Login mutation + resolvers 改造(User type + login resolver + 当前 user context)— Chapter 4 第四小节
- **仍未兑现的 part8s 占位 `// filters missing`**(per part8s README 提到的 line 149-162):phone filter 仍是后续小节的内容,可能是 part8u 之后某个小节才补

## 🧪 必备前置

1. part8s server 能正常启动(`.env` 配 Atlas URI)
2. mongod 跑着 / Atlas 集群 not paused
3. Apollo Studio(https://studio.apollographql.com/sandbox/explorer)打开 GraphQL endpoint
4. (可选)part8p 或 part8q Vite 前端跑着,验证前端 Notify 红字