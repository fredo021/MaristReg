import { Link } from 'react-router-dom'

const page = { maxWidth: '960px', margin: '3rem auto', padding: '0 1.5rem', fontFamily: 'Calibri, sans-serif' }
const heading = { fontSize: '1.9rem', color: '#1a3a5c', marginBottom: '1.5rem', fontWeight: '700' }
const empty = { color: '#777', textAlign: 'center', marginTop: '3rem', fontSize: '1rem' }

const th = {
  background: '#1a3a5c', color: '#fff', padding: '0.65rem 0.9rem',
  textAlign: 'left', fontWeight: '600', fontSize: '0.88rem',
}

const td = {
  padding: '0.6rem 0.9rem', fontSize: '0.9rem', color: '#333',
  borderBottom: '1px solid #e8e8e8',
}

export default function MembersPage({ members }) {
  return (
    <div style={page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ ...heading, marginBottom: 0 }}>Registered Members</h1>
        <span style={{
          background: '#e3eaf4', color: '#1a3a5c', borderRadius: '20px',
          padding: '0.2rem 0.75rem', fontWeight: '700', fontSize: '0.9rem',
        }}>
          {members.length}
        </span>
        <Link to="/register" style={{
          marginLeft: 'auto', background: '#1a3a5c', color: '#fff', borderRadius: '7px',
          padding: '0.5rem 1.25rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600',
        }}>
          + Register Player
        </Link>
      </div>

      {members.length === 0 ? (
        <p style={empty}>No members registered yet. <Link to="/register">Register the first player.</Link></p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr>
                {['Name', 'Age Group', 'Date of Birth', 'Email', 'Phone', 'Parent / Guardian'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id} style={{ background: i % 2 === 0 ? '#fff' : '#f7f9fc' }}>
                  <td style={{ ...td, fontWeight: '600' }}>{m.firstName} {m.lastName}</td>
                  <td style={td}>
                    <span style={{
                      background: '#e3eaf4', color: '#1a3a5c', borderRadius: '12px',
                      padding: '0.15rem 0.6rem', fontSize: '0.82rem', fontWeight: '600',
                    }}>
                      {m.ageGroup}
                    </span>
                  </td>
                  <td style={td}>{m.dateOfBirth}</td>
                  <td style={td}>{m.email}</td>
                  <td style={td}>{m.phone || '—'}</td>
                  <td style={td}>{m.parentName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
