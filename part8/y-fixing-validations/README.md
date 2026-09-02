# part8y — Fixing validations(Chapter 5 第 3 子节)

> **课程 URL**:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-5
>
> **本章小节**:User login → Adding a token to a header → **Fixing validations**(本子节)→ Updating cache, revisited
>
> **本子节对应课程章节**:Chapter 5 "Fixing validations"(第 3 个 H2)
>
> **架构延续**:本子节是 part8x library frontend 的延续(只改 3 个文件)

## 子项目结构

```
y-fixing-validations/
├── .env.example                (verbatim part8x 沿用 — VITE_BACKEND_URL 占位)
├── .gitignore                  (verbatim part8x 沿用 — node_modules + .env + dist)
├── index.html                  (verbatim part8x 沿用 — Vite 入口)
├── package.json                (verbatim part8x 沿用 — React 19.2 + Apollo 3.11 + Vite 7.2.4)
├── vite.config.js              (verbatim part8x 沿用 — react() plugin)
├── README.md                   (本文件)
└── src/
    ├── main.jsx                (verbatim part8x 沿用 — Apollo Link chain 自动加 Authorization)
    ├── App.jsx                 (verbatim part8x 沿用 — token + LoginForm + logout + notify)
    ├── queries.js              ⭐ **改** — 加 CREATE_PERSON(per part8o)+ EDIT_NUMBER(per part8q)
    └── components/
        ├── LoginForm.jsx       (verbatim part8w/x 沿用 — LOGIN mutation + localStorage) ⚠️ v1 漏 copy,已修复
        ├── Notify.jsx          (verbatim part8x 沿用 — 8 行错误展示)
        ├── Persons.jsx         (STUB — 渲染 "Persons here")
        ├── PersonForm.jsx      ⭐ **改** — 从 stub → 完整版(per part8n + part8p onError + part8y block 4 phone.length 修复)
        └── PhoneForm.jsx       ⭐ **改** — 从 stub → 完整版(per part8q + part8y block 10 try/catch 替代 onCompleted)
```

> ⚠️ **诚实声明 — v1 bug 修复**:最初创建 part8y/z 时,`Copy-Item` 只 copy 了 4 个 components(Notify / Persons / PersonForm / PhoneForm),漏了 `LoginForm.jsx`。导致 `npm run dev` 报 `Failed to resolve import "./components/LoginForm" from "src/App.jsx"`(per part8x App.jsx import)。**修复命令**:`Copy-Item w-user-login-frontend/src/components/LoginForm.jsx → y-fixing-validations/src/components/`(LoginForm.jsx 来自 part8w,part8x verbatim 沿用)。part8z 同 bug 同样已修。

## 改造范围表

| 文件 | 状态 | 来源 |
|------|------|------|
| `.env.example` | 🔁 copy | verbatim part8x 沿用 |
| `.gitignore` | 🔁 copy | verbatim part8x 沿用 |
| `index.html` | 🔁 copy | verbatim part8x 沿用 |
| `package.json` | 🔁 copy | verbatim part8x 沿用(@apollo/client ^3.11.0)|
| `vite.config.js` | 🔁 copy | verbatim part8x 沿用 |
| `src/main.jsx` | 🔁 copy | verbatim part8x 沿用(setContext + authLink.concat(httpLink))|
| `src/App.jsx` | 🔁 copy | verbatim part8x 沿用(token + LoginForm + logout)|
| `src/queries.js` | ⭐ **改** | 沿用 part8x 的 ALL_PERSONS + LOGIN,**新增** CREATE_PERSON(per part8o)+ EDIT_NUMBER(per part8q)|
| `src/components/Notify.jsx` | 🔁 copy | verbatim part8x 沿用 |
| `src/components/Persons.jsx` | 🔁 copy | verbatim part8x 沿用(STUB)|
| `src/components/PersonForm.jsx` | ⭐ **改** | 从 stub → 完整版(per part8n 沿用 + part8p setError/onError + part8y block 4 phone.length 修复)|
| `src/components/PhoneForm.jsx` | ⭐ **改** | 从 stub → 完整版(per part8q 沿用 + part8y block 10 try/catch **替代** onCompleted)|
| `README.md` | 🆕 新建 | 本文件 |

**改造核心**:9 文件 copy + 3 文件改 + 1 README 新写 = 13 文件。

## 课程原文摘要(Chapter 5 "Fixing validations" — 10 substantive blocks)

