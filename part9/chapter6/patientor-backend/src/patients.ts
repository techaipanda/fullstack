// chapter6 sub-section 3 'Full entries' — Exercise 25 扩展示例数据
// 课程原话:"Let's ditch our old patient seed data from the backend and
// start using this expanded format"
// 这里把 sub-section 2 的 3 条 entries:[] 患者换成 expanded 格式(每人有 entries)
// 数据由课程 'Full entries' 段落里给出的两个示例 + 课程 'expanded format' 链接
// 共同反推。完整 patients-full.ts 在官方 fs-typescript 仓库,这里只取两条足够
// 覆盖三种 entry 类型(HealthCheck / OccupationalHealthcare / Hospital)以便前端验证渲染。

import type { Patient, HealthCheckEntry, HospitalEntry, OccupationalHealthcareEntry } from './types.ts';
import { Gender } from './types.ts';

// ⭐ 核心概念:每个 patient 的 entries 数组里混合三种 entry 类型
//  - 不用混合:前端 switch case 没法覆盖三种 union 成员,TS 报 not exhaustive
//  - 用混合:贴合课程 discriminated union 设计,前端 switch 三个 case 才能验证 exhaustiveness

// Hospital 类型示例(课程 'Full entries' 原文 verbatim 给出)
const hospitalEntry: HospitalEntry = {
  id: 'd811e46d-70b3-4d90-b090-4535c7cf8fb1',
  date: '2015-01-02',
  type: 'Hospital',
  specialist: 'MD House',
  diagnosisCodes: ['S62.5'],
  description:
    "Healing time appr. 2 weeks. patient doesn't remember how he got the injury.",
  discharge: {
    date: '2015-01-16',
    criteria: 'Thumb has healed.',
  },
};

// OccupationalHealthcare 类型示例(课程 'Full entries' 原文 verbatim 给出)
const occHealthcareEntry: OccupationalHealthcareEntry = {
  id: 'fcd59fa6-c4b4-4fec-ac4d-df4fe1f85f62',
  date: '2019-08-05',
  type: 'OccupationalHealthcare',
  specialist: 'MD House',
  employerName: 'HyPD',
  diagnosisCodes: ['Z57.1', 'Z74.3', 'M51.2'],
  description:
    'Patient mistakenly found himself in a nuclear plant waste site without protection gear. Very minor radiation poisoning. ',
  sickLeave: {
    startDate: '2019-08-05',
    endDate: '2019-08-28'
  }
};

// HealthCheck 类型示例(由三种 entry 类型反推,课程没给 HealthCheck verbatim,
// 但课程明确 HealthCheck 必有 healthCheckRating 字段,范围 0-3)
// ⭐ 核心概念:为什么给 Healthy (0)?
//  - 不用 0:HealthCheckRating 联合类型是 0|1|2|3,传任何非字面量 TS 会报类型不匹配
//  - 用 0 (Healthy):与 HealthCheckRating.Healthy 字面量值完全一致
const healthCheckEntry: HealthCheckEntry = {
  id: 'fcd59fa6-c4b4-4fec-ac4d-df4fe1f85f62',
  date: '2019-05-01',
  type: 'HealthCheck',
  specialist: 'Dr. House',
  description: 'Yearly control visit. Cholesterol levels slightly elevated.',
  healthCheckRating: 0,  // Healthy
};

export const patients: Patient[] = [
  {
    id: 'd2773336-f723-11e9-8f0b-362b9e155667',
    name: 'John McClane',
    dateOfBirth: '1986-07-09',
    ssn: '090786-122X',
    gender: Gender.Male,
    occupation: 'New york city cop',
    entries: [hospitalEntry, healthCheckEntry],  // John 有 Hospital + HealthCheck
  },
  {
    id: 'd2773598-f723-11e9-8f0b-362b9e155667',
    name: 'Martin Riggs',
    dateOfBirth: '1979-01-30',
    ssn: '300179-777A',
    gender: Gender.Male,
    occupation: 'Cop',
    entries: [occHealthcareEntry],  // Martin 有 OccupationalHealthcare
  },
  {
    id: 'd27736ec-f723-11e9-8f0b-362b9e155667',
    name: 'Hans Gruber',
    dateOfBirth: '1970-04-25',
    ssn: '250470-555L',
    gender: Gender.Other,
    occupation: 'Technician',
    entries: [],  // Hans 没病历,验证 "No entries" 分支
  }
];
