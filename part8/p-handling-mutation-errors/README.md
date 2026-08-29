# part8p — Handling mutation errors

> **课程对应**:Chapter 3 "Handling mutation errors" 子节
> **课程 URL**:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-3(锚点 #handling-mutation-errors)
> **课程原文定位**:课程 line 421-460
> **落地日期**:2026-08-29

## 1. 课程原文要点(逐字保留)

> "If we try to create an invalid person, for example by using a name that already exists in the application, nothing happens. The person is not added to the application, but we also do not receive any error message."
>
> "Earlier, we defined a check on the server that prevents adding another person with the same name and throws an error in such a situation. However, the error is not yet handled in the frontend. Using the `onError` option of the `useMutation` hook, it is possible to register an error handler function for mutations."
>
> "Let's register an error handler for the mutation. The _PersonForm_ component receives a `setError` function as a prop, which is used to set a message indicating the error"
>
> "Create a separate component for the notification in the file _scr/components/Notify.jsx"(课程原文 typo `scr`,落地用 `src/components/Notify.jsx`)
>
> "Render the _Notify_ component that displays the error message in the file _App.jsx_"
>
> "Now the user is informed about an error with a simple notification."

## 2. 核心概念(4 个新概念)

### 2.1 `onError` option of `useMutation`

```js
const [createPerson] = useMutation(CREATE_PERSON, {
  refetchQueries: [{ query: ALL_PERSONS }],   // 成功时
  onError: (error) => setError(error.message), // 失败时
})
```

**2.1.1 是什么**:Apollo `useMutation` 的第 2 参数 OPTIONS 里的一个字段,跟 `refetchQueries` / `onCompleted` / `update` 平级。

**2.1.2 为什么需要**:
- **不用 onError**:mutation 失败时(比如 server 抛 `GraphQLError 'name must be unique'`)—— UI 没任何反馈,用户以为成功了但其实没存上
- **用 onError**:拿到 `error` 对象 → 提取 `error.message` → 调用父组件传下来的 `setError` → 屏幕顶部红字显示

**2.1.3 `error` 对象解剖**:
- `error.graphQLErrors`:GraphQL errors 数组(server 通过 `throw new GraphQLError(...)` 抛的)
- `error.message`:第一个 GraphQL error 的 message 字符串(本次用这个,简洁)
- `error.networkError`:网络层错误(选)

**2.1.4 与 `refetchQueries` 的关系**:
- `refetchQueries`:mutation **成功** 时触发 → query 重发
- `onError`:mutation **失败** 时触发 → 回调拿到 error
- 两者**互斥**:同一次 mutation 只可能走一条分支

**2.1.5 验证**:
```bash
# 1. 启 server(part8j 还在 4000 端口)
# 2. Vite dev(part8p 5173 端口)
# 3. 浏览器添加 name="Arto Hellas"(已存在,per server seed 数据)
# 4. 屏幕顶部红字 "Name must be unique: Arto Hellas"
# 5. 10s 后自动消失
```

### 2.2 `Notify` 组件(Presentational)

```jsx
const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null
  }
  return (
    <div style={{ color: 'red' }}>
      {errorMessage}
    </div>
  )
}
```

**2.2.1 是什么**:纯展示组件,单一 prop `errorMessage`,只负责"有错就显示红字,没错就什么都不渲染"。

**2.2.2 为什么需要**:
- **不用 Notify**:错误信息得手动嵌在 App.jsx 里,逻辑耦合 UI 布局
- **用 Notify**:错误显示这个关注点独立成一个组件,App 只管传 errorMessage,不管怎么渲染

**2.2.3 `return null` 语义**:
- React 官方允许组件 return `null`(表示"什么都不渲染")
- 比 `<></>` 空 Fragment 更干净
- 触发时机:`!errorMessage` 即 null 或 undefined 时

**2.2.4 内联 style**:
- `style={{ color: 'red' }}` —— 外层 `{}` 是 JSX 表达式,内层 `{}` 是对象字面量
- 课程硬编码 `color: 'red'`,生产代码应该用 CSS module / styled-components
- 这是教学简化,不动

### 2.3 `notify` 函数 + `setTimeout` 自动清除

```jsx
const notify = (message) => {
  setErrorMessage(message)
  setTimeout(() => {
    setErrorMessage(null)
  }, 10000)
}
```

**2.3.1 是什么**:App 里定义的"错误通知封装函数",封装了"set 错误 + 10s 后自动清"。

**2.3.2 为什么需要**:
- **不用 setTimeout**:错误永久显示,用户得手动关(用户体验差,且 React StrictMode 下还会再触发一次)
- **用 setTimeout**:10s 后自动消失,符合"错误是瞬时通知"的语义

**2.3.3 `10000` 是课程硬编码**:生产代码应该用常量化或 config,但课程 verbatim 写 10000。

**2.3.4 与 `setError` prop 链关系**:
- App 定义 `notify` 函数
- 通过 `<PersonForm setError={notify} />` 透传给 PersonForm
- PersonForm 在 `onError` 回调里调 `setError(error.message)` —— 本质上调 App 的 `notify`

### 2.4 `setError` prop 链(子 → 父回调)

```jsx
// App.jsx
const notify = (message) => { /* ... */ }
<PersonForm setError={notify} />

// PersonForm.jsx
const PersonForm = ({ setError }) => {
  // ...
  const [createPerson] = useMutation(CREATE_PERSON, {
    onError: (error) => setError(error.message),
  })
}
```

**2.4.1 是什么**:React 经典模式 —— 父组件管状态,子组件通过 prop 拿到"修改状态的回调函数",需要时回调传值回去。

**2.4.2 为什么需要**:
- 错误状态在 App 管(`errorMessage` state + `setTimeout` 自动清除)
- PersonForm 是 mutation 触发处,知道"何时出错 + 错误信息是什么"
- 所以 PersonForm 通过 `setError` prop 把"错误信息"传回 App

**2.4.3 prop 命名**:课程硬编码 `setError`(动词 set + 名词 Error)而不是 `handleError` / `onError` / `notify`。

## 3. 真实运行时验证(完整链路)

### 3.1 启动 server
```bash
cd /Users/jiankang/workspace/github_workspace/fullstack/part8/j-changing-a-phone-number
npm run dev
# server 监听 http://localhost:4000
```

### 3.2 启动 part8p 客户端
```bash
cd /Users/jiankang/workspace/github_workspace/fullstack/part8/p-handling-mutation-errors
npm run dev
# Vite 监听 http://localhost:5173
```

### 3.3 触发 error 路径
1. 浏览器打开 http://localhost:5173
2. 看到 Persons 列表(应包含 "Arto Hellas" 等)
3. 在 form 里填:
   - name: `Arto Hellas`(故意重复)
   - phone: `1234567`
   - street: `Test Street`
   - city: `Test City`
4. 点 `add!` 按钮
5. **期望行为**:
   - 屏幕顶部出现红字 `Name must be unique: Arto Hellas`(per part8h server 抛的 message)
   - 10 秒后红字自动消失
   - form 4 个 input 被清空(per part8n/o 沿用的 submit handler 逻辑)
   - Persons 列表不变(因为 mutation 没成功)

### 3.4 触发 success 路径(对比)
1. 在 form 里填全新名字 `Test Person`
2. 点 `add!`
3. **期望行为**:
   - 无红字(`onError` 没触发)
   - form 被清空
   - Persons 列表立即出现 `Test Person`(per part8o `refetchQueries` 触发的重发)

### 3.5 Network 面板观察(DevTools)
- **error 路径**:1 个 POST `/graphql`(mutation,响应是 `errors: [{ message: "Name must be unique: ...", extensions: { code: "BAD_USER_INPUT" } }]`)
- **success 路径**:1 个 POST `/graphql`(mutation)+ 紧接 1 个 POST `/graphql`(ALL_PERSONS,per `refetchQueries`)

## 4. 10 step 手动验证清单

| # | 操作 | 期望 | 涉及概念 |
|---|---|---|---|
| 1 | 启 server + Vite | 两个端口(4000 + 5173)都在跑 | server / client 双终端 |
| 2 | 浏览器打开 5173 | 看到 Persons 列表 | `useQuery(ALL_PERSONS)` |
| 3 | 点击某人的 `show address` | 单人详情视图 | `useQuery(FIND_PERSON, { skip })` |
| 4 | 点 `close` | 回到列表 | `setNameToSearch(null)` |
| 5 | 填全新名字并提交 | 列表立即出现新人,无错误 | `useMutation + refetchQueries` |
| 6 | 填重复名字并提交 | 红字显示,无新人,10s 后红字消失 | `useMutation + onError + setError + Notify + setTimeout` |
| 7 | 重复名提交后立即再提交一次正确 | 红字继续显示 10s 倒计时(每次 setTimeout 重置) | `notify` 的 setTimeout 多次触发 |
| 8 | 等 10s 后 | 红字消失,Notify DOM 节点消失 | `setErrorMessage(null) → return null` |
| 9 | DevTools Network 面板看 mutation 响应 | error 路径有 `errors: [...]` 数组 | GraphQL errors 格式 |
| 10 | DevTools Console 看是否有 unhandled rejection | 应该没有(`onError` 已注册) | Apollo onError vs Promise unhandled |

## 5. part8o vs part8p 对比

| 维度 | part8o "Updating the cache" | part8p "Handling mutation errors" |
|---|---|---|
| 关注点 | mutation **成功后** UI 同步 | mutation **失败后** UI 反馈 |
| 关键 option | `refetchQueries` | `onError` |
| 关键 prop | 无 | `setError` prop 链 |
| 新组件 | 无 | `Notify.jsx` |
| 改动文件 | App.jsx + Persons.jsx + PersonForm.jsx + 新建 queries.js | App.jsx + PersonForm.jsx + 新建 Notify.jsx(queries.js / Persons.jsx / main.jsx 沿用) |
| 涉及 server | 无(纯客户端 cache 策略) | part8h 抛 GraphQLError('Name must be unique', BAD_USER_INPUT) |
| 触发场景 | 用户成功添加 person | 用户提交重复名,server 拒绝 |
| UI 表现 | Persons 列表自动更新 | 屏幕顶部红字 10s |

## 6. 术语对照

| 英文术语 | 中文 | 备注 |
|---|---|---|
| `onError` | 错误回调 | useMutation 的 OPTIONS 字段,失败时触发 |
| `error.message` | 错误信息 | Apollo 包装的 GraphQLError 的 message 字段 |
| `error.graphQLErrors` | GraphQL 错误数组 | server 通过 throw new GraphQLError 抛的 |
| `setError` prop | 错误设置函数 | 子组件通过 prop 拿到的"通知父组件出错了"的回调 |
| `notify` function | 通知函数 | App 里定义的"set error + 10s 后清"的封装 |
| `errorMessage` state | 错误信息状态 | App 里的 useState,初始 null |
| `Notify` component | 通知组件 | Presentational 组件,errorMessage 有值就显示红字 |
| `return null` | 不渲染 | React 官方允许的"什么都不渲染"方式 |
| `setTimeout(..., 10000)` | 10s 后清除 | 课程硬编码,生产代码应常量化 |
| `style={{ color: 'red' }}` | 内联红字样式 | 外层 {} 是 JSX 表达式,内层 {} 是对象字面量 |

## 7. 6 Takeaways(精炼)

1. **`onError` + `setError` prop 链 = Apollo 失败处理的标配模式** — 父组件管 state,子组件通过回调把错误传回去
2. **`refetchQueries` 与 `onError` 互斥** — 一次 mutation 只走一条分支(成功走 refetch,失败走 onError)
3. **`error.message` 是简化用法** — 生产代码应该遍历 `error.graphQLErrors` 数组,逐条展示
4. **`return null` 比 `<></>` 更干净** — 表示"什么都没渲染"的官方 React 方式
5. **`setTimeout` 自动清错误是教学简化** — 生产代码应该用 toast library(notistack / react-hot-toast)+ 用户可手动关闭
6. **Notify 组件只管"显示与否"** — 不管错误来源是 mutation / query / 网络 / 业务,通用 Presentational 组件

## 8. 8 Troubleshooting

### 8.1 红字不显示
- 检查 `useMutation` 第 2 参数里有没有 `onError: (error) => setError(error.message)`
- 检查 `<PersonForm setError={notify} />` 有没有传 `setError` prop
- 检查 PersonForm 函数签名有没有 `({ setError })` 解构
- 打开 DevTools Network 看 mutation 响应是否有 `errors: [{ message: "..." }]`

### 8.2 红字显示但 10s 后不清除
- 检查 `notify` 函数里有没有 `setTimeout(() => { setErrorMessage(null) }, 10000)`
- 注意 React StrictMode 下 effect 会跑两次,但 `notify` 是普通函数不会跑两次,放心

### 8.3 `setError is not a function`
- App.jsx 没传 `<PersonForm setError={notify} />`,或 prop 名错了(应该是 `setError` 不是 `onError` / `handleError`)

### 8.4 红字永久显示(10s 后不消失)
- `setTimeout` 第二个参数是 ms,不是 s
- 课程硬编码 10000(=10s),生产代码易写成 10(只等 10ms 立即清)
- 检查是否误写为 `setTimeout(() => { setErrorMessage(null) }, 10)`

### 8.5 红字显示但 form 也被清空
- 这是 submit handler 的逻辑:`createPerson({ variables })` 后立刻 `setName('')` 等
- 即便 mutation 失败(只走 onError),form 也会被清空
- 课程 verbatim 如此,不改;生产代码应该在 mutation 成功回调(`onCompleted`)里清空

### 8.6 红字文字不对(server 抛的不是 "Name must be unique")
- 检查 part8h server 的 `throw new GraphQLError` 的第一个参数(那才是 `error.message`)
- server 端代码:
  ```js
  if (persons.find(p => p.name === args.name)) {
    throw new GraphQLError('Name must be unique: ' + args.name, {
      extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.name },
    })
  }
  ```
- 实际显示文字 = `'Name must be unique: ' + args.name`

### 8.7 Notify 组件显示但样式不对(不是红色)
- 检查 `style={{ color: 'red' }}` 双花括号 + camelCase
- 不要写成 `style={{ 'color': 'red' }}`(JSON 风格)+ 不要写成 `style="color: red"`(HTML 字符串风格)

### 8.8 浏览器报 `Cannot read properties of undefined (reading 'message')`
- `error.graphQLErrors` 是空数组时,`error.message` 可能是 undefined
- 防御写法:`onError: (error) => setError(error.message || 'Unknown error')`
- 课程 verbatim 没做这个防御,生产代码应该加

## 9. 偏离原文明示

| 维度 | 课程原文 | 我的落地 | 偏离原因 |
|---|---|---|---|
| **Notify 文件路径** | 课程 line 433 写 "scr/components/Notify.jsx" | 落地 "src/components/Notify.jsx" | 课程原文 typo `scr` 应是 `src`,修正 |
| **移除 `import { gql } from '@apollo/client'`(App.jsx)** | 课程原文保留该 import(沿用 part8l) | ❌ 删了 | inline GraphQL 操作已抽出(per part8o)→ gql 不再使用 → 删掉避免 ESLint `no-unused-vars` warning。**明示偏离** |
| **不在 part8o 之上做更多改造** | 课程仅改 App.jsx + PersonForm.jsx + 新建 Notify.jsx | verbatim 仅改这 3 处 | course-follow-official skill 纪律:only section markers + Chinese comments allowed |
| **`PersonForm` 函数签名解构 `{ setError }`** | 课程 verbatim line 431 写 `const PersonForm = ({ setError }) => {` | verbatim | 严格遵循 |
| **`onError` 回调签名 `(error) => ...`** | 课程 verbatim line 431 写 `(error) => setError(error.message)` | verbatim | 严格遵循 |
| **`notify` 函数 setTimeout 10000ms** | 课程 verbatim 10000 | verbatim 10000 | 严格遵循 |
| **JSX 顺序 `<Notify> → <Persons> → <PersonForm>`** | 课程 verbatim line 456 | verbatim | 严格遵循 |

## 10. Mac OS 注意事项

- Vite 默认端口 5173,如果被占用会自动切到 5174/5175
- 两个终端:① server 4000 ② Vite 5173
- 浏览器必须能访问 localhost,Chrome 默认允许
- 如果用 Safari,需要开发菜单 → 停用跨源限制

## 11. 后续子节

- **part8q "Updating a phone number"**:新建 `PhoneForm.jsx`(用 `useMutation(EDIT_NUMBER)`)+ `queries.js` 加 `EDIT_NUMBER` + `App.jsx` 渲染 `<PhoneForm />` + 处理"person not found"用 `onCompleted` 回调(因为 server `editNumber` 找不到 person 时返回 null,不抛 GraphQLError,所以 `onError` 没用,要用 `onCompleted`)
- **part8r "Apollo Client and the applications state"**:理论段(Apollo 自动管 cache 后,React state 只剩 form + 错误通知),无新代码
- **part8s+ 练习**(跳过 — 与 part7 练习策略一致,不做练习题)
- **part8t+ Chapter 4 "Database and user administration"**:服务端加 MongoDB + mongoose + bcrypt + jsonwebtoken
- **不** commit / push
- **不** 跑任何命令(本会话纪律)
- **一次只推进一小节** — 等用户确认 part8p 后再进 part8q