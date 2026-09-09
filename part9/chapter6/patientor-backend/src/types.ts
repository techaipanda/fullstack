// chapter6 sub-section 2 'Patientor frontend' — Exercise 23 后端类型扩展
// 课程原文 verbatim 复制:
//   - Entry 接口(暂时空,后续 sub-section 3 'Full entries' 才填充字段)
//   - Patient 加 ssn + dateOfBirth + entries: Entry[]
//   - 新增 NonSensitivePatient = Omit<Patient, 'ssn' | 'entries'>

// 课程原文(verbatim):
//   // eslint-disable-next-line @typescript-eslint/no-empty-object-type
//   export interface Entry {
//   }
// 注释保留:课程原文故意用空接口(后续小节才加字段),需要关闭 lint 规则
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Entry {
}

// chapter6 sub-section 2 'Patientor frontend' — Exercise 23 Patient
// ⭐ 核心概念:Patient 在 Exercise 23 才补全 ssn / dateOfBirth / entries
//  - 前端 starter types.ts 的 Patient 是残的(只 id/name/occupation/gender,ssn/dateOfBirth 可选,无 entries)
//  - Exercise 23 要求后端用"完整版" Patient,前端之后会跟进
//  - 不用补全:GET /api/patients 返回的 Patient[] 类型与前端 Patient 不兼容
//  - 用补全版:后端是 source of truth,前端 Exercise 24 之后改 types.ts 对齐
export interface Patient {
  id: string;
  name: string;
  ssn: string;
  occupation: string;
  gender: Gender;
  dateOfBirth: string;
  entries: Entry[];
}

// chapter6 sub-section 2 'Patientor frontend' — Exercise 23 NonSensitivePatient
// ⭐ 核心概念:NonSensitivePatient = Omit<Patient, 'ssn' | 'entries'>
//  - 列表接口 GET /api/patients 应**不返回 ssn**(隐私)
//  - 列表接口也**不返回 entries**(患者列表只需要基本信息,entries 在详情页按需拉)
//  - 详情接口 GET /api/patients/:id 返回完整 Patient(含 ssn + entries)
//  - 不用 Omit:每个返回字段都要手写一遍,改 Patient 时容易漏字段
export type NonSensitivePatient = Omit<Patient, 'ssn' | 'entries'>;

// ⭐ 核心概念:Gender 用 enum 而非字符串字面量联合
//  - 前端 starter types.ts 用 enum Gender(Male/Female/Other),值是 'male'/'female'/'other'
//  - 后端用同一份 enum,axios 收到的 Patient.gender 字段就是 'male' 这种字面量字符串
//  - 不用 enum(用 'male'|'female'|'other' 字面量联合):与前端 Gender.Male 引用方式不一致
export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other'
}