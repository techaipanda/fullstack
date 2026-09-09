// chapter6 sub-section 2 'Patientor frontend' — Exercise 24 扩展 patientService
// chapter6 sub-section 4 'Omit with unions' — Exercise 30 增 addEntry
import axios from "axios";
import { Patient, PatientFormValues, NonSensitivePatient, Entry, EntryWithoutId } from "../types";

import { apiBaseUrl } from "../constants";

// ⭐ 核心概念:为什么 getAll 用 NonSensitivePatient?
//  - 后端 Exercise 23 的 GET /api/patients 返回 NonSensitivePatient[] (Omit<Patient,'ssn'|'entries'>)
//  - 之前用 Patient[]:类型"过宽",实际拿到的对象没有 ssn/entries,访问会 undefined
//  - 改用 NonSensitivePatient[]:与后端契约 1:1,前端不会误以为有 ssn/entries
//  - 验证:TypeScript 检查 getAll 返回值给 App.tsx 的 useState<Patient[]> 会报错(Patient 比 NonSensitivePatient 字段多)
const getAll = async (): Promise<NonSensitivePatient[]> => {
  const { data } = await axios.get<NonSensitivePatient[]>(
    `${apiBaseUrl}/patients`
  );

  return data;
};

// ⭐ 核心概念:为什么 getById 返回 Patient(完整版)?
//  - Exercise 24 详情页需要 ssn + entries,只能从 Patient 接口拿
//  - 后端 GET /api/patients/:id 返回完整 Patient(Exercise 23 端点)
//  - 不用 getById:详情页要单独发一次 fetch 拿 patient,代码冗余
//  - 用 getById:封装 fetch by id,与 getAll 风格一致
const getById = async (id: string): Promise<Patient> => {
  const { data } = await axios.get<Patient>(
    `${apiBaseUrl}/patients/${id}`
  );

  return data;
};

const create = async (object: PatientFormValues): Promise<NonSensitivePatient> => {
  const { data } = await axios.post<NonSensitivePatient>(
    `${apiBaseUrl}/patients`,
    object
  );

  return data;
};

// ⭐ 核心概念:为什么 addEntry 返回 Entry(完整版)而不是 NonSensitivePatient?
//  - 后端 Exercise 29 POST /:id/entries 返回新增的 Entry 完整版(只有 id + 5 个字段)
//  - 不用 Entry:类型"过宽",拿到的对象没有 Patient 的字段,语义不匹配
//  - 用 Entry:与后端契约对齐,前端把新 entry concat 到 patient.entries
//  - 验证:PatientDetailPage 拿到 entry 后 setPatient({...patient, entries:[...patient.entries, entry]})
const addEntry = async (id: string, object: EntryWithoutId): Promise<Entry> => {
  const { data } = await axios.post<Entry>(
    `${apiBaseUrl}/patients/${id}/entries`,
    object
  );
  return data;
};

export default {
  getAll, getById, create, addEntry
};