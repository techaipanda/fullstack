// ⭐ App.jsx — part8l "Making queries"(verbatim 课程 Step 3 最终态)
//
// ⭐ 关键诚实声明:课程这一节做了 3 步递进:
//   1. 基础版:在 App 里 useQuery + 内联 JSX 渲染(姓名逗号分隔)
//   2. 抽组件版:把渲染 persons 的部分挪到 src/components/Persons.jsx
//   3. 最终态(本文件):App 用 useQuery 拿数据,传给 <Persons persons={...} />
//
// ⭐ 课程原文核心(逐字保留):
//   "When called, useQuery makes the query it receives as a parameter.
//    It returns an object with multiple fields. The field loading
//    is true if the query has not received a response yet."
//   "When a response is received, the result of the allPersons query
//    can be found in the data field, and we can render the list of names to the screen."

// ⭐ gql 走主路径 — verbatim 课程
import { gql } from '@apollo/client'

// ⭐⭐⭐ useQuery 走子路径 — verbatim 课程 ⭐⭐⭐
//
// 跟 part8k 的 ApolloProvider 一样,useQuery 也是从 '@apollo/client/react' 导入
// 这是 Apollo Client 3.10+ 的"按子包导入"约定
//   - 主路径 '@apollo/client' — 核心(ApolloClient/gql/HttpLink/InMemoryCache)
//   - 子路径 '@apollo/client/react' — React 集成(useQuery/useMutation/useApolloClient/ApolloProvider)
//
// 验证:看 Apollo 官方 https://www.apollographql.com/docs/react/api/react/hooks/#usequery
//      import from '@apollo/client/react' 是新写法(老写法 from '@apollo/client' 也行)
import { useQuery } from '@apollo/client/react'

// ⭐ Persons 子组件 import — verbatim 课程 src/components/Persons.jsx
import Persons from './components/Persons'

// ⭐⭐⭐ ALL_PERSONS query 定义 — verbatim 课程 ⭐⭐⭐
//
// 课程这里用 ALL_PERSONS(全大写 + 下划线)命名 query
// 这是 GraphQL 社区的"operation name"约定(类似常量,区别于 inline query)
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

// ⭐⭐⭐ App 组件 — verbatim 课程最终态 ⭐⭐⭐
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
  //    - 还有 `refetch` / `networkStatus` / `variables` 等(后续章节会讲)
  //    验证:打开 React DevTools,看 App 组件的 hooks 面板,useQuery 在那里
  //
  // 3. ⭐⭐ 关键认知 ⭐⭐:useQuery 在组件每次 mount 时都会发请求(默认行为)
  //    - 但 Apollo 缓存生效后,组件 re-render 不重复发(除非 query 变量变了)
  //    - "loading=true" 几乎只有第一次会看到,后续切换可能一瞬间 loading
  //    - 课程最简:不传 options,只用 useQuery 的默认行为(后续章节会教 options)
  const result = useQuery(ALL_PERSONS)

  // ⭐⭐ loading 状态分支 — verbatim 课程 ⭐⭐
  //
  // 课程写法:`if (result.loading) return <div>loading...</div>`
  // 这是最简的"loading 态"处理 — 课程没讲 spinner / skeleton / Suspense 这些高级玩法
  // 验证:刷新浏览器,F12 Network 慢点(Chrome DevTools throttle Slow 3G),能看到 "loading..." 闪一下
  if (result.loading) {
    return <div>loading...</div>
  }

  // ⭐⭐ 数据到位,渲染 Persons 子组件 — verbatim 课程 ⭐⭐
  //
  // ⭐ 关键:把 `result.data.allPersons` 数组**直接**传给 Persons
  //   Persons 自己负责 map 渲染每个 person
  // ⭐ App 不做内联渲染 — "show business list" 由 Persons 组件负责
  //   这是 Container/Presentational 分离的雏形:
  //   - App = Container(管数据 — useQuery)
  //   - Persons = Presentational(管 UI — map 渲染)
  // ⭐ 课程没教 error 处理(留作后续章节 "Handling mutation errors" 才讲)
  //   本节的最简版本:假设请求一定成功,只判断 loading
  return <Persons persons={result.data.allPersons} />
}

// ⭐ 课程 verbatim — default export,让 main.jsx 能 import App
export default App