// ===== part6 — Context API =====
// verbatim 1:1 从 https://github.com/fullstack-hy2020/context-counter/blob/main/src/components/Footer.jsx 抽取。

const footerStyle = {
  background: '#4a5568',
  color: 'white',
  padding: '10px 20px',
  textAlign: 'center',
  fontSize: '0.9rem',
  marginTop: '20px',
}

const Footer = () => {
  return (
    <footer style={footerStyle}>Full Stack Open 2026</footer>
  )
}

export default Footer