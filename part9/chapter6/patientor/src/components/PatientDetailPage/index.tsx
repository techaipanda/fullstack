// chapter6 sub-section 3 'Full entries' — Exercise 28 患者详情页 + Entry 渲染
// 课程指令(Exercise 26 + 27 + 28 合并):
//   26. "Extend a patient's page in the frontend to list the date, description
//       and diagnoseCodes of the patient's entries."
//   27. "Fetch and add diagnoses to the application state from the /api/diagnoses
//       endpoint. Use the new diagnosis data to show the descriptions for
//       patients' diagnosis codes"
//   28. "Extend the entry listing on the patient's page to include the Entry's
//       details, with a new component that shows the rest of the information
//       of the patient's entries, distinguishing different types from each
//       other. ... You should use a switch case-based rendering and exhaustive
//       type checking so that no cases can be forgotten"
// chapter6 sub-section 4 'Omit with unions' — Exercise 30-32 AddEntryModal 集成
// 课程原话(Exercise 30):
//   "add a form for adding an entry to a patient. An intuitive place for accessing
//    the form would be on a patient's page. ... Upon a successful submission the new
//    entry should be added to the correct patient and the patient's entries on
//    the patient page should be updated to contain the new entry.
//    If a user enters invalid values to the form and backend rejects the addition,
//    show a proper error message to the user"

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import TransgenderIcon from '@mui/icons-material/Transgender';

import patientService from "../../services/patients";
import { Patient, Gender, Diagnosis, Entry, EntryWithoutId, HealthCheckRating } from "../../types";
import AddEntryModal from "../AddEntryModal";

// ⭐ 核心概念:assertNever 是 TS 社区标准 idiom,课程描述"exhaustive type checking"
//  - 课程 Exercise 28 没给 verbatim 实现,只说"use ... exhaustive type checking"
//  - 标准实现:接收一个 never 参数,函数体 throw,调用时 TS 把未覆盖 union 成员 narrow 到 never
//  - 不用:加新 entry 类型时 switch 不会报错,fallback silently 走 default
//  - 用:switch default 调 assertNever(entry),TS 看到 entry 仍可能是某些 union 成员就报错
//  - 参考:https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-never-type
//  - 注:此函数不是课程 verbatim,是从 TS 类型设计常见做法复用,代码本身 1 行
const assertNever = (value: never): never => {
  throw new Error(`Unhandled discriminant: ${JSON.stringify(value)}`);
};

