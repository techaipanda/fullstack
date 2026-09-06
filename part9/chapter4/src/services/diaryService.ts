import diaryEntries from '../../data/entries.ts';
import type { DiaryEntry, NewDiaryEntry, NonSensitiveDiaryEntry } from '../types.ts';

const diaries: DiaryEntry[] = diaryEntries;

const getEntries = (): DiaryEntry[] => {
  return diaries;
};

// part4 b — Utility Types
// ⭐ 核心概念: 用解构 + 显式列出要保留的字段 来构造 NonSensitiveDiaryEntry
// 不用这种写法: 直接 diaries.map(d => d) → TS 推断返回 DiaryEntry[],仍然带 comment
// 用这种写法:   显式只挑 4 个字段 → TS 推断返回 NonSensitiveDiaryEntry[],无 comment
// 为什么不用 Omit 在运行时去字段: TS 的 Omit 只在类型层面生效,运行时还要靠 JS 显式不取字段
// 验证: GET /api/diaries 响应里每条日记只有 id/date/weather/visibility,无 comment
// 关联: README chapter4 "Utility Types" 段
const getNonSensitiveEntries = (): NonSensitiveDiaryEntry[] => {
  return diaries.map(({ id, date, weather, visibility }) => ({
    id,
    date,
    weather,
    visibility,
  }));
};

const addDiary = (entry: NewDiaryEntry): DiaryEntry => {
  const newDiaryEntry = {
    id: Math.max(...diaries.map(d => d.id)) + 1,
    ...entry
  };

  diaries.push(newDiaryEntry);
  return newDiaryEntry;
};

// part4 b — Preventing an accidental undefined result
// ⭐ 核心概念: 返回值类型用联合 DiaryEntry | undefined — 把"找不到"显式编码进类型系统
// 什么是数组协变下的 Array.find: TS 把 find 的返回推断为 T | undefined,但不显式标注容易让调用方忘记处理 undefined
// 显式标注:        强制调用方必须先判 undefined 再用,否则对 diary 的属性访问(如 diary.id)tsc 报 TS18048 "X is possibly 'undefined'"
// 不用联合标注:   开发者可能在没找到时拿到 undefined,后续访问 diary.id 等字段会运行时 TypeError
// ⚠️ 实测: Express 的 res.send(body?: any) 签名很宽松,直接传 undefined 不报错 — 类型保护作用于"后续属性访问",不是"传递"
// 验证: 路由里去掉 if (diary) 直接访问 diary.id,tsc 立刻报 TS18048
// 关联: README chapter4 "Preventing an accidental undefined result" 段
const findById = (id: number): DiaryEntry | undefined => {
  const entry = diaries.find(d => d.id === id);
  return entry;
};

export default {
  getEntries,
  getNonSensitiveEntries,
  addDiary,
  findById
};