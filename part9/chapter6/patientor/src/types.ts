// chapter6 sub-section 2 'Patientor frontend' — Exercise 24 前端类型扩展
// 课程后端 Exercise 23 给的 Entry 是空接口,前端要 import 同样的端才能引用 Entry[]
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Entry {
}

export interface Diagnosis {
  code: string;
  name: string;
  latin?: string;
}

export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other"
}

// ⭐ 核心概念:Patient 加 entries: Entry[] (可选)
//  - 课程后端 Exercise 23 Patient.entries: Entry[] 是**必填**(后端 GET 永远返回 entries: [])
//  - 前端这里用 entries?: Entry[] **可选**,是为了兼容 GET /api/patients 的返回类型
//   NonSensitivePatient = Omit<Patient,'ssn'|'entries'> 没有 entries
//  - 详情页 GET /api/patients/:id 返回完整 Patient,detail 页组件期望 Patient.entries 必有
//   所以读 detail 时需要 narrowing 或单独用 PatientForDetail 类型
//  - 不用 Omit 把 entries 也剥掉:详情页组件 props 类型要单独写
export interface Patient {
  id: string;
  name: string;
  occupation: string;
  gender: Gender;
  ssn?: string;
  dateOfBirth?: string;
  // Exercise 24 新增 —— 后端 Patient 必填,前端用可选以兼容列表 NonSensitivePatient 返回
  entries?: Entry[];
}

// ⭐ 核心概念:NonSensitivePatient = Omit<Patient, 'ssn' | 'entries'>
//  - 课程 Exercise 23 后端定义:列表接口剥离 ssn(隐私)+ entries(列表页不需要)
//  - 不用:GET /api/patients 返回的 Patient[] 与前端 Patient 类型对不齐(后端没 ssn/entries,前端要 ssn/entries)
//  - 用 NonSensitivePatient:getAll() 显式返回 NonSensitivePatient[],类型契约明确
export type NonSensitivePatient = Omit<Patient, 'ssn' | 'entries'>;

export type PatientFormValues = Omit<Patient, "id" | "entries">;