| Block | 类型 | 内容摘要 |
|-------|------|---------|
| 0 | 文字 | "In the application, it should be possible to add a person without a phone number. However, if we now try to add a person without a phone number, it doesn't work" |
| 2 | 文字 | "Validation fails, because frontend sends an empty string as the value of phone" |
| 3 | 文字 | "Let's change the function creating new persons so that it sets phone to undefined if user has not given a value" |
| 4 | 代码 | **PersonForm.submit 高亮行 6-13**:`phone: phone.length > 0 ? phone : undefined` |
| 5 | 文字 | "From the perspective of the backend and the database, the phone attribute now has no value if the user leaves the field empty. Adding a person without a phone number works again" |
| 6 | 文字 | "There is also an issue with the functionality for changing a phone number. The database validations require that the phone number must be at least 5 characters long, but if we try to update an existing person's phone number to one that is too short, nothing seems to happen. The person's phone number is not updated, but on the other hand no error message is shown either" |
| 7 | 文字 | "From the console's Network tab we can see that the request is answered with an error message" |
| 9 | 文字 | "Let's modify the application so that validation errors are also shown when changing a phone number" |
| 10 | 代码 | **PhoneForm.submit 高亮行 7-11**:`try { await changeNumber(...) } catch (error) { setError(error.message) }` |
| 11 | 文字 | "If the database validations fail, execution ends up in the catch block, where an appropriate error message is set in the application using the setError function" |

## 关键诚实声明 — 课程 trade-off(PhoneForm onCompleted → try/catch)

**这是 part8y 唯一的"破坏性改动",必须明确**:

| 项 | part8q 课程 final-state | part8y 课程 block 10 | 说明 |
|----|-----------------------|---------------------|------|
| useMutation options | `{ onCompleted: (data) => { if (!data.editNumber) setError('person not found') } }` | 无 options(裸调) | 课程**故意**丢弃 onCompleted |
| 错误处理位置 | onCompleted option 回调 | submit handler 里 try/catch | 从 options 移到 submit |
| 兜底"person not found" | ✅ data.editNumber === null → setError | ❌ setError 不会被调用 | **丢失这个兜底** |
| 兜底"phone validation error" | ❌ mutation 成功(data.editNumber 仍是旧 person),无 error 可 catch | ✅ server 抛 GraphQLError → Apollo reject promise → catch | **获得这个兜底** |

### 为什么课程做这个 trade-off?

1. **per course block 7**:validation error 在 Network tab 已经可见(后端 GraphQLError),只是前端没接住
2. **per course block 10-11**:课程重点是**让 validation error 在前端可见**,person not found 的可见性课程接受放弃
3. **per course block 6 文字暗示**:课程想表达"validation error 应该友好展示",person not found 不在重点里

### 课程 trade-off 的影响

| 用户操作 | part8q(onCompleted 模式) | part8y(try/catch 模式) |
|---------|--------------------------|------------------------|
| 改不存在的 person 的 phone | Notify 红字 "person not found" | **静默失败**(mutation 成功,旧数据未变) |
| 改存在的 person 的 phone (太短) | **静默失败**(mutation 成功但 server 抛错,onCompleted 不触发) | Notify 红字 "Person validation failed: ..." |

⛔ **警告**:per part8j/v 后端 editNumber 找不到 person 时返回 null(不抛错),所以 part8y 模式下"改不存在的人"会静默失败。

✅ **生产代码建议**:`try/catch` + `onCompleted` 双保险(per README 末尾"故意不做"章节)。

## 7 个核心概念

1. **空字符串 vs undefined 的字段语义差异**(本节**新概念**)— 课程 block 4:前端 input 空字符串 vs mongoose schema 处理 undefined,验证跳过 vs 触发 CastError
2. **mongoose schema `phone: { type: String, minlength: 5 }`**(per part8s/t)— phone 不是 required,可以 undefined,但空字符串触发 minlength 验证失败
3. **try/catch vs onError vs onCompleted 三种错误处理**(本节**新概念**)— try/catch 显式 + 错误粒度细,onError 是 Apollo option 集中处理,onCompleted 处理"success but data 异常"
4. **Apollo Client v3 error 对象结构**(per part8p)— `error.graphQLErrors[].message` 优先于 `error.message`(minimum viable improvement)
5. **Apollo Link chain + 鉴权链路**(per part8x 沿用)— part8v 强制 addPerson 需要 Authorization,part8x 自动加 header,part8y PersonForm 能正常调 addPerson
6. **refetchQueries**(per part8o 沿用)— mutation 成功后 Apollo 自动重发 ALL_PERSONS,Persons 列表立即看到新 person
7. **课程故意简化模式** — block 10 接受 person not found 兜底缺失,以换取 validation error 兜底

## minimum viable improvement(诚实声明)

per discipline "minimum viable additions",我做了**两处**小改进(都有详细 README 注释):

