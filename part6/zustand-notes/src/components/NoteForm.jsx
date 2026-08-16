// ===== part6b — ### Sending data to server(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#sending-data-to-the-server
// 课程原文 verbatim:part6b.md L515-L540 — NoteForm 改用 createNew。
//
// 课程叙事弧(L515-L543):
//   上一节 NoteForm 是客户端 generateId + add({id, content, important:false})。
//   这一节要变成异步:先 POST 到 server 拿 id,再 add 服务器返回的 note。
//   - 课程 L527 `const newNote = await noteService.createNew(content)` 是 highlight-line
//   - 课程 L528 `add(newNote)` — 直接 add 服务器返回的 note(已经带 id + important:false)
//   - addNote 变 async 函数(因为 await)
//
// verbatim 1:1 对照(L515-L540):
//   import { useNoteActions } from './store'
//   import noteService from '../services/notes'
//
//   const NoteForm = () => {
//     const { add } = useNoteActions()
//
//     const addNote = async (e) => {
//       e.preventDefault()
//       const content = e.target.note.value
//       const newNote = await noteService.createNew(content) // highlight-line
//       add(newNote)
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
// 关键变化 vs 上一节(part6a More components L598-L671):
//   1. 新增 `import noteService from '../services/notes'`
//   2. `addNote` 从 `(e) => {...}` 变成 `async (e) => {...}`
//   3. 删除 `generateId` 函数 — id 现在由 server 生成
//   4. 删除 `add({ id: generateId(), content, important: false })` 改成:
//        const newNote = await noteService.createNew(content)
//        add(newNote)
//   5. 注意路径是 `'./store'` 而不是上一节的 `'../store'`
//      — 课程 L518 verbatim 是 `'./store'`,但 NoteForm 在 src/components/
//      子目录,正确路径应该是 `'../store'`。我跟随课程 verbatim 的逻辑意图
//      (从组件视角的相对路径)用 `'../store'`(组件所在目录的上一层才是 src/)。
//      ⚠️ 严格 1:1 的话要用课程 L518 的 `'./store'`,但那会找不到模块(因为
//      课程示例项目的 NoteForm 路径可能不同)。我已在 src/components/NoteForm.jsx
//      实测 `'../store'` 是正确的解析路径。
//
// 课程 L543:"When a new note is created in the backend by calling the function
// createNew(), we get back an object describing the note, for which the backend
// has generated an id."

import { useNoteActions } from '../store'
import noteService from '../services/notes'

const NoteForm = () => {
  const { add } = useNoteActions()

  const addNote = async (e) => {
    e.preventDefault()
    const content = e.target.note.value
    const newNote = await noteService.createNew(content) // highlight-line
    add(newNote)
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