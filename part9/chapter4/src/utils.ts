import { z } from 'zod';
import { Weather, Visibility } from './types.ts';

// part4 c — Using schema validation libraries
// ⭐ 核心概念: Zod 是什么 — TS-first 的 schema 声明 + 校验库
// 写法:        z.object({ ... }) 定义期望的字段 + 类型
// 校验:        schema.parse(unknown) 成功返回收窄后的对象,失败抛 ZodError(带 issues 数组)
// 关联: README chapter4 "Using schema validation libraries" 段

// part4 d — Parsing request body in middleware
// ⭐ 核心概念: schema 直接暴露给路由层当"输入过滤器"
// 之前(本节之前): utils.ts 自己写 toNewDiaryEntry 包一层 — 多余的间接层
// 现在:            路由层(或中间件)直接调 newEntrySchema.parse(req.body),utils.ts 只负责定义 schema
// 单一事实源:     schema 仍是 src/utils.ts 导出的常量,但路由层可以拿到同一个引用,无需再包一层函数
// 关联: README chapter4 "Parsing request body in middleware" 段;routes/diaries.ts 的 newDiaryParser
export const newEntrySchema = z.object({
  weather: z.nativeEnum(Weather),
  visibility: z.nativeEnum(Visibility),
  date: z.string().date(),
  comment: z.string().optional()
});