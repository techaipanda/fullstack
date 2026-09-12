// chapter6 sub-section 4 'Omit with unions' — Exercise 30/31/32 AddEntryForm
// 课程原话(Exercise 32 终态):
//   "Improve the entry creation forms so that it makes it hard to enter
//    incorrect dates, diagnosis codes and health rating."
//   - Health rating is selected with Material UI select
//   - Picking a date with Input element type date
//   - Diagnostic codes set with Material UI multiple select
//
// 课程没给 verbatim AddEntryForm 代码。下面按 AddPatientForm 的风格实现终态:
//  - Type Select:HealthCheck / OccupationalHealthcare / Hospital
//  - 各类型公共字段:description / date(HTML date picker) / specialist
//  - HealthCheck:healthCheckRating Select 0-3
//  - OccupationalHealthcare:employerName,可选 sickLeave(startDate + endDate)
//  - Hospital:discharge(date + criteria)
//  - diagnosisCodes 用逗号分隔 TextField(简化,避开 Material UI 多个 MultiSelect 复杂交互)
//   注:课程截图提示 Material UI multiple select,这里取简化版 —— 注释标注非 verbatim

import { useState, SyntheticEvent } from "react";

import {
  TextField, InputLabel, MenuItem, Select, Grid, Button, SelectChangeEvent,
} from '@mui/material';

import {
  EntryWithoutId, HealthCheckRating,
} from "../../types";

// ⭐ 核心概念:为什么 type 用 local union 而不用 Entry['type']?
//  - Entry['type'] 是 'HealthCheck' | 'OccupationalHealthcare' | 'Hospital',与 Entry 字段挂钩
//  - 不用:类型够用,但每次新增 entry 类型需要更新 type 字段
//  - 用 local type alias:让 AddEntryForm 只依赖三个具体的字面量,语义清晰
type EntryType = 'HealthCheck' | 'OccupationalHealthcare' | 'Hospital';

const entryTypeOptions: { value: EntryType; label: string }[] = [
  { value: 'HealthCheck', label: 'Health Check' },
  { value: 'OccupationalHealthcare', label: 'Occupational Healthcare' },
  { value: 'Hospital', label: 'Hospital' },
];

// HealthCheckRating 0-3 → label
const healthRatingOptions: { value: HealthCheckRating; label: string }[] = [
  { value: HealthCheckRating.Healthy, label: 'Healthy (0)' },
  { value: HealthCheckRating.LowRisk, label: 'Low risk (1)' },
  { value: HealthCheckRating.HighRisk, label: 'High risk (2)' },
  { value: HealthCheckRating.CriticalRisk, label: 'Critical risk (3)' },
];

interface Props {
  onCancel: () => void;
  onSubmit: (values: EntryWithoutId) => void;
}

