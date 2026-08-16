// ===== part6a — Using the state from different components(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#using-the-state-from-different-components
// 课程原文 verbatim:part6a.md L264-L280 — 简化后的 App.jsx,只组合 Display + Controls,
// 不再直接访问 store(state 完全在 React 组件外)。
//
// verbatim 1:1 对照(L266-L280):
//   import Display from './Display'
//   import Controls from './Controls'
//
//   const App = () => {
//     return (
//       <div>
//         <Display />
//         <Controls />
//       </div>
//     )
//   }
//
//   export default App
//
// 课程特别指出(L282):"App component no longer passes state to its child components.
// In fact, the component does not touch the state in any way, the store definition
// has been fully separated outside the component." — 这是 Zustand 与 React useState
// 的关键差异:state 不再通过 props 自上而下传递,每个组件直接从 store 取。

import Display from './components/Display'
import Controls from './components/Controls'

const App = () => {
  return (
    <div>
      <Display />
      <Controls />
    </div>
  )
}

export default App