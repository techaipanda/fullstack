// ⭐ Persons.jsx — part8m "Named queries and variables" 子组件(verbatim 课程)
//
// ⭐ 关键诚实声明:本子节**重写** Persons.jsx — 课程明示只改这一个文件
//
// ⭐ part8l → part8m 的关键迁移:
//   - part8l:Presentational 子组件(只接 { persons } props + map 渲染)
//   - part8m:**变成 Container**(内部 useState 管理 nameToSearch + 第二个 useQuery 发 FIND_PERSON + 抽 Person 子组件展示单条详情)
//
// ⭐ 课程原文核心(逐字保留):
//   "Let's implement functionality for viewing the address details of a person.
//    The findPerson query is well-suited for this."
//   "GraphQL variables are well-suited for this. To be able to use variables,
//    we must also name our queries."
//   "The useQuery hook is well-suited for situations where the query is done
//    when the component is rendered. However, we now want to make the query only
//    when a user wants to see the details of a specific person, so the query is
//    done only as required."
//   "However, in our case we can stick to useQuery and use the option skip,
//    which makes it possible to do the query only if a set condition is true."

// ⭐⭐⭐ 新增 import:useState(part8l 没有 state,part8m 加了)⭐⭐⭐
import { useState } from 'react'

// ⭐ gql 走主路径 — verbatim 课程
import { gql } from '@apollo/client'

// ⭐⭐⭐ useQuery 走子路径 — verbatim 课程 ⭐⭐⭐
//
// part8m 的核心招式:在 Persons 子组件里**第二次**调 useQuery(第一次在 App.jsx 用 ALL_PERSONS)
import { useQuery } from '@apollo/client/react'

// ⭐⭐⭐ FIND_PERSON query 定义 — verbatim 课程 ⭐⭐⭐
//
// ⭐⭐ 三件新事 ⭐⭐:
// 1. **query 命名**:`query findPersonByName(...)` — GraphQL operation name(可选但推荐)
// 2. **变量声明**:`$nameToSearch: String!` — `!` 是 GraphQL 的"必填"标记
// 3. **变量使用**:`findPerson(name: $nameToSearch)` — query 内部用 `$变量名` 引用
//
// ⭐ 与 ALL_PERSONS 对比:
//   - ALL_PERSONS:`query { allPersons { name phone id } }`(无 name, 无 variables)
//   - FIND_PERSON:`query findPersonByName($nameToSearch: String!) { findPerson(name: $nameToSearch) { ... } }`
//
// 验证:打开浏览器 DevTools → Network → 查任意一个 POST 请求的 payload
//   会看到 JSON body 里 `variables: { nameToSearch: "Arto Hellas" }`
const FIND_PERSON = gql`
  query findPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) {
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

// ⭐⭐⭐ Person 子组件 — verbatim 课程 ⭐⭐⭐
//
// 课程设计:把"单个 person 详情"抽成 Person,Persons 负责切换"列表 vs 详情"
// Person 接 { person, onClose } 两个 props:
//   - person: Apollo 返回的 findPerson 对象(必有 name/phone/address.street/address.city)
//   - onClose: 关闭详情的回调(回到列表)
const Person = ({ person, onClose }) => {
  return (
    <div>
      <h2>{person.name}</h2>
      <div>
        {person.address.street} {person.address.city}
      </div>
      <div>{person.phone}</div>
      <button onClick={onClose}>close</button>
    </div>
  )
}

// ⭐⭐⭐ Persons 组件 — verbatim 课程最终态 ⭐⭐⭐
//
// 课程本节做的"大改":
// 1. 加 `useState(null)` 跟踪当前选中的 person name(nameToSearch)
// 2. 加 `useQuery(FIND_PERSON, { variables: { nameToSearch }, skip: !nameToSearch })`
//    — skip 选项让"没选中时"不发请求
// 3. `if (nameToSearch && result.data)` 切换"详情视图"
// 4. 每个 person 加 `<button onClick={() => setNameToSearch(p.name)}>show address</button>`
const Persons = ({ persons }) => {
  // ⭐⭐⭐ 核心概念:useState + useQuery skip 配合 ⭐⭐⭐
  //
  // 1. `const [nameToSearch, setNameToSearch] = useState(null)`
  //    - null 表示"没选任何 person" → 不发请求(skip=true)
  //    - 有值(p.name 字符串)表示"选了某个 person" → 发请求(skip=false)
  //    验证:打开 React DevTools Components 面板,点 "show address" 看 nameToSearch 状态变化
  //
  // 2. ⭐⭐⭐ useQuery 的 skip 选项 ⭐⭐⭐ — part8m 的"按需发请求"核心
  //    不用会怎样:组件渲染就发请求,空 state 也发,浪费 + 报错(参数 null)
  //    用会怎样:`skip: true` 时 useQuery 完全不发请求,直到 skip 变 false
  //    注意:skip=false 但 variables={ nameToSearch: null } 也会发请求,只是 query 会报错
  //    所以用 `!nameToSearch`(null → !null → true → skip=true)做互斥
  //
  // 3. ⭐⭐ 关键认知 ⭐⭐:`useQuery` 仍然是 Apollo 自动 cache
  //    - 同一个 nameToSearch 发请求第二次,走 cache 不发网络
  //    - 本节 H3 "Cache" 子段会展开讲
  const [nameToSearch, setNameToSearch] = useState(null)
  const result = useQuery(FIND_PERSON, {
    variables: { nameToSearch },
    skip: !nameToSearch,
  })

  // ⭐⭐ 切换视图:有选中 + 数据到位 → 显示 Person 详情 ⭐⭐
  //
  // 课程写法:`if (nameToSearch && result.data)` — 两个条件都满足才显示详情
  //   - nameToSearch 非空 = 用户点了 show address
  //   - result.data 非空 = Apollo 已收到响应
  //   setNameToSearch(null) 关闭 → 回到列表
  if (nameToSearch && result.data) {
    return (
      <Person
        person={result.data.findPerson}
        onClose={() => setNameToSearch(null)}
      />
    )
  }

  // ⭐⭐ 默认视图:列表 + 每行加 "show address" 按钮 ⭐⭐
  //
  // 课程新增 `<button onClick={() => setNameToSearch(p.name)}>show address</button>`
  // 点按钮 → setNameToSearch(p.name) → Persons 组件 re-render → useQuery(FIND_PERSON) 发请求 → 切换详情视图
  return (
    <div>
      <h2>Persons</h2>
      {persons.map((p) => (
        <div key={p.id}>
          {p.name} {p.phone}
          <button onClick={() => setNameToSearch(p.name)}>
            show address
          </button>
        </div>
      ))}
    </div>
  )
}

// ⭐ 课程 verbatim — default export,让 App.jsx 能 import Persons
export default Persons