// ⭐ 核心概念:Exercise 27 — 拉 diagnoses 用于把 diagnosis code 转 description
//  - 不用:UI 显示 diagnosis code 字符串('S62.5'),用户看不懂
//  - 用:用 code 反查 Diagnosis.name,显示 "S62.5: Fracture of other finger"
//  - 验证:打开任意有 entries 的患者详情页,看到 diagnosis code 旁边有描述
interface DiagnosesState {
  [code: string]: Diagnosis;
}

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [diagnoses, setDiagnoses] = useState<DiagnosesState>({});

  // ⭐ 核心概念:Exercise 30 — AddEntryModal 开关 state
  //  - 用 useState(false) 而非受控:modal 默认关,用户点按钮才开
  //  - 提交成功后 setModalOpen(false):modal 自动关闭,父组件能看到 entries 数组更新
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [entryError, setEntryError] = useState<string | undefined>();

  const openModal = (): void => setModalOpen(true);
  const closeModal = (): void => {
    setModalOpen(false);
    setEntryError(undefined);  // 关闭时清错,下次打开不会显示旧错误
  };

  useEffect(() => {
    if (!id) return;
    const fetchPatient = async () => {
      try {
        const p = await patientService.getById(id);
        setPatient(p);
      } catch (e: unknown) {
        if (axios.isAxiosError(e) && typeof e.response?.data === "string") {
          setError(e.response.data);
        } else {
          setError("Unrecognized axios error");
        }
      }
    };
    void fetchPatient();
  }, [id]);

  // ⭐ 核心概念:Exercise 27 — 详情页加载时同时拉 diagnoses
  //  - 与 patient fetch 并行(不用 await),useEffect 副作用里一次发起两个 fetch
  //  - 失败时静默 —— diagnoses 是增强项,主数据(patient)能加载就行
  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        const { data } = await axios.get<Diagnosis[]>(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/diagnoses`
        );
        // 转成 { [code]: Diagnosis } map 方便按 code 查
        const map: DiagnosesState = {};
        for (const d of data) map[d.code] = d;
        setDiagnoses(map);
      } catch {
        // 静默失败 —— 详情页仍能显示 entries,只是 diagnosis code 没 description
      }
    };
    void fetchDiagnoses();
  }, []);

  if (!patient && !error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // ⭐ 核心概念:为什么 submitNewEntry 用 setPatient({...patient, entries:[...entries, newEntry]})?
  //  - 不用 mutation:patient.entries.push(newEntry) 直接改 state,React 不会触发 re-render
  //  - 用 spread 创建新对象 + 新数组:返回新引用,React 检测到引用变化触发 re-render
  //  - 课程原话:"Upon a successful submission the new entry should be added to the
  //   correct patient and the patient's entries on the patient page should be updated
  //   to contain the new entry."
  //  - 验证:加完 entry 后,UI 立即显示新 entry,无需手动刷新
  const submitNewEntry = async (values: EntryWithoutId) => {
    try {
      if (!id) return;
      const newEntry = await patientService.addEntry(id, values);
      if (patient) {
        setPatient({
          ...patient,
          entries: patient.entries.concat(newEntry),
        });
      }
      setModalOpen(false);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (e?.response?.data && typeof e?.response?.data === "string") {
          setEntryError(e.response.data);
        } else if (e?.response?.data && typeof e?.response?.data === "object") {
          // ⭐ 核心概念:为什么 zod 校验失败返回的 JSON 要 stringify?
          //  - 后端 Exercise 29 校验失败返回 { error: zod issues[] },data 是 object 不是 string
          //  - 不用 JSON.stringify:UI 显示 [object Object],用户看不懂
          //  - 用 JSON.stringify(issues, null, 2):UI 显示 zod 详细错误路径
          setEntryError(JSON.stringify(e.response.data, null, 2));
        } else {
          setEntryError("Unrecognized axios error");
        }
      } else {
        setEntryError("Unknown error");
      }
    }
  };

  const genderIcon = (() => {
    switch (patient!.gender) {
      case Gender.Male: return <MaleIcon />;
      case Gender.Female: return <FemaleIcon />;
      default: return <TransgenderIcon />;
    }
  })();

  // ⭐ 核心概念:EntryDetails 是 Exercise 28 要求的"新组件"
  //  - 课程原话:"with a new component that shows the rest of the information of the patient's entries"
  //  - 不用新组件:switch + JSX 全堆在 PatientDetailPage 里,组件太长
  //  - 用新组件:每种 entry 类型独立渲染逻辑,通过 props 接收 entry + diagnoses map
  //  - 验证:VSCode 看 EntryDetails 入参,知道它接收单个 entry
  const EntryDetails = ({ entry }: { entry: Entry }) => {
    switch (entry.type) {
      case "HealthCheck":
        // ⭐ 核心概念:healthCheckRating 0-3 → Healthy/LowRisk/HighRisk/CriticalRisk
        //  - 不用:UI 显示数字 0,1,2,3,用户不理解
        //  - 用:用 HealthCheckRating 反查 key(0 → Healthy)
        //  - 验证:打开 John McClane 详情页,看到 healthCheckRating: Healthy
        const ratingKey = (Object.keys(HealthCheckRating) as Array<keyof typeof HealthCheckRating>)
          .find(k => HealthCheckRating[k] === entry.healthCheckRating);
        return (
          <Box sx={{ border: '1px solid black', borderRadius: 1, padding: 1, marginBottom: 1 }}>
            <Typography variant="body1">
              {entry.date} <strong>{entry.type}</strong>
            </Typography>
            <Typography variant="body2"><em>{entry.description}</em></Typography>
            <Typography variant="body2">Specialist: {entry.specialist}</Typography>
            <Typography variant="body2">Health rating: {ratingKey}</Typography>
            {entry.diagnosisCodes && (
              <Typography variant="body2">
                Diagnosis codes: {entry.diagnosisCodes.map(c =>
                  `${c} ${diagnoses[c]?.name ?? ''}`
                ).join(', ')}
              </Typography>
            )}
          </Box>
        );
      case "OccupationalHealthcare":
        return (
          <Box sx={{ border: '1px solid black', borderRadius: 1, padding: 1, marginBottom: 1 }}>
            <Typography variant="body1">
              {entry.date} <strong>{entry.type}</strong> ({entry.employerName})
            </Typography>
            <Typography variant="body2"><em>{entry.description}</em></Typography>
            <Typography variant="body2">Specialist: {entry.specialist}</Typography>
            {entry.sickLeave && (
              <Typography variant="body2">
                Sick leave: {entry.sickLeave.startDate} → {entry.sickLeave.endDate}
              </Typography>
            )}
            {entry.diagnosisCodes && (
              <Typography variant="body2">
                Diagnosis codes: {entry.diagnosisCodes.map(c =>
                  `${c} ${diagnoses[c]?.name ?? ''}`
                ).join(', ')}
              </Typography>
            )}
          </Box>
        );
      case "Hospital":
        return (
          <Box sx={{ border: '1px solid black', borderRadius: 1, padding: 1, marginBottom: 1 }}>
            <Typography variant="body1">
              {entry.date} <strong>{entry.type}</strong>
            </Typography>
            <Typography variant="body2"><em>{entry.description}</em></Typography>
            <Typography variant="body2">Specialist: {entry.specialist}</Typography>
            <Typography variant="body2">
              Discharge: {entry.discharge.date} ({entry.discharge.criteria})
            </Typography>
            {entry.diagnosisCodes && (
              <Typography variant="body2">
                Diagnosis codes: {entry.diagnosisCodes.map(c =>
                  `${c} ${diagnoses[c]?.name ?? ''}`
                ).join(', ')}
              </Typography>
            )}
          </Box>
        );
      default:
        // ⭐ 核心概念:assertNever 保证 union exhaustiveness
        //  - 加新 entry 类型(如 "Vaccination"),TS 在 default branch narrow 到 Vaccination
        //  - Vaccination 不是 never,TS 报 "Argument of type 'Vaccination' is not assignable to never"
        //  - 修复:加 case "Vaccination":,assertNever 自动变 unreachable
        return assertNever(entry);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2 }}>
        <Typography variant="h5">{patient!.name}</Typography>
        {genderIcon}
      </Box>

      <Typography variant="body1">SSN: {patient!.ssn ?? "(unknown)"}</Typography>
      <Typography variant="body1">Occupation: {patient!.occupation}</Typography>
      <Typography variant="body1">Date of birth: {patient!.dateOfBirth ?? "(unknown)"}</Typography>

      <Typography variant="h6" sx={{ marginTop: 3 }}>Entries</Typography>
      {patient!.entries.length > 0 ? (
        patient!.entries.map(e => <EntryDetails key={e.id} entry={e} />)
      ) : (
        <Typography variant="body2">No entries yet.</Typography>
      )}

      {/* ⭐ 核心概念:为什么 Add New Entry 按钮放在 entries 标题下面?
        - 课程原话:"An intuitive place for accessing the form would be on a patient's page"
        - 不用 Button 在顶部:用户看到 entries 后才知道有 add 功能
        - 用 Button 在 entries 下方:语义相邻,看到 entries → 想加 entry → 按钮就在那儿
        - 验证:点 → 弹 AddEntryModal → 提交 → 列表多一条 */}
      <Box sx={{ marginTop: 2 }}>
        <Button variant="contained" onClick={() => openModal()}>
          Add New Entry
        </Button>
      </Box>

      <AddEntryModal
        modalOpen={modalOpen}
        onSubmit={submitNewEntry}
        error={entryError}
        onClose={closeModal}
      />
    </Box>
  );
};

export default PatientDetailPage;
