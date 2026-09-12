// chapter3-Routing
// 改动:加 import { NativeRouter } from 'react-router-native';把 <Main /> 包进
//  <NativeRouter>...</NativeRouter>;<StatusBar style="light" /> → "auto" 改回
//  OS 自适应(后续 AppBar 在 Main 内部用 Constants.statusBarHeight 留出顶部间距,
//  状态栏图标色由 AppBar 底色决定,不再强制 light)。
// 为什么:react-router-native 的 NativeRouter 是 BrowserRouter 的 RN 替代品,
//  内部用 in-memory history stack 替代 browser history API(因为 RN 没有地址栏
//  和 history API);StatusBar style="auto" 让 OS 跟随当前 UI 主色自动选 light/dark
//  图标,避免与 AppBar 实际底色冲突。
//
// 本文件历史:s1 'Core components' / s2 'Installing deps' / s3 'Structuring' /
// s4 'Status bar style' 见 commit 6ee3fc1 / 7ff7a87 / 06cbe4c / 9ae5cf2。
//
// ⚠ 已知 gap(不阻塞本节,留待回填):Main.jsx 的 verbatim 引用了
// ./RepositoryList + ./AppBar + theme.colors.mainBackground,这三者来自
// Exercise 3.4 'The app bar' + 3.5 'Polished reviewed repositories list',
// 还没做;Main.jsx 当前会 import-resolve 失败,本节先按课程 1:1 落 verbatim,
// 等回填 Exercise 时一并解决。

import { StatusBar } from 'expo-status-bar';
import { NativeRouter } from 'react-router-native';

import Main from './src/components/Main';

const App = () => {
  return (
    <>
      <StatusBar style="auto" />
      <NativeRouter>
        <Main />
      </NativeRouter>
    </>
  );
};

export default App;
