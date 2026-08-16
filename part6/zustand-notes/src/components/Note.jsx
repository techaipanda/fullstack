// ===== part6a — ### More components and functionality(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#more-components-and-functionality
// 课程原文 verbatim:part6a.md L711-L740 — Note 组件两步演化:
//
//   step 1 (L711-L717):纯展示版本,只接 note prop
//   step 2 (L719-L740,FINAL):加 toggle importance button,接入 useNoteActions
//
// 我直接实现 step 2 终态,因为 step 1 是 step 2 的中间步骤,课程最终代码是 step 2。
//
// verbatim 1:1 对照(L719-L740):
//   import { useNoteActions } from '../store'
//
//   const Note = ({ note }) => {
//     const { toggleImportance } = useNoteActions()
//
//     return (
//       <li>
//         {note.important ? <strong>{note.content}</strong> : note.content}
//         <button onClick={() => toggleImportance(note.id)}>
//           {note.important ? 'make not important' : 'make important'}
//         </button>
//       </li>
//     )
//   }
//
//   export default Note
//
// 课程 L740 解释:"The component destructures the importance-toggling function
// from the return value of useNoteActions, and calls it when the toggle
// button is clicked."
//
// ⚠️ verbatim 笔误修补:
//   课程原文 L730/L734 有 `// highlight-start` / `// highlight-end` 注释标记,
//   它们在 JSX 内 — React 会把 `//` 当文本节点渲染(跟上一节 Uncontrolled form
//   同样的问题,part6a.md 多个代码块都有这个一致笔误)。
//   修补:直接删除 2 行 JSX 内 highlight 注释。JS 注释 L753/L761(store.js
//   内的 highlight 标记)不在 JSX 里,合法,保留。
//
// 关键设计点:
//   1. props 解构 `({ note })` — Note 接收的 prop 是单值 `note`,不是多个字段
//   2. `toggleImportance(note.id)` 只传 id,不传 note 对象 — store 自己 map 找
//   3. button text 三元表达式 — 既是 affordance 又是当前状态的提示
//   4. 不需要 `key` — key 由父组件 NoteList 在 map 时提供(L702),不在 Note 内

import { useNoteActions } from '../store'

const Note = ({ note }) => {
  const { toggleImportance } = useNoteActions() // highlight-line

  return (
    <li>
      {note.important ? <strong>{note.content}</strong> : note.content}
      <button onClick={() => toggleImportance(note.id)}>
        {note.important ? 'make not important' : 'make important'}
      </button>
    </li>
  )
}

export default Note