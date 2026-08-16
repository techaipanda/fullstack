// ===== part6b — ### Sending data to server(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#sending-data-to-the-server
// 课程原文 verbatim:part6b.md L441-L471 + L475-L493(最终 refactor 版本)。
//
// 课程叙事弧(L435-L545):
//   上一节加了 fetch GET。这一节加 fetch POST,把新 note 存到 server。
//     1. notes.js 加 createNew(content) — POST 到 baseUrl, body 是 JSON.stringify
//     2. refactor:把 fetch options 抽到独立 options 变量(课程 L473:"We can
//        further clarify the code by storing the object defining the request
//        details in a separate options helper variable")
//     3. NoteForm.jsx 改成 async + await noteService.createNew(content) + add(newNote)
//
// verbatim 1:1 对照(采用 L475-L493 的 options-refactored 版本作为最终态):
//   const getAll = async () => {
//     const response = await fetch(baseUrl)
//     if (!response.ok) throw new Error('Failed to fetch notes')
//     return await response.json()
//   }
//
//   // highlight-start
//   const createNew = async (content) => {
//     const options = {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ content, important: false }),
//     }
//
//     const response = await fetch(baseUrl, options)
//
//     if (!response.ok) {
//       throw new Error('Failed to create note')
//     }
//
//     return await response.json()
//   }
//   // highlight-end
//
//   export default { getAll, createNew } // highlight-line
//
// 课程 L497-L499 解释 options 三个字段:
//   - method: 'POST'                          — 请求类型
//   - headers: { 'Content-Type': 'application/json' }  — 让 server 知道 body 是 JSON
//   - body: JSON.stringify({ content, important: false })  — body 不能直接是 JS 对象
//
// 课程 L509:"If the request succeeds, JSON Server returns the just-created
// note, for which it has also generated a unique id. The data contained in
// the response must still be converted to JSON format using the
// response.json() function"
//
// 课程 L545:本节代码对应 part6-4 分支。

const baseUrl = 'http://localhost:3001/notes'

const getAll = async () => {
  const response = await fetch(baseUrl)

  if (!response.ok) {
    throw new Error('Failed to fetch notes')
  }

  return await response.json()
}

// highlight-start
const createNew = async (content) => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, important: false }),
  }

  const response = await fetch(baseUrl, options)

  if (!response.ok) {
    throw new Error('Failed to create note')
  }

  return await response.json()
}
// highlight-end

export default { getAll, createNew } // highlight-line