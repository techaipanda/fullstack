// chapter6 sub-section 4 'Omit with unions' — Exercise 29 POST /api/patients/:id/entries
// 课程原话(Exercise 29):
//   "Your next task is to add endpoint /api/patients/:id/entries to your backend,
//    through which you can POST an entry for a patient.
//    Remember that we have different kinds of entries in our app, so our backend
//    should support all those types and check that at least all required fields
//    are given for each type. In this exercise, you quite likely need to remember
//    this trick. ... Hint: If you have defined the HealthCheckRating with a const
//    object ... You can not a Zod enum for validation since it does not support
//    number values. Instead, yo can use the Zod union:
//      z.union([
//        z.literal(HealthCheckRating.Healthy),
//        z.literal(HealthCheckRating.LowRisk),
//        z.literal(HealthCheckRating.HighRisk),
//        z.literal(HealthCheckRating.CriticalRisk),
//      ])"
//
// 课程没给完整 handler verbatim。下面用 zod discriminatedUnion() + 三种 entry 的 baseSchema 实现
// 校验,handler 结构按 Express 标准 idiom。注意:
//  - EntryWithoutId 已在 types.ts 定义(UnionOmit<Entry,'id'>)
//  - 校验失败返回 zod issues 数组(给前端可读错误信息)
//  - id 后端生成(不接客户端 id)
//  - 此 handler 不是课程 verbatim 实现,是从课程 hint + Express 标准 idiom 组合,代码本身模式通用

import express from 'express';
// ⭐ 核心概念:为什么需要 cors?
//  - 前端 Vite 跑在 :5173,后端跑在 :3001,跨域
//  - 不用 cors:浏览器会拦截 fetch/axios 响应,前端依然拿到 'Network Error' → 'Unrecognized axios error'
//  - 用 cors:加 Access-Control-Allow-Origin 头,浏览器放行
//  - 生产环境应该限制 origin(只允许自己的前端域名),dev 环境用 cors() 默认放行所有
import cors from 'cors';
// ⭐ 核心概念:为什么用 zod?
//  - 课程 Exercise 29 明确推荐 zod 做运行时校验("this trick" 指向 zod union + literal)
//  - 不用 zod:手写 if (typeof body.healthCheckRating !== ...) 字段一多就乱
//  - 用 zod:z.discriminatedUnion('type', [...]) 自动按 type 字段 narrow 到对应 schema,switch case 不用手写
//  - 验证:故意传缺 discharge 的 HospitalEntry,后端返回 400 + zod issues,前端 catch 能拿到
import { z } from 'zod';

import { patients } from './patients.ts';
import {
  Gender, HealthCheckRating,
  type Patient, type NonSensitivePatient, type Entry,
} from './types.ts';

const app = express();
// 解析 JSON body(POST /api/patients 需要)
app.use(express.json());
// 启用 CORS(前端 :5173 跨域访问)
app.use(cors());

const PORT = 3001;

// GET /api/ping —— 前端 App.tsx 启动时调用,验证后端可达
// ⭐ 核心概念:为什么需要 ping?
//  - 不用 ping:App.tsx 会调 patientService.getAll(),如果挂了,UI 一片空白没法判断是前端还是后端问题
//  - 用 ping:课程原话 "make sure that the request made to /api/ping made on startup
//    is successful before continuing" —— 启动前先 ping 一下,失败就停
app.get('/api/ping', (_req, res) => {
  res.send('pong');
});

// GET /api/patients —— 返回 NonSensitivePatient[]
// ⭐ 核心概念:为什么列表用 NonSensitivePatient(去掉 ssn + entries)?
//  - 列表 UI 只需要 name / gender / occupation / health rating,不要 ssn 和 entries
//  - 不用 NonSensitivePatient:返回完整 Patient,前端要每次手动 strip ssn/entries,容易漏
//  - 用 NonSensitivePatient:Omit<Patient,'ssn'|'entries'> 自动剥离,改 Patient 时自动跟
const toNonSensitive = (p: Patient): NonSensitivePatient => {
  // 课程原文策略:从对象解构出非敏感字段后返回
  const { ssn: _ssn, entries: _entries, ...nonSensitive } = p;
  return nonSensitive;
};

