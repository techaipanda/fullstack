// ===== part6b — ### Async actions(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#async-actions
// 课程原文 verbatim:part6b.md L572-L592 — NoteForm 不再调 noteService。
//
// 课程叙事弧(L572-L592):
//   上一节 NoteForm 自己 await noteService.createNew(content) + add(返回的 note)。
//   这一节 NoteForm 只调 await add(content) — fetch 全部移到 store action 里。
//
// verbatim 1:1 对照(L572-L592):
//   const NoteForm = () => {
//     const { add } = useNoteActions()  // highlight-line
//
//     const addNote = async (e) => {
//       e.preventDefault()
//       const content = e.target.note.value
//       await add(content)  // highlight-line
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
// 关键变化 vs 上一节(L435-L546 Sending data):
//   1. 删除 `import noteService from '../services/notes'` — fetch 已经搬进 store
//   2. 删除 `const newNote = await noteService.createNew(content)` — 改 `await add(content)`
//   3. 删除 `add(newNote)` — `add(content)` 内部已经 set(concat(server 返回的 note))
//
// 课程 L619:"The solution is elegant; state management and communication with
// the server are entirely separated outside of React components."
// — 组件不再 import 服务层,只看 store。

import { useNoteActions } from '../store'

const NoteForm = () => {
  const { add } = useNoteActions() // highlight-line

  const addNote = async (e) => {
    e.preventDefault()
    const content = e.target.note.value
    await add(content) // highlight-line
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