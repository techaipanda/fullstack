// part5 b — App.jsx
// 课程章节: "b — props.children and component refs"
//
// 本文件相对 part5 a 的关键改动:
// 1. 引入 LoginForm、NoteForm、Togglable 三个新组件
// 2. loginForm() 用 Togglable 包 LoginForm
// 3. noteForm() 用 Togglable 包 NoteForm,并通过 useImperativeHandle
//    暴露的 ref 在 addNote 后自动收起表单
// 4. newNote state 从 App 移到 NoteForm 内部,addNote 改为接收 noteObject
// 5. 创建的笔记 important 字段硬编码为 true(去掉 Math.random)
//
// 保留: handleLogin / handleLogout / 两个 useEffect(localStorage + getAll) /
// toggleImportanceOf / Notification / Footer / 笔记列表 JSX 渲染
import { useState, useEffect, useRef } from 'react'
import noteService from './services/notes'
import loginService from './services/login'
import Note from './components/Note'
import Notification from './components/Notification'
import Footer from './components/Footer'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import NoteForm from './components/NoteForm'

const App = () => {
  const [notes, setNotes] = useState([])
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  // part5 a — 登录表单的两个受控输入
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  // part5 a — 当前登录用户
  const [user, setUser] = useState(null)

  // part5 a — 启动时拉取全部笔记
  useEffect(() => {
    noteService.getAll().then(initialNotes => {
      setNotes(initialNotes)
    })
  }, [])

  // part5 a — 启动时尝试从 localStorage 读回 user
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  // part5 a — handleLogin
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

  // part5 a — handleLogout
  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteappUser')
    setUser(null)
  }

  // part5 b — useRef 给 noteForm 一个引用,addNote 完成后收起表单
  // ① useRef() 创建一个"跨 render 持久、不触发渲染"的盒子 { current: undefined }
  //    (类似电视遥控器的"接收器"——盒子本身没功能,等 Togglable 主动塞东西进去)
  const noteFormRef = useRef()

  // part5 b — loginForm() 用 Togglable 包 LoginForm
  const loginForm = () => (
    <Togglable buttonLabel='login'>
      <LoginForm
        username={username}
        password={password}
        handleUsernameChange={({ target }) => setUsername(target.value)}
        handlePasswordChange={({ target }) => setPassword(target.value)}
        handleSubmit={handleLogin}
      />
    </Togglable>
  )

  // part5 b — noteForm() 用 Togglable 包 NoteForm
  // ② ref={noteFormRef}:把盒子递给 Togglable,告诉它:"你要给我什么能力,请放进这个盒子"
  const noteForm = () => (
    <Togglable buttonLabel='new note' ref={noteFormRef}>
      <NoteForm createNote={addNote} />
    </Togglable>
  )

  // part5 b — addNote 改为接收 noteObject 参数
  // 注意:课程原文先调 toggleVisibility() 再发请求,顺序固定
  const addNote = (noteObject) => {
    // ③ 按"盒子里的开关" → 实际就是调 Togglable 内部那个 toggleVisibility
    noteFormRef.current.toggleVisibility()
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
      })
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

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      {/* part5 a — 条件渲染 + part5 b — loginForm/noteForm 用 Togglable 包装 */}
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