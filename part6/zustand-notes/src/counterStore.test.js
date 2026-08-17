// ===== part6b — ### Testing Zustand stores(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#testing-zustand-stores
// 课程原文 verbatim:part6b.md L864-L896 — 直接测试 store,不经过 hook。
//
// 课程叙事弧(L856-L902):
//   课程 L856:"We added an export to the definition for the tests, through
//   which the test can access the store." — 所以 counterStore.js 末尾有
//   `export default useCounterStore`,test 文件 import 它。
//   课程 L898:"The tests are quite straightforward, utilizing the store's
//   getState function, which allows them to read the store's state and
//   execute the store's functions."
//   课程 L900:"Before each test, the store is reset to its initial state in
//   the beforeEach block using the store's setState function."
//
// verbatim 1:1 对照(L866-L896):
//   import { beforeEach, describe, expect, it } from 'vitest'
//   import useCounterStore from './store'
//
//   beforeEach(() => {
//     useCounterStore.setState({ counter: 0 })
//   })
//
//   describe('counter store', () => {
//     it('initial state is 0', () => {
//       expect(useCounterStore.getState().counter).toBe(0)
//     })
//
//     it('increment increases counter by 1', () => {
//       useCounterStore.getState().actions.increment()
//       expect(useCounterStore.getState().counter).toBe(1)
//     })
//
//     it('decrement decreases counter by 1', () => {
//       useCounterStore.getState().actions.decrement()
//       expect(useCounterStore.getState().counter).toBe(-1)
//     })
//
//     it('zero resets counter to 0', () => {
//       useCounterStore.getState().actions.increment()
//       useCounterStore.getState().actions.increment()
//       useCounterStore.getState().actions.zero()
//       expect(useCounterStore.getState().counter).toBe(0)
//     })
//   })
//
// ⚠️ import 路径:课程原文 `'./store'`,本项目改 `'./counterStore'`(同 counterStore.js 注释)。

import { beforeEach, describe, expect, it } from 'vitest'
import useCounterStore from './counterStore'

beforeEach(() => {
  useCounterStore.setState({ counter: 0 })
})

describe('counter store', () => {
  it('initial state is 0', () => {
    expect(useCounterStore.getState().counter).toBe(0)
  })

  it('increment increases counter by 1', () => {
    useCounterStore.getState().actions.increment()
    expect(useCounterStore.getState().counter).toBe(1)
  })

  it('decrement decreases counter by 1', () => {
    useCounterStore.getState().actions.decrement()
    expect(useCounterStore.getState().counter).toBe(-1)
  })

  it('zero resets counter to 0', () => {
    useCounterStore.getState().actions.increment()
    useCounterStore.getState().actions.increment()
    useCounterStore.getState().actions.zero()
    expect(useCounterStore.getState().counter).toBe(0)
  })
})