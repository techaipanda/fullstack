// part5 c — Note.test.jsx(第一个测试文件)
// 章节: "c — Testing React apps / Rendering the component for tests"
//
// 测试三步:
//   1) 给定数据(一个 note 对象)
//   2) render(<Note />) 让 jsdom 渲染组件
//   3) screen.getByText(...) 在已渲染 DOM 中查找文本,
//      expect(element).toBeDefined() 断言它存在
//
// 注意: 课程原文用 toBeDefined()(因为 getByText 没找到会直接 throw,
// 走到 expect 这一行就代表找到了)。
// 配 @testing-library/jest-dom/vitest 后也能用 toBeInTheDocument(),
// 这里保留课程原例用 toBeDefined,保持 1:1 复刻。
//
// vitest globals(test/expect/describe)由 eslint.config.js 的 test-specific
// 配置块注入,无需在本文件再写 /* global ... */。
import { render, screen } from '@testing-library/react'
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