| 文件 | 课程 verbatim | 我的改进 | 说明 |
|------|------------|---------|------|
| PersonForm.jsx | `onError: (error) => setError(error.message)` | `onError: (error) => { const message = error.graphQLErrors[0]?.message \|\| error.message; setError(message) }` | 优先 GraphQLError.message(更精准),fallback 兜底 |
| PhoneForm.jsx | `catch (error) { setError(error.message) }` | `catch (error) { const message = error.graphQLErrors[0]?.message \|\| error.message; setError(message) }` | 同上 |

两处改进都是**纯 fallback 兼容**,行为完全向后兼容课程 verbatim。

## 验证步骤(你需要自己跑命令)

per discipline "Claude 不替你跑任何命令":

```bash
cd part8/y-fixing-validations
cp .env.example .env
npm install   # 装 @apollo/client graphql react react-dom + dev @vitejs/plugin-react vite
npm run dev   # Vite dev server 默认 http://localhost:5173
```

预期:`VITE ready in xxx ms` + `Local: http://localhost:5173/`

然后**开两个终端**(同 part8w/x,后端相同):

**终端 1(后端,part8u/v)**:
```bash
cd part8/v-friends-list    # 或者 part8u
npm run dev                # → Server ready at http://localhost:4000
```

**终端 2(前端,part8y)**:
```bash
cd part8/y-fixing-validations
npm run dev                # → http://localhost:5173
```

### Step 1:浏览器登录(per part8w Step 1-5)
- 访问 http://localhost:5173
- 在 GraphQL Explorer 创建用户(per part8x Step 3)
- 用 username + password='secret' 登录
- 登录后应该看到 3 个组件(Persons / PersonForm / PhoneForm)不再是 stub

### Step 2:验证 PersonForm(本节**核心验证 1**)
- 在 PersonForm 输入 name="New Person" + street="Foo" + city="Bar" + phone 留空
- 点 "add!"
- 应该:成功添加 person(per course block 5 "Adding a person without a phone number works again")
- DevTools → Application → MongoDB Compass → 应该看到 phone 字段**不存在**(不是空字符串)

### Step 3:验证 phone 太短的 PersonForm 错误(per part8t + part8y)
- 在 PersonForm 输入 name="X" (太短 < 5 chars)+ street="Foo" + city="Bar" + phone="12345"
- 点 "add!"
- 应该:Notify 红字显示 "Person validation failed: name: Path `name` (`X`) is shorter than the minimum allowed length (5)."
- 10 秒后红字消失(per part8p notify 行为)

### Step 4:验证 PhoneForm(本节**核心验证 2**)
- 在 PhoneForm 输入 name="Arto" + phone="12345" (5 chars 满足)
- 点 "change number"
- 应该:成功改 phone,Persons 列表立即看到新 phone(per part8o refetchQueries)

### Step 5:验证 PhoneForm validation 错误(本节**核心验证 3**)
- 在 PhoneForm 输入 name="Arto" + phone="1234" (4 chars 太短)
- 点 "change number"
- 应该:Notify 红字显示 "Person validation failed: phone: Path `phone` (`1234`) is shorter than the minimum allowed length (5)."
- 10 秒后红字消失

### Step 6:验证 PhoneForm person not found trade-off(本节**关键诚实验证**)
- 在 PhoneForm 输入 name="NotExist" + phone="12345"
- 点 "change number"
- 应该:**静默失败** — mutation 成功(per part8j editNumber 找不到返回 null),旧数据不变,**无红字**
- ⛔ 这是**课程故意**的 trade-off,生产代码应该双保险
- 验证方法:DevTools Network → 看 editNumber mutation 响应 status 200 + data.editNumber 是 null

### Step 7:验证 PersonForm 网络流
- DevTools Network → 触发 ALL_PERSONS 自动请求(refresh 页面)
- 点开请求 → Headers → **应该有** `authorization: Bearer eyJ...`(per part8x 沿用)
- 触发 createPerson → DevTools Network → **应该有** Authorization header + variables 含 `phone: undefined`(phone 字段不存在,不是空字符串)

## 兑现的伏笔

来自 part8w/x 的"故意不做"清单:

- ✅ **PersonForm 完整版**(per part8w "故意不做" + part8n)— 现在做完整版(4 useState + useMutation + form JSX)
- ✅ **PhoneForm 完整版**(per part8w "故意不做" + part8q)— 现在做完整版(2 useState + useMutation + form JSX)
- ✅ **server validation error 前端可见**(per part8w "故意不做" + part8t 后端抛错)— part8y try/catch 兜底
- ✅ **空 phone 字段问题**(per part8w "故意不做")— part8y phone.length 修复

