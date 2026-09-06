import diaryEntries from '../../data/entries.ts';
import type { DiaryEntry } from '../types.ts';

const diaries: DiaryEntry[] = diaryEntries;

const getEntries = (): DiaryEntry[] => {
  return diaries;
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
  addDiary
};