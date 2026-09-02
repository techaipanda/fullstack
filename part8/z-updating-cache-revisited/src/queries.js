// ⭐⭐⭐ queries.js — part8y "Fixing validations" 客户端 GraphQL 操作集合 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**改**自 part8w(per part8y 第 3 小节需求)
//   - part8w/part8x 的 queries.js 只导出 2 个 GraphQL 操作:
//     ALL_PERSONS(最小 stub)+ LOGIN(verbatim course block 1)
//   - part8y 需要 PersonForm 和 PhoneForm 两个组件变完整版,
//     这俩组件分别用 CREATE_PERSON 和 EDIT_NUMBER mutation,
//     所以本文件要加这 2 个 mutation
//
// ⭐ 本节新增对照(part8x → part8y):
//   part8x 导出:ALL_PERSONS + LOGIN(2 个)
//   part8y **新增**:CREATE_PERSON(per part8o 沿用)+ EDIT_NUMBER(per part8q 沿用)
//   合计 4 个 GraphQL 操作(ALL_PERSONS + LOGIN + CREATE_PERSON + EDIT_NUMBER)
//
// ⭐ 沿用模式(per part8o 沿用 part8n 模式):
//   - 所有 GraphQL 操作抽到独立 src/queries.js 文件
//   - 各组件 `import` 它需要的子集
//   - 单一真理源 + 复用 + 关注点分离
//
// ⭐ 跟后端 part8u/v 的对齐:
//   - login(username, password): Token — 后端已经在 part8u 落地
//   - addPerson(name, street, city, phone): Person — 后端 part8h 起
//   - editNumber(name, phone): Person — 后端 part8j 起,part8t 加 try/catch
//   - 课程故意简化:phone 可选(后端 schema `phone: String` 不带 !)

import { gql } from '@apollo/client'

// ⭐⭐⭐ ALL_PERSONS query — App.jsx 必需的最小可编译版本 ⭐⭐⭐
//
// ⭐ 关键诚实声明:ALL_PERSONS **不是** Chapter 5 "Fixing validations" 的内容
//   - 课程 Chapter 5 "User login" 的 App.jsx(block 7)引用了 `result = useQuery(ALL_PERSONS)`
//   - 但课程 Chapter 5 **之前**的"Listing persons"小节(我们还没做)才定义 ALL_PERSONS 完整版
//   - 为了让 App.jsx 编译通过 + 登录后能看到 Persons stub 占位,本文件沿用 part8w 最小版本
//   - 完整 ALL_PERSONS(带 address 嵌套、phone filter、conditional skip 等)
//     等"Listing persons"小节再补
//
// ⭐ 跟后端 part8u/v allPersons 完全对齐:
//   - query allPersons(无入参)→ allPersons: [Person!]!
//   - 字段:只取 name + phone 两个(完整版还有 address { street city } + id)
//   - 最小版本不取 address 是为了避免 Persons 组件 stub 渲染时拿到不存在的嵌套字段
export const ALL_PERSONS = gql`
  query allPersons {
    allPersons {
      name
      phone
    }
  }
`

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

// ⭐⭐⭐ 新增(per part8y 需要):CREATE_PERSON mutation ⭐⭐⭐
//
// ⭐ 来源:per part8o "Updating the cache" 沿用
//   - 课程原文:"At the moment, queries and components are defined in the same
//     place in our code. Let's separate the query definitions into their own
//     file src/queries.js"
//   - part8o 把 3 个 GraphQL 操作抽到 queries.js,CREATE_PERSON 是其中之一
//
// ⭐⭐⭐ 关键架构:part8y PersonForm 完整版需要 CREATE_PERSON ⭐⭐⭐
//   - PersonForm.jsx(从 stub 升级到完整版,per part8n 沿用 + part8p onError + part8y phone.length 修复)
//     需要 `import { CREATE_PERSON } from '../queries'`
//   - useMutation(CREATE_PERSON, { refetchQueries: [{ query: ALL_PERSONS }], onError: ... })
//   - 注:part8y **不**改 refetchQueries 模式 — 沿用 part8o 不变
//
// ⭐⭐ 4 个变量的"必填 vs 可选"差异 ⭐⭐:
//   - name / street / city → String!(必填 — 数据库 schema 要求)
//   - phone → String(可选 — 部分 person 可以没 phone,per part8y block 4 fix)
//   这是 server schema(Chapter 2)决定的,前端 verbatim 复刻
//
// ⭐ variables 声明风格:每行一个 field name + 缩进对齐(per part8n 课程 final-state)
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

// ⭐⭐⭐ 新增(per part8y 需要):EDIT_NUMBER mutation ⭐⭐⭐
//
// ⭐ 来源:per part8q "Updating a phone number" 沿用
//   - 课程原文(per course line 484):"Define the editNumber mutation in src/queries.js"
//   - 课程 line 488 第一版 PhoneForm 用 useMutation(EDIT_NUMBER),line 512 第二版 final-state
//     加 onCompleted 检查 data.editNumber === null
//
// ⭐⭐⭐ 关键架构:part8y PhoneForm 完整版需要 EDIT_NUMBER ⭐⭐⭐
//   - PhoneForm.jsx(从 stub 升级到完整版,per part8q 沿用 + part8y try/catch 替换 onCompleted)
//     需要 `import { EDIT_NUMBER } from '../queries'`
//   - useMutation(EDIT_NUMBER) **不**带 options(per part8y 简化)
//   - submit handler 里 `await changeNumber({ variables })` + try/catch 兜底
//
// ⭐⭐ 关键设计:PhoneForm 从 onCompleted 改 try/catch 的 trade-off ⭐⭐
//   - part8q:useMutation(EDIT_NUMBER, { onCompleted: ... })处理 data.editNumber === null
//   - part8y:useMutation(EDIT_NUMBER)(无 options)+ submit 用 try/catch 兜底
//   - 课程 verbatim block 10 **drop 了** onCompleted 的"person not found"检查
//   - 这是课程**故意**的简化(per course block 11 只说 validation errors 兜底)
//   - 生产代码应该 try/catch + onCompleted 双保险,但**课程不做**
//   - 详见 part8y README "关键诚实声明 — 课程 trade-off" 章节
//
// ⭐ variables 声明风格:每行一个 field name + 缩进对齐(per part8q 课程 final-state)
export const EDIT_NUMBER = gql`
  mutation editNumber($name: String!, $phone: String!) {
    editNumber(name: $name, phone: $phone) {
      name
      phone
      address {
        street
        city
      }
      id
    }
  }
`