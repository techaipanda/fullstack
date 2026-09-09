// chapter6 sub-section 2 'Patientor frontend' — Exercise 24 加 /patients/:id 路由
import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { Button, Divider, Container, Typography } from '@mui/material';

import { apiBaseUrl } from "./constants";
import { NonSensitivePatient } from "./types";

import patientService from "./services/patients";
import PatientListPage from "./components/PatientListPage";
import PatientDetailPage from "./components/PatientDetailPage";

const App = () => {
  // ⭐ 核心概念:为什么 state 用 NonSensitivePatient?
  //  - patientService.getAll() 返回 NonSensitivePatient[]
  //  - 原来用 Patient[]:与 getAll 返回类型不对齐,TypeScript 报 "Type 'NonSensitivePatient[]' is not assignable to type 'Patient[]'"
  //  - 改 NonSensitivePatient[]:与 getAll 契约对齐
  //  - 验证:TypeScript 检查 setPatients 调用,看参数类型
  const [patients, setPatients] = useState<NonSensitivePatient[]>([]);

  useEffect(() => {
    void axios.get<void>(`${apiBaseUrl}/ping`);

    const fetchPatientList = async () => {
      const patients = await patientService.getAll();
      setPatients(patients);
    };
    void fetchPatientList();
  }, []);

  return (
    <div className="App">
      <Router>
        <Container>
          <Typography variant="h3" sx={{ marginBottom: "0.5em" }}>
            Patientor
          </Typography>
          <Button component={Link} to="/" variant="contained" color="primary">
            Home
          </Button>
          <Divider sx={{ marginY: 2 }} />
          <Routes>
            <Route path="/" element={<PatientListPage patients={patients} setPatients={setPatients} />} />
            {/* ⭐ 核心概念:为什么 :id 直接在 path 里?
              - React Router 6+/7 标准:动态段用 :paramName
              - 不用 query (?id=xxx):URL 语义不清晰,需 useSearchParams
              - 用 path param:PatientDetailPage 用 useParams<{id:string}>() 拿到 */}
            <Route path="/patients/:id" element={<PatientDetailPage />} />
          </Routes>
        </Container>
      </Router>
    </div>
  );
};

export default App;