app.get('/api/patients', (_req, res) => {
  res.json(patients.map(toNonSensitive));
});

// GET /api/patients/:id —— Exercise 23 核心端点
// 课程原话:
//   "Create an endpoint /api/patients/:id to the backend that returns all of the
//    patient information for one patient, including the array of patient entries
//    that is still empty for all the patients."
// 返回完整 Patient(含 ssn + entries),**不是** NonSensitivePatient(详情页需要全部数据)
app.get('/api/patients/:id', (req, res) => {
  const id = req.params.id;
  const patient = patients.find(p => p.id === id);
  if (patient) {
    res.json(patient);
  } else {
    // ⭐ 核心概念:404 vs 200 + null
    //  - 用 404 + 'Patient not found':浏览器/axios 能根据 status code 判断
    //   (前端 .catch 走 axios 错误分支,能拿到 e.response.data 字符串 → setError 显示)
    //  - 用 200 + null:前端要手动 if (data === null) ...,axios 不抛错
    res.status(404).send('Patient not found');
  }
});

// POST /api/patients —— 创建新患者(前端 AddPatientModal 调)
// ⭐ 核心概念:为什么 id 后端生成?
//  - 不用后端生成 id:前端要生成 uuid,容易重
//  - 用后端生成 id:课程原话 + 唯一性保证
// 这里用随机字符串当 id(简化,不引 uuid 包),生产环境应该用 uuid 库
const generateId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

app.post('/api/patients', (req, res) => {
  // ⭐ 核心概念:为什么 req.body 用 Omit<Patient,'id'|'entries'>?
  //  - 前端 services/patients.ts 的 create(object: PatientFormValues)
  //   PatientFormValues = Omit<Patient,'id'|'entries'> —— 课程类型契约
  //  - 不用这个类型:req.body 类型是 any,前端传错字段也不知道
  const body = req.body as Omit<Patient, 'id' | 'entries'>;
  const newPatient: Patient = {
    id: generateId(),
    entries: [],  // 新患者无病历
    ...body
  };
  patients.push(newPatient);
  // 返回 NonSensitivePatient(列表风格),与 GET /api/patients 一致
  res.json(toNonSensitive(newPatient));
});

// ========== sub-section 4 'Omit with unions' — Exercise 29 ==========
// ⭐ 核心概念:zod discriminatedUnion 按 type 字段自动 narrow
//  - 课程原话:"our backend should support all those types and check that at least all required
//    fields are given for each type" + zod union + literal 提示
//  - 不用 discriminatedUnion:z.union 也能校验,但要手写 if/switch narrow,代码冗长
//  - 用 discriminatedUnion('type', [HealthCheckSchema, OccHCSchema, HospitalSchema]):
//   zod 看到 body.type === 'HealthCheck' 就只校验 HealthCheckEntry 的字段,缺 healthCheckRating 立刻报
//  - 验证:发 POST body={ type:'Hospital', description:'x', specialist:'y', date:'z' }
//   (缺 discharge) → 后端 400 + "discharge: Required"
const baseEntrySchema = z.object({
  description: z.string(),
  date: z.string(),
  specialist: z.string(),
  // 课程 hint:diagnosisCodes 数组里的字符串要存在 diagnoses 表里(本题只检查是数组,不查存在)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  diagnosisCodes: z.array(z.string()).optional(),
});

