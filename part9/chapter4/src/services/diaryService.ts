import diaryEntries from '../../data/entries.ts';
import type { DiaryEntry, NonSensitiveDiaryEntry } from '../types.ts';

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

const addDiary = (entry: Omit<DiaryEntry, 'id'>): DiaryEntry => {
  const newDiaryEntry = {
    id: Math.max(...diaries.map(d => d.id)) + 1,
    ...entry
  };

  diaries.push(newDiaryEntry);
  return newDiaryEntry;
};

export default {
  getEntries,
  getNonSensitiveEntries,
  addDiary
};