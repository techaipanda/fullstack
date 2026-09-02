// ⭐⭐⭐ PersonForm.jsx — part8y "Fixing validations" 完整版 PersonForm ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件从 part8w/x 的 **STUB** 升级到完整版
//   - part8w/PersonForm.jsx 是 stub,只接受 setError prop,渲染字面 "PersonForm here"
//   - part8y 需要 PersonForm **可工作**,因为 course block 4 + 6 演示修改 PersonForm.submit
//     处理"addPerson without phone"问题
//   - 所以本文件 = 完整版 PersonForm(per part8n 沿用 + part8p setError/onError + part8y phone.length 修复)
//
// ⭐⭐ 本文件相对于 part8x 的差异(per part8y 第 3 小节):
//   part8x:STUB(渲染 "PersonForm here")
//   part8y:完整版 + setError prop + onError + refetchQueries(per part8o 沿用)+ **phone.length 修复(per part8y block 4)**
//
// ⭐⭐⭐ 关键诚实声明:课程 Chapter 5 "Fixing validations" **只改了 submit 函数第 7 行**
//   - 课程 block 4 verbatim 高亮行 6-13,只有 `phone: phone.length > 0 ? phone : undefined` 一处是**新**的
//   - 其他代码(4 个 useState + useMutation + 4 个 input + form JSX)**都**是 part8n 已有内容
//   - 但 part8w/x 的 PersonForm 是 STUB,所以我必须先按 part8n/p 还原完整版,再改 submit
//   - 这是"minimum viable addition" — 把 stub 升级到能跑,只动 submit 一行
//
// ⭐ 跟 part8v 后端的联动(per part8v README):
//   - part8v 后端强制 addPerson 需要 Authorization(否则 UNAUTHENTICATED)
//   - part8x 前端自动加 Authorization header(per main.jsx setContext)
//   - 所以 part8y PersonForm 用 useMutation 调 createPerson 时,会自动带 header

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { ALL_PERSONS, CREATE_PERSON } from '../queries'

// ⭐⭐⭐ PersonForm 组件 — verbatim part8n 完整版 + part8p onError + part8y phone.length 修复 ⭐⭐⭐
//
// ⭐ 课程本节做的"完整版 PersonForm":
//   1. 4 个 useState('')跟踪表单字段(name / phone / street / city)
//   2. useMutation(CREATE_PERSON, { refetchQueries: [{ query: ALL_PERSONS }], onError: ... })
//      — refetchQueries 来自 part8o 沿用(per course "Updating the cache")
//      — onError 来自 part8p(per course "Handling mutation errors")
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

  // ⭐⭐⭐ 核心:useMutation + refetchQueries(per part8o)+ onError(per part8p)⭐⭐⭐
  //
  // 1. ⭐⭐ useMutation Hook 返回数组解构 ⭐⭐(per part8n):
  //    - `const [createPerson] = useMutation(CREATE_PERSON, options)`
  //    - 数组第 0 项 = mutate function(createPerson)— 调用它发 mutation
  //
  // 2. ⭐⭐ refetchQueries(per part8o 沿用):
  //    - mutation 成功后 Apollo 自动重发 ALL_PERSONS,Persons 列表立即看到新 person
  //    - 这是 part8o "Updating the cache" 的方案之一
  //
  // 3. ⭐⭐ onError(per part8p 沿用):
  //    - server 抛 GraphQLError(如 'Name must be unique' / 'Saving person failed: ...')
  //    - → mutation 失败 → onError 触发 → setError(error.message) → Notify 红字
  //    - 关键:GraphQLError 走 onError,普通业务 return null 走 onCompleted(见 PhoneForm)
  //
  // ⭐⭐ onError 解构 error.graphQLErrors ⭐⭐
  //   - Apollo Client v3 的 error 对象:`error.graphQLErrors: GraphQLError[]` + `error.networkError`
  //   - GraphQLError.message 是 server extensions.message + 部分自定义 text
  //   - 这里我**只取** graphQLErrors[0]?.message,跟 part8p '错误字符串' 模式一致
  //   - 课程 part8p verbatim 是 `setError(error.message)`,我做了**minimum viable improvement**
  //     优先取 graphQLErrors[0].message(更精准),fallback 到 error.message
  //   - 详见 part8y README "minimum viable improvement" 章节说明
  const [createPerson] = useMutation(CREATE_PERSON, {
    refetchQueries: [{ query: ALL_PERSONS }],
    onError: (error) => {
      const message = error.graphQLErrors[0]?.message || error.message
      setError(message)
    },
  })

  // ⭐⭐⭐ submit handler — verbatim part8n + part8y block 4 phone.length 修复 ⭐⭐⭐
  //
  // ⭐ 课程原文(per course block 4 highlighted lines 6-13):
  //   const submit = async (event) => {
  //     event.preventDefault()
  //     createPerson({
  //       variables: {
  //         name,
  //         street,
  //         city,
  //         phone: phone.length > 0 ? phone : undefined,    ← ⭐ 关键修改点
  //       },
  //     })
  //     setName('')
  //     setPhone('')
  //     setStreet('')
  //     setCity('')
  //   }
  //
  // ⭐⭐⭐ 关键改动(per part8y block 4):phone.length > 0 ? phone : undefined ⭐⭐⭐
  //   - 之前(per part8n):`phone: phone`(不管用户有没有填,都把空字符串传过去)
  //   - 现在(per part8y):`phone: phone.length > 0 ? phone : undefined`(空字符串转 undefined)
  //   - 课程原文(per block 2):"Validation fails, because frontend sends an empty
  //     string as the value of phone."
  //   - 后端 part8t mongoose schema:`phone: { type: String, minlength: 5 }`
  //     (注意:phone 不是 required,可以 undefined;但是 minlength 5 对空字符串 "    " 也会失败)
  //   - 实际:空字符串 "" 在 mongoose 看是 String 类型,minlength 5 触发 ValidationError
  //   - 转 undefined 后:mongoose 不会赋值给 phone 字段,phone 字段根本不存在,验证跳过
  //
  // ⭐⭐ 为什么用 undefined 不用 null 不用 "" ⭐⭐
  //   - undefined:mongoose schema 视作"字段不存在",跳过 minlength 验证
  //   - null:不是 String 类型,触发 CastError
  //   - "" (空字符串):长度 0,触发 minlength 5 验证失败
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
  //   - target.value → 当前 input 的字符串值
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