import express, { type Response } from 'express';
import diaryService from '../services/diaryService.ts';
import type { NonSensitiveDiaryEntry } from '../types.ts';
import { toNewDiaryEntry } from '../utils.ts';
import { z } from 'zod';

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

// part4 b — Preventing an accidental undefined result
// req.params.id 是 string,要用 Number() 转 — 传非数字字符串时 Number() 返回 NaN,findById(NaN) 返回 undefined,走 404 分支
// 为什么 if/else 而不是 res.sendStatus(404)?sendStatus 仍然返回 Response,if/else 让两个分支的返回路径都明确
router.get('/:id', (req, res) => {
  const diary = diaryService.findById(Number(req.params.id));

  if (diary) {
    res.send(diary);
  } else {
    res.sendStatus(404);
  }
});

// part4 c — Using schema validation libraries
// ⭐ 核心概念: POST 端点用 instanceof z.ZodError 区分两类错误,返回不同结构的响应体
// 之前(本节之前): catch 后 instanceof Error → 拼字符串 'Something went wrong. Error: ...'
// 现在:            catch 后 instanceof z.ZodError → 返回 { error: error.issues }
//                  其它异常 → 返回 { error: 'unknown error' }
// 两种响应的区别:
//   - ZodError 响应带 issues 数组(每项含 path + message + code),客户端能定位到具体哪个字段错
//   - unknown error 响应是普通字符串兜底,避免暴露服务器内部异常细节
// 不用 instanceof 区分: 只能返回统一格式,但 Zod 校验错(用户输入问题)和代码错(服务器 bug)性质不同,应该区别对待
// 验证: POST { weather: 'bogus' } → 400 { error: [{ code: 'invalid_enum_value', ... }] }
// 关联: utils.ts 的 newEntrySchema.parse 抛 ZodError;README chapter4 "Using schema validation libraries" 段
router.post('/', (req, res) => {
  try {
    const newDiaryEntry = toNewDiaryEntry(req.body);
    const addedEntry = diaryService.addDiary(newDiaryEntry);
    res.json(addedEntry);

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).send({ error: error.issues });
    } else {
      res.status(400).send({ error: 'unknown error' });
    }
  }
});

export default router;