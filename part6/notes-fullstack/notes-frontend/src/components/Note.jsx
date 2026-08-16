// part5 a/b — Note 组件
// part5 b 不引入删除功能,只保留 toggleImportance。
// 删除(deleteNote prop + delete 按钮)是 part5 c 的内容,届时再加回来。
const Note = ({ note, toggleImportance }) => {
  const label = note.important
    ? 'make not important' : 'make important'

  return (
    <li className='note'>
      <span>{note.content}</span>
      <button onClick={toggleImportance}>{label}</button>
    </li>
  )
}

export default Note