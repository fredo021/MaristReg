import { Link } from 'react-router-dom'

const page = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '0',
  fontFamily: 'Calibri, sans-serif',
}

const hero = {
  background: '#00205b',
  color: '#fff',
  padding: '5rem 2.5rem 4rem',
  textAlign: 'center',
}

const heroHeading = {
  fontSize: '2.8rem',
  fontWeight: '800',
  marginBottom: '1rem',
  letterSpacing: '-0.01em',
  lineHeight: 1.15,
}

const heroSub = {
  fontSize: '1.15rem',
  color: 'rgba(255,255,255,0.78)',
  lineHeight: '1.65',
  maxWidth: '540px',
  margin: '0 auto 2.75rem',
}

const whiteAccent = {
  display: 'inline-block',
  width: '48px',
  height: '3px',
  background: 'rgba(255,255,255,0.4)',
  borderRadius: '2px',
  marginBottom: '1.5rem',
}

const cards = {
  display: 'flex',
  gap: '1.25rem',
  justifyContent: 'center',
  flexWrap: 'wrap',
}

const footer = {
  padding: '2.5rem 2rem',
  textAlign: 'center',
  color: '#888',
  fontSize: '0.88rem',
}

function Card({ to, title, desc, icon, bg }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: bg,
        color: '#fff',
        borderRadius: '12px',
        padding: '1.75rem 2rem',
        width: '190px',
        border: '1px solid rgba(255,255,255,0.22)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s',
        textAlign: 'center',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
      >
        <div style={{ fontSize: '1.9rem', marginBottom: '0.65rem' }}>{icon}</div>
        <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.4rem' }}>{title}</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.88, lineHeight: 1.45 }}>{desc}</div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <div style={page}>
      <div style={hero}>
        <div style={whiteAccent} />
        <h1 style={heroHeading}>Marist Water Polo</h1>
        <p style={heroSub}>
          Auckland's home of competitive water polo. Register your player,
          manage the squad, and build your teams — all in one place.
        </p>
        <div style={cards}>
          <Card to="/register" title="Register" desc="Sign up a new player" icon="📋" bg="rgba(255,255,255,0.12)" />
          <Card to="/members" title="Members"  desc="View all registered players" icon="👥" bg="rgba(255,255,255,0.12)" />
          <Card to="/teams"   title="Teams"    desc="Assign players to squads" icon="🏊" bg="rgba(255,255,255,0.12)" />
        </div>
      </div>
      <div style={footer}>
        Marist Water Polo Club — Auckland, New Zealand
      </div>
    </div>
  )
}
