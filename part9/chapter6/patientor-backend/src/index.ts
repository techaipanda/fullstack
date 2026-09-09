// chapter6 sub-section 2 'Patientor frontend' — Exercise 23 backend entry
// 课程原文只列了 Patient 类型 + GET /api/patients/:id 一个端点。
// 但前端 starter 还依赖 GET /api/ping + GET /api/patients + POST /api/patients,
// 这里一并实现以跑通端到端 + 修掉前端 Add 按钮的 'Unrecognized axios error'。

import express from 'express';
// ⭐ 核心概念:为什么需要 cors?
//  - 前端 Vite 跑在 :5173,后端跑在 :3001,跨域
//  - 不用 cors:浏览器会拦截 fetch/axios 响应,前端依然拿到 'Network Error' → 'Unrecognized axios error'
//  - 用 cors:加 Access-Control-Allow-Origin 头,浏览器放行
//  - 生产环境应该限制 origin(只允许自己的前端域名),dev 环境用 cors() 默认放行所有
import cors from 'cors';

import { patients } from './patients.ts';
import type { Patient, NonSensitivePatient } from './types.ts';

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

// 课程原话:"关闭 backend 会清空所有数据"(in-memory mock),所以不写文件

app.listen(PORT, () => {
  console.log(`Patientor backend running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET    http://localhost:3001/api/ping');
  console.log('  GET    http://localhost:3001/api/patients');
  console.log('  GET    http://localhost:3001/api/patients/:id   ← Exercise 23');
  console.log('  POST   http://localhost:3001/api/patients');
});