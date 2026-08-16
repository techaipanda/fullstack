// ===== part6b — ### More complex state(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#more-complex-state
// 课程原文 verbatim:part6b.md L75-L107 — VisibilityFilter 组件。
//
// verbatim 1:1 对照(L75-L107):
//   import { useNoteActions } from '../store'
//
//   const VisibilityFilter = () => {
//     const { setFilter } = useNoteActions()
//
//     return (
//       <div>
//         <input
//           type="radio"
//           name="filter"
//           onChange={() => setFilter('all')}
//           defaultChecked
//         />
//         all
//         <input
//           type="radio"
//           name="filter"
//           onChange={() => setFilter('important')}
//         />
//         important
//         <input
//           type="radio"
//           name="filter"
//           onChange={() => setFilter('nonimportant')}
//         />
//         not important
//       </div>
//     )
//   }
//
//   export default VisibilityFilter
//
// 关键设计点:
//   1. 三个 `<input type="radio" name="filter">` — 用同一个 `name` 让浏览器
//      视为 radio group(同一时间只能选中一个)。
//   2. `defaultChecked` 在 'all' input 上 — 让初始页面看到 'all' 选中状态。
//      课程用 `defaultChecked`(非受控)而不是 `checked` — 因为 form 状态在
//      Zustand store,不在 React state。这是 uncontrolled form 思路的延伸。
//   3. `onChange={() => setFilter('all')}` — 直接调 setFilter,不用 SyntheticEvent
//      处理 — 因为只是读 onChange 触发,不需要 event 对象。
//   4. 三个文本 'all' / 'important' / 'not important' 是裸字符串节点,
//      没包成 label — 这是 verbatim 课程原文选择(裸字符串也行,只是
//      不能点击文字触发 radio)。课程刻意如此,verbatim 保留。
//   5. VisibilityFilter 不读 useFilter — 它只 set 不过滤显示。这是 "container
//      只写,presentation 只读"的关注点分离。

import { useNoteActions } from '../store'

const VisibilityFilter = () => {
  const { setFilter } = useNoteActions()

  return (
    <div>
      <input
        type="radio"
        name="filter"
        onChange={() => setFilter('all')}
        defaultChecked
      />
      all
      <input
        type="radio"
        name="filter"
        onChange={() => setFilter('important')}
      />
      important
      <input
        type="radio"
        name="filter"
        onChange={() => setFilter('nonimportant')}
      />
      not important
    </div>
  )
}

export default VisibilityFilter