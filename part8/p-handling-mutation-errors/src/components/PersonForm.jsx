// ⭐⭐⭐ PersonForm.jsx — part8p "Handling mutation errors" 关键改造 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本子节**改 PersonForm.jsx** 的 2 处:
//   1. 函数签名加 `{ setError }` prop —— 接收父组件传来的"错误通知回调"
//   2. useMutation 加 `onError: (error) => setError(error.message)` option
//
// ⭐ 课程原文核心(per course line 425-431 逐字保留):
//   "However, the error is not yet handled in the frontend. Using the onError option
//    of the useMutation hook, it is possible to register an error handler function
//    for mutations."
//   "Let's register an error handler for the mutation. The PersonForm component
//    receives a setError function as a prop..."
//
// ⭐⭐ part8o → part8p 关键迁移 ⭐⭐:
//   - part8o:useMutation(CREATE_PERSON, { refetchQueries: [{ query: ALL_PERSONS }] })
//                                              ↑
//                              mutation 成功后 Apollo 自动重发 ALL_PERSONS
//   - part8p:useMutation(CREATE_PERSON, {
//                refetchQueries: [{ query: ALL_PERSONS }],
//                onError: (error) => setError(error.message),
//              })
//                                              ↑
//                              mutation 失败时调 setError(error.message)
//                              → App 的 notify → Notify 红字显示

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'

// ⭐⭐⭐ 从 '../queries' 导入 ALL_PERSONS + CREATE_PERSON(per part8o 沿用)⭐⭐⭐
//   ALL_PERSONS 是 refetchQueries 参数需要的 query 引用
//   CREATE_PERSON 是 useMutation 主体需要的 mutation 引用
import { ALL_PERSONS, CREATE_PERSON } from '../queries'

// ⭐⭐⭐ 关键改造 1:函数签名加 `{ setError }` prop(per course line 431)⭐⭐⭐
//
// 1. ⭐ 核心概念:子组件通过 prop 接收"回调函数" ⭐
//    - 父组件 App 定义 `const notify = (message) => { ... }`
//    - 父组件渲染时 `<PersonForm setError={notify} />`
//    - 子组件 PersonForm 通过 `({ setError })` 解构拿到这个函数引用
//    - 子组件需要触发错误时调 `setError(error.message)` —— 本质上调 App 的 notify
//
// 2. 为什么需要这个 prop 链:
//    - 错误状态在 App 管(errorMessage state + setTimeout 自动清除)
//    - PersonForm 是 mutation 触发处,知道"何时出错 + 错误信息是什么"
//    - 所以 PersonForm 通过 prop 把"错误信息"传回 App
//
// 4. prop 名是 setError(动词 set + 名词 Error)而不是 handleError / onError
//    这是课程硬编码的名字,不改
const PersonForm = ({ setError }) => {
  // ⭐ 4 个独立 useState — verbatim part8n/o(本子节不改)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')

  // ⭐⭐⭐ 关键改造 2:useMutation 加 onError option(per course line 431)⭐⭐⭐
  //
  // 1. ⭐⭐ onError 核心概念 ⭐⭐
  //    - onError 是 useMutation 第 2 参数 OPTIONS 的字段(跟 refetchQueries 平级)
  //    - 触发时机:mutation 失败时(如 server 抛 GraphQLError 'name must be unique')
  //    - 参数:error 对象(Apollo 包装的 GraphQLError)
  //    - error.graphQLErrors:GraphQL errors 数组(per part8h "BAD_USER_INPUT" 在这里)
  //    - error.message:第一个 GraphQL error 的 message 字符串
  //    - error.networkError:网络层错误(可选)
  //
  // 2. ⭐⭐ 与 refetchQueries 对比 ⭐⭐:
  //    - refetchQueries:mutation **成功** 时触发(query 重发)
  //    - onError:mutation **失败** 时触发(回调拿到 error 对象)
  //    - 两者互斥:同一次 mutation 只可能走一条(成功走 refetch,失败走 onError)
  //
  // 3. ⭐⭐ 验证 ⭐⭐:
  //    - 启动 part8j server(端口 4000)
  //    - 在浏览器添加一个名为 "Arto Hellas" 的 person(已存在)
  //    - server 抛 GraphQLError(per part8h),Apollo 自动调 onError
  //    - 屏幕顶部出现红字 "Name must be unique: Arto Hellas"(10s 后自动消失)
  //
  // 4. ⚠️ 注意:
  //    - error.message 拿到的是 server GraphQLError 的 message
  //    - server 部分(per part8h)的 throw new GraphQLError(
  //        'Name must be unique: ' + args.name,
  //        { extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.name } }
  //      )
  //    - 所以 error.message = "Name must be unique: Arto Hellas"(以 server 实际抛的为准)
  const [createPerson] = useMutation(CREATE_PERSON, {
    refetchQueries: [{ query: ALL_PERSONS }],
    onError: (error) => setError(error.message),
  })

  // ⭐ submit handler — verbatim part8n/o(本子节不改)
  const submit = (event) => {
    event.preventDefault()
    createPerson({ variables: { name, phone, street, city } })

    setName('')
    setPhone('')
    setStreet('')
    setCity('')
  }

  // ⭐ JSX — verbatim part8n/o(本子节不改)
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