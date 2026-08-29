# part8 n — Doing mutations(verbatim 课程 Chapter 3 "Doing mutations" 段)

> **本子项目作用**:把课程 Chapter 3 的 **Doing mutations** 段做成可跑的 demo — 用 **`useMutation` Hook** 实现"添加 person"功能,把 part8k ~ part8m 的"只读 GraphQL"扩展到"读写 GraphQL"。
>
> **关键诚实声明**:课程本节 verbatim 改了 1 个文件 + 新建 1 个文件:
> - **新建** `src/components/PersonForm.jsx`(CREATE_PERSON mutation + 4 个 useState + useMutation + submit handler + 表单 JSX)
> - **改** `src/App.jsx`(加 `import PersonForm` + 渲染 `<PersonForm />`)
> - **沿用 verbatim**: `package.json` / `vite.config.js` / `index.html` / `.gitignore` / `src/main.jsx` / `src/components/Persons.jsx` / `README.md`(`README` 是新建,但代码文件不动)
>
> **part8m → part8n 的关键迁移**:
> - **part8m**:纯"读 GraphQL"——`useQuery(ALL_PERSONS)` + `useQuery(FIND_PERSON, { skip })` 都是 query
> - **part8n**:扩展到"写 GraphQL"——新增 `useMutation(CREATE_PERSON)` 在 PersonForm 组件里,form submit 触发 mutation
>
> **核心新增招式 — useMutation Hook**:
> - `const [mutateFn] = useMutation(MUTATION)` — **返回数组**(与 useQuery 返回对象不同!)
> - `mutateFn({ variables: { ... } })` — 在事件 handler 里调用,触发 mutation
> - 这是 Apollo Client 的"读 / 写"两条腿之一(读 = useQuery,写 = useMutation)
>
> **诚实边界**:本节**故意**不解决"mutation 后 UI 不刷新"问题——这是 part8o "Updating the cache" 的内容。part8n 这节的真实行为是:成功添加但页面不变,要刷新才能看到。

---

## 课程原文要点(verbatim 摘录)

> "Let's implement functionality for adding new persons."
>
> "In the previous chapter, we hardcoded the parameters for mutations. Now, we need a version of the addPerson mutation which uses variables:"
> ```graphql
> mutation createPerson(
>   $name: String!
>   $street: String!
>   $city: String!
>   $phone: String
> ) {
>   addPerson(name: $name, street: $street, city: $city, phone: $phone) {
>     name
>     phone
>     id
>     address {
>       street
>       city
>     }
>   }
> }
> ```
>
> "Create a new component PersonForm for adding a new person to the application."
>
> "The code of the form is straightforward and the interesting lines have been highlighted. We can define mutation functions using the useMutation hook. The hook returns an array, the first element of which contains the function to cause the mutation."
>
> ```jsx
> const [createPerson] = useMutation(CREATE_PERSON)
> ```
>
> "The query variables receive values when the query is made:"
> ```jsx
> createPerson({ variables: { name, phone, street, city } })
> ```
>
> "Enable the PersonForm component in the file App.jsx"
>
> "New persons are added just fine, but the screen is not updated. This is because Apollo Client cannot automatically update the cache of an application, so it still contains the state from before the mutation."

---

## ⭐⭐⭐ 核心概念(本子项目讲透的 5 个)

### ⭐ GraphQL Mutation + variables(与 Query 的对照)

```graphql
query findPersonByName($nameToSearch: String!) {     ← 读
  findPerson(name: $nameToSearch) { ... }
}

mutation createPerson($name: String!, $street: String!, ...) {    ← 写
  addPerson(name: $name, street: $street, ...) { ... }
}
```

| 维度 | Query | Mutation |
|---|---|---|
| GraphQL 关键字 | `query` | `mutation` |
| 用途 | 读数据 | 写数据 |
| HTTP 语义 | GET(但 Apollo 强制 POST) | POST |
| Apollo React Hook | `useQuery` | `useMutation` |
| 调用方式 | 组件渲染自动发请求 | 手动调 mutateFn |

