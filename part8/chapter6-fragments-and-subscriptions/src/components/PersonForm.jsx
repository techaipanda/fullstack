// ⭐⭐⭐ PersonForm.jsx — part8z "Updating cache, revisited" 完整版 PersonForm(update callback)⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件从 part8y 的 useMutation(refetchQueries) 升级到 useMutation(update callback)
//   - part8y:useMutation(CREATE_PERSON, { refetchQueries: [{ query: ALL_PERSONS }], onError })
//   - part8z:useMutation(CREATE_PERSON, { onError, update: (cache, response) => {...} })
//   - 课程 block 3 文字明示"instead of using the refetchQueries attribute"
//   - 所以 part8z **完全移除** refetchQueries,只保留 update callback(per part8o → part8z 演化)
//
// ⭐⭐ 本文件相对于 part8y 的差异(per part8z 第 4 小节):
//   part8y:useMutation(CREATE_PERSON, { refetchQueries: [{ query: ALL_PERSONS }], onError })
//   part8z:useMutation(CREATE_PERSON, { onError, update: (cache, response) => cache.updateQuery(...) })
//   其他全部 verbatim 沿用:4 useState + submit handler + 4 个受控 input + form JSX
//
// ⭐⭐⭐ 关键诚实声明:课程 Chapter 5 "Updating cache, revisited" **只改了 useMutation options 字段**
//   - 课程 block 4 verbatim 高亮行 6-12,只改 `update` callback(替换 `refetchQueries`)
//   - 其他代码全部 verbatim 沿用 part8y
//   - 这是 part8 系列最小改动的小节之一(per part8x 同级别)
//
// ⭐⭐ 两种 cache 更新策略对比(refetchQueries vs update callback)⭐⭐
//
//   ┌──────────────────┬──────────────────────────┬──────────────────────────────┐
//   │ 维度             │ refetchQueries(part8o/y) │ update callback(part8z)      │
//   ├──────────────────┼──────────────────────────┼──────────────────────────────┤
//   │ 网络请求         │ 每次 mutation 重发 ALL   │ 0 网络请求(直接改 cache)     │
//   │ 实现复杂度       │ 1 行                     │ 7 行 callback                │
//   │ 正确性保证       │ Apollo 自动重发(总正确)  │ 手写 cache 更新(可能错)      │
//   │ 字段名错后果     │ 无(总是最新)            │ cache 与 server 不一致(stale)│
//   │ 适用场景         │ 简单 mutation            │ 复杂 mutation / 条件性更新   │
//   │ 课程推荐         │ 简单场景 OK              │ 复杂场景必需(per block 7)    │
//   └──────────────────┴──────────────────────────┴──────────────────────────────┘
//
// ⭐ 跟 part8u 后端的联动(per part8u/v README):
//   - part8v 后端强制 addPerson 需要 Authorization(否则 UNAUTHENTICATED)
//   - part8x 前端自动加 Authorization header(per main.jsx setContext)
//   - 所以 part8z PersonForm 用 useMutation 调 createPerson 时,会自动带 header

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { ALL_PERSONS, CREATE_PERSON } from '../queries'

