// ⭐⭐⭐ App.jsx — part8p "Handling mutation errors"(verbatim 课程 line 454-456)⭐⭐⭐
//
// ⭐ 关键诚实声明:课程本子节**改 App.jsx** 的 3 处:
//   1. 新增 `import { useState } from 'react'` —— 加 errorMessage 本地 state
//   2. 新增 `import Notify from './components/Notify'` —— 渲染错误通知
//   3. JSX 加 `<Notify errorMessage={errorMessage} />` + `<PersonForm setError={notify} />`
//      + 函数体内定义 `const notify = (message) => { ... setTimeout(...) }` 自动清错误
//
// ⭐ 课程原文(per course line 421-458 "Handling mutation errors"):
//   "Let's register an error handler for the mutation. The PersonForm component
//    receives a setError function as a prop..."
//   "Render the Notify component that displays the error message in the file App.jsx"
//
// ⭐ 偏离课程原文的一处(明示):
//   课程原 App.jsx 仍保留 `import { gql } from '@apollo/client'`(per part8l 沿用)
//   现在 ALL_PERSONS 早已抽出(per part8o)→ gql 不再使用 → 删除
//   理由:避免 ESLint `no-unused-vars` warning,这是工具约束的最小偏离
//
// ⭐⭐⭐ 关键设计:setError prop 链 ⭐⭐⭐
//   App 定义 notify 函数(管 errorMessage state + 10s 自动清除)
//      ↓ 透传 setError={notify}
//   PersonForm 拿到 setError prop
//      ↓ 在 onError 回调里调 setError(error.message)
//   Apollo mutation 失败 → 自动调 onError → setError 被调 → notify 被调
//      → errorMessage state 变 → Notify 组件 prop 变 → 红字显示
//      → 10s 后 setTimeout 触发 → errorMessage 变 null → Notify 返回 null 隐藏

// ⭐⭐⭐ 新增 import:React useState(per course line 456 第一行)⭐⭐⭐
import { useState } from 'react'

// ⭐ useQuery 走子路径 — verbatim 课程
import { useQuery } from '@apollo/client/react'

// ⭐⭐⭐ 从 './queries' 拿 ALL_PERSONS(per part8o 沿用,part8p 不变)⭐⭐⭐
import { ALL_PERSONS } from './queries'

// ⭐⭐⭐ 新增 import:Notify 组件(per course line 454 第一行)⭐⭐⭐
import Notify from './components/Notify'

// ⭐⭐⭐ 子组件 import — verbatim 课程(per part8o 沿用,part8p 不变)⭐⭐⭐
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'

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

  // ⭐⭐⭐ JSX — verbatim 课程 line 456(只是 Notify + setError=notify 是新增)⭐⭐⭐
  return (
    <div>
      {/* ⭐⭐⭐ 新增:Notify 组件渲染(per course line 456)⭐⭐⭐
          Notify 内部:!errorMessage → return null(什么都不渲染)
          errorMessage 有值 → 返回 <div style={{ color: 'red' }}>{errorMessage}</div>
          所以 errorMessage 为 null 时这行完全无 DOM 输出 */}
      <Notify errorMessage={errorMessage} />

      {/* Persons 列表 — verbatim part8o 不变 */}
      <Persons persons={result.data.allPersons} />

      {/* ⭐⭐⭐ 新增:setError={notify}(per course line 456)⭐⭐⭐
          把 notify 函数作为 setError prop 传给 PersonForm
          PersonForm 在 onError 回调里调 setError(error.message) → 即调 notify */}
      <PersonForm setError={notify} />
    </div>
  )
}

// ⭐ 课程 verbatim — default export,让 main.jsx 能 import App
export default App