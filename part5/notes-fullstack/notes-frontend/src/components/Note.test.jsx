// part5 c — Note.test.jsx
// 章节: "c — Testing React apps"
//
// 包含两个测试:
//   1) renders content  (Rendering the component for tests)
//      —— render + screen.getByText 验证文本节点存在
//   2) clicking the button calls event handler once  (Clicking buttons in tests)
//      —— userEvent + vi.fn() 验证按钮点击触发回调 1 次
//
// vitest globals(test/expect/describe/vi)由 eslint.config.js 的 test-specific
// 配置块注入,无需在本文件再写 /* global ... */。
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Note from './Note'

test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  render(<Note note={note} />)

  const element = screen.getByText('Component testing is done with react-testing-library')
  expect(element).toBeDefined()
})

test('clicking the button calls event handler once', async () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  const mockHandler = vi.fn()

  render(
    <Note note={note} toggleImportance={mockHandler} />
  )

  const user = userEvent.setup()
  const button = screen.getByText('make not important')
  await user.click(button)

  expect(mockHandler.mock.calls).toHaveLength(1)
})