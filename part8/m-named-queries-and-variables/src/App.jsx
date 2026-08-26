// ⭐ App.jsx — part8m "Named queries and variables"(verbatim 沿用 part8l)
//
// ⭐ 关键诚实声明:课程本子节**不改 App.jsx**
//   课程明示只改 src/components/Persons.jsx(增 FIND_PERSON query + useState + Person 子组件)
//   App.jsx 仍然是 part8l 的 useQuery(ALL_PERSONS) + <Persons persons={...} />
//
// ⭐ 课程原文核心(逐字保留):
//   "The useQuery hook is well-suited for situations where the query is done
//    when the component is rendered."
//   "However, we now want to make the query only when a user wants to see the
//    details of a specific person, so the query is done only as required."
//   "However, in our case we can stick to useQuery and use the option skip,
//    which makes it possible to do the query only if a set condition is true."
//
// ⭐⭐ 关键认知 ⭐⭐:course 没在 App.jsx 加 FIND_PERSON 的 useQuery
//   - FIND_PERSON 用在 Persons 组件里(子组件持有 nameToSearch state)
//   - skip 选项 + null state 让 useQuery 在子组件层面也能"按需发请求"
//   - 这就是为什么课程本节 App.jsx 完全不动 — 数据流仍然是 App → Persons(只是 Persons 内部加了第二个 useQuery)

// ⭐ gql 走主路径 — verbatim 课程
import { gql } from '@apollo/client'

// ⭐ useQuery 走子路径 — verbatim 课程
import { useQuery } from '@apollo/client/react'

// ⭐ Persons 子组件 import — verbatim 课程 src/components/Persons.jsx
//   (part8m 里 Persons.jsx 重写了 — 加了 FIND_PERSON + Person 子组件)
import Persons from './components/Persons'

// ⭐⭐⭐ ALL_PERSONS query 定义 — verbatim part8l(part8m 不改)⭐⭐⭐
//
// 课程这里用 ALL_PERSONS(全大写 + 下划线)命名 query
// ⭐ 注意:query 比 part8k 简化了 — 删了 address 字段(本节只显示 name/phone)
const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`

// ⭐⭐⭐ App 组件 — verbatim part8l(part8m 不改)⭐⭐⭐
const App = () => {
  // ⭐⭐⭐ 核心概念:useQuery Hook ⭐⭐⭐
  //
  // 1. useQuery(gql\`query {...}\`) — Apollo 提供的 React Hook
  //    不用会怎样:得用 part8k 的 `client.query().then(...)` 命令式写法,数据到不了组件
  //    用会怎样:组件渲染时自动发请求,响应到达时**自动触发组件 re-render** — 数据进了 React 渲染流
  //
  // 2. useQuery 返回一个 `result` 对象,核心字段:
  //    - `loading: boolean` — 请求是否还在路上(true = 还没拿到响应)
  //    - `error: ApolloError | undefined` — 请求失败时的错误对象(成功时 undefined)
  //    - `data: any | undefined` — 响应数据(请求未完成时 undefined)
  //    验证:打开 React DevTools,看 App 组件的 hooks 面板,useQuery 在那里
  //
  // 3. ⭐⭐ 关键认知(part8m 兑现) ⭐⭐:
  //    useQuery 默认是"组件渲染就发请求" — 但本节要"按需发请求"
  //    课程给出的方案:**`skip` 选项 + state 控制**
  //    useQuery(QUERY, { variables, skip: !triggerState })
  //    skip=true 时 useQuery 不发请求,直到 skip 变 false 才发
  //    这是 part8m 在 Persons 子组件里的核心招式
  const result = useQuery(ALL_PERSONS)

  // ⭐⭐ loading 状态分支 — verbatim 课程 ⭐⭐
  if (result.loading) {
    return <div>loading...</div>
  }

  // ⭐⭐ 数据到位,渲染 Persons 子组件 — verbatim 课程 ⭐⭐
  //
  // ⭐ App 不做内联渲染 — "show business list" 由 Persons 组件负责
  //   App = Container(管数据 — useQuery),Persons = Presentational(管 UI)
  //   但 part8m 里 Persons **也变成了 Container**(内部还调一次 useQuery(FIND_PERSON))
  //   — 这打破了 part8l 的纯 Presentational 模式,**为后续章节铺垫**(part8n "Doing mutations" 也会用类似模式)
  return <Persons persons={result.data.allPersons} />
}

// ⭐ 课程 verbatim — default export,让 main.jsx 能 import App
export default App