// ===== part6 — Context API =====
// verbatim 1:1 从 https://github.com/fullstack-hy2020/context-counter/blob/main/src/components/Panel.jsx 抽取。
// 课程正文给了一个简化版的 Panel(只有 <Display /> + <Controls />),
// 但实际仓库里 Panel 多 import 了一个 Navbar(未在 JSX 渲染)。
// verbatim 1:1 保留这个未使用的 import。

import Display from './Display'
import Controls from './Controls'
import Navbar from './Navbar'

const Panel = () => {
  return (
    <div>
      <Display  />
      <Controls />
    </div>
  )
}
export default Panel