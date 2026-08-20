import React, { useState } from 'react'

// ⭐ 核心概念:esbuild bundle 的"入口文件"特征
// App.jsx 被 main.jsx import,esbuild 会从 main.jsx 出发,沿着 import 链把所有依赖
// (包括 react、react-dom)一起打包进 dist/main.js 一个文件
// 课程原文如此:无任何额外组件,直接 useState counter
const App = () => {
  // ⭐ 核心概念:useState 是 React 自带 hook,esbuild 不需要任何额外配置就能编译它
  // 验证:改 const [counter, setCounter] = useState(100) 重新 build,看到的初始值是 100
  const [counter, setCounter] = useState(0)

  return (
    <div>
      <p>count: {counter}</p>

      {/* ⭐ 核心概念:onClick 用箭头函数 + 函数式更新
          这里写的是 counter + 1 而不是 (c) => c + 1(函数式更新)。
          课程原文如此:每次都基于当前闭包里的 counter 值。
          在快速连点的极端情况下会丢更新,这是 React 经典坑,课程故意保留。 */}
      <button onClick={() => setCounter(counter + 1)}>increment</button>
    </div>
  )
}

export default App