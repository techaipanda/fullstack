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

// part4 b — Adding a new diary
// ⭐ 核心概念: POST 端点从 req.body 取数据,经过 service 写入,返回新创建的 entry
// 不用显式解析 req.body: Express 的 express.json() 中间件(在 src/index.ts 注册)已经把 JSON body 解析成对象放在 req.body
// 为什么不在这里做类型校验: 那是下一节 "Validating requests" 的内容 — 严格按课程顺序,本节只搭骨架
// req.body 当前的类型: any(因为没声明) — 所以 destructure 出来是 any,传给 addDiary 不会触发 tsc 报错(类型层全开)
// ⚠️ 课程原文如此: 课程在本节故意不解析 req.body 类型,保留 any 状态以演示"裸用"的问题 — 下一节用 type guard 收紧
// 下面 5 行的 eslint-disable-next-line 是为了压制 no-unsafe-assignment 警告(工具/课程版本错位,不是 bug)
// 验证: POST /api/diaries { "date":"...","weather":"...","visibility":"...","comment":"..." } → 200 + 新 entry
// 关联: README chapter4 "Adding a new diary" 段
router.post('/', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { date, weather, visibility, comment } = req.body;
  const addedEntry = diaryService.addDiary({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    date,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    weather,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    visibility,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    comment,
  });
  res.json(addedEntry);
});

export default router;