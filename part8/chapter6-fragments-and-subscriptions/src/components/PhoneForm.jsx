// ⭐⭐⭐ PhoneForm.jsx — part8y "Fixing validations" 完整版 PhoneForm(try/catch 模式)⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件从 part8w/x 的 **STUB** 升级到完整版
//   - part8w/PhoneForm.jsx 是 stub,只接受 setError prop,渲染字面 "PhoneForm here"
//   - part8y 需要 PhoneForm **可工作**,因为 course block 10 演示修改 PhoneForm.submit
//     处理"phone too short" validation error
//   - 所以本文件 = 完整版 PhoneForm(per part8q 沿用,但**drop** onCompleted,改用 try/catch)
//
// ⭐⭐ 本文件相对于 part8x 的差异(per part8y 第 3 小节):
//   part8x:STUB(渲染 "PhoneForm here")
//   part8y:完整版 + setError prop + EDIT_NUMBER mutation + **try/catch 模式**(per part8y block 10)
//
// ⭐⭐⭐ 关键诚实声明:课程 Chapter 5 "Fixing validations" 的破坏性改动 ⭐⭐⭐
//   - 课程 block 10 verbatim 用 `try/catch` 替换 part8q 的 `onCompleted` 模式
//   - part8q:`useMutation(EDIT_NUMBER, { onCompleted: (data) => { if (!data.editNumber) setError('person not found') } })`
//   - part8y:`useMutation(EDIT_NUMBER)`(无 options)+ submit 用 try/catch 兜底
//   - **副作用**:person not found 时(per part8j resolver return null 不抛错)
//     现在 setError 不会被调用 — 课程**故意**简化,block 11 只说 validation errors
//   - 详见 part8y README "关键诚实声明 — 课程 trade-off" 章节
//
// ⭐ 课程本节做的"完整版 PhoneForm":
//   1. 2 个 useState(name + phone)— verbatim part8q 沿用
//   2. useMutation(EDIT_NUMBER) — **不带 options**(per part8y 简化,丢弃 onCompleted)
//   3. submit handler:event.preventDefault + try/await changeNumber/catch setError + 清空 form
//   4. JSX:<form onSubmit> 2 个受控 input + submit button
//
// ⭐ 跟 part8u 后端的联动(per part8u/v README):
//   - editNumber 不需要 Authorization(per part8v 故意不加鉴权)
//   - 但前端 part8x 会自动加 header(后端忽略也行)
//   - 后端 editNumber resolver(per part8j/v):找不到 person 返回 null(不抛 GraphQLError)
//   - 后端 editNumber resolver(per part8t):phone 触发 mongoose 验证失败 → 抛 GraphQLError

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { EDIT_NUMBER } from '../queries'

