// chapter6 sub-section 3 'Full entries' — Entry 联合类型扩展
// 课程原文 verbatim 复制:
//   - BaseEntry 包含 id/description/date/specialist 四个公共字段,可选 diagnosisCodes
//   - diagnosisCodes 用 Array<Diagnosis['code']>(而不是 string[]),与 Diagnosis.code 类型自动对齐
//   - 用 ESlint 推荐语法 Array<...> 而不是 [...][]("starts to look a bit strange")
//
//   - HealthCheckRating 用 "const object" 模式:
//        const HealthCheckRating = { Healthy: 0, LowRisk: 1, HighRisk: 2, CriticalRisk: 3 } as const;
//        type HealthCheckRating = typeof HealthCheckRating[keyof typeof HealthCheckRating];
//     用 keyof typeof 取 value 类型,得到字面量联合 0|1|2|3
//     这种模式比 enum 更轻量,且能直接用 HealthCheckRating.Healthy 这种常量访问
//
//   - HealthCheckEntry extends BaseEntry,加 type: "HealthCheck" tag 和 healthCheckRating 字段
//     type 字段是 TypeScript discriminated union 的"tag",switch case 能用它 narrowing
//
//   - Entry = HospitalEntry | OccupationalHealthcareEntry | HealthCheckEntry 联合导出

// ⭐ 核心概念:Diagnosis 已有但放在 types.ts 里,BaseEntry.diagnosisCodes 直接引用 Diagnosis['code']
//  - 不用 Diagnosis['code']:用 string[],Diagnosis.code 类型将来变了不会跟
//  - 用 Diagnosis['code']:字段类型与 Diagnosis.code 自动同步
export interface Diagnosis {
  code: string;
  name: string;
  latin?: string;
}

// 课程原文 verbatim:
//   interface BaseEntry {
//     id: string;
//     description: string;
//     date: string;
//     specialist: string;
//     diagnosisCodes?: Array<Diagnosis['code']>;
//   }
// ⭐ 核心概念:为什么 diagnosisCodes 是可选的?
//  - 示例数据里 HealthCheck 类型没有 diagnosisCodes 字段
//  - 不用 ?:HealthCheckEntry 必须传 diagnosisCodes,与示例数据不一致
//  - 用 ?:三个 entry 类型共用 BaseEntry,需要字段就各自加,可选字段在 BaseEntry 声明一次
export interface BaseEntry {
  id: string;
  description: string;
  date: string;
  specialist: string;
  diagnosisCodes?: Array<Diagnosis['code']>;
}

// ⭐ 核心概念:HealthCheckRating 用 const object + typeof 而不是 enum
//  - 不用 enum:课程明确推荐 const object 模式,"a perfect case for a const as object"
//  - 用 const object + as const:值是 readonly 字面量常量,类型用 typeof 提取成字面量联合
//  - 验证:VSCode hover HealthCheckRating.Healthy 看到 0 字面量类型
export const HealthCheckRating = {
  Healthy: 0,
  LowRisk: 1,
  HighRisk: 2,
  CriticalRisk: 3,
} as const;

export type HealthCheckRating = typeof HealthCheckRating[keyof typeof HealthCheckRating];

// 课程原文 verbatim(HealthCheckEntry 部分):
//   interface HealthCheckEntry extends BaseEntry {
//     type: "HealthCheck";
//     healthCheckRating: HealthCheckRating;
//   }
// ⭐ 核心概念:为什么 type 字段是 string literal "HealthCheck" 而非 enum?
//  - 不用 string literal:TS 不会做 discriminated union narrowing,
//   switch (entry.type) 的 case 不会自动 narrow 到 HealthCheckEntry
//  - 用 string literal "HealthCheck":TS 看到 type 字段是这个字面量,
//   就把 entry narrow 到 HealthCheckEntry,自动得到 healthCheckRating 字段
export interface HealthCheckEntry extends BaseEntry {
  type: "HealthCheck";
  healthCheckRating: HealthCheckRating;
}

