// ⭐ Persons.jsx — part8p "Handling mutation errors" 沿用 part8o verbatim
//
// ⭐ 关键诚实声明:课程本子节**不改 Persons.jsx**
//   课程本节改 3 个文件(改 App.jsx + 改 PersonForm.jsx + 新建 Notify.jsx)
//   Persons.jsx 的 useState + useQuery(FIND_PERSON, { skip }) + Person 子组件 verbatim 沿用

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'

// ⭐⭐⭐ 从 '../queries' 导入 FIND_PERSON(per part8o 沿用,part8p 不变)⭐⭐⭐
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