// ===== part6b — ### Async actions(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#async-actions
// 课程原文 verbatim:part6b.md L547-L705 — 这一节 services/notes.js 加 update() 函数。
//
// 课程叙事弧(L547-L705):
//   上一节 NoteForm 自己在调 noteService.createNew + add(返回的 note)。
//   这一节把 fetch 全部搬进 store action:
//     1. notes.js 加 update(id, note) — PUT 到 /notes/:id
//     2. store.js 加 `import noteService` + 3 个 action 全部改 async + 用 get() 取当前 state
//     3. NoteForm.jsx 删 noteService import,改成 `await add(content)`
//     4. App.jsx 删 noteService import,改成 `initialize()` 无参
//
// 这一节本文件的 verbatim 增补(L625-L641):
//   const update = async (id, note) => {
//     const response = await fetch(`${baseUrl}/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(note),
//     })
//
//     if (!response.ok) {
//       throw new Error('Failed to update note')
//     }
//
//     return await response.json()
//   }
//
//   export default { getAll, createNew, update }
//
// 课程 L621 "Let's finalize the application by synchronizing the importance
// toggle change to the server." — toggleImportance action 改成 PUT 到 server
// 后,UI 改的状态(important 翻转)会同步到 json-server 的 db.json,真正
// 实现"刷新后重要标记保留"。
//
// 课程 L705:本节代码对应 part6-5 分支(zustand-notes/tree/part6-5)。

const baseUrl = 'http://localhost:3001/notes'

const getAll = async () => {
  const response = await fetch(baseUrl)

  if (!response.ok) {
    throw new Error('Failed to fetch notes')
  }

  return await response.json()
}

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

// highlight-start
const update = async (id, note) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  })

  if (!response.ok) {
    throw new Error('Failed to update note')
  }

  return await response.json()
}
// highlight-end

export default { getAll, createNew, update } // highlight-line