### ⭐⭐⭐ useMutation Hook(part8n 核心)

```jsx
const [createPerson] = useMutation(CREATE_PERSON)
```

⭐ **与 useQuery 的关键差异**:
| | useQuery | useMutation |
|---|---|---|
| **触发时机** | 组件渲染即自动发请求 | 手动调 mutateFn 才发 |
| **返回值** | **对象** `{ loading, data, error }` | **数组** `[mutateFn, result]` |
| **解构** | `const { loading, data } = useQuery(...)` | `const [mutateFn] = useMutation(...)` |
| **典型场景** | 列表展示 / 详情查看 | 表单提交 / 按钮触发 |

⭐ **为什么返回数组而不是对象**:
- 课程明示:"The hook returns an array, the first element of which contains the function to cause the mutation"
- 数组解构允许**只取** mutateFn(本节场景)—useQuery 的对象解构做不到这一点
- 课程的解构:`const [createPerson] = useMutation(CREATE_PERSON)` —— 第二个元素(result)被丢弃

⭐ **典型陷阱**:
- 误用 `const { data } = useMutation(...)` 会报错 — useMutation 返回数组,不是对象
- `useMutation` 必须**手动**调 mutateFn,不会自动发请求(否则一上来就误删数据)

### ⭐⭐ 受控组件模式(Controlled Component)

```jsx
<input value={name} onChange={({ target }) => setName(target.value)} />
```

⭐ **核心思想**:React state 是 input 唯一真理源 — input 的值始终等于 React state

- 不用受控会怎样:input 自己管 DOM value,React state 与 DOM 不一致(经典 demo:用户输入 'a' 后 `setName('b')`,input 仍显示 'a')
- 用受控会怎样:onChange 触发 setName → re-render → value 反映最新 state

⭐ **onChange 写法**:
```jsx
onChange={({ target }) => setName(target.value)}
```
- 解构 `event.target` → 拿 input DOM 元素
- `target.value` → 当前 input 的字符串值
- `setName(target.value)` → 更新 state

⭐ **本节用法**:4 个 input(name / phone / street / city)都是受控的 — 写法完全一致,只是 set 函数不同

### ⭐⭐ 4 个独立 useState(课程风格)

```jsx
const [name, setName] = useState('')
const [phone, setPhone] = useState('')
const [street, setStreet] = useState('')
const [city, setCity] = useState('')
```

⭐ **vs 1 个合并 state**:
- 不用 4 个会怎样:用 `useState({ name: '', phone: '', ... })`,setName 时要 `setState(s => ({ ...s, name: 'x' }))`,代码冗长
- 用 4 个会怎样:4 个独立 set 函数 —— 直白对应 4 个字段,符合 CLAUDE.md 约定

### ⭐⭐ 乐观 UI(Optimistic UI)— submit 后立即清空

```jsx
const submit = (event) => {
  event.preventDefault()
  createPerson({ variables: { name, phone, street, city } })
  // ← 课程没等 mutation 响应,直接清空表单
  setName('')
  setPhone('')
  setStreet('')
  setCity('')
}
```

⭐ **核心思想**:mutation 是异步请求,但 UI 不等响应

- 优点:用户立即看到表单清空,不阻塞等待响应
- 缺点(本节没处理):如果 server 报错,表单已清空但数据没创建 —— part8q 才讲 onError 处理
- 课程明示这是"半成品"行为,需要配合 onError 才能完美(留到下节)

---

## ⭐⭐⭐ 真实运行时行为 — "加完后页面不刷新"

> **关键诚实**:这是 part8n 故意展示的"半成品"行为,**不是 bug**!

课程明示:
> "New persons are added just fine, but the screen is not updated. This is because Apollo Client cannot automatically update the cache of an application, so it still contains the state from before the mutation."

