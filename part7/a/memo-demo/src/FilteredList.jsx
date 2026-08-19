// ============================================================================
// part7 a.2 useMemo — 演示文件
// 课程核心问题:每次组件 re-render,函数体都重跑。没必要的重跑会浪费 CPU。
// 解决:useMemo 缓存"昂贵的计算结果",直到依赖数组里的某个值变化为止。
// 关联:对应 README.md 段 4-6,以及课程 verbatim 代码块 2
// ============================================================================

import { useState, useMemo } from 'react'

// ❓ 什么是"昂贵的计算"?
// 这是课程里用来模拟"重计算"的占位函数。真实场景下,它可能是:
// - 大数组的 filter / map / sort
// - JSON.parse / JSON.stringify
// - 正则表达式匹配
// - 第三方库的复杂转换
// 100000 次大整数加法看起来不重,但在 10000 个 item × 100000 次循环 = 10 亿次操作
// 的真实场景下,会让 UI 卡顿。
const expensiveCalculation = () => {
  let sum = 0
  for (let i = 0; i < 100000; i++) sum += i
  return sum
}

// 假装这是从后端拿到的列表(10000 个 item)。
// 模块顶层(组件外)定义 → React 整个生命周期里只有这一份,不会因为 re-render 重建。
// 如果写在组件内,每次 re-render 都会新建一个数组,useMemo 比较引用时会"假阳性失效"。
const ITEMS = Array.from({ length: 10000 }, (_, i) => `item ${i + 1}`)

const FilteredList = () => {
  // 当前过滤词(用户在输入框打的字)
  const [filter, setFilter] = useState('')
  // 是否深色模式 — 跟 filter 无关,但也会触发本组件 re-render
  const [darkMode, setDarkMode] = useState(false)

  // ==========================================================================
  // ⭐ 核心概念:useMemo
  // ==========================================================================
  // useMemo(() => 计算函数, [依赖1, 依赖2, ...]) 的工作方式:
  //
  // 1. 第一次渲染时,执行"计算函数",把结果记下来
  // 2. 后续渲染时:
  //    - 如果 [依赖] 数组里所有值都跟上次一样 → 直接返回上次记的结果(不重算)
  //    - 如果 [依赖] 数组里任意一个值变化了 → 重新执行,记新结果
  //
  // 本例的依赖是 [filter]:
  //   - filter 没变(只是切 dark mode)→ 不重新过滤,跳过 10000 × 100000 次循环
  //   - filter 变了(用户打字)→ 重新过滤,更新列表
  //
  // 验证方法:打开浏览器 DevTools Console,会看到 'filtering...' 的日志。
  //   - 在输入框打字 → 看到 'filtering...' 多次
  //   - 点 "toggle dark mode" → **看不到** 'filtering...'(useMemo 命中缓存)
  // ==========================================================================
  const filtered = useMemo(() => {
    // 故意在 useMemo 内层打日志,这样能直观看到"什么时候真正重算了"
    console.log('filtering...')
    return ITEMS.filter(item => {
      expensiveCalculation() // 模拟耗时操作
      return item.includes(filter)
    })
    //                                                          ↓ deps 数组
    //                                                          filter 变了才重跑
  }, [filter])

  return (
    <div style={{ background: darkMode ? '#333' : '#fff', padding: '1rem' }}>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="filter items"
      />
      <button onClick={() => setDarkMode(!darkMode)}>toggle dark mode</button>
      <ul>
        {filtered.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}

export default FilteredList
