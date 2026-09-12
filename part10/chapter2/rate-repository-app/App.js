// chapter3-StatusBarStyle
// 改动:加 import { StatusBar } from 'expo-status-bar'; 顶层 fragment 渲染
//  <StatusBar style="light" /> 紧跟 <Main />;App 从单元素返回变为 2 元素
//  并列(需 fragment 包裹避免引入额外 View wrapper 污染 flex 根)。
// 为什么:expo-status-bar 跨平台声明式控制 OS 状态栏前景色;style="light" 让
//  OS 用浅色图标适配后续 AppBar 深底色;fragment 让同级多 JSX 元素返回不引入
//  容器组件,保持 App.js 作为薄 wrapper 的扩展点身份。
//
// 本文件历史:s1 'Core components' / s2 'Installing deps' / s3 'Structuring'
// 见 commit 6ee3fc1 / 7ff7a87 / 06cbe4c;s3 起 App.js 保持"薄 wrapper"模式
// (import 根组件 + const App = () => <Root /> + export default)。

import { StatusBar } from 'expo-status-bar';

import Main from './src/components/Main';

const App = () => {
  return (
    <>
      <StatusBar style="light" />
      <Main />
    </>
  );
};

export default App;
