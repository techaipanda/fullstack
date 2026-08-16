// ===== part6b — ### More complex state(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#more-complex-state
// 课程原文 verbatim:part6b.md L173-L189 — NoteList 终态(不知道 filter 存在)。
//
// verbatim 1:1 对照(L173-L189):
//   import { useNotes } from '../store'
//   import Note from './Note'
//
//   const NoteList = () => {
//     // component gets always the properly filtered set of notes
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
// 课程 L171 强调:"The function useNotes thus always returns a list of notes
// filtered in the desired way. The consumer of the function, the NoteList
// component, doesn't even need to be aware of the filter's existence"
// 这是把 filter 逻辑搬到 store.js 的核心收益 — NoteList 完全不知道 filter,
// 只调 useNotes() 拿到的就是已经过滤好的 notes。
//
// 关键变化 vs 上一节(part6a L673-L773):
//   1. 不再 import `useFilter` — filter 状态不在 NoteList 关心范围
//   2. 不再有 `const notesToShow = notes.filter(...)` — filter 在 useNotes 内部
//   3. 不再有 filter 三元逻辑 — 全在 store.js 处理
//   4. 跟上一节 L692-L707 的代码几乎一样(只是少了一行 notesToShow 提取)
//
// 这是 verbatim 1:1 推进的典型案例:课程前半部分(L123-L147)的 NoteList 比
// 终态多几行 filter 逻辑,课程最终砍掉。直接实现终态 L173-L189。

import { useNotes } from '../store'
import Note from './Note'

const NoteList = () => {
  // component gets always the properly filtered set of notes
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