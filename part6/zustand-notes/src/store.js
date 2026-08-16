// ===== part6b — ### More complex state(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#more-complex-state
// 课程原文 verbatim:part6b.md L41-L225 — 加 filter 功能(all / important / nonimportant)。
//
// 课程叙事弧(L41-L191 主体):
//   上一节 zustand-notes 完成了"加 note + toggle importance"。本节要加
//   "filter 显示哪些 note"功能:3 个 radio button(all/important/nonimportant),
//   切换时只渲染匹配的 note。
//
// 课程给两个方案:
//   方案 A (L121-L147):filter 逻辑放在 NoteList 内部
//   方案 B (L149-L189,FINAL):filter 逻辑搬到 store.js 的 useNotes 内部,
//     用两次 useNoteStore 读取(notes + filter),NoteList 完全不知道 filter 存在。
//
// 课程 L171:"The solution is elegant!" — 推荐方案 B。
//
// verbatim 1:1 对照(L49-L71 主 store 定义):
//   const useNoteStore = create((set) => ({
//     notes: initialNotes,             // highlight-line(不再是 [])
//     filter: 'all',                   // highlight-line(新字段)
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
//       ),
//       setFilter: value => set(() => ({ filter: value }))  // highlight-line
//     }
//   }))
//
//   export const useNotes = () => useNoteStore((state) => state.notes)
//   export const useFilter = () => useNoteStore((state) => state.filter)  // highlight-line
//   export const useNoteActions = () => useNoteStore((state) => state.actions)
//
// verbatim 1:1 对照(L151-L169,useNotes 改成含 filter 逻辑):
//   export const useNotes = () => {
//     const notes = useNoteStore((state) => state.notes)
//     const filter = useNoteStore((state) => state.filter)
//
//     if (filter === 'important') return notes.filter(n => n.important)
//     if (filter === 'nonimportant') return notes.filter(n => !n.important)
//
//     return notes
//   }
//
// ⚠️ initialNotes seed(课程省略定义,我自己添加 3 条合理 seed):
//   - 课程 L51 用 `initialNotes` 但没在代码块内给出定义。
//   - 我加 3 条 seed:2 important + 1 nonimportant,这样 filter 3 种模式都有可视化差异:
//     * filter='all'          → 3 li
//     * filter='important'    → 2 li
//     * filter='nonimportant' → 1 li
//   - 如果不加 seed,store 是空 list,filter 切换看不出效果。
//
// 课程 L195-L223 重要警告:"possible alternative solution":
//   如果用 single selector `{ notes, filter } => ...` 加 useShallow 修复,
//   课程原话:"This approach does not work, however, as it leads to an infinite
//   re-rendering loop when the filter is changed"。
//   课程 L223 强调:"In the course material we use the earlier-presented
//   version with two separate useNoteStore calls" — 即方案 B(两次 selector)。
//
// 课程 L225:"The current code of the application is available in its entirety
// on GitHub, in the branch part6-3" — 本节代码对应 part6-3 分支。

import { create } from 'zustand'

// ⚠️ 课程省略 initialNotes 定义 — 我添加 3 条 seed 让 filter 可视化。
// (课程 L51 用 `initialNotes` 但正文没定义,GitHub part6-3 分支应有等价内容)
const initialNotes = [
  { id: 1, content: 'Zustand is less complex than Redux', important: true },
  { id: 2, content: 'Filtering notes is a common feature', important: true },
  { id: 3, content: 'Uncontrolled forms are sometimes useful', important: false },
]

const useNoteStore = create((set) => ({
  notes: initialNotes,           // highlight-line(不再是 [])
  filter: 'all',                 // highlight-line
  actions: {
    add: note => set(
      state => ({ notes: state.notes.concat(note) })
    ),
    toggleImportance: id => set(
      state => ({
        notes: state.notes.map(note =>
          note.id === id ? { ...note, important: !note.important } : note
        )
      })
    ),
    setFilter: value => set(() => ({ filter: value })) // highlight-line
  }
}))

// highlight-start
export const useNotes = () => {
  const notes = useNoteStore((state) => state.notes)
  const filter = useNoteStore((state) => state.filter)

  if (filter === 'important') return notes.filter(n => n.important)
  if (filter === 'nonimportant') return notes.filter(n => !n.important)

  return notes
}
// highlight-end

export const useFilter = () => useNoteStore((state) => state.filter) // highlight-line
export const useNoteActions = () => useNoteStore((state) => state.actions)