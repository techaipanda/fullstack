// ⭐ PersonForm.jsx — part8n "Doing mutations" 新增子组件(verbatim 课程)
//
// ⭐ 关键诚实声明:本子节**新建** PersonForm.jsx — 课程本节唯一的新增文件
//
// ⭐ 课程原文核心(逐字保留):
//   "Create a new component PersonForm for adding a new person to the application."
//   "The code of the form is straightforward and the interesting lines have been highlighted."
//   "We can define mutation functions using the useMutation hook."
//   "The hook returns an array, the first element of which contains the function
//    to cause the mutation."
//   "The query variables receive values when the query is made."
//
// ⭐⭐ 课程代码块(verbatim 1:1 — 课程高亮 line 30 / 35):
//   - line 30 area:imports(useState + gql + useMutation)
//   - line 35 area:useMutation 解构 + submit handler
//
// ⭐ 课程"old way vs new way"对比(part7 → part8 的延续):
//   - part7 后端:axios.post(URL, payload) — 命令式
//   - part8 客户端:useMutation(MUTATION) — 声明式,与 useQuery 镜像

// ⭐⭐⭐ 新增 import:useState(part8n 第一次引入表单 state)⭐⭐⭐
import { useState } from 'react'

// ⭐ gql 走主路径 — verbatim 课程
import { gql } from '@apollo/client'

// ⭐⭐⭐ useMutation 走子路径 — verbatim 课程 ⭐⭐⭐
//
// part8n 的核心招式:从 useQuery(读) 进化到 useMutation(写)
// @apollo/client/react 子路径与 useQuery 一致
import { useMutation } from '@apollo/client/react'

// ⭐⭐⭐ CREATE_PERSON mutation 定义 — verbatim 课程 ⭐⭐⭐
//
// ⭐⭐ 三件新事 ⭐⭐:
// 1. **mutation 关键字**:`mutation createPerson(...)` — 与 query 平级的 GraphQL 操作类型
// 2. **operation name**:`createPerson` — 与 query 同款规范
// 3. **variables 声明 + 使用**:`$name: String!` + `addPerson(name: $name, ...)` — 与 FIND_PERSON 同款
//
// ⭐⭐ 与 FIND_PERSON(读)对比 ⭐⭐:
//   - FIND_PERSON:`query findPersonByName($nameToSearch: String!) { findPerson(name: $nameToSearch) { ... } }`
//   - CREATE_PERSON:`mutation createPerson($name: String!, $street: String!, $city: String!, $phone: String) { addPerson(...) { ... } }`
//
// ⭐⭐ 4 个变量的"必填 vs 可选"差异 ⭐⭐:
//   - name / street / city → String!(必填 — 数据库 schema 要求)
//   - phone → String(可选 — 部分 person 可以没 phone)
//   这是 server schema(Chapter 2)决定的,前端 verbatim 复刻
//
// 验证:打开浏览器 DevTools → Network → 查 addPerson 的 POST 请求 payload
//   会看到 JSON body 里 `variables: { name: "...", street: "...", city: "...", phone: "..." }`
const CREATE_PERSON = gql`
  mutation createPerson(
    $name: String!
    $street: String!
    $city: String!
    $phone: String
  ) {
    addPerson(name: $name, street: $street, city: $city, phone: $phone) {
      name
      phone
      id
      address {
        street
        city
      }
    }
  }
`

