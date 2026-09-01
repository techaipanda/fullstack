// ⭐⭐⭐ App.jsx — part8w "User login" 客户端顶层组件 ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件是 part8w **改** 的客户端顶层组件
//   课程 Chapter 5 "User login" 小节**改 App.jsx** 的 4 处(per course block 7 + 12):
//     1. 加 `import LoginForm from './components/LoginForm'`(block 7 highlighted line 1)
//     2. 加 `useState(localStorage.getItem('phonebook-user-token'))` 初始化 token(block 7 highlighted line 5)
//     3. 加 `if (!token) return LoginForm`(block 7 highlighted lines 20-31)
//     4. 加 `useApolloClient` + `client.resetStore()` logout(button block 12 highlighted)
//
// ⭐ 跟 part8p 的差异(per course 严格 verbatim):
//   part8p App.jsx:硬编码 `<Persons />` + `<PersonForm setError={notify} />` + `<PhoneForm setError={notify} />`
//                 + 无 token state + 无 logout
//   part8w App.jsx:block 7 的 token state + if (!token) return LoginForm
//                 + block 12 的 useApolloClient + onLogout + resetStore
//                 + 用 stub 组件替换完整 Persons/PersonForm/PhoneForm
//
// ⭐⭐⭐ 关键架构:token 是"登录状态"的唯一来源 ⭐⭐⭐
//   - token === null → 未登录 → 显示 LoginForm
//   - token 是 string(JWT)→ 已登录 → 显示 Persons/PersonForm/PhoneForm + logout 按钮
//   - token 持久化到 localStorage 'phonebook-user-token',刷新页面后保留

import { useState } from 'react'

// ⭐ useQuery 走 @apollo/client/react 子路径(per part8p 沿用)
import { useQuery } from '@apollo/client/react'

// ⭐⭐⭐ 新增(per course block 12 highlighted line 1):useApolloClient ⭐⭐⭐
//   - useApolloClient 返回 Apollo client 实例(就是 main.jsx 里 new ApolloClient() 那个)
//   - client 对象有 resetStore() 方法 — 清空整个 Apollo cache
//   - logout 时调 resetStore() 是为了防止:已登录用户 cache 里有自己的"私有数据",
//     登出后切换用户,旧数据不应该泄露给新用户
//   - 课程原文(per course block 13):"Clearing the cache is important, because
//     some queries may have fetched data into the cache that only an authenticated
//     user is allowed to access"
import { useApolloClient } from '@apollo/client/react'

// ⭐⭐⭐ 从 './queries' 拿 ALL_PERSONS(per part8o 沿用 + part8w 加 ALL_PERSONS stub)⭐⭐⭐
import { ALL_PERSONS } from './queries'

// ⭐⭐⭐ 各种组件 imports(per part8p 沿用 + part8w 加 LoginForm)⭐⭐⭐
import Notify from './components/Notify'
import LoginForm from './components/LoginForm'
import Persons from './components/Persons'
import PersonForm from './components/PersonForm'
import PhoneForm from './components/PhoneForm'

