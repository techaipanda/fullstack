import express from 'express';
import diaryService from '../services/diaryService.ts';

const router = express.Router();

// part4 b — Utility Types
// 路由层只调用 getNonSensitiveEntries,客户端拿不到 comment 字段
// 为什么不在这里给 res 加 Response<NonSensitiveDiaryEntry[]> 类型注解: 那是下一节 "Typing the request and response" 的内容
router.get('/', (_req, res) => {
  res.send(diaryService.getNonSensitiveEntries());
});

export default router;