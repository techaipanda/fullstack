// part4 c — Using schema validation libraries
// z.infer 已在文件顶部 import type { z } from 'zod'
// 课程原本用 string union,后来改成 enum — FSO part9 长期固定写法,本节课程要求 z.nativeEnum(Weather) 所以必须是原生 enum
// ⭐ 核心概念: enum 是 TS 独有的"命名常量集合"类型,既是值也是类型
// 写法:        enum Weather { Sunny = 'sunny', Rainy = 'rainy', ... }
// 效果:        Weather 既是 type(用作类型注解)又是 object(运行时存在,可 Object.values() 取所有合法值)
// 字符串 enum: 每个成员显式赋值字符串,编译产物是 { Sunny: 'sunny', Rainy: 'rainy', ... }(没有反向映射)
// 关联: utils.ts 的 z.nativeEnum(Weather) 依赖 enum 运行时对象
// ⚠️ 注意: 之前用过 as const 对象写法,本节课程明确要求 z.nativeEnum,所以换回 enum
export enum Weather {
  Sunny = 'sunny',
  Rainy = 'rainy',
  Cloudy = 'cloudy',
  Stormy = 'stormy',
  Windy = 'windy'
}

export enum Visibility {
  Great = 'great',
  Good = 'good',
  Ok = 'ok',
  Poor = 'poor'
}

// part4 c — Using schema validation libraries
// 课程原文(1659-1668 行):
//   export interface DiaryEntry {
//     id: number;
//     date: string;
//     weather: Weather;
//     visibility: Visibility;
//     comment?: string;   // ⭐ 注意: comment 变成可选(本节之前是必填)
//   }
// 为什么 comment 改可选: utils.ts 用 z.string().optional() 校验,comment 不传也能通过,DiaryEntry 必须能容纳 undefined
// 验证: hover 在 DiaryEntry 上,看到 comment?: string
// 关联: utils.ts 的 newEntrySchema.comment = z.string().optional()
export interface DiaryEntry {
  id: number;
  date: string;
  weather: Weather;
  visibility: Visibility;
  comment?: string;
}

// part4 c — Using schema validation libraries
// ⭐ 核心概念: NewDiaryEntry — 显式声明(避开循环依赖)
// 课程原文用 z.infer<typeof newEntrySchema>(types.ts 里 import { newEntrySchema } from './utils'),
// 但 utils.ts 又 import type NewDiaryEntry from './types' — 形成循环依赖,TS 报 TS2304 "Cannot find name newEntrySchema"
// 实际处理: NewDiaryEntry 显式列字段,NewDiaryEntry 跟 DiaryEntry 的可选 comment 保持一致
// 验证: hover 在 NewDiaryEntry 上看到 { weather: Weather; visibility: Visibility; date: string; comment?: string }
// 关联: utils.ts 的 newEntrySchema(仍是 schema 校验的单一事实源)
export type NewDiaryEntry = {
  weather: Weather;
  visibility: Visibility;
  date: string;
  comment?: string;
};

// part4 b — Utility Types
// ⭐ 核心概念: Omit<T, K> 是 TS 内置的工具类型 (utility type)
// 什么是工具类型: 接受一个类型作为参数,返回一个新类型 — 是"类型的函数"
// 什么是 Omit: 从 T 类型里"剥掉"字段 K(第二个参数是字段名字符串字面量)
// 为什么用 Omit: 客户端不需要看 comment(隐私/敏感),但服务端的 DiaryEntry 必须保留 comment
// 不用 Omit: 要么重复定义一个完全相同的接口,要么把 comment 泄露出去
// 用 Omit: 新类型自动跟着 DiaryEntry 变,加字段时不用两边同步
// 第二个参数语法: 'comment' 是字符串字面量,TS 强制它必须是 DiaryEntry 里存在的字段名(拼错会报错)
// 验证: hover 在 NonSensitiveDiaryEntry 上,IDE 只显示 4 个字段(id/date/weather/visibility),无 comment
// 关联: README chapter4 "Utility Types" 段
export type NonSensitiveDiaryEntry = Omit<DiaryEntry, 'comment'>;