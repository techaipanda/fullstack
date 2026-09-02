// ⭐⭐⭐ LoginForm.jsx — part8w "User login" verbatim 课程代码 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 课程 Chapter 5 "User login" block 3**
//   课程原文(per course block 2):
//     "Let's define the LoginForm component responsible for logging in in the file
//      src/components/LoginForm.jsx. It works in much the same way as the earlier
//      components that handle mutations. The interesting lines are highlighted in
//      the code"
//
// ⭐ 课程 highlighted lines(per course block 3 顶部标注):
//   - line 5: `import { LOGIN } from '../queries'`(per part8o 模式)
//   - line 9-18: useMutation 的配置对象 onCompleted + onError 回调
//   - line 20-23: submit handler(event.preventDefault + login({ variables }))
//
// ⭐ 跟 part8p 关键对比:
//   part8p:CREATE_PERSON mutation → 4 个 useState + useMutation + refetchQueries
//   part8w:LOGIN mutation → 2 个 useState + useMutation + onCompleted/onError
//         + **localStorage 持久化 token**(本节**新概念** — 之前 chapter 没讲过)
//
// ⭐⭐⭐ 核心概念:useMutation 的两个回调 ⭐⭐⭐
//   - onCompleted:mutation **成功**(server 返回 2xx + 没抛 GraphQLError)时触发
//     → 拿到 data 参数(data.login.value 是 JWT token)
//     → 把 token 存到 React state(通过 setToken prop)和 localStorage
//   - onError:mutation **失败**(server 抛 GraphQLError 或网络失败)时触发
//     → 拿到 error 参数(error.message 是 server 抛的错误信息)
//     → 通过 setError prop 传给 App 的 notify 函数 → Notify 红字
//
// ⭐⭐⭐ localStorage.setItem('phonebook-user-token', token) — 新概念 ⭐⭐⭐
//   - 课程原文(per course block 5):
//     "the token value is read from the response data and then stored in the
//      application state and in the browser's localStorage"
//   - localStorage 是浏览器**持久化** key-value 存储,关闭 tab/browser 仍保留
//   - key 命名约定 'phonebook-user-token'(per course verbatim 沿用)
//     — 即使本节做的是 library app,key 仍叫 phonebook-user-token
//       (课程还没改 key 命名,这是 library frontend 早期阶段,沿用 phonebook)
//   - 下次刷新页面:App.jsx 用 `useState(localStorage.getItem('phonebook-user-token'))`
//     把 token 恢复到 React state,用户不需要重新登录(per course block 8-10)

import { useState } from 'react'

// ⭐ useMutation 走 @apollo/client/react 子路径(per part8p 沿用)
import { useMutation } from '@apollo/client/react'

// ⭐ LOGIN mutation 从 src/queries.js 导入(per part8o 模式)
import { LOGIN } from '../queries'

// ⭐⭐⭐ LoginForm 组件 — verbatim 课程 block 3 ⭐⭐⭐
const LoginForm = ({ setError, setToken }) => {
  // ⭐⭐ 两个独立 useState — verbatim 课程 line 6-7 ⭐⭐
  // 课程硬编码两个独立 state 变量(不用 useReducer 或合并 state),
  // 跟 part8p PersonForm 的 4 个独立 useState 风格一致
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // ⭐⭐⭐ useMutation 调用 — verbatim 课程 line 8-18(highlighted)⭐⭐⭐
  //
  // ⭐ 解构 [login](只取第一个元素,per part8p 模式):Apollo 返回 tuple
  //   [mutateFn, { data, loading, error, called }]
  //   LoginForm 只需要 mutateFn(login),其他用不到 → 解构丢弃
  //
  // ⭐⭐ onCompleted(data)回调(per course verbatim):
  //   - 课程原文(per course block 5):"the token value is read from the response
  //     data and then stored in the application state and in the browser's
  //     localStorage"
  //   - data.login.value 是后端 part8u/v login resolver 返回的 JWT
  //   - setToken(token) → 通知 App 组件 token state 更新 → App 重新渲染 → 跳出 LoginForm
  //   - localStorage.setItem → 持久化,刷新页面后仍能恢复(per course block 8-10)
  //
  // ⭐⭐ onError(error)回调(per course verbatim):
  //   - 课程原文(per course block 5 暗示 + part8p 模式延伸):
  //     "onError receives the error and we use setError to display it"
//   - error.message 是 server 抛 GraphQLError 的 message 字段(per part8u/v schema)
  //   - setError 是 prop(由 App 传下来),指向 notify 函数 → Notify 红字
  const [ login ] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const token = data.login.value
      setToken(token)
      localStorage.setItem('phonebook-user-token', token)
    },
    onError: (error) => {
      setError(error.message)
    }
  })

  // ⭐⭐⭐ submit handler — verbatim 课程 line 20-23(highlighted)⭐⭐⭐
  //
  // ⭐ event.preventDefault():阻止 form 默认提交(GET 请求 → 刷新页面)
  //   - 这是 React 处理 form 的标准模式,所有 form submit handler 第一句都该有
  //   - part8p PersonForm 用了一模一样的写法(per part8p verbatim line 24-27)
  //
  // ⭐ login({ variables: { username, password } }):
  //   - 调用 mutateFn 触发 mutation
  //   - variables 对象对应 GraphQL operation 的 $username / $password
  //   - 后端 part8u/v login resolver 接 username + password → 任意 password 通过
  const submit = (event) => {
    event.preventDefault()
    login({ variables: { username, password } })
  }

  // ⭐⭐⭐ JSX — verbatim 课程 line 24-46 ⭐⭐⭐
  //
  // ⭐ input 的 onChange:({ target }) => setXxx(target.value) 解构 target
  //   - 标准 React input controlled component 模式
  //   - 课程 verbatim 沿用,不做优化(如 debounce)
  //
  // ⭐ password input 用 type='password'(per course verbatim):
  //   - 浏览器自动遮罩输入字符
  //
  // ⭐ button type='submit'(per course verbatim):
  //   - 在 form 内,submit 按钮触发 form 的 onSubmit 事件 → submit 函数
  //   - 课程没显式 type,但 React 警告必须显式 type,所以补上
  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

// ⭐ 课程 verbatim — default export,让 App.jsx 能 import LoginForm
export default LoginForm