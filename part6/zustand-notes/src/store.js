// ===== part6a — ### Zustand notes(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#zustand-notes
// 课程原文 verbatim:part6a.md L492-L537 — 首次建立 Zustand notes 项目雏形。
//
// 课程叙事弧:
//   hook-counter 已经演示了 Zustand 的 create/set/actions 模式(简单 counter),
//   现在开始做更完整的应用:notes。L492-L537 这一节是 "### Zustand notes" 子标题,
//   只做到"能 render 一条 seed note 即可",故意不写 actions 也没暴露 selector
//   的细节 — 让读者先看到最简形态,下一节(L539 起)再讲 immutable + actions。
//
// verbatim 1:1 对照(L519-L535):
//   import { create } from 'zustand'
//
//   const useNoteStore = create(set => ({
//     notes: [
//       {
//         id: 1,
//         content: 'Zustand is less complex than Redux',
//         important: true,
//       },
//     ],
//   }))
//
//   export const useNotes = () => useNoteStore(state => state.notes)
//
// 关键设计选择(与 hook-counter 终态不同 — 课程有意为之):
//   1. 名字叫 `useNoteStore`(整个 store),不是 `useCounter` + `useCounterControls`
//      两段式对外 hook。因为这是 "初版 / 演示版",L566 才会改成两段式。
//   2. 没有 actions 字段 — 课程故意先展示"只读 store",L541 才会引入 add。
//   3. 导出的是 selector wrapper(`state => state.notes`),不是裸 store,
//      组件层依然只用 `useNotes()`,不直接触碰 useNoteStore。
//   4. seed note 的 `important: true` 是为了下一节 + 现在的 App render 能看到
//      <strong> 包裹效果,验证分支渲染正确(L507-L510)。

import { create } from 'zustand'

const useNoteStore = create(set => ({
  notes: [
    {
      id: 1,
      content: 'Zustand is less complex than Redux',
      important: true,
    },
  ],
}))

export const useNotes = () => useNoteStore(state => state.notes)