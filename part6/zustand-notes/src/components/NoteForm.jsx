// ===== part6a — ### More components and functionality(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#more-components-and-functionality
// 课程原文 verbatim:part6a.md L673-L773 — 拆组件 + toggle importance。
//
// 课程 L688 对 NoteForm 的说明:
//   "Note creation, i.e., NoteForm, doesn't contain anything dramatic,
//   so the code is not shown here."
// 课程刻意不展示 NoteForm 的代码 — 因为它的逻辑就是上一节(L598-L671)
// App.jsx 里 form + addNote + generateId 那一块原封不动搬过来,没有任何
// 新逻辑。这是 verbatim 1:1 推进的典型场景:课程"心照不宣"地把上节代码
// 拆出来,我按上节 verbatim 1:1 实现这个组件。
//
// verbatim 1:1 对照(从上一节 L602-L637 的 App 内联代码抽出):
//   import { useNoteActions } from '../store'
//
//   const NoteForm = () => {
//     const { add } = useNoteActions()
//
//     const generateId = () => Number((Math.random() * 1000000).toFixed(0))
//
//     const addNote = (e) => {
//       e.preventDefault()
//       const content = e.target.note.value
//       add({ id: generateId(), content, important: false })
//       e.target.reset()
//     }
//
//     return (
//       <form onSubmit={addNote}>
//         <input name="note" />
//         <button type="submit">add</button>
//       </form>
//     )
//   }
//
//   export default NoteForm
//
// 关键变化 vs 上一节 L598-L671(在 App.jsx 里):
//   1. 不再 `import { useNotes }` — NoteForm 不消费 notes 列表(那是 NoteList 的事)
//   2. 不再 import React 之外任何东西 — 完全独立的 UI 子树
//   3. 不再返回 `<ul>` — 列表渲染归 NoteList 管
//   4. 路径从 `'./store'` 改成 `'../store'` — 因为 NoteForm 在 src/components/
//
// 课程设计意图:
//   App 只剩 2 行 JSX(L679-L686) — 完全的容器组件,所有业务逻辑下沉到子组件。
//   这是 single responsibility 的典型:App 只负责组合,子组件各自管各自的 concern。

import { useNoteActions } from '../store'

const NoteForm = () => {
  const { add } = useNoteActions()

  const generateId = () => Number((Math.random() * 1000000).toFixed(0))

  const addNote = (e) => {
    e.preventDefault()
    const content = e.target.note.value
    add({ id: generateId(), content, important: false })
    e.target.reset()
  }

  return (
    <form onSubmit={addNote}>
      <input name="note" />
      <button type="submit">add</button>
    </form>
  )
}

export default NoteForm