**为什么会这样**:
1. 课程代码:`useQuery(ALL_PERSONS)` 在 App 组件 mount 时发请求 → Apollo 把响应存到 InMemoryCache
2. `createPerson` mutation 成功 → Apollo 把**新 person**存到 cache(如果 response 里有 person)
3. ⚠️ 但 **Persons 组件**展示的列表来自 App 组件传过来的 `result.data.allPersons`(Part 8n 沿用 part8m 的"App useQuery + 传给 Persons"模式)
4. Apollo 的 InMemoryCache 是**自动归一化**的(按 `id` 字段) — 但**不会自动触发组件 re-render**
5. 结果:cache 里有新 person 数据,但 Persons 组件**没收到**新 props → 列表不刷新

**临时解决方案**(课程没给出,读者自验):
- 按 F5 刷新页面 → cache 清空 → useQuery 重新发请求 → 列表显示新 person

**正式解决方案**(part8o "Updating the cache" 才讲):
- `pollInterval: 2000` → useQuery 定期轮询,自动同步
- `refetchQueries: [{ query: ALL_PERSONS }]` → mutation 后自动 refetch 列表
- `cache.updateQuery` / `cache.modify` → 手动更新 cache

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**需要两个终端**。

### Step 1 — 启动 Chapter 2 server(终端 A)

```bash
# 终端 A
cd /Users/jiankang/workspace/github_workspace/fullstack/part8/j-changing-a-phone-number
npm start
```

**期望**:`🚀 Server ready at http://localhost:4000/`

### Step 2 — 安装 part8n 依赖(终端 B)

```bash
# 终端 B(新开)
cd /Users/jiankang/workspace/github_workspace/fullstack/part8/n-doing-mutations
npm install
```

**期望**:依赖装好(与 part8m 完全一样,无新增 — `@apollo/client` + `graphql` + `react` + `vite`)。

### Step 3 — 启动 Vite dev server(终端 B)

```bash
npm run dev
```

**期望**:`➜ Local: http://localhost:5173/`

### Step 4 — 浏览器打开页面,初识视图

访问 `http://localhost:5173`。

**期望看到**(part8m 列表 + 新表单):
```
Persons
Arto Hellas 040-123543 [show address]
Mary Popup 040-432342 [show address]
create new
name [        ]
phone [        ]
street [        ]
city [        ]
[add!]
```

⭐ **新观察**:页面多了 "create new" 标题 + 4 个 input + add 按钮 — 这就是 part8n 的入口。

### Step 5 — 填写表单,提交 mutation

填一个**唯一名字**(避免触发 part8h 的查重错误):

```
name:  Test Person
phone: 040-9999999
street: Test Street 1
city:   Test City
```

点 `add!`。

**期望**:
- 表单**立即清空**(乐观 UI — 没等响应)
- F12 Network → 看到新增 POST 到 `http://localhost:4000/`,payload 是:
  ```json
  {
    "query": "mutation createPerson(...) { ... }",
    "variables": {
      "name": "Test Person",
      "phone": "040-9999999",
      "street": "Test Street 1",
      "city": "Test City"
    }
  }
  ```
- server 响应 200,response.data.addPerson 包含新 person

### Step 6 — ⭐⭐⭐ 观察 "页面不刷新" 行为(关键铁证)

**期望**:
- ⚠️ Persons 列表**没出现** Test Person
- 这是 part8n 的真实行为 — Apollo cache 自动归一化但**不自动触发 re-render**

⭐ **验证 cache 里有数据**:
- Apollo DevTools → Cache → RootQuery → allPersons → 应该看到 3 条 persons(2 旧 + 1 新)

### Step 7 — F5 刷新页面验证 server 端确实添加成功

按 F5。

**期望**:
- Persons 列表**出现** Test Person
- 验证 mutation 在 server 端成功了 — 刷新 = cache 清空 + useQuery 重发请求

### Step 8 — ⭐ 验证"再添加同名 person 触发 server 报错"

再填写同样的表单(name: Test Person)+ 点 add!

**期望**:
- server 返回 GraphQL error(per part8h 错误处理):"Name must be unique"
- 但**前端 UI 完全没反应** —— 没报错提示、表单已清空
- 这是 part8q "Handling mutation errors" 才解决的(用 onError handler)

