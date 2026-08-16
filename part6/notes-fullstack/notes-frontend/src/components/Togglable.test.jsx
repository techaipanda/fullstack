// part5 c — Togglable.test.jsx
// 章节: "c — Testing React apps / Tests for the Togglable component"
//
// 4 个测试,集中在 describe('<Togglable />') 内组织:
//   1) renders its children
//      —— 验证 Togglable 渲染了 children(无论可见性)
//   2) at start the children are not displayed
//      —— 初始 visible=false 时 children 不可见(display:none)
//   3) after clicking the button, children are displayed
//      —— 点击 buttonLabel 按钮后 visible=true,children 可见
//   4) toggled content can be closed
//      —— 点击 cancel 按钮,children 重新隐藏
//
// 关键技术:
//   - beforeEach(...) 每个 test 之前重新 render,保证 Togglable 状态独立。
//   - toBeVisible() / not.toBeVisible() 来自 @testing-library/jest-dom,
//     检测元素 CSS 是否包含 display:none / visibility:hidden 等。
//   - vitest globals (describe/beforeEach/test) 由 eslint.config.js
//     test-specific 配置块注入,无需 import。
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Togglable from './Togglable'

describe('<Togglable />', () => {
  beforeEach(() => {
    render(
      <Togglable buttonLabel='show...'>
        <div>togglable content</div>
      </Togglable>
    )
  })

  test('renders its children', () => {
    screen.getByText('togglable content')
    //screen.debug()
  })

  test('at start the children are not displayed', () => {
    const element = screen.getByText('togglable content')
    //screen.debug(element)
    expect(element).not.toBeVisible()
  })

  test('after clicking the button, children are displayed', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('show...')
    await user.click(button)

    const element = screen.getByText('togglable content')
    //screen.debug()
    expect(element).toBeVisible()
  })

  test('toggled content can be closed', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('show...')
    await user.click(button)

    const closeButton = screen.getByText('cancel')
    await user.click(closeButton)

    const element = screen.getByText('togglable content')
    expect(element).not.toBeVisible()
  })
})