// ===== part6b — ### Fetching data from the server(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#fetching-data-from-the-server
// 课程原文 verbatim:part6b.md L395-L405 — store 改为 [] + initialize action。
//
// 课程叙事弧(L393-L429):
//   上一节 ## More complex state 完成后 store 有 initialNotes(3 seed notes)。
//   这一节要让数据从服务器拉,所以:
//     1. notes: initialNotes → notes: []       (highlight-line)
//     2. filter: 'all'       → filter: ''       (课程 verbatim 是空串)
//     3. 加 initialize action:set(() => ({ notes }))  (highlight-line)
//
// verbatim 1:1 对照(L395-L405):
//   const useNoteStore = create((set) => ({
//     notes: [], // highlight-line
//     filter: '',
//     actions: {
//       // ...
//       setFilter: value => set(() => ({ filter: value })),
//       initialize: notes => set(() => ({ notes })) // highlight-line
//     }
//   }))
//
// 课程 L431-L433 关键点:
//   "We have added the initialize function to the dependency array of the
//    useEffect hook. If we try to use an empty dependency array, ESLint gives
//    the following warning: React Hook useEffect has a missing dependency:
//    'initialize'."
//   课程 L433:"The code would work logically exactly the same even if we used
//    an empty dependency array, because initialize refers to the same function
//    throughout the program's execution. However, it is good programming
//    practice to add all variables and functions used by the useEffect hook
//    that are defined inside the component to the dependencies."
//
// ⚠️ filter 从 'all' 改成 '' 是 verbatim 1:1(课程就这么写)。功能上 useNotes 的
//    if-else 'important' / 'nonimportant' 都不匹配,fall through return notes,
//    效果等价于 'all'。这是课程自己前后不一致(More complex state 用 'all'),
//    我按 verbatim 不动它。
//
// ⚠️ initialNotes 已删除 — 课程 L397 `notes: []`,原来 More complex state 我加的
//    3 条 seed 不再需要(数据从 server 来)。

import { create } from 'zustand'

const useNoteStore = create((set) => ({
  notes: [], // highlight-line
  filter: '', // 课程 verbatim 是空串(不是 'all')
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
    setFilter: value => set(() => ({ filter: value })),
    initialize: notes => set(() => ({ notes })) // highlight-line
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

export const useFilter = () => useNoteStore((state) => state.filter)
export const useNoteActions = () => useNoteStore((state) => state.actions)