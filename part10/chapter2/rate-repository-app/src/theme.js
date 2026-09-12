// chapter3-Theming
// 改动:集中 style 数值到单一 module,导出 theme 对象作为样式语义常量
//  (colors / fontSizes / fonts / fontWeights 四个命名空间)。
// 为什么:消除散落在组件里的 magic number(#0366d6 等),改用语义引用
//  (theme.colors.primary) 做样式参数化,改主题一处生效,跨组件一致性提升。

const theme = {
  colors: {
    textPrimary: '#24292e',
    textSecondary: '#586069',
    primary: '#0366d6',
  },
  fontSizes: {
    body: 14,
    subheading: 16,
  },
  fonts: {
    main: 'System',
  },
  fontWeights: {
    normal: '400',
    bold: '700',
  },
};

export default theme;