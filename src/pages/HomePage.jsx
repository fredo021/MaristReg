import { Link } from 'react-router-dom'

const page = {
  maxWidth: '760px',
  margin: '5rem auto',
  padding: '0 2rem',
  textAlign: 'center',
  fontFamily: 'Calibri, sans-serif',
}

const heading = {
  fontSize: '2.6rem',
  color: '#1a3a5c',
  marginBottom: '1rem',
  fontWeight: '800',
}

const sub = {
  fontSize: '1.15rem',
  color: '#555',
  lineHeight: '1.6',
  marginBottom: '2.5rem',
}

const cards = {
  display: 'flex',
  gap: '1.25rem',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: '1rem',
}

function Card({ to, title, desc, bg }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: bg,
        color: '#fff',
        borderRadius: '10px',
        padding: '1.5rem 2rem',
        width: '180px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
        transition: 'transform 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.4rem' }}>{title}</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.88 }}>{desc}</div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <div style={page}>
      <h1 style={heading}>Welcome to Marist Water Polo</h1>
      <p style={sub}>
        Auckland's home of competitive water polo. Register your player, manage the squad,
        and build your teams — all in one place.
      </p>
      <div style={cards}>
        <Card to="/register" title="Register" desc="Sign up a new player" bg="#1a3a5c" />
        <Card to="/members" title="Members" desc="View all registered players" bg="#2c6e49" />
        <Card to="/teams" title="Teams" desc="Assign players to squads" bg="#7b3f00" />
      </div>
    </div>
  )
}