### Step 9 — Apollo DevTools 检查 mutation 入参

打开 Apollo DevTools → Mutations 标签 → 点最近一条 createPerson。

**期望**:
- Variables 字段:`{ name: "Test Person", phone: "...", street: "...", city: "..." }`
- Response 字段:返回的新 person 对象(含 name / phone / id / address.street / address.city)

### Step 10 — ⭐⭐⭐ 验证 useMutation 数组解构

打开浏览器 console,输入:
```js
// 没现成方式 — 但可以间接验证:
// 在 React DevTools 看 PersonForm 组件的 hooks 面板,useMutation 在那里
```

或者更直观:改 PersonForm.jsx 加 console.log:
```jsx
const [createPerson] = useMutation(CREATE_PERSON)
console.log('useMutation return:', createPerson)
```
(验证完立即删 console.log,避免污染源码)

### Step 11 — ⭐⭐ 验证受控组件

在 React DevTools Components 面板,选中 `input[name]`。

**期望**:
- value 字段显示当前 state 的值
- 改 value → setName 触发 → state 变化 → input 显示新值

### Step 12 — 启动生产 build

```bash
npm run build
```

**期望**:Vite 输出 `dist/`,无报错。

---

## ⭐ part8m vs part8n 关键对比

| 维度 | part8m | part8n |
|---|---|---|
| 操作类型 | 读(query) | **读 + 写(query + mutation)** |
| Hook | `useQuery(ALL_PERSONS)` + `useQuery(FIND_PERSON)` | 同 part8m + **`useMutation(CREATE_PERSON)`** |
| Persons.jsx | Container + useState + useQuery | **verbatim part8m** |
| PersonForm.jsx | (不存在) | **新建** — useState 4 个 + useMutation + 表单 |
| App.jsx | `<Persons persons={...} />` | 同 + **`<PersonForm />`** |
| 表单提交后 UI | (无表单) | **立即清空**(乐观 UI),但列表不刷新 |
| 错误处理 | (无 mutation) | **未实现**(下节课才讲 onError) |
| main.jsx | verbatim part8l | verbatim part8m |
| 抽 queries.js | 未抽 | 未抽(下节课才抽) |

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| Mutation | "mutation createPerson" | GraphQL 写操作 | `CREATE_PERSON` mutation |
| Variables | "a version of the addPerson mutation which uses variables" | mutation 的动态参数 | `$name: String!` 等 4 个 |
| useMutation | "useMutation hook" | Apollo 提供的 mutation Hook | `useMutation(CREATE_PERSON)` |
| Array destructuring | "returns an array, the first element" | useMutation 返回值是数组 | `const [createPerson] = ...` |
| mutate function | "the function to cause the mutation" | 触发 mutation 的函数 | `createPerson({ variables })` |
| Controlled component | (隐含) | React state 是 input 唯一真理源 | `<input value={name} onChange={...}>` |
| Optimistic UI | (隐含,课程没明确术语) | 不等响应就更新 UI | submit 后立即 setName('') |
| event.preventDefault | (隐含) | 阻止表单默认提交行为 | submit handler 第一行 |
| Cache invalidation | "Apollo Client cannot automatically update the cache" | cache 不会自动同步 mutation | 留到 part8o 处理 |

---

## ⭐ 关键 takeaway(6 条)

1. **GraphQL mutation 与 query 平级** —— 都是 GraphQL 操作类型关键字
2. **useMutation 返回数组**(`[mutateFn, result]`)—— 与 useQuery 返回对象是镜像对照
3. **受控组件是 React 表单标准** —— `value={state}` + `onChange={setState}` 配对
4. **乐观 UI 是常见做法** —— submit 后不等响应立即清空(配合 onError 才完美)
5. **Apollo cache 不自动触发 re-render** —— mutation 成功 + cache 更新 ≠ 组件重渲染(这是 part8o 要解决的问题)
6. **课程本节故意留半成品** —— 让读者体验"半成品"行为,再下节课给出完整解法

---

