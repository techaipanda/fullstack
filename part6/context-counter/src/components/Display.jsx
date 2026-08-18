// ===== part6 — Context API =====
// verbatim 1:1 从 https://github.com/fullstack-hy2020/context-counter/blob/main/src/components/Display.jsx 抽取。
// 消费 useCounter hook 取 counter 值,直接渲染。

import useCounter from '../hooks/useCounter'
const Display = () => {
  const { counter } = useCounter()

  return <div>{counter}</div>
}

export default Display