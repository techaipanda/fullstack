// part5 c — NoteForm.test.jsx
// 章节: "c — Testing React apps / Testing the forms"
//
// 1 个测试:验证 NoteForm 表单提交行为。
//
// 关键技术:
//   - createNote 用 vi.fn() mock(无返回值 stub),无需 vi.mock 整个 service 模块。
//   - screen.getByRole('textbox') 用 ARIA role 找输入框。
//   - user.type(input, '...') 模拟逐字输入,触发 onChange。
//   - user.click(submitButton) 触发表单 submit,NoteForm 内部调 createNote。
//   - 断言:
//       (1) createNote 被调用 1 次(mock.calls.length)
//       (2) 第一次调用的第一个参数(.calls[0][0])的 content 字段是输入的文本
//
// vitest globals(test/expect/vi)由 eslint.config.js test-specific 配置块注入。
import { render, screen } from '@testing-library/react'
import NoteForm from './NoteForm'
import userEvent from '@testing-library/user-event'

test('<NoteForm /> updates parent state and calls onSubmit', async () => {
  const createNote = vi.fn()
  const user = userEvent.setup()

  render(<NoteForm createNote={createNote} />)

  const input = screen.getByRole('textbox')
  const sendButton = screen.getByText('save')

  await user.type(input, 'testing a form...')
  await user.click(sendButton)

  expect(createNote.mock.calls).toHaveLength(1)
  expect(createNote.mock.calls[0][0].content).toBe('testing a form...')
  console.log(createNote.mock.calls)
})