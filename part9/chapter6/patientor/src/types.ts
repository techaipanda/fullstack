// chapter6 sub-section 3 'Full entries' — Exercise 26 前端 Entry 联合类型
// 课程原话:"You can use the same type definition for an Entry in the frontend.
// For these exercises, it is enough to just copy/paste the definitions from
// the backend to the frontend."
// 所以前端 Entry 类型与 backend/src/types.ts 完全一致(verbatim copy/paste)

export interface Diagnosis {
  code: string;
  name: string;
  latin?: string;
}

export interface BaseEntry {
  id: string;
  description: string;
  date: string;
  specialist: string;
  diagnosisCodes?: Array<Diagnosis['code']>;
}

export const HealthCheckRating = {
  Healthy: 0,
  LowRisk: 1,
  HighRisk: 2,
  CriticalRisk: 3,
} as const;

export type HealthCheckRating = typeof HealthCheckRating[keyof typeof HealthCheckRating];

export interface HealthCheckEntry extends BaseEntry {
  type: "HealthCheck";
  healthCheckRating: HealthCheckRating;
}

export interface OccupationalHealthcareEntry extends BaseEntry {
  type: "OccupationalHealthcare";
  employerName: string;
  sickLeave?: {
    startDate: string;
    endDate: string;
  };
}

export interface HospitalEntry extends BaseEntry {
  type: "Hospital";
  discharge: {
    date: string;
    criteria: string;
  };
}

export type Entry =
  | HospitalEntry
  | OccupationalHealthcareEntry
  | HealthCheckEntry;

// ⭐ 核心概念:前端 Patient 与后端契约对齐
//  - 课程 sub-section 2 后端 Patient.entries: Entry[] 是必填
//  - 不用对齐:前端读 patient.entries 时 TS 不会报错,但语义与后端不一致
//  - 用对齐:前端读 entries 不需要 ?.,switch case 也不需要 narrowing 可选
//  - 注:之前为了兼容 NonSensitivePatient 用了 entries?:,现在 NonSensitivePatient 仍
//   通过 Omit 剥离 entries,前端 Patient.entries 必填,与课程契约一致
export interface Patient {
  id: string;
  name: string;
  occupation: string;
  gender: Gender;
  ssn?: string;
  dateOfBirth?: string;
  entries: Entry[];
}

export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other"
}

export type NonSensitivePatient = Omit<Patient, 'ssn' | 'entries'>;

export type PatientFormValues = Omit<Patient, "id" | "entries">;
