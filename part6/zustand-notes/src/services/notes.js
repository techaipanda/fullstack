// ===== part6b — ### Fetching data from the server(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#fetching-data-from-the-server
// 课程原文 verbatim:part6b.md L340-L355 + L381-L391(简化版)
//
// 课程叙事弧(L336-L429):
//   上一节把 db.json + json-server 准备好。这一节用 fetch() 真正
//   从后端拉数据:
//     1. 建 src/services/notes.js — getAll() 函数
//     2. store.js 加 initialize action(把 notes 数组整个替换)
//     3. App.jsx 用 useEffect 调 noteService.getAll().then(notes => initialize(notes))
//
// verbatim 1:1 对照(L340-L355 原始版 + L381-L391 简化版,采用简化版):
//   const baseUrl = 'http://localhost:3001/notes'
//
//   const getAll = async () => {
//     const response = await fetch(baseUrl)
//
//     if (!response.ok) {
//       throw new Error('Failed to fetch notes')
//     }
//
//     return await response.json() // highlight-line
//   }
//
//   export default { getAll }
//
// 课程 L357:"The notes are now fetched from the backend by calling the
// fetch() function, which has been given the backend URL as an argument.
// The request type is not separately specified, so fetch performs the
// default action, which is a GET request." — fetch() 默认是 GET。
//
// 课程 L367:"The attribute response.ok gets the value true if the request
// succeeded, i.e., if the response status code is in the range 200-299."
//
// 课程 L369:"Note that fetch does not automatically throw an error even if
// the response status code is, for example, 404. Error handling must be
// implemented manually, as we have done now."
//
// 课程 L377:"It is also worth noting that response.json() is an asynchronous
// function, so the await keyword must be used with it."
//
// 课程 L389 高亮 line:用 `return await response.json()` 直接返回,不再中转 data。
// 课程 L341 baseUrl 硬编码 'http://localhost:3001/notes' — 这是 JSON Server 默认
// 端口 + 我们前面 db.json 配的 notes 资源路径。

const baseUrl = 'http://localhost:3001/notes'

const getAll = async () => {
  const response = await fetch(baseUrl)

  if (!response.ok) {
    throw new Error('Failed to fetch notes')
  }

  return await response.json() // highlight-line
}

export default { getAll }