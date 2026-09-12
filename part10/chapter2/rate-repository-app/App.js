// chapter3 sub-section 3 'Structuring our project' — 课程 verbatim 整体替换
//
// 课程原话(verbatim):
//   "Next, let's use the Main component in the App component in the App.js file
//    which is located in our project's root directory. Replace the current content
//    of the file with this"
//
// ============================================================
// 历史轨迹(已迁移到 git,代码层不再保留):
// ============================================================
// sub-section 1 'Core components' (commit 6ee3fc1):
//   在 App.js 内 verbatim 演示了 4 个核心组件:
//   - Text (唯一可包字符串的 RN 组件)
//   - Pressable + Alert (RN 的 <button>)
//   - TextInput (受控组件 value + onChangeText)
//   - View (RN 的 <div>,默认 flex 容器)
//   含 HelloWorld / PressableText / EchoTextInput 3 个 verbatim 片段
//
// sub-section 2 'Installing dependencies in Expo project' (commit 7ff7a87):
//   通过 `npx expo install expo-constants` 安装 expo-constants ~55.0.17
//   (由 Expo CLI 自动选 SDK 55 兼容版本)
//   App.js 仅加注释,无代码改动(本节只有命令 + 注释)
//
// sub-section 3 'Structuring our project' (本次 commit):
//   按课程 verbatim 'Replace the current content' 字面意思,App.js 整体替换为
//   5 行(import Main + const App = () => <Main /> + export default App)
//   所有 sub-section 1/2 的演示代码全部废弃,演示搬到 src/components/Main.jsx
//   (即 Main.jsx 接管 UI;后续 sub-section 4 'Reviewed repositories list' 练习题
//   才会扩展 Main.jsx 加 RepositoryList 子组件)
//
// ⭐ 核心概念:为什么 sub-section 3 把 App.js 缩成 5 行?
//  之前的 sub-section 1/2 在 App.js 内 inline 演示组件 — 只适合教学(碎片化学习),
//   不适合实际项目。真实 RN 项目 App.js 一般只做 3 件事:
//   1) 引入根组件(这里是 Main.jsx)
//   2) 定义一个极薄的 <App /> 把根组件包起来(为后续加 Provider / SafeAreaProvider
//      等 wrapper 留扩展点)
//   3) export default
//  这样后续替换 Main 为导航器 (AppNavigator)、加 error boundary、加 context provider
//  都不会污染 App.js

import Main from './src/components/Main';

const App = () => {
  return <Main />;
};

export default App;