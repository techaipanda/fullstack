// ⭐ part7 c — Error Boundary 子节 —— 课程原文"Usage Pattern"verbatim
// 课程原文:"You can wrap any part of your component tree with an error boundary to
// contain failures to that subtree: ... If Notes throws an error, only that section
// shows the fallback. Persons continues to work normally."
//
// 关键 ⭐ 课程概念:
//   - Notes 和 Persons 是被 ErrorBoundary 各自独立包裹的两个兄弟组件
//   - 包裹位置选在 App 层(也可以选更细粒度的层级 —— 粒度越细,失败爆炸半径越小)
//   - 课程没定义 Notes / Persons(假设读者已经有自己的项目),本子项目里这两个是 ⭐ stub

import ErrorBoundary from './ErrorBoundary'
import Notes from './Notes'
import Persons from './Persons'

const App = () => {
  return (
    <div>
      {/* ⭐ ErrorBoundary 隔离:Notes 出错不会蔓延到 Persons */}
      <ErrorBoundary>
        <Notes />
      </ErrorBoundary>
      {/* ⭐ 独立 ErrorBoundary:即使 Notes 已经挂了 fallback,Persons 仍然正常 */}
      <ErrorBoundary>
        <Persons />
      </ErrorBoundary>
    </div>
  )
}

export default App