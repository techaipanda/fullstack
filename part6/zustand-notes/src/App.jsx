// ===== part6a — ### Zustand notes(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#zustand-notes
// 课程原文 verbatim:part6a.md L498-L517 — App render seed note。
//
// verbatim 1:1 对照(L498-L516):
//   import { useNotes } from './store'
//
//   const App = () => {
//     const notes = useNotes()
//
//     return (
//       <div>
//         <ul>
//           {notes.map(note => (
//             <li key={note.id}>
//               {note.important ? <strong>{note.content}</strong> : note.content}
//             </li>
//           ))}
//         </ul>
//       </div>
//     )
//   }
//   export default App
//
// 课程 L537 强调:"The state has been initialized with one note already added so
// that we can verify the application can successfully render the state."
// — 本节没有 add 功能,只能看到 store 初始化时塞的那一条 seed note。
// 这是有意的渐进设计:先验证 "能读",下一节再加 "能写"。
//
// 课程 L537 进一步提醒:"The application does not have the functionality to
// add new notes, and the store does not yet support it" — store 现在确实没有
// actions,L539 才会引入。

import { useNotes } from './store'

const App = () => {
  const notes = useNotes()

  return (
    <div>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            {note.important ? <strong>{note.content}</strong> : note.content}
          </li>
        ))}
      </ul>
    </div>
  )
}
export default App