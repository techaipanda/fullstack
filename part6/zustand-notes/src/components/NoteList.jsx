// ===== part6a — ### More components and functionality(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#more-components-and-functionality
// 课程原文 verbatim:part6a.md L692-L707 — NoteList 组件。
//
// verbatim 1:1 对照(L692-L707):
//   import { useNotes } from '../store'      // highlight-line
//   import Note from './Note'
//
//   const NoteList = () => {
//     const notes = useNotes()
//
//     return (
//       <ul>
//         {notes.map(note => (
//           <Note key={note.id} note={note} />
//         ))}
//       </ul>
//     )
//   }
//
// 课程 L709 强调:"The component fetches the list of notes from the store and
// creates a corresponding Note component for each, passing the note's data
// as props" — 这是经典的 "list + item" 拆分:
//   - NoteList 负责列表容器 + 数据 fetch(useNotes)
//   - Note 负责单条渲染 + 交互(toggle importance)
//
// 关键设计点:
//   1. `key={note.id}` 放在 list 渲染处(L702),不在 Note 内部 — 这是 React
//      的规则:key 必须出现在调用 map 的父组件的 JSX 里,用于 React diff 算法。
//      把 key 写在 Note 内部是错的。
//   2. `note={note}` 作为 prop 传给 Note — 单值对象,Note 用解构接 `{ note }`。
//   3. NoteList 不消费 useNoteActions — 它只读不写。toggle 是 Note 自己的事
//      (L725),不是 list 的事。这是关注点分离。
//
// 路径注意:
//   `'../store'` — store 在 src/store.js,组件在 src/components/
//   `'./Note'` — Note 是 NoteList 的 sibling,在同一目录

import { useNotes } from '../store'      // highlight-line
import Note from './Note'

const NoteList = () => {
  const notes = useNotes()

  return (
    <ul>
      {notes.map(note => (
        <Note key={note.id} note={note} />
      ))}
    </ul>
  )
}

export default NoteList