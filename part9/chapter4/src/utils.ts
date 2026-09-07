import { z } from 'zod';
import { Weather, Visibility } from './types.ts';
import type { NewDiaryEntry } from './types.ts';

// part4 c — Using schema validation libraries
// ⭐ 核心概念: Zod 是什么 — TS-first 的 schema 声明 + 校验库
// 写法:        z.object({ ... }) 定义期望的字段 + 类型
// 校验:        schema.parse(unknown) 成功返回收窄后的对象,失败抛 ZodError(带 issues 数组)
// 类型推导:    z.infer<typeof schema> 反向拿到 TS 类型(详见 types.ts 的 NewDiaryEntry)
// 关联: README chapter4 "Using schema validation libraries" 段
export const newEntrySchema = z.object({
  // ⭐ 核心概念: z.nativeEnum — 接收 TS 原生 enum,运行时校验 + 静态类型同步
  // 为什么用 nativeEnum(而不是 z.union([z.literal('a'), ...])):
  //   - 单一事实源:Weather/Visibility 已经是 enum,不需要重复定义字面量 union
  //   - 改 enum 时校验自动跟上
  // 验证: POST { weather: 'bogus' } → ZodError,issues 里能看到 path=['weather']
  // 关联: types.ts 的 Weather/Visibility enum
  weather: z.nativeEnum(Weather),
  visibility: z.nativeEnum(Visibility),
  // ⭐ 核心概念: z.string().date() — Zod 自带的 ISO date 校验
  // 之前(本节之前): 手写 isDate(date) + Date.parse() + Boolean() 双重判断
  // 现在:            z.string().date() 一行搞定(等价于校验 string + Date.parse 不为 NaN)
  // 关联: README chapter4 "Using schema validation libraries" 段
  date: z.string().date(),
  // ⭐ 核心概念: z.string().optional() — 字段值可以是 string | undefined
  // 为什么 optional: 课程原本 comment 必填,后改成可选(因为 type DiaryEntry 改成 comment?: string)
  // 不用 optional: 校验时缺 comment 抛 ZodError
  // 关联: types.ts 的 DiaryEntry.comment?: string
  comment: z.string().optional()
});

// part4 c — Using schema validation libraries
// ⭐ 核心概念: 简化版 toNewDiaryEntry — 全部校验交给 Zod,函数体只剩一行
// 之前(本节之前): 14+ 行手写 type guard + 字段检查 + 错误抛掷
// 现在:            schema.parse(object) → Zod 内部跑 z.object 校验,任一字段错抛 ZodError
// 校验顺序: Zod 按 schema 字段顺序逐个校验,weather/visibility/date/comment 任一失败立刻抛
// 失败时: 抛出的 ZodError.issues 是数组,每项含 path(字段路径)+ message(具体原因)
// 关联: routes/diaries.ts POST catch 块用 instanceof z.ZodError 拿 issues
export const toNewDiaryEntry = (object: unknown): NewDiaryEntry => {
  return newEntrySchema.parse(object);
};

// part4 c — Using schema validation libraries
// ⭐ 核心概念: z.infer<typeof schema> — 从 schema 反向推导 TS 类型,作为 NewDiaryEntry 单一事实源
// 之前(本节之前): NewDiaryEntry = Omit<DiaryEntry, 'id'> — 类型和校验各写一遍,改字段两边同步
// 现在:            NewDiaryEntry = z.infer<typeof newEntrySchema> — schema 改了,类型自动跟上
// 用 infer 的代价: 课程原文说"觉得这样有点倒置",所以 DiaryEntry 还是用 interface 显式声明
//                 实际效果:NewDiaryEntry 跟着 schema 走,DiaryEntry 独立定义,二者刚好对齐
// 验证: hover 在 NewDiaryEntry 上看到 { weather: Weather; visibility: Visibility; date: string; comment?: string }
// 关联: README chapter4 "Using schema validation libraries" 段,types.ts