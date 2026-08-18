// ===== part6 — Context API =====
// verbatim 1:1 从 https://github.com/fullstack-hy2020/context-counter/blob/main/src/components/Controls.jsx 抽取。
// 消费 useCounter hook 取三个动词(increment / decrement / zero)。

import useCounter from '../hooks/useCounter'
const Controls = () => {
  const { increment, decrement, zero } = useCounter()
  return (
    <div>
      <button onClick={increment}>plus</button>
      <button onClick={decrement}>minus</button>
      <button onClick={zero}>zero</button>
    </div>
  )
}
export default Controls