const healthCheckEntrySchema = baseEntrySchema.extend({
  type: z.literal('HealthCheck'),
  // 课程原话 verbatim hint:"z.union([z.literal(HealthCheckRating.Healthy), ...])"
  //  - 不用 z.union of literals:用 z.number() 太宽,0.5 / -1 / 'abc' 都过
  //  - 用 z.union of literals:只接受 0|1|2|3 四个字面量,前端乱传 '2' 字符串会被拒
  healthCheckRating: z.union([
    z.literal(HealthCheckRating.Healthy),
    z.literal(HealthCheckRating.LowRisk),
    z.literal(HealthCheckRating.HighRisk),
    z.literal(HealthCheckRating.CriticalRisk),
  ]),
});

const occupationalHealthcareEntrySchema = baseEntrySchema.extend({
  type: z.literal('OccupationalHealthcare'),
  employerName: z.string(),
  // 课程原话示例数据里 sickLeave 有,但其他示例(无 sickLeave)没出现,故 optional
  sickLeave: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }).optional(),
});

const hospitalEntrySchema = baseEntrySchema.extend({
  type: z.literal('Hospital'),
  discharge: z.object({
    date: z.string(),
    criteria: z.string(),
  }),
});

const entrySchema = z.discriminatedUnion('type', [
  healthCheckEntrySchema,
  occupationalHealthcareEntrySchema,
  hospitalEntrySchema,
]);

// POST /api/patients/:id/entries —— Exercise 29 核心端点
// 课程原话:"add endpoint /api/patients/:id/entries to your backend, through which you can
// POST an entry for a patient"
app.post('/api/patients/:id/entries', (req, res) => {
  // 1. 找 patient —— 找不到直接 404
  const id = req.params.id;
  const patient = patients.find(p => p.id === id);
  if (!patient) {
    return res.status(404).send('Patient not found');
  }

  // 2. zod 校验 body —— 失败返回 issues 数组
  // ⭐ 核心概念:为什么不用 as EntryWithoutId 而用 zod 校验?
  //  - 用 as:编译期类型正确但运行期 body 可能是任意结构,字段缺失/类型错误时不会立刻发现
  //  - 用 zod:运行期校验,失败立刻 400 + 详细 issues,前端能 catch 显示
  //  - 验证:curl POST 缺字段的 body,看到 400 + zod issues
  const parseResult = entrySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues });
  }

  // 3. 加 id 后存入 patient.entries
  const newEntry: Entry = {
    ...parseResult.data,
    id: generateId(),
  } as Entry;
  patient.entries.push(newEntry);

  // 4. 返回新增的 entry(不含 patient,只 entry)
  return res.json(newEntry);
});

// ========== Exercise 11 (前置,9-5 时已经 GET /api/diagnoses 但没 backend 实现) ==========
// 课程 Exercise 11 在 part 9 sub-section 2 'Patientor backend' 实现过 /api/diagnoses,
// 这里补一个最小 mock(ICD-10 几条)以让 Exercise 27 的 diagnoses 反查能跑通
// 注:课程原话没要求 backend 这里实现 /api/diagnoses(默认从前面的 Exercise 拿),但
// 我们的 backend 没 9.5 的前置,所以补一个最小 mock
const diagnoses = [
  { code: 'S62.5', name: 'Fracture of other finger', latin: 'Fractura digiti alterius' },
  { code: 'Z57.1', name: 'Occupational exposure to radiation' },
  { code: 'Z74.3', name: 'Need for continuous supervision' },
  { code: 'M51.2', name: 'Other specified intervertebral disc displacement' },
];

app.get('/api/diagnoses', (_req, res) => {
  res.json(diagnoses);
});

// 课程原话:"关闭 backend 会清空所有数据"(in-memory mock),所以不写文件

app.listen(PORT, () => {
  console.log(`Patientor backend running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET    http://localhost:3001/api/ping');
  console.log('  GET    http://localhost:3001/api/patients');
  console.log('  GET    http://localhost:3001/api/patients/:id   ← Exercise 23');
  console.log('  POST   http://localhost:3001/api/patients');
  console.log('  POST   http://localhost:3001/api/patients/:id/entries   ← Exercise 29');
  console.log('  GET    http://localhost:3001/api/diagnoses');
});