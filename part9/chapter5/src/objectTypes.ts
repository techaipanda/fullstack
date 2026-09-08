// part5 i — A note about defining object types
//
// 课程原文 (line 959-998) 是**纯概念讨论** — 只有 1 个新代码块:
//   line 964-970: interface DiaryEntry (verbatim)
//   line 985-991: type DiaryEntry = {...} 的等价 type 写法
//
// ⚠️ Weather / Visibility 的实际 union 定义在 chapter4 part9 c "Ilari's flight diaries"
// 后端;这里给出**最简本地存根** 让文件能独立编译,不重复 chapter4 已交付的类型。
// 关联: commit 45efc64 feat:9-4-Parsing request body in middleware(chapter4 最后一次 commit)

// ─────────────────────────────────────────────────────────────────────────
// 存根类型 — 仅用于让 DiaryEntry interface 编译通过
// 真值在 chapter4 (Weather = 'sunny' | 'rainy' | 'cloudy' | 'stormy';Visibility = 'good' | 'poor')
// 这里简化为 string 让本节聚焦于"interface vs type"主题本身
// ─────────────────────────────────────────────────────────────────────────
type Weather = string;
type Visibility = string;

// ─────────────────────────────────────────────────────────────────────────
// interface 形式 — 课程 line 964-970 verbatim
// ─────────────────────────────────────────────────────────────────────────
interface DiaryEntry {
  id: number;
  date: string;
  weather: Weather;
  visibility: Visibility;
  comment?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// type 别名等价形式 — 课程 line 985-991(下面代码块作注释引用,不在本文件重复声明)
//
//   type DiaryEntry = {
//     id: number;
//     date: string;
//     weather: Weather;
//     visibility: Visibility;
//     comment?: string;
//   }
//
// ⚠️ 为什么不能同时在文件里 `interface DiaryEntry` + `type DiaryEntry =`:
//    TS 共享同一标识符 namespace;同名 interface 走 declaration merging,同名 type 会报错
//    TS2451 "Duplicate identifier 'DiaryEntry'"
//
// ⭐ 核心概念 1: interface vs type — 课程 line 994-997
//  课程原文 (line 994):
//    "In most cases, you can use either type or interface, whichever syntax you prefer."
//
//  唯一关键差异(课程 line 995):
//    1. 同名 interface → declaration merging(同名合并所有字段)
//       同名 type → 编译错误 TS2300 "Duplicate identifier"
//    2. TS 文档(课程 line 997)https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces
//       推荐在大多数场景用 interface
//  何时该用 type 而不是 interface:
//    - 需要 union / intersection / mapped / utility 类型(interface 不能直接表达)
//    - 例如: type ID = string | number; type UserWithRole = User & { role: Role }
//  验证: 把 interface DiaryEntry 复制一行(同名),看 declaration merging 自动合并字段;
//        改成 type DiaryEntry = {...} 复制一行,看 TS2300 报错
//  关联: 课程原文 line 994-997
//
// ⭐ 核心概念 2: optional property `comment?: string`
//  `comment?` 表示该字段**可以存在,也可以不存在**(undefined)
//  访问 comment 的类型自动是 `string | undefined`
//  与 explicit `comment: string | undefined` 区别:
//    - `comment?` — 字段可缺失,代码里 `entry.comment.toUpperCase()` 会报 TS2532
//    - `comment: string | undefined` — 字段必须存在,但值可能是 undefined
//  验证: 把 `comment?` 改成 `comment`,看 noteEntry({ id, date, weather, visibility }) 报 TS2741
//  关联: 课程原文 line 969 — 由 Exercise 9.17 继承到前端
// ─────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────
// 模块自检: 创建一个最小 DiaryEntry 样本,确认 interface 形状可实例化
// (用户已跳过 9.17,这里只为"过 build"用,不写组件)
// ─────────────────────────────────────────────────────────────────────────
const sampleDiary: DiaryEntry = {
  id: 1,
  date: '2026-09-08',
  weather: 'sunny',
  visibility: 'good',
  // comment 故意省略 — 验证 optional
};
// (eslint.config.js 当前没启用 no-console 规则,不需要 disable 注释)
console.log(sampleDiary);