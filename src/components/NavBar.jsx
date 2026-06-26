import { Link, useLocation } from 'react-router-dom'

const nav = {
  background: '#1a3a5c',
  padding: '0 2rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  height: '60px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
}

const brand = {
  color: '#f5c842',
  fontWeight: '800',
  fontSize: '1.15rem',
  marginRight: 'auto',
  textDecoration: 'none',
  letterSpacing: '0.02em',
}

function linkStyle(active) {
  return {
    color: active ? '#f5c842' : '#cce0f5',
    textDecoration: 'none',
    fontWeight: active ? '700' : '400',
    fontSize: '0.95rem',
    paddingBottom: '2px',
    borderBottom: active ? '2px solid #f5c842' : '2px solid transparent',
  }
}

const adminLink = (active) => ({
  color: active ? '#f5c842' : '#8ab0cc',
  textDecoration: 'none',
  fontWeight: active ? '700' : '400',
  fontSize: '0.85rem',
  paddingBottom: '2px',
  borderBottom: active ? '2px solid #f5c842' : '2px solid transparent',
  marginLeft: '0.5rem',
  opacity: 0.85,
})

export default function NavBar() {
  const { pathname } = useLocation()
  return (
    <nav style={nav}>
      <Link to="/" style={brand}>Marist Water Polo</Link>
      <Link to="/" style={linkStyle(pathname === '/')}>Home</Link>
      <Link to="/register" style={linkStyle(pathname === '/register')}>Register</Link>
      <Link to="/members" style={linkStyle(pathname === '/members')}>Members</Link>
      <Link to="/teams" style={linkStyle(pathname === '/teams')}>Teams</Link>
      <Link to="/admin" style={adminLink(pathname === '/admin')}>Admin</Link>
    </nav>
  )
}
