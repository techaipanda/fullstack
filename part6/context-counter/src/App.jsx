// ===== part6 — Context API =====
// 课程章节: https://fullstackopen.com/en/part6/react_query_context_api
// 课程原文 verbatim: 课程 §App.jsx Version 4(final)。
//
// verbatim 1:1 对照(课程 §App.jsx final 抽取):
//   - 只有 8 行(import Panel + Footer + Navbar,JSX 包 Navbar/Panel/Footer)
//   - 关键:App.jsx 不持有任何 state,也不 import useState
//   - 因为状态被抽到 CounterContextProvider 里(在 main.jsx wrap 了 App)
//
// 课程末段指向仓库 https://github.com/fullstack-hy2020/context-counter
// 本文件 verbatim 与该仓库 src/App.jsx 一致。

import Panel from './components/Panel'
import Footer from './components/Footer'
import Navbar from './components/Navbar'

const App = () => {

  return (
    <div>
      <Navbar />
      <Panel />
      <Footer />
    </div>
  )
}

export default App