## 故意不做(诚实声明)

per discipline "minimum viable additions" + 课程严格按 block 4 + block 10:

- ❌ **allPersons 完整版**(带 address 嵌套)— per part8w README:等"Listing persons"小节
- ❌ **Persons 完整版**(STUB 渲染 "Persons here")— per part8w README:等"Listing persons"小节
- ❌ **update cache 精确控制**(per part8o refetchQueries 升级版)— per part8w README:等"Updating cache, revisited"小节
- ❌ **try/catch + onCompleted 双保险** — 课程**故意**trade-off,生产代码建议加
- ❌ **表单在 catch 后不清空** — 课程 verbatim 立即清空,生产代码可以保留数据让用户改
- ❌ **ApolloErrorLink 401 自动 logout**(per part8x)— 沿用 part8x 不变
- ❌ **setContext 异步版**(refresh token 模式)— 沿用 part8x 不变

## 后端对接验证(per part8u/v README 的 resolvers)

| 前端操作 | 后端 schema + resolver(part8u/v) | 一致性 |
|---------|----------------------------------|--------|
| PersonForm 不填 phone | addPerson resolver(per part8v 鉴权)→ mongoose person.save(phone 字段不存在)| ✅ |
| PersonForm name 太短 | addPerson resolver → mongoose ValidationError → part8t catch 抛 GraphQLError `Saving person failed: ...` | ✅ |
| PhoneForm phone="12345" | editNumber resolver(per part8j 无鉴权)→ mongoose person.save(phone="12345") | ✅ |
| PhoneForm phone="1234" | editNumber resolver → mongoose ValidationError → part8t catch 抛 GraphQLError `Saving number failed: ...` | ✅ |
| PhoneForm name="NotExist" | editNumber resolver → return null(per part8j 找不到 person) | ✅ |
| 登录后调 addPerson | part8v addPerson 强制 UNAUTHENTICATED → 前端 part8x setContext 自动加 header → 鉴权通过 | ✅ |

✅ **结论**:前端 part8y 完整版 + 后端 part8u/v 解锁了 addPerson/editNumber 的 validation error 前端可见。

## Troubleshooting

| 症状 | 可能原因 | 修复 |
|------|---------|------|
| Notify 红字 "Saving person failed: ..." | name 太短 / street 太短 / city 太短(per part8t mongoose 验证)| 改成 ≥5/3/3 字符 |
| Notify 红字 "Saving number failed: ..." | phone 太短(per part8t minlength: 5)| 改成 ≥5 字符 |
| PhoneForm 改不存在的人没反应 | part8y trade-off(per 关键诚实声明章节)| 接受或加 onCompleted 双保险 |
| PhoneForm 改存在的 person 没反应 | 后端没启 / VITE_BACKEND_URL 配错 | 看后端 terminal + check .env |
| addPerson 提示 "not authenticated" | 没登录 / token 失效 / Authorization header 没加 | 重新登录(per part8x Step 5 验证 Authorization header)|
| PersonForm 不填 phone 还是报错 | 浏览器缓存了 part8x 老版 PersonForm.jsx | Ctrl+Shift+R 强刷 / 重启 Vite |
| 空字符串 vs undefined 在 Network 看不出 | 用 curl + jq 看 JSON body 才是 undefined | `cat payload.json \| jq .variables.phone` 应输出 `null` |

## 下一步(per course 顺序)

- ✅ part8w User login
- ✅ part8x Adding a token to a header
- ✅ part8y Fixing validations(本子节)
- ⏭️ **Chapter 5 第 4 小节**:"Updating cache, revisited"(per course H2)— `update` callback 精确控制 cache 更新(refetchQueries 升级版)
- ⏭️ Exercises 18-24(library app 的 6 个练习题)— per 课程策略:**跳过练习题**

我们 part8y 落地后,**下一步是 part8z "Updating cache, revisited"**(待映射字母)。

## 通道状态表(本子节)

| 通道 | 状态 | 备注 |
|------|------|------|
| chrome-devtools MCP evaluate_script | OK | 抓 Fixing validations 10 个 substantive blocks(idx 0-12 跳过 empty)|
| PowerShell Copy-Item | OK | 创建 y-fixing-validations/ + copy 9 verbatim 文件 |
| Write GateGuard | OK | 3 次 Write 都提供 facts 后通过(queries.js + PersonForm.jsx + PhoneForm.jsx)|
| Bash mkdir | OK | 创建 src/components/ 子目录 |
| AskUserQuestion | OK | 用户选"新建 part8y-fixing-validations/ (Recommended)" |
| WebSearch / WebFetch | SKIP | per 硬约束 |