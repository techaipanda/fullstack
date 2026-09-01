// ⭐⭐⭐ queries.js — part8w "User login" 客户端 GraphQL 操作集合 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本节**新建** src/queries.js(per part8o "Updating the cache" 模式)
//   课程 Chapter 5 "User login" 小节在 src/queries.js 加 LOGIN mutation
//   课程 Part 8o "Updating the cache" 已经建立模式:
//     "抽 inline GraphQL 操作定义到独立 src/queries.js 文件"
//   part8w 沿用 part8o 模式,把 LOGIN(以及 App.jsx 必需的 ALL_PERSONS)统一导出
//
// ⭐⭐ 本节新增/修改对照(part8p → part8w):
//   part8p 导出:ALL_PERSONS + FIND_PERSON + CREATE_PERSON + EDIT_NUMBER(4 个)
//   part8w **新增**:LOGIN mutation(本节 verbatim course block 1)
//   part8w 沿用:ALL_PERSONS(App.jsx 用,本节加 stub 最小版本 — 见下方注释)
//
// ⭐ LOGIN mutation 是本节核心 verbatim 课程内容,见下方 export const LOGIN
// ⭐ ALL_PERSONS 是 App.jsx 必需依赖,本节给最小可编译版本
//
// ⭐ 跟后端 part8u/v 的对齐:
//   - login(username, password): Token — 后端已经在 part8u 落地(per part8u README)
//   - 课程故意简化:password 永远 = 'secret'(后端 login resolver 不真校验密码)
//   - 所以前端任意 password 都能登录(只要 username 存在)

import { gql } from '@apollo/client'

// ⭐⭐⭐ LOGIN mutation — verbatim 课程 Chapter 5 "User login" block 1 ⭐⭐⭐
//
// ⭐ 课程原文(per course block 0):
//   "Let's first define the mutation for logging in in the file src/queries.js"
//
// ⭐ 跟后端 part8u/v login mutation 完全对齐:
//   - 入参:username + password 两个 String!
//   - 返回:Token { value }
//   - 后端 login resolver(per part8u README):任意 password 通过,
//     jwt.sign({ username, id }, process.env.JWT_SECRET) → 返回 { value: token }
//
// ⭐ 课程 verbatim 排版细节(per course block 1):
//   - `login(username: $username, password: $password)  {` 后面**两个**空格
//     (course 原文如此,verbatim 保留,虽然 ESLint 通常会报)
//   - 多行 GraphQL 模板字符串风格跟 part8p CREATE_PERSON 一致
//
// ⭐ 为什么用 useMutation 调它(per part8p 模式):
//   - LoginForm.jsx 用 useMutation(LOGIN, { onCompleted, onError })
//   - onCompleted(data) → setToken(data.login.value) + localStorage.setItem
//   - onError(error) → setError(error.message) → Notify 红字
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

// ⭐⭐⭐ ALL_PERSONS query — App.jsx 必需的最小可编译版本 ⭐⭐⭐
//
// ⭐ 关键诚实声明:ALL_PERSONS **不是** Chapter 5 "User login" 小节的内容
//   - 课程 Chapter 5 "User login" 的 App.jsx(block 7)引用了 `result = useQuery(ALL_PERSONS)`
//   - 但课程 Chapter 5 **之前**的"Listing persons"小节(我们还没做)才定义 ALL_PERSONS
//   - 为了让 App.jsx 编译通过 + 登录后能看到"登录用户已登录"提示 + 证明
//     ALL_PERSONS 在 Apollo cache 里有数据,本节给一个**最小可编译版本**
//   - 完整 ALL_PERSONS(带 address 嵌套、phone filter、conditional skip 等)
//     等下一节做"Listing persons"时再补
//
// ⭐ 跟后端 part8u/v allPersons 完全对齐(per part8i enum 改造):
//   - query allPersons(无入参)→ allPersons: [Person!]!
//   - 字段:只取 name + phone 两个(完整版还有 address { street city } + id)
//   - 最小版本不取 address 是为了避免 Persons 组件 stub 渲染时拿到不存在的嵌套字段
//
// ⭐ part8p 完整 ALL_PERSONS 应该是:
//   export const ALL_PERSONS = gql`
//     query allPersons {
//       allPersons {
//         name
//         phone
//         address { street city }
//         id
//       }
//     }
//   `
// 本节先给最小版本,Persons stub 组件不渲染 address 也不需要 address 字段
export const ALL_PERSONS = gql`
  query allPersons {
    allPersons {
      name
      phone
    }
  }
`