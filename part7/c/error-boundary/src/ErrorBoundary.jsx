// ⭐ part7 c — Error Boundary 子节 —— 课程原文 Code Block 1 verbatim
// 课程原文:"An error boundary is a component that catches JavaScript errors anywhere in its
// child component tree and displays a fallback UI instead of crashing the whole application."
//
// 本子节要点(逐行 ⭐ 中文注释,只解释 WHY,不替换课程代码):
//
// ⭐ 核心概念 1:ErrorBoundary 必须是 Class Component(React 至今没出 hook 替代)
//   - 课程原文:"As of 2026, React has not yet introduced a hook-based alternative for this,
//     so error boundaries must still be implemented as Class components."
//   - 不用 class:无法实现(React 16+ 只支持 class 实现 getDerivedStateFromError / componentDidCatch)
//   - 用 class:这两个生命周期方法都是 Class Component 独有的 API
//   - 验证:故意把 class 改成 function 组件,React 报 "getDerivedStateFromError is not a function"
//
// ⭐ 核心概念 2:static getDerivedStateFromError(error) — 静态生命周期,出错时返回新 state
//   - 课程原文配套(replaces componentWillMount-era error handling)
//   - 不用 getDerivedStateFromError:出错时 hasError 还是 false → render 走原 children 路径 →
//     React 把整个组件树 unmount + 不显示任何 fallback UI
//   - 用 getDerivedStateFromError:返回 { hasError: true, error } → render 走 fallback 分支
//   - static:无 this 访问、不能 setState;只能"返回新 state"或 null(不变)
//   - 验证:F12 React DevTools,出错瞬间 state 立即变为 { hasError: true, error: <Error对象> }
//          而无需等 componentDidCatch
//
// ⭐ 核心概念 3:componentDidCatch(error, info) — 实例生命周期,用于副作用(日志/Sentry 上报)
//   - 课程原文配套:用于"console.error"或上报到监控服务
//   - 不用 componentDidCatch:出错时没有 hook 点上报到 Sentry / 把日志落盘
//   - 用 componentDidCatch:浏览器 Console 立刻出现 "ErrorBoundary caught an error <Error> <info>"
//     info.componentStack 告诉你是哪个组件抛的(树状栈)
//   - getDerivedStateFromError vs componentDidCatch:
//     前者必须返回新 state(纯函数),后者用于副作用(异步上报不阻塞渲染)
//   - 验证:F12 Console 看 componentDidCatch 输出的 error + info.componentStack
//
// ⭐ 核心概念 4:render 走双分支(hasError / props.children)
//   - hasError=true → 返回 fallback UI(Something went wrong + 错误信息 + try again)
//   - hasError=false → 返回 this.props.children(把控制权交还给被包裹的子树)
//   - 不用 if 分支:出错时 UI 不切换 → 整个 App 仍然崩白屏
//   - 用 if 分支:出错时被包裹子树被 fallback 替换,但其他 ErrorBoundary 包裹的兄弟组件不受影响
//   - 验证:故意让 Notes 抛错 → Notes 区域变 fallback,Persons 区域仍然正常显示
//
// ⭐ 核心概念 5:"try again" 按钮恢复 — setState({ hasError: false, error: null })
//   - 课程 verbatim 写法:setState 把两个 state 字段都重置回初值
//   - 不用 try again:用户只能刷新整页才能解除边界状态
//   - 用 try again:用户原地点击恢复 → render 重新走 children 分支 → 子组件重新挂载
//   - 验证:Notes 抛错 → 点 try again → Notes 重新渲染(但 state 会重置,因为组件被重新挂载)

import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    // ⭐ state 双字段:hasError(开关)+ error(用于 fallback 里显示具体错误信息)
    this.state = { hasError: false, error: null }
  }

  // ⭐ 静态生命周期方法:React 在子树抛错时调用,返回值被 merge 进 state
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  // ⭐ 实例生命周期方法:React 在子树抛错时调用,用于副作用(日志 / Sentry 上报)
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error', error, info)
  }

  render() {
    // ⭐ 出错分支:显示 fallback UI
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <p>{this.state.error.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            try again
          </button>
        </div>
      )
    }

    // ⭐ 正常分支:渲染被包裹的子组件(没有任何包装 DOM,纯穿透)
    return this.props.children
  }
}

export default ErrorBoundary