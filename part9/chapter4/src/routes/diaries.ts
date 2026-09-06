import express, { type Response } from 'express';
import diaryService from '../services/diaryService.ts';
import type { NonSensitiveDiaryEntry } from '../types.ts';
import toNewDiaryEntry from '../utils.ts';

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
// part4 b — Validating requests
// ⭐ 核心概念: POST 端点用 try/catch 统一处理 toNewDiaryEntry 的校验错误
// 之前(本节之前): 直接 destructure req.body,类型层全开(全是 any),非法 body 也照样写库
// 现在(本节):     try { toNewDiaryEntry(req.body) } 把 unknown body 收窄到 NewDiaryEntry,任何字段错抛 Error
// catch 处理:    error: unknown → 用 instanceof Error 守卫再访问 .message,避免访问 undefined 属性
// 响应:          400 + 'Something went wrong. Error: <具体原因>'(让客户端知道哪儿错了)
// 不用 try/catch:  校验错会让 Node 进程崩溃(同步抛错未被捕获会触发 uncaughtException,服务挂掉)
// 关联: utils.ts 的 toNewDiaryEntry + parseX 抛 Error 链路
// 验证: POST { "weather":"bogus" } → 400 'Something went wrong. Error: Incorrect weather: bogus'
// 关联: README chapter4 "Validating requests" 段
router.post('/', (req, res) => {
  try {
    // 课程原文如此: toNewDiaryEntry 内部已经 type guard 收窄到 NewDiaryEntry(req.body 是 any 但 toNewDiaryEntry 入参是 unknown,合法)
    const newDiaryEntry = toNewDiaryEntry(req.body);
    const addedEntry = diaryService.addDiary(newDiaryEntry);
    res.json(addedEntry);
  } catch (error: unknown) {
    let errorMessage = 'Something went wrong.';
    if (error instanceof Error) {
      errorMessage += ' Error: ' + error.message;
    }
    res.status(400).send(errorMessage);
  }
});

export default router;