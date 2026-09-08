// part5 h — Communicating with the server
//
// 课程原文 (line 885-894) 要求"create a file types.ts with the following content":
//   export interface Note { id: string, content: string }
//   export type NewNote = Omit<Note, 'id'>
//
// ⚠️ 文件命名偏离: 课程说"a file types.ts",但 sub-section 4 已经创建了
// types.ts 存放 CoursePart / CoursePartBasic / CoursePartGroup / CoursePartBackground
// (用于后续 Exercise 9.16)。直接覆盖会丢掉 CoursePart 类型,违反 1:1。
// 解 决: 改用 noteTypes.ts,语义清晰且与现有 types.ts 并存。
// 关联: chapter5 d (Deeper type usage) 提交 commit d3d8543

// ─────────────────────────────────────────────────────────────────────────
// Note — 课程 line 887-890 verbatim
// ─────────────────────────────────────────────────────────────────────────
export interface Note {
  id: string,
  content: string
}

// ─────────────────────────────────────────────────────────────────────────
// NewNote = Omit<Note, 'id'>
// 课程原文 (line 893-894):
//   export type NewNote = Omit<Note, 'id'>
//   "We have added a new type for a new note, one that does not yet have the id field assigned"
//
// ⭐ 核心概念: Omit<Note, 'id'>
//  Omit 是什么: TS utility type — `Omit<T, K>` 返回 T 但**去掉** K 指定的字段
//               builtin: type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
//  为什么用:   客户端创建 note 时还没有 id(后端生成);用 Omit 强制约束
//               payload 里**不能带 id** 字段,编译期阻止误传
//  对比 Pick:  Pick<Note, 'content'> 只挑出 content(白名单)
//              Omit<Note, 'id'> 是反选(黑名单)— 更适合"大部分字段都要,只有一两个不要"的场景
//  验证:       createNote({ content: 'x' }) ✓ ;createNote({ id: '1', content: 'x' }) ✗ TS2353
//  关联:       课程原文 line 893-896
// ─────────────────────────────────────────────────────────────────────────
export type NewNote = Omit<Note, 'id'>