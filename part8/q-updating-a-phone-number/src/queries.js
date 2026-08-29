// ⭐⭐⭐ queries.js — part8q "Updating a phone number" 抽出第 4 个 GraphQL 操作 ⭐⭐⭐
//
// ⭐ 关键诚实声明:课程本子节**改 src/queries.js** 的 1 处:
//   在 part8p 基础上(ALL_PERSONS / FIND_PERSON / CREATE_PERSON 3 个操作 verbatim 沿用)
//   加 EDIT_NUMBER(per course line 469-481)— 这是 part8q 的第 4 个导出
//
// ⭐ 课程原文(per course line 466):"The mutation again requires the use of variables.
//   Add the following query to the file queries.js"
//
// ⭐⭐ 课程 verbatim 关键设计(per course line 469-481)⭐⭐:
//   - mutation 名 editNumber(对应 server 端 part8j 的 Mutation.editNumber resolver)
//   - 2 个 variables:$name: String! + $phone: String!
//   - selection set:{ name phone address { street city } id }
//     —— 跟 CREATE_PERSON 完全一样(因为 update 也返回完整 Person object)
//
// ⭐ EDIT_NUMBER 是 part8q PhoneForm.jsx 用的(per course line 488 / 512)
//   PhoneForm 里 useMutation(EDIT_NUMBER, { onCompleted: (data) => ... })

import { gql } from '@apollo/client'

// ⭐ ALL_PERSONS — App.jsx 用 useQuery 渲染列表(verbatim part8o/p 沿用)
export const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`

// ⭐ FIND_PERSON — Persons.jsx 用 useQuery + skip 按需查详情(verbatim part8m 沿用)
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
//   part8o 已加 refetchQueries(per course line 343)
//   part8p 再加 onError(error) → setError(error.message)(per course line 431)
//   part8q 不变 — 沿用 verbatim
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

// ⭐⭐⭐ 新增:EDIT_NUMBER — PhoneForm.jsx 用 useMutation 更新已有 person 的 phone ⭐⭐⭐
//
// 1. ⭐⭐ 核心概念:这是 part8q 新加的 mutation ⭐⭐
//    - 课程原文(per course line 469-481 verbatim):
//      "Add the following query to the file queries.js:
//       export const EDIT_NUMBER = gql`
//         mutation editNumber($name: String!, $phone: String!) {
//           editNumber(name: $name, phone: $phone) {
//             name
//             phone
//             address {
//               street
//               city
//             }
//             id
//           }
//         }
//       `"
//    - 这就是 course line 469-481 的完整原文
//
// 2. ⭐⭐ 为什么 selection set 跟 CREATE_PERSON 一样 ⭐⭐
//    - 因为 server 的 editNumber resolver(per part8j)return updated Person
//    - Apollo cache 按 Person ID 归一化,所以更新后 Persons 列表自动显示新 phone
//      (per course line 502:"Surprisingly, when a person's number is changed,
//       the new number automatically appears on the list of persons rendered
//       by the Persons component. This happens because each person has an
//       identifying field of type ID, so the person's details saved to the
//       cache update automatically when they are changed with the mutation.")
//
// 3. ⭐⭐ 2 个 variables 而不是 3 个(对比 CREATE_PERSON 的 4 个)⭐⭐
//    - CREATE_PERSON:需要 name + phone + street + city(创建完整 Person)
//    - EDIT_NUMBER:只需要 name + phone(只更新 phone,address 不变)
//    - server 端 editNumber resolver(per part8j)签名:
//      editNumber: (root, args) => { ... }
//      args.name 用来找 person,args.phone 是新 phone
//
// 4. ⭐⭐ 注意:EDIT_NUMBER 可能返回 null(per course line 504)⭐⭐
//    - 如果 server 找不到 name 对应的 person,resolver return null
//    - mutation 本身没抛 GraphQLError(成功响应,但 data.editNumber === null)
//    - 所以不能用 onError 处理("person not found")
//    - 要用 onCompleted(per course line 508-514)— 见 PhoneForm.jsx
//
// 5. ⭐⭐ 验证 ⭐⭐:
//    - 启动 part8j server(端口 4000)
//    - 在浏览器 change number 那里填 name="Arto Hellas"(已存在)+ 新 phone="999"
//    - 点 "change number"
//    - 屏幕上方 Persons 列表里 Arto Hellas 的 phone 立即变 "999"
//      —— Apollo cache 自动更新(per course line 502)
//    - 然后试 name="NotExist" + 任意 phone
//    - 屏幕顶部红字 "person not found"(10s 后消失)
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