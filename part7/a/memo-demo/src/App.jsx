// ============================================================================
// part7 a.2 + a.3 + a.4 — 父组件 App
// 演示 useMemo(a.2) + React.memo(a.3) + useCallback(a.4) 三件套配对
// 关联:README.md a.2/a.3/a.4 各段 + 课程 verbatim
// ============================================================================

import { useState, useMemo, useCallback } from 'react'
import FilteredList from './FilteredList.jsx'
import SearchResults from './SearchResults.jsx'   // 已被 React.memo 包裹(见 SearchResults.jsx)
import MyComponent from './MyComponent.jsx'       // 课程 a.3 verbatim 演示组件
import IncrementButton from './IncrementButton.jsx' // 课程 a.4 verbatim 演示组件(接收函数 prop)

const App = () => {
  // App 顶层 input 的过滤词,会同时控制 SearchResults 和 FilteredList
  const [filter, setFilter] = useState('')
  // 独立 state 用来"故意让父组件重渲染"
  // 验证:切换它时,React.memo 包裹的子组件应该**跳过** render
  const [other, setOther] = useState(0)
  // a.4 新增:IncrementButton 的 count state
  const [count, setCount] = useState(0)

  // ==========================================================================
  // ⭐ 核心概念(a.2):为什么对象 props 必须配合 useMemo,React.memo 才能生效?
  // ==========================================================================
  // React.memo 对 props 做 shallow equality(Object.is):
  //   - primitive(字符串/数字/布尔)→ 比值
  //   - 对象/数组/函数 → 比**引用**(同一对象才算相等)
  //
  // 我们的 options 是对象,记住这个事实:
  //   ❌ 没有 useMemo 时:
  //     const options = { caseSensitive: false, filter }
  //     父组件 App 每次 render 都会执行这行代码,
  //     JS 创建一个**新的对象**({...})— 即使 filter 没变,引用也跟上次不同。
  //     React.memo 跑 Object.is(prevOptions, newOptions) → false → memo 失效
  //     → SearchResults 仍然 re-render(即使 props "看起来"一样)
  //
  //   ✅ 用 useMemo 包裹:
  //     const options = useMemo(() => ({ ... }), [filter])
  //     - filter 变了 → 重新生成 options → 引用不同 → SearchResults re-render
  //     - filter 没变 → 返回**上次那个对象的引用** → Object.is 相等 → memo 命中 → 跳过 render
  //
  // 对比 MyComponent(value 是字符串):
  //   value 是 primitive,React.memo 比的是 'hello' === 'hello' → true
  //   即使没用 useMemo,只要值没变,就跳过 render
  //
  // 所以:
  //   - 对象/数组/函数 props → 必须配合 useMemo / useCallback 才能让 React.memo 生效
  //   - primitive props → React.memo 自动就能工作
  // ==========================================================================
  const options = useMemo(() => ({ caseSensitive: false, filter }), [filter])

  // 演示 a.3 verbatim 的 MyComponent: 接收一个字符串 value
  // 字符串是 primitive,值比较
  const myValue = useMemo(() => `hello ${filter}`, [filter])

  // ==========================================================================
  // ⭐ 核心概念(a.4):useCallback — 缓存函数引用,让 React.memo 不再失效
  // ==========================================================================
  // 函数(箭头函数)在 JS 里是对象引用 — 跟 options 对象是同一类问题。
  //
  //   ❌ 没有 useCallback 时:
  //     const handleIncrement = () => setCount(c => c + 1)
  //     父组件 App 每次 render 都执行 `() => ...` → 创建一个**新函数对象**
  //     → 引用每次都不同 → React.memo 跑 Object.is(prevFn, newFn) = false
  //     → IncrementButton memo 失效 → 跟着父组件一起 re-render
  //
  //   ✅ 用 useCallback 包裹:
  //     useCallback(fn, deps) 只在 deps 变化时返回**同一个函数引用**,
  //     否则返回上次缓存的函数 — 跟 useMemo 缓存值的语义一致
  //     (事实上 useCallback(fn, deps) ≈ useMemo(() => fn, deps))
  //
  //   验证: 在 src/IncrementButton.jsx 加了 console.log
  //     - filter 变了 → App re-render → 如果 handleIncrement 引用稳定 → IncrementButton 跳过(看不到日志)
  //     - setCount / setOther 触发 re-render → 同上,IncrementButton 跳过
  //     - 直接改成 `const handleIncrement = () => setCount(c => c + 1)`(不用 useCallback)
  //       → 每次 re-render 都看到 'IncrementButton rendered'(memo 失效)
  //
  // 依赖项说明:
  //   setCount 是 React 保证稳定引用(setState 函数本身),所以可以放空 deps `[]`
  //   课程里用的是 `() => setCount(c => c + 1)`(函数式更新,不依赖外部 count),
  //   所以 deps 是空数组 `[]`,handleIncrement 引用**永远不变**
  //   (只要 App 不卸载,这个函数就一直复用同一个引用)
  // ==========================================================================
  const handleIncrement = useCallback(() => setCount(c => c + 1), [])

  return (
    <div>
      <h1>part7 a.2/a.3/a.4 — useMemo + React.memo + useCallback demo</h1>
      <div>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="filter items"
        />
      </div>
      <div>
        {/* 故意让父组件重渲染,但跟 SearchResults/MyComponent 的 props 都无关 */}
        <button onClick={() => setOther(other + 1)}>
          bump unrelated state ({other})
        </button>
      </div>
      <div>
        {/* a.4 演示:count + IncrementButton(被 React.memo 包裹,接收函数 prop) */}
        <p>count: {count}</p>
        <IncrementButton onIncrement={handleIncrement} />
      </div>
      <SearchResults options={options} />
      <MyComponent value={myValue} />
      <FilteredList />
    </div>
  )
}

export default App
