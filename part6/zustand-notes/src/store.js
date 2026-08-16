// ===== part6a — ### More components and functionality(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#more-components-and-functionality
// 课程原文 verbatim:part6a.md L744-L765 — 加上 toggleImportance action。
//
// verbatim 1:1 对照(L744-L765):
//   import { create } from 'zustand'
//
//   const useNoteStore = create(set => ({
//     notes: [],
//     actions: {
//       add: note => set(
//         state => ({ notes: state.notes.concat(note) })
//       ),
//       toggleImportance: id => set(
//         state => ({
//           notes: state.notes.map(note =>
//             note.id === id ? { ...note, important: !note.important } : note
//           )
//         })
//       )
//     }
//   }))
//
//   export const useNotes = () => useNoteStore(state => state.notes)
//   export const useNoteActions = () => useNoteStore(state => state.actions)
//
// 课程 L767-L771 解释 toggle 逻辑:
//   "The new state is formed from the old state using the map function such
//    that all old notes are included, except for the note to be modified, for
//    which a version is created where its importance is toggled:
//    { ...note, important: !note.important }"
//
// 关键设计点:
//   1. (L750-L752) add 不变 — 上一节 verbatim
//   2. (L754-L760) toggleImportance 用 Array.map 创建新数组:
//
//        state.notes.map(note =>
//          note.id === id ? { ...note, important: !note.important } : note
//        )
//
//      - 用 map 而不是 forEach/for — 因为要"创建新数组"维持不可变
//      - 三元表达式选 note — 命中 id 的换成新 spread 对象 `{ ...note,
//        important: !note.important }`,其他原样返回
//      - spread `{ ...note }` 而不是 `Object.assign({}, note)` — 课程选 spread
//        因为更现代、更短(课程 L770 明确用 spread)
//   3. ⚠️ 课程原文 L753 / L761 有 `// highlight-start` / `// highlight-end`
//      注释标记 — 它们在 store 顶层 set 调用旁,**不在 JSX 里**,是合法 JS
//      注释,保留 verbatim(不影响运行时)
//
// 课程 L773:"The current code of the application is available in its entirety
// on GitHub, in the branch part6-2" — 整个 L673-L773 范围对应 part6-2 分支。

import { create } from 'zustand'

const useNoteStore = create(set => ({
  notes: [],
  actions: {
    add: note => set(
      state => ({ notes: state.notes.concat(note) })
    ),
    // highlight-start
    toggleImportance: id => set(
      state => ({
        notes: state.notes.map(note =>
          note.id === id ? { ...note, important: !note.important } : note
        )
      })
    )
     // highlight-end
  }
}))

export const useNotes = () => useNoteStore(state => state.notes)
export const useNoteActions = () => useNoteStore(state => state.actions)