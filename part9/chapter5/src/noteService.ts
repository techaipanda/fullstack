// part5 h — Communicating with the server
//
// 课程原文 (line 898-917) 要求"create a module in the file noteService.ts":
//   import axios from 'axios';
//   import { Note, NewNote } from "./types";
//   const baseUrl = 'http://localhost:3001/notes'
//   export const getAllNotes = () => {
//     return axios.get<Note[]>(baseUrl).then(response => response.data)
//   }
//   export const createNote = (object: NewNote) => {
//     return axios.post<Note>(baseUrl, object).then(response => response.data)
//   }
//
// 1:1 复刻;import 路径改成 ./noteTypes(同上一文件命名理由)

import axios from 'axios';
import { Note, NewNote } from './noteTypes';

const baseUrl = 'http://localhost:3001/notes'

// ─────────────────────────────────────────────────────────────────────────
// getAllNotes — 课程 line 906-910 verbatim
// ─────────────────────────────────────────────────────────────────────────
export const getAllNotes = () => {
  return axios
    .get<Note[]>(baseUrl)
    .then(response => response.data)
}

// ─────────────────────────────────────────────────────────────────────────
// createNote — 课程 line 912-916 verbatim
// ─────────────────────────────────────────────────────────────────────────
export const createNote = (object: NewNote) => {
  return axios
    .post<Note>(baseUrl, object)
    .then(response => response.data)
}

// ⭐ 核心概念(放在文件底部,因为它是覆盖整个文件的横向主题):
//  axios.get<T>(url) / axios.post<T>(url, body) 的 type parameter
//  课程原文 (line 826-848):
//    axios.get(...) 返回的 response.data 默认是 any
//    加 <Note[]> 后,response.data 类型是 Note[]
//    ⚠️ 课程 line 850-865 明确警告:"giving a type parameter is potentially dangerous"
//       TS 不在运行时验证服务端响应,只是让编译器"信任你"
//       本质等价于 response.data as Note[] — 同样没有运行时保障
//  课程 line 865 的解药:
//    解析响应数据(类似 part9 c "Proofing requests" 用 Zod 那一段)
//    本节不演示 — 留作后续章节
//  验证: 把 getAllNotes 里的 <Note[]> 删掉,hover response.data 看 any
//  关联: 课程原文 line 818-865
//
//  ⭐ 核心概念: 把 axios 调用抽到独立 service 模块
//  为什么抽:  App 组件不直接依赖 axios,只依赖 getAllNotes/createNote
//            将来换 fetch / graphql / SDK 时只改这个文件,App 不动
//  这是 Repository Pattern 在前端 API 层的简化应用
//  验证:  删掉这个文件,把 axios.get 写回 App.tsx,功能不变但耦合度变高
//  关联:  课程原文 line 898-919 "The code that communicates with the backend is also extracted to a module"