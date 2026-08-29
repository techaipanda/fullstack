// ⭐⭐⭐ queries.js — part8o "Updating the cache" 抽出查询/变更定义 ⭐⭐⭐
//
// ⭐ 关键诚实声明:课程本子节**新建** src/queries.js
//   课程原文:"At the moment, queries and components are defined in the same place
//   in our code. Let's separate the query definitions into their own file src/queries.js"
//
// ⭐ 课程抽出 3 个 GraphQL 操作:
//   1. ALL_PERSONS  — query(列表,App.jsx 用 useQuery)
//   2. FIND_PERSON  — query(单条详情,Persons.jsx 用 useQuery + skip)
//   3. CREATE_PERSON — mutation(添加,PersonForm.jsx 用 useMutation + refetchQueries)
//
// ⭐ 之前(per part8n)这 3 个定义是 inline 在各个组件文件里的
//   part8o 全部挪到这里统一导出,各组件 `import` 它需要的子集
//
// ⭐⭐ 三大收益 ⭐⭐:
// 1. **单一真理源** — Apollo cache key 按 operation name + variables 缓存,
//    统一命名不会冲突(例:ALL_PERSONS 现在被 App + PersonForm 引用)
// 2. **复用** — 同一个 query 在多个组件里用,不用复制 gql 文本
// 3. **关注点分离** — 组件只管 UI,queries.js 只管 GraphQL 文本
//
// ⭐ 课程 verbatim 强调:
//   "Each component then imports the queries it needs:
//    import { ALL_PERSONS } from './queries'"

import { gql } from '@apollo/client'

// ⭐ ALL_PERSONS — App.jsx 用 useQuery 渲染列表
//   per part8m 沿用 + part8o 不变 — 不加 pollInterval(per course final state,
//   见 App.jsx 注释)
export const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`

// ⭐ FIND_PERSON — Persons.jsx 用 useQuery + skip 按需查详情(per part8m 沿用)
export const FIND_PERSON = gql`
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

// ⭐⭐ CREATE_PERSON — PersonForm.jsx 用 useMutation 创建新 person ⭐⭐
//   ⭐⭐ part8o 关键变化:PersonForm 调 useMutation 时附 refetchQueries 参数 ⭐⭐
//   useMutation(CREATE_PERSON, { refetchQueries: [{ query: ALL_PERSONS }] })
//   —— mutation 成功后 Apollo 自动重发 ALL_PERSONS,Persons 列表立即看到新 person
//   —— 这就是 part8o 的"更新 cache"方案之一(refetchQueries)
export const CREATE_PERSON = gql`
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