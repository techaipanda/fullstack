// chapter6 sub-section 2 'Patientor frontend' — Exercise 24 患者名变可点击 Link
import { useState } from "react";
import { Box, Table, Button, TableHead, Typography, TableCell, TableRow, TableBody } from '@mui/material';
import { Link } from "react-router-dom";
import axios from 'axios';

import { PatientFormValues, NonSensitivePatient } from "../../types";
import AddPatientModal from "../AddPatientModal";

import HealthRatingBar from "../HealthRatingBar";

import patientService from "../../services/patients";

// ⭐ 核心概念:为什么 Props 用 NonSensitivePatient?
//  - App.tsx 的 state 类型从 Exercise 23 后端契约变 NonSensitivePatient[]
//  - PatientListPage 接 patients prop,类型必须与 App 对齐,否则 TS 报错
//  - 不用 NonSensitivePatient:类型不对齐
//  - 验证:VSCode hover patients prop 能看到 NonSensitivePatient[]
interface Props {
  patients: NonSensitivePatient[];
  setPatients: React.Dispatch<React.SetStateAction<NonSensitivePatient[]>>;
}

const PatientListPage = ({ patients, setPatients } : Props ) => {

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const openModal = (): void => setModalOpen(true);

  const closeModal = (): void => {
    setModalOpen(false);
    setError(undefined);
  };

  const submitNewPatient = async (values: PatientFormValues) => {
    try {
      const patient = await patientService.create(values);
      setPatients(patients.concat(patient));
      setModalOpen(false);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (e?.response?.data && typeof e?.response?.data === "string") {
          const message = e.response.data.replace('Something went wrong. Error: ', '');
          console.error(message);
          setError(message);
        } else {
          setError("Unrecognized axios error");
        }
      } else {
        console.error("Unknown error", e);
        setError("Unknown error");
      }
    }
  };

  return (
    <div className="App">
      <Box>
        <Typography align="center" variant="h6">
          Patient list
        </Typography>
      </Box>
      <Table sx={{ marginBottom: "1em" }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>Occupation</TableCell>
            <TableCell>Health Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.values(patients).map((patient: NonSensitivePatient) => (
            <TableRow key={patient.id}>
              {/* ⭐ 核心概念:为什么 Name 用 Link 包起来?
                - 课程 Exercise 24:"The user should be able to access a patient's information by clicking the patient's name"
                - 不用 Link:点击名字没反应,详情页只能手输 URL
                - 用 Link:点击名字 → React Router 跳 /patients/:id → PatientDetailPage
                - 验证:点击 John McClane,URL 变 /patients/d2773336-f723-11e9-8f0b-362b9e155667 */}
              <TableCell>
                <Link to={`/patients/${patient.id}`}>{patient.name}</Link>
              </TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>{patient.occupation}</TableCell>
              <TableCell>
                <HealthRatingBar showText={false} rating={1} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AddPatientModal
        modalOpen={modalOpen}
        onSubmit={submitNewPatient}
        error={error}
        onClose={closeModal}
      />
      <Button variant="contained" onClick={() => openModal()}>
        Add New Patient
      </Button>
    </div>
  );
};

export default PatientListPage;
