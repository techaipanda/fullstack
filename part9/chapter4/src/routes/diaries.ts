import express, { type NextFunction, type Request, type Response } from 'express';
import diaryService from '../services/diaryService.ts';
import type { DiaryEntry, NewDiaryEntry, NonSensitiveDiaryEntry } from '../types.ts';
import { newEntrySchema } from '../utils.ts';
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

// part4 d — Parsing request body in middleware
// ⭐ 核心概念: newDiaryParser — Express 中间件函数(三参数 req/res/next),只负责"校验 + 放行"
// 之前(本节之前): 校验逻辑直接写在 POST handler 内,handler 里 try/catch + instanceof z.ZodError
// 现在:            校验挪到独立中间件,handler 不再 try/catch,只用 next() 传 ZodError 给 errorMiddleware
// 三参数职责:
//   - req:  Request<unknown, unknown, unknown> — 默认未知 body 类型,中间件不预设 schema
//   - res:  Response — 中间件不写响应,校验失败用 next(error) 把 error 传给后续 errorMiddleware
//   - next: NextFunction — 校验通过调 next() 进入下一个 handler;校验失败调 next(error) 跳过 handler 进入错误处理
// 为什么 next(error) 不 throw: Express middleware 链必须显式调 next 才能传 error,throw 只会冒泡到 Express 默认错误处理器,自定义 errorMiddleware 接不到
// 关联: utils.ts 的 newEntrySchema;README chapter4 "Parsing request body in middleware" 段
const newDiaryParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    newEntrySchema.parse(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

// part4 d — Parsing request body in middleware
// ⭐ 核心概念: Request<P, ResBody, ReqBody> — Express 的 Request 泛型三参数,把"已校验"这个事实写进类型
// 第三参数 ReqBody = NewDiaryEntry: 中间件成功后 req.body 已被 Zod 收窄,handler 直接用 req.body 不需要再 cast/parse
// 第一/二参数 unknown: 课程原文写 "we do not need those for now",用 unknown 占位(必须给 <i>some</i> 值才能定位第三参数)
//                实际语义:第一个 P 是路由 params(如 :id 解析为 P),第二个 ResBody 是 Response 的形状(不需要)
// 之前(本节之前): handler 写 const newDiaryEntry = toNewDiaryEntry(req.body);diaryService.addDiary(newDiaryEntry)
// 现在:            handler 直接 diaryService.addDiary(req.body) — 一行,body 类型安全
// 验证: hover 在 req.body 上看到 NewDiaryEntry 而非 any/unknown
// 关联: newDiaryParser 中间件校验后 next();README chapter4 "Parsing request body in middleware" 段
router.post('/', newDiaryParser, (req: Request<unknown, unknown, NewDiaryEntry>, res: Response<DiaryEntry>) => {
  const addedEntry = diaryService.addDiary(req.body);
  res.json(addedEntry);
});

// part4 d — Parsing request body in middleware
// ⭐ 核心概念: errorMiddleware — Express 错误处理中间件(四参数 error/req/res/next),由 router.use() 装到整个 router
// 为什么必须是四参数: Express 通过 function arity 区分普通中间件(req/res/next)vs 错误处理(error/req/res/next)
//                 只有 arity=4 的函数被识别为 error handler,arity=3 的就算签名像 error handler 也不会触发
// 两种错误路径:
//   - error instanceof z.ZodError → 客户端输入校验失败 → 自己处理,res.status(400).send({ error: error.issues })
//   - else → 其它未知错误 → next(error) 传给下一个 error handler(通常是 Express 默认错误处理器,返回 500)
// 为什么 ZodError 自己处理,其它 next(error): ZodError 是"已知用户错误",返回结构化错误信息对客户端有用;
//                                          其它错误可能是代码 bug,不要泄露细节,转给默认 500 处理
// 关联: README chapter4 "Parsing request body in middleware" 段;newDiaryParser 中间件的 next(error)
const errorMiddleware = (error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).send({ error: error.issues });
  } else {
    next(error);
  }
};

router.use(errorMiddleware);

export default router;