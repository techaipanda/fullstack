// ===== part6c — Managing data on the server with the TanStack Query library =====
// 课程章节: https://fullstackopen.com/en/part6/many_redux_or_one_question#managing-data-on-the-server-with-the-tanstack-query-library
// 课程原文 verbatim: part6c 第 1 个 H2 段 6 "Let's move the function making the
// actual HTTP request to its own file src/requests.js"。
//
// verbatim 1:1 对照(段 6 代码块):
//   const baseUrl = 'http://localhost:3001/notes'
//
//   export const getNotes = async () => {
//     const response = await fetch(baseUrl)
//     if (!response.ok) {
//       throw new Error('Failed to fetch notes')
//     }
//     return await response.json()
//   }
//
// 课程说明:"Fetching data from the server is done, as in the previous chapter,
// using the Fetch API's fetch function. However, the function call is now wrapped
// into a query formed by the useQuery function."
//
// 本节只 export getNotes。createNote / updateNote 留到 part6c 第 2 个 H2
// "Synchronizing data to the server using TanStack Query"(branch part6-2)。

const baseUrl = 'http://localhost:3001/notes'

export const getNotes = async () => {
  const response = await fetch(baseUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch notes')
  }
  return await response.json()
}