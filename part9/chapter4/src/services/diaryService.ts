import diaryEntries from '../../data/entries.json' with { type: 'json' };

const diaries = diaryEntries as Array<{
  id: number;
  date: string;
  weather: string;
  visibility: string;
  comment: string;
}>;

const getEntries = () => {
  return diaries;
};

const addDiary = (entry: Omit<typeof diaries[number], 'id'>) => {
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