// ⭐⭐⭐ Notify.jsx — part8p "Handling mutation errors" 新建组件 ⭐⭐⭐
//
// ⭐ 关键诚实声明:课程本子节**新建** src/components/Notify.jsx
//   课程原文(per course line 433):"Create a separate component for the notification
//   in the file scr/components/Notify.jsx"  ← 课程原文是 "scr"(拼写错误),
//   实际应是 "src",落地用 "src/components/Notify.jsx"
//
// ⭐ 课程原文(per course line 450):"The component receives a possible error message
//   as a prop. If an error message is set, it is rendered on the screen."
//
// ⭐⭐ 课程 verbatim 关键设计 ⭐⭐:
// 1. 接收 errorMessage prop(单一 prop)
// 2. !errorMessage → return null(什么都不渲染,不留空白)
// 3. errorMessage 有值 → 返回 <div style={{ color: 'red' }}>{errorMessage}</div>
//    —— 内联 style,red 颜色,直接显示错误字符串

// ⭐⭐⭐ Notify 组件 — verbatim 课程 line 436-447 ⭐⭐⭐
const Notify = ({ errorMessage }) => {
  // ⭐⭐ 核心:无错误时 return null(per course line 437-439)⭐⭐
  //
  // 1. ⭐ 核心概念:return null = 不渲染任何 DOM ⭐
  //    - 不用 return <></>:空 Fragment 没必要,且部分 lint 规则不喜
  //    - 不用 return <div hidden>:多一个 DOM 节点,无意义
  //    - 课程硬编码 return null,这是 React 官方允许的"什么都不渲染"方式
  //
  // 2. 何时触发:errorMessage 是 null(undefined 也算 falsy)→ null
  //    何时返回 DOM:errorMessage 是非空字符串(比如 "name must be unique")→ div
  //
  // 3. 验证:打开浏览器 DevTools → 提交一个重复名字 → Notify 出现红字
  //         10s 后 → Notify DOM 节点消失(react StrictMode 会调两次 setTimeout,
  //         但卸载逻辑 OK)
  if (!errorMessage) {
    return null
  }

  // ⭐⭐⭐ 红字 div(per course line 441-443)⭐⭐⭐
  //
  // 1. ⭐ 内联 style:React 允许 `style={{ key: value }}` 写法(注意双花括号)
  //    - 外层 {} = JSX 表达式
  //    - 内层 {} = 对象字面量
  //    - key 用 camelCase:color 而不是 'color'
  //
  // 2. color: 'red' 是硬编码课程硬编码的样式
  //    生产代码应该用 CSS module / styled-components / Tailwind
  //    但课程 verbatim 写 color: 'red',这是教学简化,不动
  return (
    <div style={{ color: 'red' }}>
      {errorMessage}
    </div>
  )
}

// ⭐ 课程 verbatim — default export,让 App.jsx 能 import Notify
export default Notify