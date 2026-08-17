// ===== part6b — ### Async actions(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#async-actions
// 课程原文 verbatim:part6b.md L551-L569 — App 不再调 noteService.getAll。
//
// 课程叙事弧(L551-L569):
//   上一节 App 自己 `noteService.getAll().then(notes => initialize(notes))`,
//   fetch 散落在组件里。
//   这一节 App 只 `initialize()`(无参)— fetch 全部搬进 store action。
//
// verbatim 1:1 对照(L551-L569):
//   const App = () => {
//     const { initialize } = useNoteActions()  // highlight-line
//
//     useEffect(() => {
//       initialize()  // highlight-line
//     }, [initialize])
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
// 关键变化 vs 上一节(L336-L434 Fetching data):
//   1. 删除 `import noteService from './services/notes'` — fetch 在 store 里
//   2. useEffect body 从 `noteService.getAll().then(notes => initialize(notes))`
//      简化为 `initialize()`(initialize 变成无参 async,内部自己 await noteService.getAll)
//
// 课程 L431-L433 细节仍在 — initialize 在依赖数组里是 good practice。
//
// 课程 L617:"The functions add and initialize have thus been changed into
// asynchronous functions, which first call the appropriate noteService function,
// and then update the state."

import { useEffect } from 'react'
import { useNoteActions } from './store'
import NoteForm from './components/NoteForm'
import VisibilityFilter from './components/VisibilityFilter'
import NoteList from './components/NoteList'

const App = () => {
  const { initialize } = useNoteActions() // highlight-line

  // highlight-start
  useEffect(() => {
    initialize() // highlight-line
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