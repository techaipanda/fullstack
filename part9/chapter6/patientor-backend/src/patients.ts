// chapter6 sub-section 2 'Patientor frontend' — Exercise 23 seed data
// 课程原话:"As we are using mock data instead of a database, the data will not
// persist — closing the backend will delete all the data we have added."
//
// 所以种子数据只放 3 条够测试就够。Exercise 25 之后才会用 patients-full.ts 的扩展示例数据替换。
//
// 这里用纯 mock 数据,字段全部对齐 Exercise 23 后的 Patient 类型(ssn + dateOfBirth + entries:[])
// 不用 patients-full.ts 的原因:
//   - patients-full.ts 的 entries 字段(HealthCheck/OccupationalHealthcare/Hospital)
//   - 是子小节 3 'Full entries' 之后才能处理的,提前引入会让 tsc 报"Entry 空接口不能用"的错
import type { Patient } from './types.ts';
import { Gender } from './types.ts';

// ⭐ 核心概念:id 用确定性字符串(uuid-v4 风格的固定值)
//  - 不用随机 id:每次重启 backend,id 变,前端 dev session 缓存的 patient 引用会失效
//  - 用确定性 id:'d2773336-...' 这种固定值,重启后 GET /api/patients/:id 还能命中
export const patients: Patient[] = [
  {
    id: 'd2773336-f723-11e9-8f0b-362b9e155667',
    name: 'John McClane',
    dateOfBirth: '1986-07-09',
    ssn: '090786-122X',
    // ⭐ 核心概念:gender 字段用 Gender enum 常量而非字符串字面量
    //  - 不用 Gender.Male,直接 'male':TS strict mode 报错("'"male"' is not assignable to type 'Gender'")
    //   因为 Gender 是 enum,类型是 Gender.Male | Gender.Female | Gender.Other,不接受任意 string
    //  - 用 Gender.Male:与类型契约一致,enum 常量本身就是 Gender 类型
    //  - 验证:tsc --noEmit 0 errors
    gender: Gender.Male,
    occupation: 'New york city cop',
    entries: []  // Exercise 23 全部患者的 entries 先空数组
  },
  {
    id: 'd2773598-f723-11e9-8f0b-362b9e155667',
    name: 'Martin Riggs',
    dateOfBirth: '1979-01-30',
    ssn: '300179-777A',
    gender: Gender.Male,
    occupation: 'Cop',
    entries: []
  },
  {
    id: 'd27736ec-f723-11e9-8f0b-362b9e155667',
    name: 'Hans Gruber',
    dateOfBirth: '1970-04-25',
    ssn: '250470-555L',
    gender: Gender.Other,
    occupation: 'Technician',
    entries: []
  }
];