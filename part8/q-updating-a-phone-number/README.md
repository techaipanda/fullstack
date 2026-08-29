# part8q — Updating a phone number

> **课程对应**:Chapter 3 "Updating a phone number" 子节
> **课程 URL**:https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql/chapter-3(锚点 #updating-a-phone-number)
> **课程原文定位**:课程 line 462-514
> **落地日期**:2026-08-29

## 1. 课程原文要点(逐字保留)

> "Let's add the possibility to change the phone numbers of persons to our application. The solution is almost identical to the one we used for adding new persons."
>
> "The mutation again requires the use of variables. Add the following query to the file _queries.js_"
>
> "Create a new component _PhoneForm_ in the file _src/components/PhoneForm.jsx_ for updating a phone number. The component adds a form to the application where you can enter a new phone number for a selected person."
>
> "The _PhoneForm_ component is straightforward: it asks for the person's name and a new phone number via a form. When the form is submitted, it calls the _changeNumber_ function that handles the update, created with the _useMutation_ hook."
>
> "Enable the new component in the file _App.jsx_"
>
> "Surprisingly, when a person's number is changed, the new number automatically appears on the list of persons rendered by the _Persons_ component. This happens because each person has an identifying field of type _ID_, so the person's details saved to the cache update automatically when they are changed with the mutation."
>
> "Our application still has one small flaw. If we try to change the phone number for a name which does not exist, nothing seems to happen. This happens because if a person with the given name cannot be found, the mutation response is _null_"
>
> "Since this isn't considered an error state from GraphQL's point of view, registering an _onError_ error handler wouldn't be useful in this situation. However, we can add an _onCompleted_ callback to the _useMutation_ hook, where we can generate a potential error message:"
>
> "The _onCompleted_ callback function is always executed when the mutation has been successfully completed. If the person wasn't found—that is, if the query result _data.editNumber_ is _null_—the component uses the _setError_ callback function it received via props to set an appropriate error message."

## 2. 核心概念(5 个新概念)

### 2.1 `EDIT_NUMBER` mutation — 第 4 个 GraphQL 操作

```graphql
export const EDIT_NUMBER = gql`
  mutation editNumber($name: String!, $phone: String!) {
    editNumber(name: $name, phone: $phone) {
      name
      phone
      address {
        street
        city
      }
      id
    }
  }
`
```

**2.1.1 是什么**:第 4 个 GraphQL 操作,加在 `src/queries.js` 末尾。跟 CREATE_PERSON 类似,但是 update 不是 create。

**2.1.2 关键差异(对比 CREATE_PERSON)**:
| 维度 | CREATE_PERSON | EDIT_NUMBER |
|---|---|---|
| mutation 名 | `addPerson` | `editNumber` |
| variables | 4 个(name + phone + street + city)| 2 个(name + phone)|
| selection set | `{ name phone address { street city } id }` | `{ name phone address { street city } id }`(一样)|
| 可能返回 null | ❌(抛 GraphQLError on error) | ✅(找不到 person return null)|

**2.1.3 为什么 selection set 一样**:
- server `editNumber` resolver(per part8j)return updated Person
- Apollo cache 按 Person ID 归一化,所以更新后 Persons 列表自动显示新 phone(per course line 502)
- 这就是为什么我们能"surprisingly, ... the new number automatically appears on the list"(per course line 502)

### 2.2 `PhoneForm` 组件(对照 PersonForm)

```jsx
const PhoneForm = ({ setError }) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [changeNumber] = useMutation(EDIT_NUMBER, {
    onCompleted: (data) => {
      if (!data.editNumber) {
        setError('person not found')
      }
    }
  })
  const submit = (event) => {
    event.preventDefault()
    changeNumber({ variables: { name, phone } })
    setName('')
    setPhone('')
  }
  // ... JSX
}
```

**2.2.1 是什么**:跟 PersonForm 平级的子组件,但负责"更新已有 person 的 phone"而不是"创建新 person"。

**2.2.2 PersonForm vs PhoneForm 对比**:
| 维度 | PersonForm | PhoneForm |
|---|---|---|
| 目的 | 创建新 person | 更新已有 person 的 phone |
| input 字段数 | 4 个(name + phone + street + city)| 2 个(name + phone)|
| useMutation | CREATE_PERSON | EDIT_NUMBER |
| 错误处理 option | `onError` | `onCompleted` |
| 错误触发条件 | server 抛 GraphQLError(per part8h)| server return null(per part8j)|
| 错误信息来源 | `error.message`(server message)| `'person not found'`(前端硬编码)|
| setError prop | ✅(per part8p)| ✅(per part8q)|

### 2.3 `onCompleted` callback — 跟 `onError` 的根本区别

```jsx
const [changeNumber] = useMutation(EDIT_NUMBER, {
  onCompleted: (data) => {
    if (!data.editNumber) {
      setError('person not found')
    }
  }
})
```

**2.3.1 是什么**:`useMutation` 的第 2 参数 OPTIONS 里的一个字段,跟 `onError` / `refetchQueries` / `update` 平级。

**2.3.2 触发时机**:
- **onCompleted**:mutation **成功完成** 时(无论返回数据是什么,包括 data.editNumber === null)
- **onError**:mutation **失败** 时(server 抛 GraphQLError)

**2.3.3 为什么这里用 onCompleted 不用 onError**(per course line 508):
- 课程原文:"Since this isn't considered an error state from GraphQL's point of view, registering an onError error handler wouldn't be useful in this situation."
- server `editNumber` resolver 找不到 person 时返回 null(per part8j)
- 这是"成功响应"(HTTP 200)+ `data: { editNumber: null }`
- onError 不会触发(没有 GraphQLError)
- 必须用 onCompleted 捕获 `data.editNumber === null`

**2.3.4 onError vs onCompleted 决策树**:
```
server 响应状态
  ├─ 抛 GraphQLError(error.extensions.code)
  │    → mutation 失败
  │    → onError 触发(error 对象)
  │    → PersonForm.jsx 用此模式(per part8p)
  │
  └─ 成功 HTTP 200 + data: { ... }
       ├─ data.editNumber 是 Person object
       │    → mutation 成功
       │    → onCompleted 触发(data 对象)
       │    → data.editNumber 有值 → 啥也不做(PhoneForm)
       │
       └─ data.editNumber 是 null
            → mutation 仍然"成功"(没抛错)
            → onCompleted 触发(data 对象)
            → data.editNumber === null → setError('person not found')(PhoneForm)
```

**2.3.5 `'person not found'` 是前端硬编码**:
- 不是 server message(因为 server 没抛错)
- 是前端兜底文案,告诉用户"server 没找到这个 person"
- 生产代码可以更友好:`'No person with name "NotExist" found'`
- 但课程 verbatim 用 `'person not found'`

### 2.4 Apollo cache 自动更新(per course line 502)

```jsx
// mutation 成功后
// Persons 列表里 Arto Hellas 的 phone 立即变 "999"
// —— Apollo cache 自动更新(per course line 502)
```

**2.4.1 是什么**:Apollo `InMemoryCache` 按 Person ID 归一化 Person 对象。EDIT_NUMBER mutation 成功后,server 返回更新后的 Person object → Apollo 自动把这个新 Person 写进 cache → Persons 组件订阅的 ALL_PERSONS 自动重新 render。

**2.4.2 课程原文**(per course line 502):
> "Surprisingly, when a person's number is changed, the new number automatically appears on the list of persons rendered by the _Persons_ component. This happens because each person has an identifying field of type _ID_, so the person's details saved to the cache update automatically when they are changed with the mutation."

**2.4.3 跟 part8o `refetchQueries` 的对比**:
| 维度 | part8o `refetchQueries` | part8q Apollo cache 自动 |
|---|---|---|
| 适用场景 | CREATE_PERSON(新 person,不在 cache)| EDIT_NUMBER(已有 person,在 cache)|
| 触发机制 | mutation 成功后 Apollo 重发 ALL_PERSONS | mutation 返回的 Person 写回 cache,触发 re-render |
| 优点 | 简单 | 不用重发网络请求 |
| 缺点 | 多一次网络请求 | 只对 cache 已有 ID 有效 |

### 2.5 `setError` prop 链复用(per part8p 沿用)

```jsx
// App.jsx
<PhoneForm setError={notify} />

// PhoneForm.jsx
const PhoneForm = ({ setError }) => {
  // ...
  const [changeNumber] = useMutation(EDIT_NUMBER, {
    onCompleted: (data) => {
      if (!data.editNumber) {
        setError('person not found')
      }
    }
  })
}
```

**2.5.1 是什么**:跟 part8p PersonForm 一样的 setError prop 链。App 定义 `notify` → 透传给两个子组件。

**2.5.2 复用点**:
- App 的 `notify` 函数不变(管 errorMessage state + 10s 自动清除)
- Notify 组件不变(显示红字)
- PersonForm 仍调 `setError(error.message)`
- **PhoneForm 也调 `setError('person not found')`**

**2.5.3 复用价值**:
- 错误通知这个关注点只有一份代码(notify + Notify)
- 两个子组件各自负责"何时调 setError + 传什么 string"

## 3. 真实运行时验证(完整链路)

### 3.1 启动 server(part8j)
```bash
cd /Users/jiankang/workspace/github_workspace/fullstack/part8/j-changing-a-phone-number
npm run dev
# server 监听 http://localhost:4000
```

### 3.2 启动 part8q 客户端
```bash
cd /Users/jiankang/workspace/github_workspace/fullstack/part8/q-updating-a-phone-number
npm run dev
# Vite 监听 http://localhost:5173
```

### 3.3 触发 cache 自动更新路径(success)
1. 浏览器打开 http://localhost:5173
2. 看到 Persons 列表(包含 "Arto Hellas" 等)
3. 在 change number 表单填:
   - name: `Arto Hellas`(已存在)
   - phone: `999`(新号码)
4. 点 `change number` 按钮
5. **期望行为**(per course line 502):
   - 屏幕顶部**无**红字(`onCompleted` 检测 data.editNumber 有值,不做事)
   - form 被清空
   - Persons 列表里 "Arto Hellas" 的 phone 立即变 `999`(Apollo cache 自动更新)

### 3.4 触发 onCompleted null 路径
1. 在 change number 表单填:
   - name: `NotExist`(故意不存在)
   - phone: `1234`
2. 点 `change number`
3. **期望行为**(per course line 508-514):
   - mutation 成功(无 onError)
   - 屏幕顶部出现红字 `person not found`(onCompleted 检测 data.editNumber === null)
   - 10 秒后红字自动消失
   - form 被清空
   - Persons 列表不变(因为没找到 person)

### 3.5 触发 onError 路径(对比 PersonForm)
1. 滚到上方 create new 表单
2. 填重复名字 `Arto Hellas`(per part8h server 抛 GraphQLError)
3. 点 `add!`
4. **期望行为**(per part8p 沿用):
   - 屏幕顶部红字 `Name must be unique: Arto Hellas`(onError)
   - 10s 后消失

### 3.6 Network 面板观察(DevTools)
- **EDIT_NUMBER success 路径**:1 个 POST `/graphql`(mutation)+ 0 个后续 query(Apollo cache 自动更新,无重发)
- **EDIT_NUMBER null 路径**:1 个 POST `/graphql`(mutation,响应 `data: { editNumber: null }`)
- **CREATE_PERSON error 路径**:1 个 POST `/graphql`(mutation,响应 `errors: [{ message: "Name must be unique", extensions: { code: "BAD_USER_INPUT" } }]`)

## 4. 10 step 手动验证清单

| # | 操作 | 期望 | 涉及概念 |
|---|---|---|---|
| 1 | 启 server + Vite | 两个端口(4000 + 5173)都在跑 | server / client 双终端 |
| 2 | 浏览器打开 5173 | 看到 Persons 列表 + create new + change number 三个区块 | `useQuery(ALL_PERSONS)` |
| 3 | 在 change number 填 Arto Hellas + 新 phone 999 + 提交 | Persons 列表 Arto 的 phone 立即变 999 | Apollo cache 自动更新(per course line 502)|
| 4 | 在 change number 填 NotExist + 任意 phone + 提交 | 红字显示 "person not found",10s 后消失 | `useMutation + onCompleted + setError + Notify` |
| 5 | 重复名提交后立即再提交一次正确 | 红字继续显示 10s 倒计时(每次 setTimeout 重置)| `notify` 的 setTimeout 多次触发 |
| 6 | 等 10s 后 | 红字消失,Notify DOM 节点消失 | `setErrorMessage(null) → return null` |
| 7 | 滚到 create new,填重复名字 Arto Hellas + 提交 | 红字显示 "Name must be unique",跟 change number 用的同一个 notify | `setError` prop 链复用 |
| 8 | 切换不同 phone 值(从 999 改到 888)| Persons 列表相应更新 | Apollo cache 自动更新 |
| 9 | DevTools Network 看 EDIT_NUMBER mutation 响应 | success 路径 `data: { editNumber: { name, phone, ... } }`,null 路径 `data: { editNumber: null }` | GraphQL null 响应格式 |
| 10 | DevTools Console 看是否有 unhandled rejection | 应该没有(onError + onCompleted 都已注册)| Apollo 完整错误处理 |

## 5. part8p vs part8q 对比

| 维度 | part8p "Handling mutation errors" | part8q "Updating a phone number" |
|---|---|---|
| 关注点 | mutation **失败**(server 抛错)UI 反馈 | mutation **成功但 data 异常**(server return null)UI 反馈 |
| 新 mutation | 无 | EDIT_NUMBER(per part8q queries.js 第 4 个导出)|
| 新组件 | Notify.jsx | PhoneForm.jsx |
| 新 option | `onError` | `onCompleted` |
| 触发条件 | server 抛 GraphQLError | server return null(成功响应但 data 字段为 null)|
| 错误信息 | `error.message`(server message)| `'person not found'`(前端硬编码)|
| 改动文件 | App.jsx + PersonForm.jsx + 新建 Notify.jsx | App.jsx + queries.js + 新建 PhoneForm.jsx |
| 涉及 server | part8h 抛 GraphQLError('Name must be unique', BAD_USER_INPUT) | part8j `editNumber` resolver 找不到 person 返回 null |
| Apollo cache | 不变(只是错误处理)| 自动更新(per course line 502)— Person ID 归一化 |
| setError 链 | 新引入(per part8p)| 复用(per part8q)|

## 6. 术语对照

| 英文术语 | 中文 | 备注 |
|---|---|---|
| `EDIT_NUMBER` | 编辑号码 mutation | 第 4 个 GraphQL 操作,更新已有 person 的 phone |
| `editNumber` resolver | editNumber 解析器 | server 端(per part8j),找不到 person 返回 null |
| `onCompleted` | 完成回调 | useMutation OPTIONS 字段,success 时触发(含 data=null 情况)|
| `data.editNumber` | 响应的 editNumber 字段 | mutation 返回数据里的 editNumber 字段,可能是 Person 或 null |
| `setError('person not found')` | setError 兜底文案 | 前端硬编码的"找不到"文案 |
| `PhoneForm` | 更新 phone 表单组件 | 子组件,接 setError prop |
| `changeNumber` | 更新号码函数 | useMutation 返回的 mutation trigger 函数 |
| Apollo cache 自动更新 | Apollo 缓存自动同步 | per course line 502:mutation 返回 Person → cache 自动 re-render |
| Person ID 归一化 | 按 ID 去重 | Apollo InMemoryCache 按 ID 字段把同一 Person 合并 |
| onError vs onCompleted | 错误 vs 完成 | onError 处理 GraphQLError,onCompleted 处理 success but data 异常 |

## 7. 6 Takeaways(精炼)

1. **`onError` 处理 GraphQLError,`onCompleted` 处理 success-but-null** — 这是 Apollo mutation 错误处理的两个互补分支
2. **Apollo cache 按 Person ID 归一化** — EDIT_NUMBER 成功后 Persons 列表自动更新(per course line 502),不需要 refetchQueries
3. **`'person not found'` 是前端硬编码** — 不是 server message,因为 server 没抛错,只 return null
4. **`setError` prop 链可复用** — 同一个 notify + Notify 服务于 PersonForm 和 PhoneForm 两个 mutation
5. **mutation 返回 null 是合法响应** — 不是 server 错误,只是"找不到",这是 GraphQL nullable field 的典型用法
6. **PhoneForm 是 PersonForm 的镜像** — 同构(useState + useMutation + submit + JSX),但 input 字段数(2 vs 4)和错误处理(onCompleted vs onError)不同

## 8. 8 Troubleshooting

### 8.1 改 phone 后 Persons 列表不更新
- 检查 EDIT_NUMBER 的 selection set 是否包含 `{ name phone address { street city } id }`(跟 ALL_PERSONS 完全一致)
- 如果不一致,Apollo cache 可能因为字段缺失不更新 — 这是 Apollo normalization 的细节
- 验证:打开 DevTools Network 看 mutation 响应 → data.editNumber 必须包含 phone 字段

### 8.2 改不存在的 person 没显示 "person not found"
- 检查 `useMutation(EDIT_NUMBER, { onCompleted: (data) => { if (!data.editNumber) { setError('person not found') } } })`
- 检查函数签名 `const PhoneForm = ({ setError }) => {`
- 检查 App.jsx 是否传 `<PhoneForm setError={notify} />`
- 验证:DevTools Network 看 mutation 响应 `data.editNumber === null`

### 8.3 `setError is not a function`(PhoneForm)
- App.jsx 没传 `<PhoneForm setError={notify} />`,或 prop 名错了

### 8.4 onCompleted 没触发
- onCompleted 只在 mutation **成功完成** 时触发
- 如果 mutation 因为网络错误失败,走 onError(不调 onCompleted)
- 如果 mutation 因为 GraphQLError 失败,走 onError(不调 onCompleted)

### 8.5 改存在的 person 时 Persons 列表立即更新但屏幕顶部也闪一下红字
- 不应该:data.editNumber 有值 → if (!data.editNumber) 是 false → 不 setError
- 如果出现:检查 PhoneForm 的 onCompleted 回调有没有写错(把 `!data.editNumber` 写成 `data.editNumber` 了)

### 8.6 onError 和 onCompleted 同时触发
- 不应该:onError 和 onCompleted 是互斥的(per Apollo 设计)
- 如果同时触发,可能是自定义 Apollo link 链没配对
- 验证:DevTools 看 mutation 响应有没有 `errors` 字段

### 8.7 PhoneForm input 字段数不对(4 个而非 2 个)
- 课程 verbatim 是 2 个:name + phone(per course line 488)
- 不要加 street / city(因为 EDIT_NUMBER 只需要 name + phone,address 不变)

### 8.8 `EDIT_NUMBER` 没从 queries.js 导出
- 检查 `src/queries.js` 末尾有没有 `export const EDIT_NUMBER = gql\`...\``
- 检查 PhoneForm.jsx 是不是 `import { EDIT_NUMBER } from '../queries'`(注意 `'../queries'` 不是 `'./queries'`,因为 PhoneForm 在 components/ 子目录)

## 9. 偏离原文明示

| 维度 | 课程原文 | 我的落地 | 偏离原因 |
|---|---|---|---|
| **EDIT_NUMBER 完整字符串** | 课程 line 469-481 verbatim | verbatim 1:1 | 严格遵循 |
| **PhoneForm 函数签名 `({ setError }) => {}`** | 课程 line 512 写 `const PhoneForm = ({ setError }) => {` | verbatim | 严格遵循 |
| **useMutation onCompleted 回调** | 课程 line 512 verbatim:`onCompleted: (data) => { if (!data.editNumber) { setError('person not found') } }` | verbatim | 严格遵循 |
| **`'person not found'` 字符串** | 课程 line 512 硬编码 | verbatim | 严格遵循 |
| **submit handler** | 课程 line 488/512 verbatim:`event.preventDefault()` + `changeNumber({ variables: { name, phone } })` + `setName('')` + `setPhone('')` | verbatim | 严格遵循 |
| **JSX input 字段顺序 name → phone** | 课程 verbatim line 488 | verbatim | 严格遵循 |
| **JSX button 文字 `'change number'`** | 课程 verbatim line 488 | verbatim | 严格遵循 |
| **App.jsx 加 `import PhoneForm`** | 课程 line 496 "highlighted lines: 1, 11" verbatim | verbatim | 严格遵循 |
| **JSX 加 `<PhoneForm setError={notify} />`** | 课程 line 496 verbatim | verbatim | 严格遵循 |
| **移除 `import { gql } from '@apollo/client'`(App.jsx)** | 课程原文保留(per part8l 沿用) | ❌ 删了(per part8p 沿用)| inline GraphQL 操作已抽出(per part8o)→ gql 不再使用 → 删掉避免 ESLint warning |
| **queries.js 加 EDIT_NUMBER** | 课程 line 469-481 verbatim | verbatim 加在末尾 | 严格遵循 |

## 10. Mac OS 注意事项

- Vite 默认端口 5173,如果被占用会自动切到 5174/5175
- 两个终端:① server 4000(part8j)② Vite 5173
- 浏览器必须能访问 localhost,Chrome 默认允许
- 如果用 Safari,需要开发菜单 → 停用跨源限制
- 端口 4000 和 5173 都打开才能完整验证 EDIT_NUMBER 链路

## 11. 后续子节

- **part8r "Apollo Client and the applications state"**:理论段(Apollo 自动管 cache 后,React state 只剩 form + 错误通知),无新代码
  - 课程原文(per course line 518):"In our example, management of the applications state has mostly become the responsibility of Apollo Client. ... Our example uses the state of the React components only to manage the state of a form and to show error notifications."
- **part8s+ 练习**(跳过 — 与 part7 练习策略一致,不做练习题)
- **part8t+ Chapter 4 "Database and user administration"**:服务端加 MongoDB + mongoose + bcrypt + jsonwebtoken
- **不** commit / push
- **不** 跑任何命令(本会话纪律)
- **一次只推进一小节** — 等用户确认 part8q 后再进 part8r