// ⭐⭐⭐ PersonForm 组件 — verbatim part8n/y 完整版 + part8z update callback 替代 refetchQueries ⭐⭐⭐
//
// ⭐ 课程本节做的"完整版 PersonForm":
//   1. 4 个 useState('')跟踪表单字段(name / phone / street / city)
//   2. useMutation(CREATE_PERSON, { onError, update: (cache, response) => {...} })
//      — onError 来自 part8p 沿用
//      — **update callback 来自 part8z block 4 替代 part8o refetchQueries**
//   3. submit handler:event.preventDefault + createPerson({ variables }) + 清空表单
//   4. JSX:<form onSubmit> 4 个受控 input + submit button
//
// ⭐⭐ 课程风格:4 个 useState 独立声明 ⭐⭐
//   课程明示多 useState(不是 useState({...})合并对象)
//   —— part5 也用同样的"独立 useState"模式(per CLAUDE.md 约定)
//
// ⭐⭐ setError prop 来源 ⭐⭐:
//   - App.jsx 渲染 `<PersonForm setError={notify} />`(per part8p)
//   - notify = (message) => { setErrorMessage(message); setTimeout(() => setErrorMessage(null), 10000) }
//   - Notify 组件在 App.jsx 顶层,setErrorMessage 触发 Notify 红字显示
const PersonForm = ({ setError }) => {
  // ⭐ 4 个独立 useState — verbatim part8n 风格
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')

  // ⭐⭐⭐ 核心:useMutation + update callback(per part8z block 4)⭐⭐⭐
  //
  // 1. ⭐⭐ useMutation Hook 返回数组解构 ⭐⭐(per part8n):
  //    - `const [createPerson] = useMutation(CREATE_PERSON, options)`
  //    - 数组第 0 项 = mutate function(createPerson)— 调用它发 mutation
  //
  // 2. ⭐⭐⭐ 关键改造(per part8z block 4):update callback 替代 refetchQueries ⭐⭐⭐
  //    - 之前(per part8o/part8y):`refetchQueries: [{ query: ALL_PERSONS }]`
  //      → mutation 成功后 Apollo 自动重发 ALL_PERSONS query,Persons 列表立即看到新 person
  //      → 优点:简单 + 总是正确
  //      → 缺点:每次 mutation 都重发 → 多余网络请求(per course block 2 "the query is always rerun")
  //    - 现在(per part8z block 4):`update: (cache, response) => {...}`
  //      → mutation 成功后 Apollo 直接调用 callback 修改 cache
  //      → 优点:0 网络请求 + 精确控制(per course block 7 "the only sensible way")
  //      → 缺点:必须手写 cache 更新逻辑,字段名错会导致 stale data(per course block 9-10)
  //
  // 3. ⭐⭐ cache.updateQuery API 解析(per course block 4-6):⭐⭐
  //    - cache.updateQuery({ query: ALL_PERSONS }, (prevData) => newData)
  //    - 参数 1:查询定义(query document + 可选 variables)
  //    - 参数 2:callback 接收 prevData(当前 cache 数据),返回 newData(新数据)
  //    - callback 不返回(newData === undefined)时 cache 不变
  //    - prevData 形状:跟 query selection set 一致(本例:`{ allPersons: [{ name, phone, id, address }] }`)
  //
  // 4. ⭐⭐ update callback 函数签名解析(per course block 5):⭐⭐
  //    - `update: (cache, response) => {...}`
  //    - cache:Apollo InMemoryCache 实例(有 updateQuery / modify / readQuery 等方法)
  //    - response:mutation 响应数据(包含 data.addPerson 字段,即新创建的 person)
  //    - 课程 block 5 原文:"The callback function is given a reference to the cache
  //      and the data returned by the mutation as parameters. For example, in our
  //      case, this would be the created person"
  //
  // 5. ⭐⭐ response.data.addPerson 解析(per part8h addPerson mutation):⭐⭐
  //    - response.data.addPerson 是新创建的 Person 对象(per queries.js CREATE_PERSON selection set)
  //    - 字段:name + phone + id + address { street, city }
  //    - 课程 block 4 verbatim:`allPersons: allPersons.concat(response.data.addPerson)`
  //    - 这是**不可变更新**模式(per part7 React immutable)— 用 concat 而非 push
  //
  // 6. ⭐⭐ onError 保留(per part8p 沿用 + part8y graphQLErrors 改进):⭐⭐
  //    - onError 跟 update callback **平级**,都在 useMutation options 里
  //    - onError 触发时机:server 抛 GraphQLError → Apollo 调 onError
  //    - update 触发时机:server 成功响应 → Apollo 调 update
  //    - **不**互斥:两者可以同时存在
  //    - 课程 block 4 verbatim 显示 onError 也在 options 里(我严格保留)
  //
  // 7. ⭐⭐ 课程故意移除 refetchQueries 的理由(per block 2-3):⭐⭐
  //    - block 2:"the drawback being that the query is always rerun with any updates"
  //    - block 3:"It is possible to optimize the solution ... instead of using the refetchQueries attribute"
  //    - 课程**故意**展示 update 作为 refetchQueries 的替代方案
  //    - 生产代码可以**两个都用**(同时设置),但**课程不做**
  //    - 我严格 verbatim 沿用(只 update 不 refetch)
  const [createPerson] = useMutation(CREATE_PERSON, {
    onError: (error) => {
      const message = error.graphQLErrors[0]?.message || error.message
      setError(message)
    },
    // ⭐⭐⭐ Chapter 6 子节 2 新增(per course line 1234-1242 verbatim):use helper instead of inline cache.updateQuery ⭐⭐⭐
    //
    // ⭐ 课程原文(per part8e.md line 1234-1242):
    //   "update: (cache, response) => {
    //      // highlight-start
    //      const addedPerson = response.data.addPerson
    //      addPersonToCache(cache, addedPerson)
    //      // highlight-end
    //    },"
    //
    // ⭐ 跟 part8z inline 版本的关键差异:
    //   part8z: cache.updateQuery({ query: ALL_PERSONS }, ({ allPersons }) => { ... })
    //   Chapter 6 子节 2: addPersonToCache(cache, addedPerson)
    //   - inline 版本:PersonForm 自己负责 cache 更新逻辑
    //   - helper 版本:抽到 utils/apolloCache.js,PersonForm + App 都调它
    //   - helper 内置 some(...) 去重(per part8e.md line 1132-1138)
    //   - 两条路径(useMutation + useSubscription)同时调也不会重复添加
    update: (cache, response) => {
      const addedPerson = response.data.addPerson
      addPersonToCache(cache, addedPerson)
    },
  })

  // ⭐⭐⭐ submit handler — verbatim part8n + part8y block 4 phone.length 修复 ⭐⭐⭐
  //
  // ⭐ 课程原文(per course block 4 highlighted lines 6-13,per part8y 沿用):
  //   const submit = async (event) => {
  //     event.preventDefault()
  //     createPerson({
  //       variables: {
  //         name,
  //         street,
  //         city,
  //         phone: phone.length > 0 ? phone : undefined,
  //       },
  //     })
  //     setName('')
  //     setPhone('')
  //     setStreet('')
  //     setCity('')
  //   }
  //
  // ⭐⭐ phone.length 修复(per part8y block 4)verbatim 沿用
  //   - 空字符串 "" → undefined → mongoose 跳过验证
  //   - 课程原文:"set phone to undefined if user has not given a value"
  //
  // ⭐⭐ "乐观清空"模式沿用 part8n:
  //   - createPerson 是异步请求,但课程不等响应就直接清空
  //   - 这是常见的"乐观 UI"做法 —— 用户立即看到表单清空,不阻塞等待响应
  //   - ⚠️ 副作用:如果 server 报错,表单已经清空但数据没创建
  //   - onError 兜底(per part8p)只显示红字,不恢复表单 — 课程明示接受这个 trade-off
  const submit = async (event) => {
    event.preventDefault()
    createPerson({
      variables: {
        name,
        street,
        city,
        phone: phone.length > 0 ? phone : undefined,
      },
    })

    setName('')
    setPhone('')
    setStreet('')
    setCity('')
  }

  // ⭐⭐ JSX:4 个受控 input + submit button — verbatim part8n ⭐⭐
  //
  // ⭐⭐ 受控组件(controlled component)模式 ⭐⭐:
  // - `<input value={name} onChange={...}>` — React 组件的 state 是 input 唯一真理源
  // - onChange 写法:`onChange={({ target }) => setName(target.value)}`
  //   - 解构 event.target → 拿 input DOM 元素
  //   - target.value → 当前 input 字符串值
  //   - setName(target.value) → 更新 state
  //   这是 React 表单标准写法(出现 4 次,name/phone/street/city)
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

// ⭐ 课程 verbatim — default export,让 App.jsx 能 import PersonForm
export default PersonForm