## ⭐⭐ Troubleshooting(出问题了看这里)

### 问题 1 — Console 报 "Could not find Apollo Client context"

**原因**:ApolloProvider 没包 `<App />`。

**解决**:
- 检查 `src/main.jsx` 有 `<ApolloProvider client={client}><App /></ApolloProvider>`
- 检查 main.jsx 路径引用 `./App.jsx` 是否正确

### 问题 2 — submit 后 console 报 "Network Error"

**原因**:Chapter 2 server 没起。

**解决**:
- 终端 A 跑 `cd part8/j-changing-a-phone-number && npm start`
- 看到 `🚀 Server ready at http://localhost:4000/`

### 问题 3 — 表单清空了但 Persons 列表不变

**原因**:**这是 part8n 的预期行为**,不是 bug。

**解决**:
- 按 F5 刷新 → cache 清空 → useQuery 重发 → 列表出现新 person
- 完美解法是 part8o "Updating the cache" 才讲

### 问题 4 — submit 没反应

**原因**:常见是 useMutation 解构错 — 写成对象解构:
```jsx
const { mutate } = useMutation(CREATE_PERSON)  // ❌ 错!
```

**解决**:
- 必须用数组解构:
```jsx
const [createPerson] = useMutation(CREATE_PERSON)  // ✅ 对
```

### 问题 5 — server 报 "Name must be unique" 但前端没提示

**原因**:**part8n 不处理 mutation 错误**。

**解决**:
- 这是 part8q "Handling mutation errors" 的内容
- 暂时用**唯一名字**避免触发

### 问题 6 — 点 add 按钮后页面刷新了

**原因**:`event.preventDefault()` 没调。

**解决**:
- 检查 submit handler 第一行是 `event.preventDefault()`

### 问题 7 — input 输入后没反应 / 不受控

**原因**:`value={...}` 没绑 state 或 `onChange` 没绑 setter。

**解决**:
- 检查 `<input value={name} onChange={({ target }) => setName(target.value)} />` 是配对完整的
- 4 个 input 都要这么写

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `src/components/PersonForm.jsx` | verbatim 课程最终态 | **完全 verbatim**(4 个 useState + useMutation + submit + 表单 JSX) | 严格遵循 |
| `src/App.jsx` | verbatim 课程(加 import + `<PersonForm />`)| **完全 verbatim** | 严格遵循 |
| `src/components/Persons.jsx` | 课程明示不改 | **verbatim part8m** | 课程明示 |
| `src/main.jsx` | 课程明示不改 | **verbatim part8m** | 课程明示 |
| `package.json` / `vite.config.js` / `index.html` / `.gitignore` | 课程无 | 沿用 part8m verbatim | 同 part8m 工程脚手架 |
| 注释 | 课程英文 | 中文 ⭐ 注释 | ⭐ memory:`part7/8 学习代码必须含中文注释` |

---

## ⚠️ Mac OS 注意事项(只对你这台机器有效)

- **同 part8m** — Node v22.22.3 满足要求 / 两个端口(4000 + 5173)/ 两个终端
- **新增注意**:
  - StrictMode 下,**首次 mount** useQuery(ALL_PERSONS)会发 1 个 POST(useMutation 不发,因为要手动调)
  - 表单 submit 后**立即**清空 state(createPerson 是异步,但 setName('') 同步)
  - server 端**没启动**的话,Network Error 但前端不报红(只是 console 报)

---

## 后续子节

- part8n **Doing mutations 已完结**(CREATE_PERSON mutation + useMutation + PersonForm 子组件)
- ⚠️ **故意未做**:part8o "Updating the cache"(pollInterval / refetchQueries / 抽 queries.js)
- ⚠️ **故意未做**:part8q "Handling mutation errors"(onError + Notify 组件)
- ⚠️ **故意未做**:part8r "Updating a phone number"(EDIT_NUMBER mutation + PhoneForm)
- **一次只推进一小节** — 等用户确认 part8n 后再进 part8o
- **不** commit / push
- **不** 跑任何命令