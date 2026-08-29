// ⭐ Persons.jsx — part8o "Updating the cache" 沿用 part8m/n verbatim
//
// ⭐ 关键诚实声明:课程本子节**只改** Persons.jsx 的 import 部分
//   课程明示的唯一变化:把 inline `const FIND_PERSON = gql\`...\`` 抽出到 src/queries.js
//   其他逻辑(useState + useQuery(FIND_PERSON, { skip }) + Person 子组件)verbatim 沿用 part8n
//
// ⭐ 课程原文:
//   "Each component then imports the queries it needs:
//    import { ALL_PERSONS } from './queries'"
//   —— Persons.jsx 在 src/components/ 子目录,import 路径是 '../queries'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'

// ⭐⭐⭐ 从 '../queries' 导入 FIND_PERSON(替代之前的 inline 定义)⭐⭐⭐
import { FIND_PERSON } from '../queries'

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