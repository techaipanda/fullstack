import express, { type Response } from 'express';
import diaryService from '../services/diaryService.ts';
import type { NonSensitiveDiaryEntry } from '../types.ts';

const router = express.Router();

// part4 b — Utility Types
// 路由层只调用 getNonSensitiveEntries,客户端拿不到 comment 字段
// part4 b — Typing the request and response
// ⭐ 核心概念: Express 的 Response<T> 泛型让 handler 的响应类型在 tsc 阶段就被记录
// 什么是泛型: 类型层面的参数 — Response<T> 里的 T 代表 res.send() / res.json() 的内容类型
// 标了 Response<T> 之后: tsc 把这个端点声明为"返回 T",IDE hover 端点时显示返回结构
// 注意: 因为 NonSensitiveDiaryEntry 是 DiaryEntry 的子集,DiaryEntry[] 也能赋值给 NonSensitiveDiaryEntry[]
//        (TS 数组协变: B extends A → B[] assignable to A[])— 所以类型注解不是"运行时防泄漏",是"文档化契约"
// 为什么不是 DiaryEntry[]: 这个路由脱敏了 comment,公开声明响应不含 comment 更诚实
// 验证: IDE hover router.get 行的 Response<NonSensitiveDiaryEntry[]>,看到 res.send 期望的形状
// 关联: README chapter4 "Typing the request and response" 段
router.get('/', (_req, res: Response<NonSensitiveDiaryEntry[]>) => {
  res.send(diaryService.getNonSensitiveEntries());
});

export default router;