// ⭐⭐⭐ PersonForm 组件 — verbatim 课程最终态 ⭐⭐⭐
//
// ⭐ 课程本节做的"全新组件":
// 1. 4 个 useState('')跟踪表单字段(name / phone / street / city)
// 2. useMutation(CREATE_PERSON) 解构出 createPerson 函数
// 3. submit handler:event.preventDefault + createPerson({ variables }) + 清空表单
// 4. JSX:<form onSubmit> 4 个受控 input + submit button
//
// ⭐⭐ 课程风格:4 个 useState 独立声明 ⭐⭐
//   课程明示多 useState(不是 useState({...})合并对象)
//   —— part5 也用同样的"独立 useState"模式(per CLAUDE.md 约定)
const PersonForm = () => {
  // ⭐ 4 个独立 useState — verbatim 课程风格
  // 不用会怎样:用 1 个 useState({ name: '', phone: ... })合并,
  //            setName 时要 spread 旧对象,代码冗长
  // 用会怎样:4 个独立 setName / setPhone / setStreet / setCity — 直白对应
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')

  // ⭐⭐⭐ 核心概念:useMutation Hook ⭐⭐⭐
  //
  // 1. useMutation(MUTATION) — Apollo 提供的 React Hook(对应 server 的写操作)
  //    不用会怎样:用 ApolloClient 实例直接 client.mutate({ mutation, variables }),
  //              是 part7 风格的命令式 API,数据到不了组件
  //    用会怎样:返回 `[mutateFn, result]` 数组,mutateFn 在事件 handler 里调用即可
  //
  // 2. ⭐⭐ useMutation 返回数组解构 ⭐⭐(与 useQuery 返回对象不同!):
  //    - `const [createPerson] = useMutation(CREATE_PERSON)`
  //    - 数组第 0 项 = mutate function(createPerson)— 调用它发 mutation
  //    - 数组第 1 项 = result object(也有 loading / data / error,但本节不用)
  //    课程明示:"The hook returns an array, the first element of which contains
  //             the function to cause the mutation."
  //    验证:打开 console.log(useMutation.toString()) — 但更直观是 React DevTools
  //         看 PersonForm 的 hooks 面板
  //
  // 3. ⭐⭐ 与 useQuery 对比 ⭐⭐:
  //    - useQuery:组件渲染就自动发请求(读取)
  //    - useMutation:不自动发请求,要手动调 createPerson()(写入)
  //    —— 这与 REST API 的 GET vs POST 语义一致
  const [createPerson] = useMutation(CREATE_PERSON)

  // ⭐⭐⭐ submit handler — verbatim 课程 ⭐⭐⭐
  //
  // 课程三件事:
  // 1. event.preventDefault() — 阻止表单默认提交行为(浏览器刷新页面)
  // 2. createPerson({ variables: { name, phone, street, city } }) — 触发 mutation
  //    ⭐⭐ 注意顺序:课程先 createPerson 再清空 state(如果先清空,variables 会传空字符串!)
  // 3. setName('') / setPhone('') / setStreet('') / setCity('') — 清空表单字段
  //
  // ⭐ 课程的"乐观清空"模式:
  //   - createPerson 是异步请求,但课程不等响应就直接清空
  //   - 这是常见的"乐观 UI"做法 —— 用户立即看到表单清空,不阻塞等待响应
  //   - ⚠️ 副作用:如果 server 报错(下节课讲 onError),表单已经清空但数据没创建
  //   - 本节按 verbatim 复刻,这个问题留给 part8o "Handling mutation errors" 处理
  const submit = (event) => {
    event.preventDefault()
    createPerson({ variables: { name, phone, street, city } })

    setName('')
    setPhone('')
    setStreet('')
    setCity('')
  }

  // ⭐⭐ JSX:4 个受控 input + submit button — verbatim 课程 ⭐⭐
  //
  // ⭐⭐ 受控组件(controlled component)模式 ⭐⭐:
  // - `<input value={name} onChange={...}>` — React 组件的 state 是 input 唯一真理源
  // - 不用受控会怎样:input 自己管 DOM value,React state 与 DOM 不一致
  //   (经典 demo:用户输入'a'后,setName('b'),input 仍显示 'a')
  // - 用受控会怎样:onChange 触发 setName → re-render → value 反映最新 state
  //
  // ⭐ onChange 写法:
  //   `onChange={({ target }) => setName(target.value)}`
  //   - 解构 event.target → 拿 input DOM 元素
  //   - target.value → 当前 input 的字符串值
  //   - setName(target.value) → 更新 state
  //   这是 React 表单标准写法(出现 4 次,name/phone/street/city)
  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={submit}>
        <div>
          name <input value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          phone <input value={phone}
            onChange={({ target }) => setPhone(target.value)}
          />
        </div>
        <div>
          street <input value={street}
            onChange={({ target }) => setStreet(target.value)}
          />
        </div>
        <div>
          city <input value={city}
            onChange={({ target }) => setCity(target.value)}
          />
        </div>
        <button type='submit'>add!</button>
      </form>
    </div>
  )
}

// ⭐ 课程 verbatim — default export,让 App.jsx 能 import PersonForm
export default PersonForm