// HospitalEntry — 由课程示例数据反推,课程页面未给 verbatim 定义
// ⭐ 核心概念:从示例数据反推字段
//  - 课程给出的示例(在 'Full entries' 中段):
//      {
//        id: 'd811e46d-70b3-4d90-b090-4535c7cf8fb1',
//        date: '2015-01-02',
//        type: 'Hospital',
//        specialist: 'MD House',
//        diagnosisCodes: ['S62.5'],
//        description: "Healing time appr. 2 weeks...",
//        discharge: { date: '2015-01-16', criteria: 'Thumb has healed.' }
//      }
//  - 公共字段(id/date/specialist/diagnosisCodes/description)继承 BaseEntry
//  - Hospital 特有:type: "Hospital" + discharge: { date, criteria }
//  - 注:这是从示例数据反推,课程页面 Exercise 25 描述"conform to the new example data",
//   但页面没给出 HospitalEntry verbatim 定义 —— 此处按字段语义推断
export interface HospitalEntry extends BaseEntry {
  type: "Hospital";
  discharge: {
    date: string;
    criteria: string;
  };
}

// OccupationalHealthcareEntry — 由课程示例数据反推
//  - 示例数据:
//      {
//        id: 'fcd59fa6-c4b4-4fec-ac4d-df4fe1f85f62',
//        date: '2019-08-05',
//        type: 'OccupationalHealthcare',
//        specialist: 'MD House',
//        employerName: 'HyPD',
//        diagnosisCodes: ['Z57.1', 'Z74.3', 'M51.2'],
//        description: 'Patient mistakenly found himself...',
//        sickLeave: { startDate: '2019-08-05', endDate: '2019-08-28' }
//      }
//  - 公共字段继承 BaseEntry
//  - OccupationalHealthcare 特有:type: "OccupationalHealthcare" + employerName: string + 可选 sickLeave
//  - 注:sickLeave 在示例数据中出现了,但不是每个 OccupationalHealthcare 都必有,所以用 ?
//  - 这是从示例数据反推 + 字段语义,课程页面没给 verbatim 定义
export interface OccupationalHealthcareEntry extends BaseEntry {
  type: "OccupationalHealthcare";
  employerName: string;
  sickLeave?: {
    startDate: string;
    endDate: string;
  };
}

// 课程原文 verbatim:
//   export type Entry =
//     | HospitalEntry
//     | OccupationalHealthcareEntry
//     | HealthCheckEntry;
// ⭐ 核心概念:Entry 是 discriminated union
//  - 三个 interface 都有 type 字段(string literal 不同)
//  - TS 看到 entry.type 就 narrow 到对应子类型
//  - switch case 必须覆盖 union 每个成员,否则 TS strict 报 "not exhaustive"
export type Entry =
  | HospitalEntry
  | OccupationalHealthcareEntry
  | HealthCheckEntry;

// Patient 在 sub-section 2 'Patientor frontend' 已完整,此处只改 entries 字段类型
// ⭐ 核心概念:为什么 Patient.entries 是 Entry[] 必填而不是 ?
//  - 课程后端 Patient.entries 必填(后端 GET /:id 永远返回 entries 数组)
//  - 用 Entry[] 必填:与后端契约对齐,前端读 patient.entries 时不需要 ?.
//  - 不用 ?:与课程契约一致
//  - 验证:tsc --noEmit 不报 "Property entries is optional" 的相关错误
export interface Patient {
  id: string;
  name: string;
  ssn: string;
  occupation: string;
  gender: Gender;
  dateOfBirth: string;
  entries: Entry[];
}

// ⭐ 核心概念:NonSensitivePatient = Omit<Patient, 'ssn' | 'entries'>
//  - 列表接口仍然剥离 ssn + entries(隐私 + 数据量)
//  - 详情接口返回完整 Patient,现在 Patient.entries 是 Entry[] 联合类型(不再是空数组)
//  - 不用 Omit:每个返回字段手写,改 Patient 时漏字段风险
export type NonSensitivePatient = Omit<Patient, 'ssn' | 'entries'>;

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other'
}
