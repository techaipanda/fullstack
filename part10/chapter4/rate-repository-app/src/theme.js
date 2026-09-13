// chapter3-Theming + chapter3-AppBar/RepositoryList (Exercise 3.4/3.5)
// 改动:colors 命名空间扩展 3 键(appBarBackground #24292e / mainBackground
//  #e1e4e8 / repositoryBackground #fff),其他 3 命名空间不变。
// 为什么:课程 Exercise 3.4/3.5 明确把这 3 色值纳入 theme 集中管理,避免
//  散落 inline;magic number → 语义引用,改主题一处生效。

const theme = {
  colors: {
    textPrimary: '#24292e',
    textSecondary: '#586069',
    primary: '#0366d6',
    appBarBackground: '#fff3f3',
    mainBackground: '#e1e4e8',
    repositoryBackground: '#ffffff',
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