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

// ⭐⭐⭐ Chapter 6 子节 1 "Fragments"(per part8e.md lines 11-128)新增:PERSON_DETAILS fragment 定义 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本 fragment 是 Chapter 6 第 1 个 H3 "Fragments" verbatim 课程代码
//   课程原文(per part8e.md block 5):
//     "However, it is much more sensible to define the fragment once and store
//      it in a variable. Let's add the fragment definition to the beginning of
//      the queries.js file"
//   verbatim 课程代码(per part8e.md block 6,lines 100-111):
//     const PERSON_DETAILS = gql`
//       fragment PersonDetails on Person {
//         id
//         name
//         phone
//         address {
//           street
//           city
//         }
//       }
//     `
//
// ⭐⭐⭐ 核心概念:GraphQL Fragment(片段)⭐⭐⭐
//   - Fragment 是 GraphQL 的字段复用机制,允许你**一次**定义字段集合,**多处**复用
//   - 类比:类似 SQL 的 view(虚拟表)— 一处定义字段集合,多处查询用别名引用
//   - 关键约束(per course block 4):"The fragments **are not** defined in the
//     GraphQL schema, but in the client. The fragments must be declared when
//     the client uses them for queries"
//     → fragment 定义在 **客户端**,不在 server schema 里!
//     → fragment 本质上是 **client-side code generation**:发送 query 时,Apollo Client
//        会把 fragment 展开成完整的字段集合,server 看到的还是普通的 GraphQL query
//
// ⭐ 为什么用 fragment(对比):
//   - 不用:每个 query/mutation 都要重复写
//           query { allPersons { name phone address{street city} } }
//           query { findPerson(...) { name phone address{street city} } }
//           (重复 4-5 行 × N 个 query → 容易漏字段、改名不一致)
//   - 用:  一处定义 fragment,所有 query 用 ...PersonDetails 展开
//           query { allPersons { ...PersonDetails } }
//           query { findPerson(...) { ...PersonDetails } }
//           (DRY 原则 + 字段集合变更只改一处 → 一致性保证)
//
// ⭐ Fragment 定义语法(verbatim course):
//   fragment <FragmentName> on <TypeName> {
//     <field1>
//     <field2>
//     <nestedObject { <field> }>
//   }
//   - `fragment` 关键字(GraphQL 内置)
//   - `<FragmentName>`(本例 `PersonDetails`):PascalCase 命名,client 内部使用
//   - `on <TypeName>`(本例 `on Person`):绑定的 GraphQL type
//     → fragment 只能在该 type 或其 subtype 的 selection set 里用 `...PersonDetails`
//     → 课程 PersonDetails **只**对 Person type 有意义,Address / Phone 类型不能用
//
// ⭐⭐ 字段集:`id name phone address { street city }` ⭐⭐
//   - 跟 ALL_PERSONS 当前字段(name + phone)**不完全对齐**:
//     ALL_PERSONS 只取 name + phone,本 fragment 多取了 id + address
//   - 这是**故意**的(per part8e.md 本子节 verbatim)— fragment 是字段全集
//   - 但课程**不要求**改 ALL_PERSONS 用 fragment(per part8e.md 此子节 verbatim)
//   - 所以 ALL_PERSONS 仍是 name + phone,findPerson 用 fragment 取完整字段
//
// ⭐ 验证方法(用户自己跑):
//   - 打开 React DevTools → Apollo Client DevTools 扩展
//   - 在 DevTools Console 跑:
//       import { gql } from '@apollo/client'
//       const f = gql`fragment PersonDetails on Person { id name phone address { street city } }`
//       console.log(JSON.stringify(f, null, 2))
//   - 应看到 fragment AST(包含 kind: 'FragmentDefinition')
const PERSON_DETAILS = gql`
  fragment PersonDetails on Person {
    id
    name
    phone
    address {
      street
      city
    }
  }
`

// ⭐⭐⭐ Chapter 6 子节 1 "Fragments"(per part8e.md lines 117-125)新增:FIND_PERSON query(用 fragment)⭐⭐⭐
//
// ⭐ 关键诚实声明:FIND_PERSON 是 part8e.md 第 1 子节 verbatim 新增的 query
//   verbatim 课程代码(per part8e.md block 7,lines 117-125):
//     export const FIND_PERSON = gql`
//       query findPersonByName($nameToSearch: String!) {
//         findPerson(name: $nameToSearch) {
//           ...PersonDetails
//         }
//       }
//       ${PERSON_DETAILS}
//     `
//
// ⭐⭐⭐ 核心概念:`${...}` JavaScript 模板字符串插值 ⭐⭐⭐
//   - 这是 **JavaScript 模板字符串(template literal)的语法**(不是 GraphQL 语法!)
//   - `${PERSON_DETAILS}` 在运行时把 PERSON_DETAILS 模板字符串的内容(也就是
//     `fragment PersonDetails on Person { id name phone address { street city } }`)
//     **插入**到 FIND_PERSON 模板字符串里
//   - 拼出来的最终 GraphQL document(运行时):
//     query findPersonByName($nameToSearch: String!) {
//       findPerson(name: $nameToSearch) {
//         ...PersonDetails
//       }
//     }
//     fragment PersonDetails on Person {
//       id name phone address { street city }
//     }
//   - 跟"把 fragment 直接写在 query 内部"(per part8e.md block 4 lines 79-95)**完全等价**
//     per course block 8:"the end result is exactly the same as in the earlier
//     example, where the fragment was defined directly alongside the query"
//
// ⭐⭐ 为什么用 ${PERSON_DETAILS} 而不是把 fragment 直接写在 query 里 ⭐⭐
//   - 不用 ${}:每个引用 fragment 的 query 都要复制 9 行 fragment 定义
//              → 重复 + 改 fragment 要改 N 处
//   - 用 ${}:  一处定义 PERSON_DETAILS,所有引用 query 用 `${PERSON_DETAILS}` 嵌入
//              → DRY + 改 fragment 只改一处,所有 query 自动同步
//
// ⭐ FIND_PERSON 入参设计:
//   - $nameToSearch:String!  — course verbatim 变量名
//   - findPerson(name: $nameToSearch) — 调用 server part8v findPerson resolver
//   - 返回 Person type with ...PersonDetails 展开的字段(id / name / phone / address)
//
// ⭐ 后续用途预告:
//   - 本节**没有**任何组件用 FIND_PERSON(App.jsx / Persons.jsx 都未导入)
//   - 这是**故意**的 — 课程先**埋好 fragment 工具**,后续"Subscriptions on the client"
//     子节会用 `useSubscription` + PersonDetails fragment 来响应 personAdded 事件
//   - 所以现在 FIND_PERSON 是"准备好但未使用"的状态(dead code by design)
//
// ⭐ 验证方法(用户自己跑):
//   - npm run dev + 浏览器 Console:
//       import { FIND_PERSON } from '/src/queries.js'
//       console.log(FIND_PERSON.loc.source.body)
//   - 应看到 query + fragment 拼接的完整 GraphQL document
export const FIND_PERSON = gql`
  query findPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) {
      ...PersonDetails
    }
  }

  ${PERSON_DETAILS}
`