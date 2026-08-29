// ⭐ Persons.jsx — part8n "Doing mutations" 沿用 part8m verbatim
//
// ⭐ 关键诚实声明:课程本子节**不改** Persons.jsx
//   课程明示只改 src/App.jsx + 新建 src/components/PersonForm.jsx
//   Persons.jsx 仍是 part8m 的完整 Container(useState + useQuery(FIND_PERSON) + Person 子组件)
//
// ⭐ part8m 的核心招式继续生效:
//   - useState(null) 管 nameToSearch
//   - useQuery(FIND_PERSON, { variables: { nameToSearch }, skip: !nameToSearch })
//   - 列表 + 每行 [show address] 按钮 → 切换 Person 详情视图
//
// ⭐ 课程本节 Persons 与 PersonForm 是"列表 vs 创建"两个独立操作:
//   - Persons 读 (useQuery + skip)
//   - PersonForm 写 (useMutation)
//   —— Apollo Client 的"读 / 写"清晰分离

import { useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

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

const Persons = ({ persons }) => {
  const [nameToSearch, setNameToSearch] = useState(null)
  const result = useQuery(FIND_PERSON, {
    variables: { nameToSearch },
    skip: !nameToSearch,
  })

  if (nameToSearch && result.data) {
    return (
      <Person
        person={result.data.findPerson}
        onClose={() => setNameToSearch(null)}
      />
    )
  }

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

export default Persons