// ===== part6 — Context API =====
// verbatim 1:1 从 https://github.com/fullstack-hy2020/context-counter/blob/main/src/components/Navbar.jsx 抽取。
// 课程正文没有给 Navbar verbatim,只通过 App.jsx 的 <Navbar /> JSX 引用,
// 因此本文件 verbatim 与课程官方仓库一致。

const navStyle = {
  background: '#4a5568',
  color: 'white',
  padding: '10px 20px',
  fontSize: '1.2rem',
  fontWeight: 'bold',
}

const Navbar = () => {
  return (
    <nav style={navStyle}>counter app</nav>
  )
}

export default Navbar