// ⭐⭐⭐ App 组件 — verbatim 课程 block 7 + 12(per course highlighted lines 1, 5, 20-31)⭐⭐⭐
const App = () => {
  // ⭐⭐⭐ 新增 token state(per course block 7 highlighted line 5)⭐⭐⭐
  //
  // ⭐ 课程原文(per course block 8):"The token is now initialized from a token
  //   value that may be found in localStorage"
  // ⭐ 课程原文(per course block 10):"This way, the token is also restored when
  //   the page is reloaded, and the user stays logged in. If localStorage does
  //   not contain a value for the key phonebook-user-token, the token value will
  //   be null."
  //
  // ⭐⭐⭐ 用法解析:`useState(localStorage.getItem('phonebook-user-token'))` ⭐⭐⭐
  //   - localStorage.getItem 是浏览器 API,同步读 key
  //   - key 不存在时返回 null(per MDN)
  //   - key 存在时返回字符串(就是 JWT)
  //   - React 把这个初始值存到 token state,后续 setToken(token) 更新
  //   - 首次渲染:有 token → 已登录态(显示 Persons/...);无 token → 未登录态(显示 LoginForm)
  //   - 刷新页面:token 从 localStorage 恢复 → 用户体验"无缝登录"
  const [token, setToken] = useState(localStorage.getItem('phonebook-user-token'))

  // ⭐⭐⭐ errorMessage state + notify 函数(per part8p 沿用)⭐⭐⭐
  //
  // ⭐ 课程 block 7 verbatim:errorMessage 是 App 的本地 state,Notify 通过 prop 拿
  //   - setErrorMessage(message) → Notify 红字显示
  //   - setTimeout(10000) → 10 秒后自动清除
  //   - notify 是 setError 的"包装函数",被 LoginForm onError 回调调用
  // ⭐ 跟 part8p 的**唯一**差异:errorMessage 不再来自 PersonForm 的 mutation 失败
  //   而是来自 LoginForm 的 login mutation 失败(per part8w LoginForm.jsx)
  const [errorMessage, setErrorMessage] = useState(null)
  const result = useQuery(ALL_PERSONS)

  // ⭐⭐⭐ 新增(per course block 12 highlighted line 8):useApolloClient ⭐⭐⭐
  //   - 拿到 Apollo client 实例
  //   - client.resetStore() 用于 logout 时清 cache
  const client = useApolloClient()

  if (result.loading) {
    return <div>loading...</div>
  }

  // ⭐⭐⭐ notify 函数(per part8p 沿用,block 7 也用了)⭐⭐⭐
  //
  // ⭐ 课程 verbatim notify = (message) => { setErrorMessage(message); setTimeout(() => { setErrorMessage(null) }, 10000) }
  //   - setErrorMessage 是 React state setter
  //   - setTimeout 闭包捕获 setErrorMessage,10 秒后置 null → Notify 自动隐藏
  //   - 注意:课程没在 setTimeout 里 clearTimeout — 如果 10 秒内用户重新触发 notify,
  //     旧的 timer 仍会触发,但 setErrorMessage(null) 后再 setErrorMessage(message)
  //     也只是正常切换显示,没有 bug。这是课程简化,生产代码应该加 useRef 跟踪 timer id
  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  // ⭐⭐⭐ 新增 logout handler(per course block 12 highlighted lines 14-18)⭐⭐⭐
  //
  // ⭐ 课程原文(per course block 11):"In the button's click handler, we set
  //   token to null, remove the token from localStorage, and reset the Apollo
  //   Client cache"
  // ⭐ 课程 verbatim:
  //   const onLogout = () => {
  //     setToken(null)             // React state → 触发 re-render → 跳回 LoginForm
  //     localStorage.clear()       // 清整个 localStorage(不只是 phonebook-user-token)
  //     client.resetStore()        // 清 Apollo cache
  //   }
  //
  // ⭐⭐⭐ localStorage.clear() vs localStorage.removeItem() ⭐⭐⭐
  //   - 课程 verbatim 用 clear() — 清**整个** localStorage(可能有其他 key)
  //   - 更精准应该 removeItem('phonebook-user-token') 只清 token key
  //   - 课程用 clear() 是因为这是单 key app,清整个 OK
  const onLogout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  // ⭐⭐⭐ 未登录分支(per course block 7 highlighted lines 20-31)⭐⭐⭐
  //
  // ⭐ 课程原文(per course block 6):"If token is not defined, we render only
  //   the login form"
  //
  // ⭐⭐⭐ token === null 判定 ⭐⭐⭐
  //   - 首次加载:localStorage 没有 token → token state 是 null → 进入此分支
  //   - 用户登出:setToken(null) → token state 是 null → 跳回此分支
  //
  // ⭐ Notify 在最上面(per part8p 沿用):即使未登录也要显示 login mutation 错误
  // ⭐ h2 "Login" 标题:per course verbatim
  // ⭐ LoginForm 接收两个 callback:
  //   - setToken:setToken 函数(loginForm onCompleted 拿到 token 后调)
  //   - setError:notify 函数(loginForm onError 拿到 error.message 后调)
  if (!token) {
    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <h2>Login</h2>
        <LoginForm
          setToken={setToken}
          setError={notify}
        />
      </div>
    )
  }

  // ⭐⭐⭐ 已登录分支(per course block 12 verbatim)⭐⭐⭐
  //
  // ⭐ 课程 verbatim(per course block 12 highlighted lines 25+):
  //   return (
  //     <>
  //       <Notify errorMessage={errorMessage} />
  //       <button onClick={onLogout}>logout</button>
  //       <Persons persons={result.data.allPersons} />
  //       <PersonForm setError={notify} />
  //       <PhoneForm setError={notify} />
  //     </>
  //   )
  //
  // ⭐⭐⭐ 用 Fragment <> 而非 <div> ⭐⭐⭐
  //   - 课程 verbatim 用 Fragment,避免多一层 div 包裹
  //   - per React docs,Fragment 不产生 DOM 节点,纯逻辑分组
  //
  // ⭐ Persons/PersonForm/PhoneForm 在 part8w 都是 stub 占位组件
  //   - <Persons persons={...}>:stub 接收 prop 但不渲染真实数据
  //   - <PersonForm setError={notify}>:stub 接收 setError 但不渲染表单
  //   - <PhoneForm setError={notify}>:stub 接收 setError 但不渲染表单
  //   - 真正的功能等 Chapter 5 "Listing persons" / "Doing mutations"小节做
  //
  // ⭐⭐⭐ logout 按钮设计 ⭐⭐⭐
  //   - 课程硬编码放在 Persons 之前,理由:作为"已登录态的出口"放在最显眼位置
  //   - onLogout 同时清 React state + localStorage + Apollo cache,三处一致
  return (
    <>
      <Notify errorMessage={errorMessage} />
      <button onClick={onLogout}>logout</button>
      <Persons persons={result.data.allPersons} />
      <PersonForm setError={notify} />
      <PhoneForm setError={notify} />
    </>
  )
}

export default App