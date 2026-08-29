// ⭐ App.jsx — part8o "Updating the cache"(verbatim 课程最终态)
//
// ⭐ 关键诚实声明:课程本子节**改 App.jsx**
//   课程明示的 2 个变化(组合起来即本子节最终态):
//   1. 抽出 inline `const ALL_PERSONS = gql\`...\`` 到 src/queries.js(per course "Let's separate the query definitions into their own file")
//   2. 从 './queries' 导入 ALL_PERSONS,改成 `import { ALL_PERSONS } from './queries'`
//
// ⭐ 课程本节**最终态** App.jsx 不使用 pollInterval(per course final snippet):
//   "Each component then imports the queries it needs:
//    import { ALL_PERSONS } from './queries'
//    const App = () => {
//      const result = useQuery(ALL_PERSONS)
//      // ...
//    }"
//   课程展示的 snippet 中 useQuery(ALL_PERSONS) 没有第二个参数(没 pollInterval)
//   ⭐⭐ 解释 ⭐⭐:课程前文展示过 pollInterval 方案,但紧接着就指出其缺点
//   (多余网络流量 + 页面闪烁),随后引入 refetchQueries 作为"另一种方式"。
//   课程最终态(branch part8-2)是用 refetchQueries,不混用 pollInterval。
//   refetchQueries 在 PersonForm.jsx 实现(见那里)。
//
// ⭐ 偏离课程原文的一处(明示):
//   课程原 App.jsx 仍有 `import { gql } from '@apollo/client'`(inline 时需要)
//   现在 ALL_PERSONS 已抽出,gql 在 App.jsx 不再使用 → 删除该 import
//   理由:避免 ESLint `no-unused-vars` warning,这是工具约束的最小偏离

// ⭐ useQuery 走子路径 — verbatim 课程
import { useQuery } from '@apollo/client/react'

// ⭐⭐⭐ 新增 import:从 ./queries 拿 ALL_PERSONS(课程 verbatim line 3)⭐⭐⭐
import { ALL_PERSONS } from './queries'

// ⭐⭐⭐ PersonForm / Persons 子组件 import — verbatim 课程 ⭐⭐⭐
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'

// ⭐⭐⭐ App 组件 — verbatim 课程最终态 ⭐⭐⭐
const App = () => {
  // ⭐ useQuery(ALL_PERSONS) — 不带 pollInterval
  // 课程最终态:cache 更新靠 PersonForm 的 refetchQueries 推动(见那里),
  // 不靠 App 这边轮询
  const result = useQuery(ALL_PERSONS)

  if (result.loading) {
    return <div>loading...</div>
  }

  // ⭐ JSX 与 part8n 一致:Persons(读)+ PersonForm(写)
  return (
    <div>
      <Persons persons={result.data.allPersons} />
      <PersonForm />
    </div>
  )
}

// ⭐ 课程 verbatim — default export,让 main.jsx 能 import App
export default App