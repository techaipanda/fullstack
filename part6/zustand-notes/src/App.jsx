// ===== part6b — ### Fetching data from the server(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#fetching-data-from-the-server
// 课程原文 verbatim:part6b.md L409-L427 — App 用 useEffect 拉取 notes。
//
// verbatim 1:1 对照(L409-L427):
//   const App = () => {
//     const { initialize } = useNoteActions()
//
//    // highlight-start
//     useEffect(() => {
//       noteService
//         .getAll()
//         .then(notes => initialize(notes))
//     }, [initialize])
//    // highlight-end
//
//     return (
//       <div>
//         <NoteForm />
//         <VisibilityFilter />
//         <NoteList />
//       </div>
//     )
//   }
//
// 课程 L429:"The notes are thus fetched from the server using the getAll()
// function we defined and then stored using the store's initialize function.
// These actions are done in the useEffect hook, meaning they are executed
// during the first render of the App component."
//
// 课程 L431-L433 重要细节:
//   - initialize 必须在 useEffect 的依赖数组里(否则 ESLint 警告)
//   - 课程说:"The code would work logically exactly the same even if we used
//     an empty dependency array, because initialize refers to the same function
//     throughout the program's execution. However, it is good programming
//     practice to add all variables and functions used by the useEffect hook
//     that are defined inside the component to the dependencies."
//
// 课程 L419-L425 的 JSX 顺序与原 More complex state 终态一致:
//   NoteForm
//   VisibilityFilter
//   NoteList
//
// ⚠️ 严格 verbatim:课程 L415 是 `noteService.getAll().then(notes => initialize(notes))`
//    我在格式化时把它拆成多行(`.getAll()` 独立一行),逻辑等价。课程 .then() 也写成
//    `notes => initialize(notes)` 而不是 `initialize` 简写 — 保留 verbatim 风格。

import { useEffect } from 'react'
import noteService from './services/notes'
import { useNoteActions } from './store'
import NoteForm from './components/NoteForm'
import VisibilityFilter from './components/VisibilityFilter'
import NoteList from './components/NoteList'

const App = () => {
  const { initialize } = useNoteActions()

  // highlight-start
  useEffect(() => {
    noteService
      .getAll()
      .then(notes => initialize(notes))
  }, [initialize])
  // highlight-end

  return (
    <div>
      <NoteForm />
      <VisibilityFilter />
      <NoteList />
    </div>
  )
}

export default App