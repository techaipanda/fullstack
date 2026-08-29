// ⭐⭐⭐ App.jsx — part8q "Updating a phone number"(verbatim 课程 line 492-496)⭐⭐⭐
//
// ⭐ 关键诚实声明:课程本子节**改 App.jsx** 的 2 处(在 part8p 基础之上):
//   1. 新增 `import PhoneForm from './components/PhoneForm'` —— 引入更新 phone 表单
//   2. JSX 在 `<PersonForm setError={notify} />` 后面加 `<PhoneForm setError={notify} />`
//
// ⭐ 课程原文(per course line 492-496 "Updating a phone number"):
//   "Enable the new component in the file App.jsx"
//   代码框:加 import PhoneForm + JSX 加 <PhoneForm setError={notify} />
//
// ⭐ 偏离课程原文的一处(明示,沿用 part8p):
//   课程原 App.jsx 仍保留 `import { gql } from '@apollo/client'`(per part8l 沿用)
//   现在 ALL_PERSONS 早已抽出(per part8o)→ gql 不再使用 → 删除
//   理由:避免 ESLint `no-unused-vars` warning,这是工具约束的最小偏离
//
// ⭐⭐⭐ 关键设计:setError prop 链复用 ⭐⭐⭐
//   App 定义 notify 函数(管 errorMessage state + 10s 自动清除)
//      ↓ 透传 setError={notify} 给两个子组件
//   PersonForm 拿到 setError prop → onError 时调 setError(error.message)
//   PhoneForm 拿到 setError prop → onCompleted 时 data.editNumber === null 时调 setError('person not found')
//   Apollo mutation → 自动调 onError/onCompleted → setError 被调 → notify 被调
//      → errorMessage state 变 → Notify 组件 prop 变 → 红字显示
//      → 10s 后 setTimeout 触发 → errorMessage 变 null → Notify 返回 null 隐藏
//
// (per part8p 沿用的 import / state / notify 函数详见下文注释)

// ⭐⭐⭐ 新增 import:React useState(per course line 456 第一行)⭐⭐⭐
import { useState } from 'react'

// ⭐ useQuery 走子路径 — verbatim 课程
import { useQuery } from '@apollo/client/react'

// ⭐⭐⭐ 从 './queries' 拿 ALL_PERSONS(per part8o 沿用,part8p 不变)⭐⭐⭐
import { ALL_PERSONS } from './queries'

// ⭐⭐⭐ 新增 import:Notify 组件(per course line 454 第一行)⭐⭐⭐
import Notify from './components/Notify'

// ⭐⭐⭐ 子组件 import — verbatim 课程(per part8o/p 沿用,part8q 不变)⭐⭐⭐
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'

// ⭐⭐⭐ 新增 import:PhoneForm 组件(per course line 496 highlighted "1")⭐⭐⭐
//
// 1. ⭐ 核心概念:PhoneForm 是 part8q 新引入的子组件 ⭐
//    - 跟 PersonForm 平级,但负责"更新已有 person 的 phone"而不是"创建新 person"
//    - 同样需要 setError prop,因为 onCompleted 里要 setError('person not found')
//
// 2. ⭐ 命名约定:PhoneForm 不是 PhoneNumberForm,课程 verbatim 用 PhoneForm
//    这是课程硬编码的名字,不改
import PhoneForm from './components/PhoneForm'

// ⭐⭐⭐ App 组件 — verbatim 课程最终态(line 456)⭐⭐⭐
const App = () => {
  // ⭐⭐⭐ 新增:errorMessage 本地 state(per course line 456)⭐⭐⭐
  //
  // 1. useState(null) — 初始 null 表示"没有错误"
  // 2. setErrorMessage(string) — 设一个字符串就显示错误
  // 3. setErrorMessage(null) — 清掉错误
  // 4. 这是经典的"父组件管错误状态 + 通过 prop 传给子组件的回调"模式
  const [errorMessage, setErrorMessage] = useState(null)

  // ⭐ useQuery(ALL_PERSONS) — verbatim part8o(per part8p 不变,无 pollInterval)
  const result = useQuery(ALL_PERSONS)

  if (result.loading) {
    return <div>loading...</div>
  }

  // ⭐⭐⭐ 新增:notify 函数(per course line 456)⭐⭐⭐
  //
  // 1. ⭐ 核心概念:错误通知自动清除 ⭐
  //    - setErrorMessage(message) → Notify 显示红字
  //    - setTimeout(() => setErrorMessage(null), 10000) → 10s 后自动清
  //    - 不用 setTimeout:错误永久显示,用户得手动关(用户体验差)
  //    - 用 setTimeout:10s 后自动消失,符合"错误是瞬时通知"的语义
  //
  // 2. setTimeout 10000ms(10s)— 课程硬编码这个值,不改
  //    生产代码可能用常量化 / 配 config,但课程 verbatim 写 10000
  //
  // 3. ⭐⭐ 这个 notify 会被传给 PersonForm 作为 setError prop ⭐⭐
  //    见下面 <PersonForm setError={notify} />
  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  // ⭐⭐⭐ JSX — verbatim 课程 line 496(per course "highlighted lines: 1, 11")⭐⭐⭐
  //   - line 1(import)新增 PhoneForm
  //   - line 11(JSX)新增 <PhoneForm setError={notify} />
  return (
    <div>
      {/* ⭐⭐⭐ Notify 组件渲染(per course line 456 verbatim 沿用)⭐⭐⭐
          Notify 内部:!errorMessage → return null(什么都不渲染)
          errorMessage 有值 → 返回 <div style={{ color: 'red' }}>{errorMessage}</div>
          所以 errorMessage 为 null 时这行完全无 DOM 输出 */}
      <Notify errorMessage={errorMessage} />

      {/* Persons 列表 — verbatim part8o 不变 */}
      <Persons persons={result.data.allPersons} />

      {/* setError={notify}(per course line 456 verbatim 沿用)
          把 notify 函数作为 setError prop 传给 PersonForm
          PersonForm 在 onError 回调里调 setError(error.message) → 即调 notify */}
      <PersonForm setError={notify} />

      {/* ⭐⭐⭐ 新增:<PhoneForm setError={notify} />(per course line 496)⭐⭐⭐
          把 notify 函数同样作为 setError prop 传给 PhoneForm
          PhoneForm 在 onCompleted 回调里:
            - data.editNumber 有值 → 不做事
            - data.editNumber === null → setError('person not found') → 即调 notify */}
      <PhoneForm setError={notify} />
    </div>
  )
}

// ⭐ 课程 verbatim — default export,让 main.jsx 能 import App
export default App