import { Link, useLocation } from 'react-router-dom'
import logoUrl from '../assets/logo.png'

const nav = {
  background: '#00205b',
  padding: '0 2rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  height: '64px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
}

const logoArea = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
  marginRight: 'auto',
  textDecoration: 'none',
}

const brandText = {
  color: '#ffffff',
  fontWeight: '800',
  fontSize: '1.1rem',
  letterSpacing: '0.01em',
  lineHeight: 1.2,
}

function linkStyle(active) {
  return {
    color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontWeight: active ? '700' : '400',
    fontSize: '0.95rem',
    paddingBottom: '3px',
    borderBottom: active ? '2px solid #ffffff' : '2px solid transparent',
    transition: 'color 0.15s',
  }
}

function adminLinkStyle(active) {
  return {
    color: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
    textDecoration: 'none',
    fontWeight: active ? '700' : '400',
    fontSize: '0.85rem',
    paddingBottom: '3px',
    borderBottom: active ? '2px solid #ffffff' : '2px solid transparent',
    marginLeft: '0.25rem',
  }
}

export default function NavBar() {
  const { pathname } = useLocation()
  return (
    <nav style={nav}>
      <Link to="/" style={logoArea}>
        {logoUrl && (
          <img src={logoUrl} alt="Marist Water Polo" style={{ height: '44px', width: 'auto', display: 'block' }} />
        )}
        <span style={brandText}>Marist Water Polo</span>
      </Link>
      <Link to="/" style={linkStyle(pathname === '/')}>Home</Link>
      <Link to="/register" style={linkStyle(pathname === '/register')}>Register</Link>
      <Link to="/members" style={linkStyle(pathname === '/members')}>Members</Link>
      <Link to="/teams" style={linkStyle(pathname === '/teams')}>Teams</Link>
      <Link to="/admin" style={adminLinkStyle(pathname === '/admin')}>Admin</Link>
    </nav>
  )
}
