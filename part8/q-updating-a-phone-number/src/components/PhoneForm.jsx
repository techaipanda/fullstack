// ⭐⭐⭐ PhoneForm.jsx — part8q "Updating a phone number" 新建组件 ⭐⭐⭐
//
// ⭐ 关键诚实声明:课程本子节**新建** src/components/PhoneForm.jsx
//   课程原文(per course line 484):"Create a new component PhoneForm in the file
//   src/components/PhoneForm.jsx for updating a phone number."
//
// ⭐ 课程原文(per course line 490):"The PhoneForm component is straightforward:
//   it asks for the person's name and a new phone number via a form. When the form
//   is submitted, it calls the changeNumber function that handles the update,
//   created with the useMutation hook."
//
// ⭐⭐ 课程演进路径(verbatim 落地最终态)⭐⭐:
//   - course line 488:第一版 PhoneForm(函数签名 `() => {}`,无 onCompleted)
//   - course line 512:第二版 final-state(函数签名 `({ setError }) => {}`,加 onCompleted)
//   - 落地用 line 512 最终态(per course-follow-official skill:write final-state code)
//   - 中间状态(line 488 → 512 的演进)是教学步骤,落地不需要
//
// ⭐⭐ 课程 verbatim 关键设计 ⭐⭐:
// 1. 接收 setError prop — 跟 PersonForm.jsx 一致(per part8p),子→父回调链
// 2. useState name + phone — 2 个独立 useState(对比 PersonForm 是 4 个)
// 3. useMutation(EDIT_NUMBER, { onCompleted: (data) => {...} }) — 关键是 onCompleted
//    不是 onError,因为 server 找不到 person 时 return null 不抛 GraphQLError
// 4. submit handler 跟 PersonForm 一样:event.preventDefault() + changeNumber + 清空 form
// 5. JSX form:2 个 input + 1 个 button(对比 PersonForm 是 4 个 input)

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { EDIT_NUMBER } from '../queries'

// ⭐⭐⭐ PhoneForm 组件 — verbatim 课程 final-state(line 512)⭐⭐⭐
const PhoneForm = ({ setError }) => {
  // ⭐ 2 个独立 useState — verbatim 课程(line 488 / 512 一致)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // ⭐⭐⭐ 关键改造:useMutation 加 onCompleted option(per course line 508-514)⭐⭐⭐
  //
  // 1. ⭐⭐ onCompleted 核心概念 ⭐⭐
  //    - onCompleted 是 useMutation 第 2 参数 OPTIONS 的字段(跟 onError 平级)
  //    - 触发时机:mutation **成功完成** 时(无论返回数据是什么,包括 data.editNumber === null)
  //    - 参数:data 对象(Apollo 包装的 mutation 响应)
  //    - 课程硬编码拿 data.editNumber(因为 mutation 名 editNumber + selection set 返回 editNumber 字段)
  //
  // 2. ⭐⭐ 为什么这里用 onCompleted 不用 onError(per course line 508)⭐⭐
  //    - 课程原文:"Since this isn't considered an error state from GraphQL's
  //      point of view, registering an onError error handler wouldn't be useful
  //      in this situation."
  //    - 也就是说:server `editNumber` resolver 找不到 person 时返回 null(per part8j),
  //      不是抛 GraphQLError,所以 mutation 整体是"成功响应"(HTTP 200)
  //    - onError 不会触发(没有 GraphQLError)
  //    - 但 data.editNumber === null 这个值,需要由 onCompleted 捕获并 setError
  //
  // 3. ⭐⭐ PersonForm 用 onError,PhoneForm 用 onCompleted — 对比记忆 ⭐⭐
  //    - PersonForm.jsx(per part8p):server 抛 GraphQLError('Name must be unique')
  //      → mutation 失败 → onError 触发 → setError(error.message)
  //    - PhoneForm.jsx(per part8q):server return null(不抛错)
  //      → mutation "成功" 但 data.editNumber === null → onCompleted 触发 → setError('person not found')
  //    - 总结:**onError = GraphQLError 兜底** / **onCompleted = success 但 data 异常兜底**
  //
  // 4. ⭐⭐ 验证 ⭐⭐:
  //    - 启动 part8j server(端口 4000)
  //    - 在 change number 表单填 name="NotExist"(不存在)+ phone="1234"
  //    - 点 "change number"
  //    - mutation 成功(无 onError 触发)
  //    - 但 data.editNumber === null → onCompleted 触发 setError('person not found')
  //    - 屏幕顶部红字 "person not found"(10s 后消失)
  //
  // 5. ⭐⭐ setError 错误字符串是课程硬编码的 'person not found' ⭐⭐
  //    - 不是 server message(因为 server 没抛错)
  //    - 是前端自己生成的兜底文案
  //    - 生产代码可以更友好:比如 'No person with name "NotExist" found',
  //      但课程 verbatim 用 'person not found'
  const [changeNumber] = useMutation(EDIT_NUMBER, {
    onCompleted: (data) => {
      if (!data.editNumber) {
        setError('person not found')
      }
    }
  })

  // ⭐ submit handler — verbatim 课程(line 488 / 512 一致)
  //   跟 PersonForm 的 submit handler 几乎一样:
  //   - event.preventDefault()
  //   - changeNumber({ variables: { name, phone } }) — 2 个变量
  //   - setName('') + setPhone('') — 清空表单
  const submit = (event) => {
    event.preventDefault()
    changeNumber({ variables: { name, phone } })

    setName('')
    setPhone('')
  }

  // ⭐ JSX — verbatim 课程(line 488 / 512 一致)
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