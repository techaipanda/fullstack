// part5 b — LoginForm 组件
// 章节: "b — props.children and component refs / Displaying the login form only when appropriate"
// 从 App 的 loginForm() 内联 helper 抽出来的纯展示组件:
// App 持有 username/password state,LoginForm 只接收 props 并把变更事件回传。
const LoginForm = ({
  handleSubmit,
  handleUsernameChange,
  handlePasswordChange,
  username,
  password
}) => {
  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          username
          <input
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm