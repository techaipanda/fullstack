// ⭐⭐⭐ PersonForm.jsx — part8o "Updating the cache" 关键改造 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本子节**改 PersonForm.jsx** — 课程本节核心改动
//   课程明示的 2 个变化:
//   1. 抽出 inline `const CREATE_PERSON = gql\`...\`` 到 src/queries.js
//   2. useMutation 加 refetchQueries option —— 这是 part8o "更新 cache"的核心招式
//
// ⭐ 课程原文核心(逐字保留):
//   "Another easy way to keep the cache in sync is to use the useMutation hook's
//    refetchQueries parameter to define that the query fetching all persons is done
//    again whenever a new person is created."
//
// ⭐⭐ part8n → part8o 关键迁移 ⭐⭐:
//   - part8n:useMutation(CREATE_PERSON)               ← mutation 成功但 UI 不刷新(per part8n README)
//   - part8o:useMutation(CREATE_PERSON, { refetchQueries: [{ query: ALL_PERSONS }] })
//                                              ↑
//                              mutation 成功后 Apollo 自动重发 ALL_PERSONS
//                              Persons 列表立即看到新 person

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'

// ⭐⭐⭐ 从 '../queries' 导入 ALL_PERSONS + CREATE_PERSON ⭐⭐⭐
//   ALL_PERSONS 是 refetchQueries 参数需要的 query 引用
//   CREATE_PERSON 是 useMutation 主体需要的 mutation 引用
import { ALL_PERSONS, CREATE_PERSON } from '../queries'

const PersonForm = () => {
  // ⭐ 4 个独立 useState — verbatim 课程风格(per part8n 沿用)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')

  // ⭐⭐⭐ 核心概念:useMutation + refetchQueries ⭐⭐⭐
  //
  // 1. useMutation(MUTATION, OPTIONS) — OPTIONS 是 useMutation 第二参数
  //    不用 OPTIONS:只有 mutateFn 和 result(per part8n)
  //    用 OPTIONS:可挂 onError / onCompleted / refetchQueries / update / variables
  //
  // 2. ⭐⭐ refetchQueries ⭐⭐(本节核心):
  //    `{ refetchQueries: [{ query: ALL_PERSONS }] }` —— mutation 成功后,
  //    Apollo 自动重发 ALL_PERSONS 这个 query,Persons 列表立即更新
  //
  // 3. ⭐⭐ 多 query 同步刷新(per course 演示) ⭐⭐:
  //    refetchQueries: [
  //      { query: ALL_PERSONS },
  //      { query: OTHER_QUERY },
  //      { query: ANOTHER_QUERY },
  //    ]
  //    —— 一个 mutation 触发,多个 query 同步重发,UI 多处同步更新
  //
  // 4. ⭐⭐ 三种"更新 cache"方案对比(per course 文本):
  //    - **pollInterval**(在 useQuery 上):每 2s 轮询,缺点:多余网络流量 + 页面闪烁
  //    - **refetchQueries**(本节):mutation 后精准重发,缺点:不会自动同步"他人修改"
  //    - **cache.modify / cache.updateQuery**(课程说"more about those later in this part")
  //
  // 5. 验证:打开浏览器 DevTools → Network → 提交表单 → 看到 1 个 POST(mutation)
  //    + 紧接着 1 个 POST(query ALL_PERSONS)—— refetchQueries 触发的重发
  const [createPerson] = useMutation(CREATE_PERSON, {
    refetchQueries: [{ query: ALL_PERSONS }],
  })

  // ⭐ submit handler — verbatim part8n(per course 本节不改)
  const submit = (event) => {
    event.preventDefault()
    createPerson({ variables: { name, phone, street, city } })

    setName('')
    setPhone('')
    setStreet('')
    setCity('')
  }

  // ⭐ JSX — verbatim part8n(per course 本节不改)
  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={submit}>
        <div>
          name <input value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          phone <input value={phone}
            onChange={({ target }) => setPhone(target.value)}
          />
        </div>
        <div>
          street <input value={street}
            onChange={({ target }) => setStreet(target.value)}
          />
        </div>
        <div>
          city <input value={city}
            onChange={({ target }) => setCity(target.value)}
          />
        </div>
        <button type='submit'>add!</button>
      </form>
    </div>
  )
}

export default PersonForm