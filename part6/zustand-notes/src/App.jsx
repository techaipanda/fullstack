// ===== part6a — ### More components and functionality(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#more-components-and-functionality
// 课程原文 verbatim:part6a.md L679-L686 — App 简化到极致,只组合子组件。
//
// verbatim 1:1 对照(L679-L686):
//   const App = () => (
//     <div>
//       <NoteForm />
//       <NoteList />
//     </div>
//   )
//
//   export default App
//
// 课程 L677 强调:"The App component after the change is simple" — 拆完组件后
// App 变成纯容器组件(presentational container),所有业务逻辑下沉到 2 个子组件:
//
//   NoteForm  (src/components/NoteForm.jsx)  — 处理 form 提交 + add action
//   NoteList  (src/components/NoteList.jsx)  — 渲染 notes list
//     └── Note (src/components/Note.jsx)    — 单条 note + toggle importance
//
// App 自己不再:
//   - 直接 import store(useNotes/useNoteActions 都不在 App 里)
//   - 持有任何 state
//   - 处理任何事件
//
// 这就是 React "container component vs presentational component" 的经典拆分:
//   - App = container(组合)
//   - NoteForm / NoteList / Note = presentational(各自管各自的 concern)

import NoteForm from './components/NoteForm'
import NoteList from './components/NoteList'

const App = () => (
  <div>
    <NoteForm />
    <NoteList />
  </div>
)

export default App