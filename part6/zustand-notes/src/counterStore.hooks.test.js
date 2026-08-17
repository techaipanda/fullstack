// ===== part6b — ### Testing Zustand stores(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#testing-zustand-stores
// 课程原文 verbatim:part6b.md L920-L1031 — 通过 hooks 测试 store。
//
// 课程叙事弧(L920-L1031):
//   课程 L920:"Let's however make another version of the tests for example
//   purposes, where the store is used in exactly the same way as the
//   application uses it." — 这次不直接调 getState,而是像 app 一样走 hooks。
//   课程 L922:"useCounter and useCounterControls are React hooks, so testing
//   them requires React Testing Library and the jsdom library." — 装
//   @testing-library/react + jsdom。
//   课程 L994-L1029 详细解释 renderHook + act 的用法。
//   课程 L1031:"Testing via hooks uses React Testing Library and renders the
//   hooks in a real React context using jsdom. This approach is considerably
//   slower than tests that use the store directly, so if the hooks do not
//   contain complex logic, it may be sufficient to run the tests using the
//   store directly."
//
// verbatim 1:1 对照(L947-L991):
//   import { beforeEach, describe, expect, it } from 'vitest'
//   import { renderHook, act } from '@testing-library/react'
//   import useCounterStore, { useCounter, useCounterControls } from './store'
//
//   beforeEach(() => {
//     useCounterStore.setState({ counter: 0 })
//   })
//
//   describe('counter hooks', () => {
//     it('useCounter returns initial value of 0', () => {
//       const { result } = renderHook(() => useCounter())
//       expect(result.current).toBe(0)
//     })
//
//     it('increment updates counter', () => {
//       const { result: counter } = renderHook(() => useCounter())
//       const { result: controls } = renderHook(() => useCounterControls())
//
//       act(() => controls.current.increment())
//
//       expect(counter.current).toBe(1)
//     })
//
//     it('decrement updates counter', () => {
//       const { result: counter } = renderHook(() => useCounter())
//       const { result: controls } = renderHook(() => useCounterControls())
//
//       act(() => controls.current.decrement())
//
//       expect(counter.current).toBe(-1)
//     })
//
//     it('zero resets counter', () => {
//       const { result: counter } = renderHook(() => useCounter())
//       const { result: controls } = renderHook(() => useCounterControls())
//
//       act(() => {
//         controls.current.increment()
//         controls.current.increment()
//         controls.current.zero()
//       })
//
//       expect(counter.current).toBe(0)
//     })
//   })
//
// ⚠️ import 路径:课程原文 `'./store'`,本项目 `'./counterStore'`。

import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useCounterStore, { useCounter, useCounterControls } from './counterStore'

beforeEach(() => {
  useCounterStore.setState({ counter: 0 })
})

describe('counter hooks', () => {
  it('useCounter returns initial value of 0', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current).toBe(0)
  })

  it('increment updates counter', () => {
    const { result: counter } = renderHook(() => useCounter())
    const { result: controls } = renderHook(() => useCounterControls())

    act(() => controls.current.increment())

    expect(counter.current).toBe(1)
  })

  it('decrement updates counter', () => {
    const { result: counter } = renderHook(() => useCounter())
    const { result: controls } = renderHook(() => useCounterControls())

    act(() => controls.current.decrement())

    expect(counter.current).toBe(-1)
  })

  it('zero resets counter', () => {
    const { result: counter } = renderHook(() => useCounter())
    const { result: controls } = renderHook(() => useCounterControls())

    act(() => {
      controls.current.increment()
      controls.current.increment()
      controls.current.zero()
    })

    expect(counter.current).toBe(0)
  })
})