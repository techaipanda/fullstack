// chapter3-Flexbox
// 改动:删 sub-section 7 (Theming) 的 4 个 <Text> 演示,改为 import FlexboxExample
//  (default) + FlexboxItemExample (named) 两个组件,通过 fragment 串接渲染。
// 为什么:Theming 小节演示文本主题(color / fontSize / fontWeight),Flexbox 小节
//  演示布局主题(flex 容器 / 项目行为),节主题切换对应展示组件切换;Main.jsx 保持
//  "当前小节 demo 容器"角色,自身不持有演示内容,只调度子组件。

import FlexboxExample, { FlexboxItemExample } from './FlexboxExample';

const Main = () => {
  return (
    <>
      <FlexboxExample />
      <FlexboxItemExample />
    </>
  );
};

export default Main;