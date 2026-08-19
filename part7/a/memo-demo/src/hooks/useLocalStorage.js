// ============================================================================
// part7 a 后续 — useLocalStorage(课程 verbatim 自定义 hook)
// 作用:把"状态持久化到 localStorage"封装成可复用 hook
// 关联:README.md "Persisting State with a Custom Hook" 段 + 课程 verbatim
// ============================================================================

import { useState } from 'react'

// ============================================================================
// ⭐ 核心概念:Custom Hook 组合多个内置 hook — 这里是 useState + localStorage
// ============================================================================
// 为什么需要?
//   - useState 的值在页面刷新后会丢失(只活在内存里)
//   - localStorage 持久化:刷新 / 关闭浏览器都不丢
//   - 把"读 localStorage + 写回 localStorage"细节封装到 hook 里
//     → 父组件完全无感知,就像用普通 useState 一样
//
// 关键设计点:
//   - 返回 [value, setValue] 元组 — 模仿 useState API
//   - 读:第一次渲染时从 localStorage 拿,有就用,没有用 initialValue
//   - 写:setValue 时同时更新 React state + 写回 localStorage
//   - try/catch 包裹(SSR / 隐私模式 / localStorage 满都可能抛错)
//   - 用 useState 的 lazy initializer(`useState(() => ...`))
//     → 只在**第一次渲染**跑一次,后续渲染跳过 localStorage 读
//     → 这是关键性能优化:不能每次 render 都读 localStorage
//
// 课程原文(verbatim)三个关键点:
//   1. "wraps useState and keeps the value in sync with localStorage"
//   2. "On the first render it reads from localStorage, falling back to initialValue"
//   3. "The component has no idea that localStorage is involved. That concern is
//      entirely hidden inside the hook."
// ============================================================================
export const useLocalStorage = (key, initialValue) => {
  // ==========================================================================
  // ⭐ 核心概念:useState 的 lazy initializer
  // ==========================================================================
  //   useState(() => { ... })  ← 传入一个函数
  //   - 这个函数只在**第一次渲染**执行一次
  //   - 后续渲染时 React 直接用缓存的 initial state,不会再调函数
  //   - 如果不这么写 `useState(window.localStorage.getItem(key) ...)`:
  //     每次 render 都会读 localStorage,虽然读到的是同一个值,但浪费
  //     而且如果读操作有副作用(比如 SSR 没有 window),直接执行会炸
  // ==========================================================================
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // SSR 环境 / 隐私模式 / localStorage 被禁用 → 退到 initialValue
      return initialValue
    }
  })

  // ==========================================================================
  // ⭐ 核心概念:setValue 同时更新两处
  // ==========================================================================
  //   - setStoredValue(value):更新 React state,触发组件重渲染
  //   - window.localStorage.setItem(key, JSON.stringify(value)):
  //     同步写回 localStorage,刷新后能恢复
  //   - 注意 JSON.stringify / JSON.parse:localStorage 只能存字符串,
  //     对象 / 数组要先序列化(即使存字符串也要包一下,语义统一)
  //   - try/catch:localStorage 写满(5MB)或被禁用时不要让整个 app 崩
  // ==========================================================================
  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}