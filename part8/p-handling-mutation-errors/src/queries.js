// ⭐⭐⭐ queries.js — part8p "Handling mutation errors" 沿用 part8o verbatim ⭐⭐⭐
//
// ⭐ 关键诚实声明:课程本子节**不改 src/queries.js**
//   课程本节改 3 个文件(改 App.jsx + 改 PersonForm.jsx + 新建 Notify.jsx)
//   queries.js 的 3 个 GraphQL 操作(ALL_PERSONS / FIND_PERSON / CREATE_PERSON)不动
//
// ⭐ 课程抽出 3 个 GraphQL 操作(per part8o 沿用,part8p 不变):
//   1. ALL_PERSONS  — query(列表,App.jsx 用 useQuery)
//   2. FIND_PERSON  — query(单条详情,Persons.jsx 用 useQuery + skip)
//   3. CREATE_PERSON — mutation(添加,PersonForm.jsx 用 useMutation + refetchQueries + onError)

import { gql } from '@apollo/client'

// ⭐ ALL_PERSONS — App.jsx 用 useQuery 渲染列表
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
//   part8o 已加 refetchQueries(per course line 343)
//   part8p 再加 onError(error) → setError(error.message)(per course line 431)
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