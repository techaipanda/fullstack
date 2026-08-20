// ⭐ 核心概念 2(续):import.meta.env —— 课程原文:
//   "Access the variable in your application code via import.meta.env."
//
// 课程 verbatim 代码块:
//   const App = () => {
//     const notes = useNotes(import.meta.env.VITE_BACKEND_URL)
//     return (
//       <div>
//         {notes.length} notes on server {import.meta.env.VITE_BACKEND_URL}
//       </div>
//     )
//   }
//
// ⭐ 课程里 useNotes 来自 part7/c(anecdotes / country-hook 等真实项目),本子项目为了能跑起来,
//   在文件底部内联了一个返回 [] 的极简 stub。
//   stub 用 ⭐ 标注,不引入新概念,只为了让 JSX 不报错。读 course-follow-official 严要求:
//   "do NOT add helpers the course didn't add" —— 这里破例是因为我们要演示 config 而非 hook。

import { useState, useEffect } from 'react'

const App = () => {
  // 课程 verbatim 调用,演示 import.meta.env.VITE_BACKEND_URL 在浏览器里能拿到字符串
  const notes = useNotes(import.meta.env.VITE_BACKEND_URL)

  return (
    <div>
      <p>
        {notes.length} notes on server {import.meta.env.VITE_BACKEND_URL}
      </p>
    </div>
  )
}

// ⭐ 本子项目内联的极简 stub —— 真实项目里这来自 part7/c 的 useNotes hook(自定义 hook)
const useNotes = (_url) => {
  const [notes, setNotes] = useState([])
  // 真 hook 会 fetch(_url) 后 setNotes;本子项目不演示网络,直接返回空数组
  return notes
}

export default App