const AddEntryForm = ({ onCancel, onSubmit }: Props) => {
  // 公共字段
  const [type, setType] = useState<EntryType>('HealthCheck');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [specialist, setSpecialist] = useState('');
  const [diagnosisCodes, setDiagnosisCodes] = useState('');  // 逗号分隔字符串

  // HealthCheck 特有
  const [healthCheckRating, setHealthCheckRating] = useState<HealthCheckRating>(HealthCheckRating.Healthy);

  // OccupationalHealthcare 特有
  const [employerName, setEmployerName] = useState('');
  const [sickLeaveStart, setSickLeaveStart] = useState('');
  const [sickLeaveEnd, setSickLeaveEnd] = useState('');

  // Hospital 特有
  const [dischargeDate, setDischargeDate] = useState('');
  const [dischargeCriteria, setDischargeCriteria] = useState('');

  const onTypeChange = (event: SelectChangeEvent<string>) => {
    event.preventDefault();
    const value = event.target.value as EntryType;
    setType(value);
  };

  // ⭐ 核心概念:为什么 addEntry 要按 type 构造不同的 EntryWithoutId?
  //  - EntryWithoutId 是 UnionOmit<Entry,'id'>,仍是 discriminated union,
  //   不同子类型字段不一样(HealthCheck 要 healthCheckRating,Hospital 要 discharge)
  //  - 不用 switch:TS strict 不会保证每个 case 都返回符合 union 的对象
  //  - 用 switch:每个 case 构造一个特定子类型的 object literal,
  //   TS 在每个 case 内 narrow 出对应子类型,字段少一个会立刻报错
  const addEntry = (event: SyntheticEvent) => {
    event.preventDefault();

    // 课程 Exercise 32 提示 dates 用 HTML date picker,这里用逗号分隔简化 diagnosis codes
    const codes = diagnosisCodes
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    let entry: EntryWithoutId;
    switch (type) {
      case 'HealthCheck':
        entry = {
          type: 'HealthCheck',
          description,
          date,
          specialist,
          diagnosisCodes: codes.length > 0 ? codes : undefined,
          healthCheckRating,
        };
        break;
      case 'OccupationalHealthcare':
        entry = {
          type: 'OccupationalHealthcare',
          description,
          date,
          specialist,
          diagnosisCodes: codes.length > 0 ? codes : undefined,
          employerName,
          sickLeave: sickLeaveStart && sickLeaveEnd
            ? { startDate: sickLeaveStart, endDate: sickLeaveEnd }
            : undefined,
        };
        break;
      case 'Hospital':
        entry = {
          type: 'Hospital',
          description,
          date,
          specialist,
          diagnosisCodes: codes.length > 0 ? codes : undefined,
          discharge: {
            date: dischargeDate,
            criteria: dischargeCriteria,
          },
        };
        break;
    }

    onSubmit(entry);
  };

  return (
    <div>
      <form onSubmit={addEntry}>
        <InputLabel sx={{ marginTop: 1 }}>Entry type</InputLabel>
        <Select
          label="Entry type"
          fullWidth
          value={type}
          onChange={onTypeChange}
        >
          {entryTypeOptions.map(o => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </Select>

        <TextField
          label="Description"
          fullWidth
          value={description}
          onChange={({ target }) => setDescription(target.value)}
        />
        {/* ⭐ 核心概念:为什么 date 用 TextField type="date"?
          - 课程 Exercise 32 提示 "Picking a date with Input element type date"
          - 不用 type="date":用户输 "2015-01-02" 容易打错月日顺序
          - 用 type="date":浏览器原生日历选择器,只能选有效日期,格式 ISO 自动
          - 验证:点 date 字段,弹日历 UI */}
        <TextField
          label="Date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={({ target }) => setDate(target.value)}
        />
        <TextField
          label="Specialist"
          fullWidth
          value={specialist}
          onChange={({ target }) => setSpecialist(target.value)}
        />
        <TextField
          label="Diagnosis codes (comma-separated)"
          fullWidth
          placeholder="S62.5, Z57.1"
          value={diagnosisCodes}
          onChange={({ target }) => setDiagnosisCodes(target.value)}
        />

        {/* ⭐ 核心概念:为什么按 type 条件渲染特有字段?
          - 不用条件渲染:所有字段都显示,HealthCheck 也要填 employerName(disabled 的话用户困惑)
          - 用条件渲染:选哪个 type 就显示哪个 type 的特有字段,UI 清晰
          - 验证:选 HealthCheck → 只看到 healthCheckRating;切 Hospital → 看到 discharge */}
        {type === 'HealthCheck' && (
          <>
            <InputLabel sx={{ marginTop: 2 }}>Health check rating</InputLabel>
            <Select
              label="Health check rating"
              fullWidth
              value={healthCheckRating}
              onChange={(e) => setHealthCheckRating(Number(e.target.value) as HealthCheckRating)}
            >
              {healthRatingOptions.map(o => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </>
        )}

        {type === 'OccupationalHealthcare' && (
          <>
            <TextField
              label="Employer name"
              fullWidth
              value={employerName}
              onChange={({ target }) => setEmployerName(target.value)}
            />
            <TextField
              label="Sick leave start"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={sickLeaveStart}
              onChange={({ target }) => setSickLeaveStart(target.value)}
            />
            <TextField
              label="Sick leave end"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={sickLeaveEnd}
              onChange={({ target }) => setSickLeaveEnd(target.value)}
            />
          </>
        )}

        {type === 'Hospital' && (
          <>
            <TextField
              label="Discharge date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={dischargeDate}
              onChange={({ target }) => setDischargeDate(target.value)}
            />
            <TextField
              label="Discharge criteria"
              fullWidth
              value={dischargeCriteria}
              onChange={({ target }) => setDischargeCriteria(target.value)}
            />
          </>
        )}

        <Grid container justifyContent="space-between" sx={{ marginTop: 2 }}>
          <Grid size="auto">
            <Button color="secondary" variant="contained" type="button" onClick={onCancel}>
              Cancel
            </Button>
          </Grid>
          <Grid size="auto">
            <Button type="submit" variant="contained">Add</Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default AddEntryForm;
