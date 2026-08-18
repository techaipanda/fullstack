// ===== part6c — Synchronizing data to the server using TanStack Query =====
// 课程章节: https://fullstackopen.com/en/part6/react_query_context_api#synchronizing-data-to-the-server-using-tanstack-query
// 课程原文 verbatim: part6c 第 2 个 H2 整段。
//
// verbatim 1:1 对照:
//   - getNotes 来自上一个 H2("Managing data on the server ..."),verbatim 不动
//   - 本节新增 createNote(POST) + updateNote(PUT) 两个 mutation 函数
//
// 课程叙事弧:
//   createNote = POST + JSON.stringify body
//   updateNote = PUT to ${baseUrl}/${updatedNote.id} + JSON.stringify body
//   两者统一在 !response.ok 时 throw,success 时 return response.json()
//
// 课程原话(本节末):"The current code for the application is on GitHub in
// the branch _part6-2_." — 这意味着本 H2 的代码 state 就是 part6-2 branch。
// 下一个 H2 是 "Optimizing the performance"(branch part6-3)。

const baseUrl = 'http://localhost:3001/notes'

export const getNotes = async () => {
  const response = await fetch(baseUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch notes')
  }
  return await response.json()
}

export const createNote = async (newNote) => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newNote)
  }

  const response = await fetch(baseUrl, options)

  if (!response.ok) {
    throw new Error('Failed to create note')
  }

  return await response.json()
}

export const updateNote = async (updatedNote) => {
  const options = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedNote)
  }

  const response = await fetch(`${baseUrl}/${updatedNote.id}`, options)

  if (!response.ok) {
    throw new Error('Failed to update note')
  }

  return await response.json()
}