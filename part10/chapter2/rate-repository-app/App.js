// chapter3 sub-section 1 'Core components' — 课程原话 verbatim 演示片段
//
// 课程原话(章节开头):
//   "In the previous parts, we have learned that we can use React to define
//    components as functions, which receive props as an argument and returns a
//    tree of React elements. ... As we can see, React is not bound to a certain
//    environment, such as the browser environment. Instead, there are libraries
//    such as ReactDOM that can render a set of predefined components, such as
//    DOM elements, in a specific environment. In React Native these predefined
//    components are called core components."
//
// 课程原话(核心组件清单):
//   - Text component is the only React Native component that can have textual children
//     (similar to <strong> / <h1>)
//   - View component is the basic user interface building block (similar to <div>)
//   - TextInput component is a text field (similar to the <input> element)
//   - Pressable component captures different press events (similar to <button>)
//
// 课程原话(关键差异):
//   "The first difference is that the Text component is the only React Native
//    component that can have textual children. This means that you can't, for
//    example, replace the Text component with the View component in the previous
//    example.
//    The second notable difference is related to the event handlers. While working
//    with the DOM elements we are used to adding event handlers such as onClick
//    to basically any element such as <div> and <button>. In React Native we have
//    to carefully read the API documentation to know what event handlers (as well
//    as other props) a component accepts. For example, the Pressable component
//    provides props for listening to different kinds of press events. We can for
//    example use the component's onPress prop for listening to press events"
//
// 课程没给完整 App.js verbatim,只给 3 个独立演示片段(片段 1 仅作概念对比,
// 不是要写到 App.js)。这里把片段 2 + 片段 3 组合到 App.js,展示 4 个核心
// 组件(View / Text / TextInput / Pressable)在真机/模拟器里的样子。
// 后续 sub-section 2 'Installing dependencies in Expo project' 会教 expo-constants,
// 后续 sub-section 3 'Structuring our project' 会教 src/components/ 拆分,这里
// 故意保持单文件,展示概念即可。

import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';

// ⭐ 核心概念:片段 2 — Text 是唯一可以包字符串的 RN 组件
//  课程原话:"Text component is the only React Native component that can have
//   textual children"
//  不用 Text 包字符串:运行时 React Native 警告 + iOS/Android 行为不一致(部分
//   平台直接抛 "Text strings must be rendered within a <Text> component")
//  用 Text 包字符串:跨平台一致,iOS/Android/Web 都能正确渲染文字
//  验证:把 <Text>Hello world!</Text> 改成 <View>Hello world!</View>,在
//   iOS 模拟器会看到红屏 "Text strings must be rendered within a <Text> component"
// 课程 verbatim props 演示:组件接收 props 作为参数(展示 React 函数组件定义)。
// 此处 props 故意未使用,用 void 表达式消费以满足 lint/TS,verbatim 保留 props 形参
const HelloWorld = (props) => {
  void props;
  return <Text>Hello world!</Text>;
};

// ⭐ 核心概念:片段 3 — Pressable 是 RN 的"按钮",事件 prop 必须看 API 文档
//  课程原话:"the Pressable component provides props for listening to different
//   kinds of press events. We can for example use the component's onPress prop"
//  不用 Pressable:用 <View onPress={...} /> → onPress 在 View 上不存在,运行时
//   静默无响应(用户按了没反应,但没报错,最难排查的 bug)
//  用 Pressable + onPress:按下触发,跨平台都有视觉反馈(iOS opacity 变化,
//   Android ripple)
//  验证:点 "You can press me" 文字区域,弹 Alert "You pressed the text!"
// 同上,verbatim 保留 props 形参(课程片段 3)
const PressableText = (props) => {
  void props;
  return (
    <Pressable
      onPress={() => Alert.alert('You pressed the text!')}
    >
      <Text>You can press me</Text>
    </Pressable>
  );
};

// ⭐ 核心概念:TextInput — RN 的 <input>,受控组件模式(value + onChangeText)
//  课程原话:"TextInput component is a text field component similar to the
//   <input> element"
//  不用受控:用户输入后 React state 不知道,提交时拿到空字符串
//  用受控:value 绑 state,onChangeText 更新 state,React 始终知道当前值
//  验证:点输入框 → 弹键盘 → 输入文字 → 输入框显示
//  注:TextInput 实际有大量原生 prop(keyboardType / secureTextEntry / autoCapitalize
//   等),课程没展开,后续 sub-section 'Form state management' 会用 formik 接管
function EchoTextInput() {
  const [text, setText] = useState('');
  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Type something..."
        value={text}
        onChangeText={setText}
      />
      <Text>You typed: {text}</Text>
    </View>
  );
}

// ⭐ 核心概念:View — RN 的 <div>,基本 UI 容器
//  课程原话:"View component is the basic user interface building block similar
//   to the <div> element"
//  关键差异:View 默认 flex 容器(flexDirection: 'column'),CSS 里的
//   display: block / inline 概念不存在
//  验证:把 styles.container 改 backgroundColor 颜色,看到整块染色
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Core components demo</Text>

      <Text style={styles.section}>1. Text (fragment 2 — verbatim)</Text>
      <HelloWorld />

      <Text style={styles.section}>2. Pressable + Alert (fragment 3 — verbatim)</Text>
      <PressableText />

      <Text style={styles.section}>3. TextInput</Text>
      <EchoTextInput />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
    fontSize: 14,
    color: '#586069',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 4,
    padding: 8,
    width: 220,
    marginVertical: 4,
  },
});
