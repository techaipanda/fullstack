// ===== part6a — ### Pure functions and immutable objects(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#pure-functions-and-immutable-objects
// 课程原文 verbatim:part6a.md L539-L596 — 引入 add action + 强制不可变更新。
//
// 课程叙事弧(从 L539 开始):
//   上一节 L537 结尾说:"the store does not yet support [adding new notes]",
//   L539 这一节正式开始加 action。课程先展示错误做法(L543-L550 用 Array.push),
//   引用 Zustand 文档:"Like with React's useState, we need to update state
//   immutably",然后给出正确做法 Array.concat(L558-L564),最终落到 L566-L582 的
//   终态 — actions 子对象 + 两个对外 hook。
//
// 三步演化(全部 verbatim):
//   step 1 (L543-L550):错误示范 — `state.notes.push(note)` 会 mutate state,
//      Zustand 会拒绝/不刷新 UI。课程说"our attempt is, however, against the rules"。
//   step 2 (L558-L564):正确示范 — Array.concat 创建新数组:
//
//      note => set(
//        state => {
//          return { notes: state.notes.concat(note) }
//        }
//      )
//
//   step 3 (L566-L582,FINAL):把 action 收进 `actions` 子对象 + 加 useNoteActions
//      对外 hook。这跟 hook-counter L373-L465 终态一致的 best practice。
//
// verbatim 1:1 对照(L566-L582):
//   import { create } from 'zustand'
//
//   const useNoteStore = create(set => ({
//     notes: [], // highlight-line
//     actions: {
//       add: note => set(
//         state => ({ notes: state.notes.concat(note) })
//       )
//     }
//   }))
//
//   export const useNotes = () => useNoteStore(state => state.notes)
//   export const useNoteActions = () => useNoteStore(state => state.actions)
//
// 关键差异 vs 上一节(L492-L537 终态):
//   1. seed note 移除:`notes: []` 起步 — 因为本节要演示"如何从 0 加",
//      不能再有 seed 干扰(上节 seed 是为了演示 read)。
//   2. actions 子对象模式首次登场 — 跟 hook-counter 终态(L373-L465)对齐。
//   3. useNoteActions 是新对外 hook — 给下一节(L598-L671 "Uncontrolled form")
//      的 App 组件用 `const { add } = useNoteActions()`。
//
// 课程 L584-L592 提到 Array spread 替代 concat:
//   state => ({ notes: [...state.notes, note] })
// 课程原话:"It is a matter of preference whether to use spread or the
// concat function"。本节按 verbatim 用 concat,跟课程保持 1:1。

import { create } from 'zustand'

const useNoteStore = create(set => ({
  notes: [],
  actions: {
    add: note => set(
      state => ({ notes: state.notes.concat(note) })
    )
  }
}))

export const useNotes = () => useNoteStore(state => state.notes)
export const useNoteActions = () => useNoteStore(state => state.actions)