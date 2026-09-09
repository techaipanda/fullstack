// chapter6 sub-section 2 'Patientor frontend' — Exercise 24 患者详情页
// 课程指令:
//   "Create a page for showing a patient's full information in the frontend.
//    The user should be able to access a patient's information by clicking
//    the patient's name. Fetch the data from the endpoint created in the
//    previous exercise."

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import TransgenderIcon from '@mui/icons-material/Transgender';

import patientService from "../../services/patients";
import { Patient, Gender } from "../../types";

// ⭐ 核心概念:为什么用 useParams + useEffect 而不是 React Query?
//  - 课程范围:只用 useState + useEffect + axios(与 chapter5 笔记应用一致)
//  - 不用 React Query/SWR:简化,符合 sub-section 2 'Patientor frontend' 的最小改动原则
//  - 验证:打开详情页,console 会看到 'fetching patient...' 日志;切路由会再触发一次
const PatientDetailPage = () => {
  // ⭐ 核心概念:useParams<{id: string}>() 是 React Router v6/v7 的标准 API
  //  - 课程路由:<Route path="/patients/:id" element={<PatientDetailPage />} />
  //  - 不用 useParams:组件拿不到 id,没法 fetch
  //  - 用 useParams:Route 匹配时 React Router 自动注入 :id 段
  //  - 验证:VSCode hover useParams 的返回类型,看到 { id: string }
  const { id } = useParams<{ id: string }>();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    const fetchPatient = async () => {
      try {
        const p = await patientService.getById(id);
        setPatient(p);
      } catch (e: unknown) {
        // ⭐ 核心概念:为什么复用前端 PatientListPage 的 catch 模式?
        //  - 课程范围内统一用 axios.isAxiosError narrowing + e.response.data 字符串分支
        //  - 不复用:详情页错误信息格式与列表页不一致,UI 不一致
        if (axios.isAxiosError(e) && typeof e.response?.data === "string") {
          setError(e.response.data);
        } else {
          setError("Unrecognized axios error");
        }
      }
    };
    void fetchPatient();
  }, [id]);

  // 加载中
  if (!patient && !error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 错误状态
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // ⭐ 核心概念:为什么 Gender 用 switch + 图标组件?
  //  - 课程截图提示用 Material UI Icons(MaleIcon / FemaleIcon / TransgenderIcon)
  //  - 不用 if/else 链:TS 不会做 exhaustiveness 检查,加 Gender.NewValue 时不报错
  //  - 用 switch case + 显式 default:TS strict 能强制每个枚举值都被处理
  //  - 验证:把 Gender 加个新值,TS 会在 default 报告 "Type 'Gender' can never be..."
  const genderIcon = (() => {
    switch (patient!.gender) {
      case Gender.Male: return <MaleIcon />;
      case Gender.Female: return <FemaleIcon />;
      default: return <TransgenderIcon />;
    }
  })();

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
      {/* ⭐ 核心概念:为什么只显示 entries.length 而不是 iterate?
        - 课程 Exercise 23 的 Entry 是**空接口**(等 sub-section 3 'Full entries' 才加字段:id/description/date/specialist 等)
        - 用 .map + 读 entry.id/description:TS strict 报 "Property does not exist on type 'Entry'"
        - 用 .length:只显示条数,不读字段,TS 不报错,UI 也合理(每条 entry 现在就是空对象 {})
        - 验证:TypeScript 0 errors. 下一个 sub-section 加完 Entry 字段,这里改成 .map + 字段访问 */}
      {patient!.entries && patient!.entries.length > 0 ? (
        <Typography variant="body2">
          {patient!.entries.length} entries (details available in sub-section 3 'Full entries')
        </Typography>
      ) : (
        <Typography variant="body2">No entries yet.</Typography>
      )}
    </Box>
  );
};

export default PatientDetailPage;