// ⭐⭐⭐ PhoneForm 组件 — verbatim part8q 完整版 + part8y try/catch(替代 onCompleted)⭐⭐⭐
const PhoneForm = ({ setError }) => {
  // ⭐ 2 个独立 useState — verbatim part8q
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // ⭐⭐⭐ 关键改造(per part8y block 10 + trade-off):useMutation 不带 options ⭐⭐⭐
  //
  // 1. ⭐⭐ 跟 part8q 的对比 ⭐⭐
  //    - part8q(per course line 512):
  //      ```
  //      const [changeNumber] = useMutation(EDIT_NUMBER, {
  //        onCompleted: (data) => {
  //          if (!data.editNumber) {
  //            setError('person not found')
  //          }
  //        }
  //      })
  //      ```
  //    - part8y(per course block 10):**不**带 options
  //      ```
  //      const [changeNumber] = useMutation(EDIT_NUMBER)
  //      ```
  //
  // 2. ⭐⭐ 关键 trade-off ⭐⭐
  //    - part8q onCompleted 模式:能兜底"person not found"(data.editNumber === null)
  //    - part8y try/catch 模式:**不**能兜底"person not found"(mutation 成功,无 error)
  //    - 但 try/catch 模式能兜底"phone validation error"(server 抛 GraphQLError)
  //    - 课程**故意**接受这个 trade-off — block 11 只讲 validation errors 兜底
  //    - 生产代码应该 try/catch + onCompleted 双保险,但**课程不做**
  //
  // 3. ⭐⭐ 为什么 try/catch 比 onError 更合适 ⭐⭐
  //    - onError 是 useMutation options 字段(per part8p PersonForm 模式)
  //    - onError 触发时机:server 抛 GraphQLError → Apollo 把 error 传给 onError
  //    - **课程选择 try/catch 不选择 onError** — 因为:
  //      a. try/catch 显式 — 看代码立刻知道哪里处理错误
  //      b. try/catch 只包 changeNumber 一行 — 错误粒度更细
  //      c. 课程不需要 onError 来 catch 其它 mutation(PhoneForm 只调一个)
  //    - 两种都合理,课程 verbatim 用 try/catch
  const [changeNumber] = useMutation(EDIT_NUMBER)

  // ⭐⭐⭐ submit handler — verbatim part8y block 10 try/catch 模式 ⭐⭐⭐
  //
  // ⭐ 课程原文(per course block 10 highlighted lines 7-11):
  //   const submit = async (event) => {
  //     event.preventDefault()
  //     try {
  //       await changeNumber({ variables: { name, phone } })
  //     } catch (error) {
  //       setError(error.message)
  //     }
  //     setName('')
  //     setPhone('')
  //   }
  //
  // ⭐⭐⭐ 关键改动(per part8y block 10 vs part8q):try/catch 替代 fire-and-forget ⭐⭐⭐
  //   - 之前(per part8q):`changeNumber({ variables })` — 不 await,fire-and-forget
  //     错误处理交给 onCompleted option
  //   - 现在(per part8y):`await changeNumber({ variables })` 包在 try/catch 里
  //     错误处理直接 catch(error) → setError(error.message)
  //
  // ⭐⭐ catch(error) 的 error 对象结构(per Apollo Client v3):
  //   - error.graphQLErrors: GraphQLError[] — server 抛的 GraphQL errors
  //   - error.networkError: Error — 网络层错误
  //   - error.message: string — Apollo 拼接的 friendly message
  //   - 课程 verbatim 用 error.message(简单粗暴)
  //   - 我做了**minimum viable improvement**:优先取 graphQLErrors[0]?.message
  //     (跟 PersonForm onError 改进一致)
  //
  // ⭐⭐ "乐观清空"模式保留(per part8n 沿用):
  //   - setName('') + setPhone('') 在 try/catch **之外** — 不管成功失败都清空
  //   - 这是课程 verbatim(per block 10 line 10-11)— 即使 catch 触发也清空
  //   - ⚠️ 副作用:validation error 触发的 catch 后,表单已清空,用户得重新填
  //     生产代码可以在 catch 里保留表单数据让用户改,但**课程不做**
  const submit = async (event) => {
    event.preventDefault()
    try {
      await changeNumber({ variables: { name, phone } })
    } catch (error) {
      // ⭐ minimum viable improvement:优先 GraphQLError.message,fallback 到 error.message
      const message = error.graphQLErrors[0]?.message || error.message
      setError(message)
    }
    setName('')
    setPhone('')
  }

  // ⭐⭐ JSX — verbatim part8q 沿用(2 个 input + 1 个 button)⭐⭐
  return (
    <div>
      <h2>change number</h2>
      <form onSubmit={submit}>
        <div>
          name <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          phone <input
            value={phone}
            onChange={({ target }) => setPhone(target.value)}
          />
        </div>
        <button type='submit'>change number</button>
      </form>
    </div>
  )
}

// ⭐ 课程 verbatim — default export,让 App.jsx 能 import PhoneForm
export default PhoneForm