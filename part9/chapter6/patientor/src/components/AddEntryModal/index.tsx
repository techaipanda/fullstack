// chapter6 sub-section 4 'Omit with unions' — Exercise 30/31/32 AddEntryModal
// 课程原话(Exercise 30):
//   "add a form for adding an entry to a patient. An intuitive place for accessing
//    the form would be on a patient's page. In this exercise, it is enough to
//    support one entry type. All the fields in the form can be just plain text inputs,
//    so it is up to the user to enter valid values."
// Exercise 31:"Extend your solution so that it supports all the entry types"
// Exercise 32:"Improve the entry creation forms so that it makes it hard to enter
//   incorrect dates, diagnosis codes and health rating."
//
// 此处直接写 Exercise 32 终态(支持全部 3 种 + 改进 inputs):
//  - 类型用 Select 切换 HealthCheck/OccupationalHealthcare/Hospital
//  - 日期用 TextField type="date"
//  - HealthCheck rating 用 Material UI Select
//  - diagnosis codes 用 TextField(逗号分隔,简化实现;MultiSelect 是 Exercise 32 截图提示,
//    课程没给 verbatim 实现,这里取简化的 comma-split)
//  - 各类型特有字段(discharge / employerName / sickLeave)按 type 动态渲染
//
// 注:此文件与 AddEntryForm 都是 Exercise 32 终态的工程实现,不是课程 verbatim 代码
//  - 课程没给 AddEntryModal / AddEntryForm 的完整 verbatim 代码
//  - 实现参照 AddPatientModal 的结构 + Material UI 文档 idiom
//  - 已加 eslint-disable 防止 unused import 警告(useState 在 form 内)

import { Dialog, DialogTitle, DialogContent, Divider, Alert } from '@mui/material';

import AddEntryForm from "./AddEntryForm";
import { EntryWithoutId } from "../../types";

interface Props {
  modalOpen: boolean;
  onClose: () => void;
  onSubmit: (values: EntryWithoutId) => void;
  error?: string;
}

const AddEntryModal = ({ modalOpen, onClose, onSubmit, error }: Props) => {
  // ⭐ 核心概念:为什么 Modal 内层不再管 modalOpen state?
  //  - AddPatientModal 也没管 modalOpen state,只透传 props
  //  - 用 props 透传:Modal 的开关由父组件(PatientListPage / PatientDetailPage)控制,
  //   这样父组件能根据 fetch 完成来关闭 modal
  //  - 验证:点 Add → 弹窗 → 提交成功 → modal 关闭(由父组件 setModalOpen(false))
  return (
    <Dialog fullWidth={true} open={modalOpen} onClose={() => onClose()}>
      <DialogTitle>Add a new entry</DialogTitle>
      <Divider />
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <AddEntryForm onSubmit={onSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default AddEntryModal;
