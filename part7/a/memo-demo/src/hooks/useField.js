// ============================================================================
// part7 a.5 Custom hooks — useField(课程 verbatim 自定义 hook)
// 作用:把"管理表单 input state"这段逻辑抽成一个可复用的 hook
// 关联:README.md a.5 段 1-4 + 课程 verbatim 代码块
// ============================================================================

import { useState } from 'react'

// ============================================================================
// ⭐ 核心概念:Custom Hook — 抽离 stateful logic 到可复用函数
// ============================================================================
// 什么是 custom hook?
//   - 本质就是一个普通 JS 函数,**命名约定**为 `use*`(React 才能识别)
//   - 内部可以调用其他 hooks(useState / useEffect / useMemo / 自定义 hooks)
//   - 跟普通函数的区别:它内部维护 state + 跨渲染持有数据
//
// 为什么需要?
//   - 同一个表单 input 逻辑(管理 value + 触发 onChange)在多个组件里出现
//   - 重复代码 → 抽成 custom hook → 一处定义,多处复用
//   - 跟"组件抽取"的区别:custom hook 抽的是**逻辑**,不是 UI
//
// 怎么写?
//   - 命名必须 `use*`(否则 React 不会检查 hooks 规则)
//   - 内部调 useState / useEffect / useMemo 等
//   - 返回**任何**东西:一个值、一个对象、一个数组、一个函数
//
// 这个 hook 的设计(课程 verbatim):
//   输入: `name`(input 的 name 属性,本演示版本未使用,保留课程签名)
//   输出: 一个对象 `{ type, value, onChange }`
//     - type:固定是 'text'(简化版)
//     - value:当前输入值
//     - onChange:直接 spread 给 <input>(无需在父组件写 setName)
// ============================================================================
export const useField = (name) => {
  // 内部用 useState 维护 input 当前值 — 这就是 custom hook 持有 state 的方式
  const [value, setValue] = useState('')

  // onChange 直接返回箭头函数(每次组件 re-render 会创建新引用)
  //   - 如果配合 React.memo + 子组件接收 onChange prop,需要用 useCallback 包裹
  //   - 本演示里没用到 memo,直接返回即可
  const onChange = (event) => {
    setValue(event.target.value)
  }

  // 返回一个对象 — 父组件直接 spread 到 input 上即可
  //   <input {...useField('name')} />
  return {
    type: 'text',
    value,
    onChange
  }
}