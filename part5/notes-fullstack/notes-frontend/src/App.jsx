// part5 a — App.jsx
// 课程章节: "a — Login in frontend"
//
// 注意:本文件严格按 Full Stack Open 官网 part5 a 章节最终代码 1:1 复刻。
// 章节里把登录表单写成 App 内部的 loginForm() helper,
// 不抽成独立的 LoginForm 组件——这与原书一致。
// 唯一改动是顶部这一段中文注释 + 行内 part5 a 标记,便于学习定位。
import { useState, useEffect } from 'react'
import noteService from './services/notes'
import loginService from './services/login'
import Note from './components/Note'
import Notification from './components/Notification'
import Footer from './components/Footer'

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  // part5 a — 登录表单的两个受控输入
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  // part5 a — 当前登录用户,未登录为 null,登录后为 { token, username, name }
  const [user, setUser] = useState(null)

  // part5 a — 启动时拉取全部笔记
  useEffect(() => {
    noteService.getAll().then(initialNotes => {
      setNotes(initialNotes)
    })
  }, [])

  // part5 a — 启动时尝试从 localStorage 读回 user,实现"刷新仍保持登录"
  // 注意:localStorage 的键名是 'loggedNoteappUser' (a 小写),严格按官网示例
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      // 严格按 Full Stack Open part5 a 章节官方代码 1:1 复刻:
      // 课程原文在 useEffect 内 setUser,把 localStorage 的 user 写回 state。
      // 这是 React 19 之前的官方推荐写法;新版 react-hooks 插件会报此规则。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  // part5 a — handleLogin
  // 成功:写 localStorage + noteService.setToken + setUser + 清空输入
  // 失败:在顶部 Notification 显示 "wrong credentials",5 秒后消失
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user))
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  // part5 a — handleLogout:清 localStorage + setUser(null)
  // 注:官方示例没有清 noteService 模块里的 token——下一次 handleLogin 会覆盖
  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteappUser')
    setUser(null)
  }

  // part5 a — loginForm() helper
  // 官网把登录表单写成 App 内部的函数,不抽成组件
  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        <label>
          username
          <input
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  )

  // part5 a — noteForm() helper
  const noteForm = () => (
    <form onSubmit={addNote}>
      <input value={newNote} onChange={handleNoteChange} />
      <button type="submit">save</button>
    </form>
  )

  const addNote = (event) => {
    event.preventDefault()
    const noteObject = {
      content: newNote,
      important: Math.random() > 0.5,
    }
    noteService.create(noteObject).then(returnedNote => {
      setNotes(notes.concat(returnedNote))
      setNewNote('')
    })
  }

  const handleNoteChange = (event) => {
    setNewNote(event.target.value)
  }

  const toggleImportanceOf = (id) => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }
    noteService.update(id, changedNote).then(returnedNote => {
      setNotes(notes.map(note => note.id !== id ? note : returnedNote))
    })
  }

  const notesToShow = showAll
    ? notes
    : notes.filter(note => note.important === true)

  // part5 a — 条件渲染:
  // 未登录 → loginForm()
  // 已登录 → user.name + logout 按钮 + noteForm()
  // 笔记列表与切换 important/all 的按钮不论是否登录都显示
  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      {!user && loginForm()}
      {user && (
        <div>
          <p>{user.name} logged in</p>
          <button onClick={handleLogout}>logout</button>
          {noteForm()}
        </div>
      )}

      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map(note => (
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        ))}
      </ul>

      <Footer />
    </div>
  )
}

export default App