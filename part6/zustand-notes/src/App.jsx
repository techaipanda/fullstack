// ===== part6b — ### More complex state(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#more-complex-state
// 课程原文 verbatim:part6b.md L111-L119 — App 加 VisibilityFilter。
//
// verbatim 1:1 对照(L111-L119):
//   const App = () => (
//     <div>
//       <NoteForm />
//       <VisibilityFilter /> // highlight-line
//       <NoteList />
//     </div>
//   )
//
// 课程 L109 强调:"The App component renders the filter" — App 仍然是
// 纯容器组件,只是多了一层子组件组合:
//   NoteForm        — 创建 note
//   VisibilityFilter — 选择 filter
//   NoteList        — 渲染 notes(已过滤)
//
// 关键设计点:
//   1. VisibilityFilter 插在 NoteForm 和 NoteList 之间 — UI 顺序跟用户
//      交互流程一致(先创建,再选择显示模式,再看到结果)。
//   2. App 自己依然不知道 store — 不知道 filter 是什么,不知道 notes 是什么。
//   3. 仍然 export default App — main.jsx 不变。

import NoteForm from './components/NoteForm'
import VisibilityFilter from './components/VisibilityFilter'
import NoteList from './components/NoteList'

const App = () => (
  <div>
    <NoteForm />
    <VisibilityFilter />
    <NoteList />
  </div>
)

export default App