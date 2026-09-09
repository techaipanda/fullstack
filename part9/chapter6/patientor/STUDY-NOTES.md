# 第 9 章 第 6 节 ·Grande finale: Patientor

> 课程链接: <https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-typescript/chapter-6>
> 起始代码 (官方 starter): <https://github.com/fullstack-hy2020/fs-typescript/tree/main/patientor/frontend>

本目录 `patientor/` 是从官方仓库直接 clone 的 starter,本节**没有要写的代码**,核心是
**先读懂这个 starter 代码库,再进入下一节开始改**。下面的笔记是按课程要求,通读 starter
之后留下的中文学习记录。

---

## 子小节 1 · Working with an existing codebase

> 课程原文要点(中文转述)
>
> 1. 进一个已有代码库,先**读 README.md**:通常会说明应用是干嘛的、依赖、怎么启。
> 2. README 烂掉或缺失 →直接看 `package.json`,看 dependencies、scripts、build 工具。
> 3. **把应用跑起来,自己点一点**(课程原话:"It is always a good idea to start the
>    application and click around to verify you have a functional development environment")。
> 4. 浏览**文件夹结构**,找功能的边界。本节示例项目是**按 feature 切**的。
> 5. 找 `types.ts`(或类似文件),看类型。VSCode hover 变量/参数能看到大量上下文。
> 6. 读 **tests**(unit / integration / e2e)。重构和加新功能时,测试是最重要的工具。
> 7. 读代码本身就是一种技能,**第一遍读不懂很正常**。课程原话:
> > "Think of it all like growth rings in trees. Understanding everything requires
> > digging deep into the code and business domain requirements. The more code you read,
> > the better you will be at understanding it. You will most likely read far more code
> > than you are going to produce throughout your life."

### ⭐ 核心概念:本节为什么没有代码改动

按课程顺序,这一节是**纯引导**,告诉你"动手前先读懂"。如果跳过直接看 Exercise 23,
会一脸懵 —— 不知道 App 的 props 怎么传、不知道 services 怎么写、不知道 Patient 类型长
什么样。所以本节的 "代码工作" 是:

- ✅ 把 starter 拉下来 → ✅ 装依赖 → ✅ lint + build 通过 → ✅ 写本学习笔记

下一节 "Patientor frontend" 开始才会真正改 starter(加 `/api/patients/:id` 路由、加
patient 详情页等)。

---

## 读 starter 的实战笔记

### 1) README.md(4 行)

```text
# Patientor frontend
- npm install 后 npm run dev
- 应用可以无 backend 跑起来,但 /api/ping 要成功
```

⚠️ 这 README 很短(很可能是课程故意留的 stub,呼应原文"如果 README 是 stub 就去看
package.json"),所以直接跳到 `package.json`。

### 2) package.json —— 看 5 件事

| 字段 | 值 | 含义 |
|---|---|---|
| `type` | `"module"` | ESM(与本仓库其他 chapter 一致) |
| `scripts.dev` | `vite` | 用 Vite 启 dev server |
| `scripts.build` | `tsc && vite build` | **先 tsc 类型检查,再 vite 打包** —— 所以 build 失败先看 tsc 报错 |
| `dependencies` | `@mui/material`, `@mui/icons-material`, `@emotion/*`, `react-router-dom`, `axios` | 与课程一致:UI 用 Material UI,路由用 React Router v7,HTTP 用 axios |
| `react` | `^19.2.4` | 与本仓库其他 chapter 同 major,组件写法无差异 |

⭐ 注意:**没有 `json-server`**。Patientor 的后端是 Express + TypeScript,前端依赖
`http://localhost:3001/api`(见 `src/constants.ts`),与 chapter5 用 json-server 不同。

### 3) 文件夹结构(feature-wise)

src/
├── App.tsx                              # 顶层 Router + Container
├── components/
│   ├── HealthRatingBar.tsx              # 单文件组件(没有子组件)
│   ├── AddPatientModal/                 # 目录组件(有子组件)
│   │   ├── index.tsx                    #   弹窗本体
│   │   └── AddPatientForm.tsx           #   子组件:表单
│   └── PatientListPage/                 # 目录组件(无独立子组件时仍用目录)
│       └── index.tsx
├── services/
│   └── patients.ts                      # axios 封装: getAll / create
├── types.ts                              # 共享类型: Patient, Diagnosis, Gender, PatientFormValues
├── constants.ts                         # apiBaseUrl = 'http://localhost:3001/api'
├── main.tsx                             # ReactDOM.createRoot 入口
├── index.css                            # 全局样式
└── vite-env.d.ts                        # Vite 环境变量类型
```

⭐ 核心概念:**"目录 vs 文件"组件的判定标准**
- 课程原话:"If a component has some subcomponents not used elsewhere in the app,
  it might be a good idea to define the component and its subcomponents in a directory."
- 例:`AddPatientModal` 有 `AddPatientForm` 子组件 → 用 `components/AddPatientModal/`
- 反例:`HealthRatingBar` 没有子组件 → 单文件 `components/HealthRatingBar.tsx`
- ⚠️ 即使没有子组件,`PatientListPage` 也用目录(因为将来可能要加 `PatientRow` 等子组件)
- 不用 vs 用的区别:用目录更容易后续扩展 + 子组件**不会被其他模块误用**

### 4) types.ts(共 4 个 export)

```typescript
export interface Diagnosis {
  code: string;
  name: string;
  latin?: string;       // 拉丁语学名,可选
}

export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other"
}

export interface Patient {
  id: string;
  name: string;
  occupation: string;
  gender: Gender;
  ssn?: string;          // 可选
  dateOfBirth?: string;   // 可选
}

export type PatientFormValues = Omit<Patient, "id" | "entries">;
```

⭐ 核心概念:`PatientFormValues` 用 `Omit<Patient, "id" | "entries">`
- 创建患者表单**不需要** `id`(后端生成)和 `entries`(新患者没病历)
- ⭐ 不用 Omit:表单组件 props 要重复写 name/occupation/gender/ssn/dateOfBirth 5 个字段
- ⭐ 用 Omit:**复用 Patient 类型,自动排除 id/entries**,改 Patient 时表单自动跟
- 验证:在 Exercise 23 后端加 `entries: Entry[]` 到 Patient,前端表单类型不变(因为已 omit)

### 5) App.tsx —— 看 props 怎么传

```typescript
const [patients, setPatients] = useState<Patient[]>([]);
// ...
<PatientListPage
  patients={patients}
  setPatients={setPatients}
/>
```

⭐ 核心概念:`setPatients` 的类型签名
- 课程专门强调:`setPatients: React.Dispatch<React.SetStateAction<Patient[]>>`
- 这是 `useState` 返回的 setter 的标准签名,React TypeScript cheatsheet 的典型示例
- 验证:VSCode hover `setPatients` 能看到 `Dispatch<SetStateAction<Patient[]>>`

### 6) services/patients.ts —— 看 axios 封装

```typescript
const getAll = async () => {
  const { data } = await axios.get<Patient[]>(`${apiBaseUrl}/patients`);
  return data;
};
```

⭐ 核心概念:**axios 泛型写在 `.get<T>()` 上,不是 `<T>` 包函数**
- 错(TS 报错):`async <T>(): T => axios.get(...)`
- 对:`axios.get<Patient[]>(...)` ← 类型参数绑在 axios 调用上,**返回值的 data 自动是 Patient[]**
- 验证:在 getAll 上加 `const data: number = await ... getAll()`,TS 会报错(data 实际是 Patient[])

### 7) ⭐⭐ 看测试在哪

本 starter **没有测试**(单元测试也没有)。这是预期 —— 课程原话:"If the project has unit,
integration, or end-to-end tests, reading those is most likely beneficial." 这是条件句:有就读,
没有就跳过。Patientor 的 e2e 测试在 Exercise 33 才出现(`patientor-tests/` 目录)。

---

## 验证 starter 可用性

| 步骤 | 命令 | 结果 |
|---|---|---|
| 装依赖 | `npm install` | ✅ 250 packages added in 34s |
| Lint | `npm run lint` | ✅ eslint 0 errors / 0 warnings |
| Build | `npm run build` | ✅ tsc 通过 + vite build 1.09s → dist/ |

(Dev server 启动需要 backend 在 3001 端口 — 下一节会引出 Patientor 后端)

---

## 下一步预告

- **Patientor frontend**(下一节)会引出:
  - Exercise 23:后端加 `/api/patients/:id` 返回单患者 + 扩 `Patient` 加 `entries: Entry[]`
  - Exercise 24:前端加 patient 详情页(React Router 跳转)
- **Full entries**(再下一节):`BaseEntry` + `HealthCheckEntry` + const object pattern
- **Omit with unions**(最后):`UnionOmit<T, K>` 模式,完成全部 Exercise 25-34