import { Link } from 'react-router-dom'

const page = { maxWidth: '1100px', margin: '3rem auto', padding: '0 1.5rem', fontFamily: 'Calibri, sans-serif' }
const heading = { fontSize: '1.9rem', color: '#1a3a5c', marginBottom: '1.5rem', fontWeight: '700' }
const empty = { color: '#777', textAlign: 'center', marginTop: '3rem', fontSize: '1rem' }

const th = {
  background: '#00205b', color: '#fff', padding: '0.65rem 0.9rem',
  textAlign: 'left', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap',
}
const td = { padding: '0.6rem 0.9rem', fontSize: '0.88rem', color: '#333', borderBottom: '1px solid #e8e8e8' }

const gradeBadge = {
  background: '#e8ecf2', color: '#00205b', borderRadius: '12px',
  padding: '0.15rem 0.6rem', fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap',
}

const parentPlayerBadge = {
  marginLeft: '0.4rem', background: '#e8ecf2', color: '#00205b',
  borderRadius: '10px', padding: '0.1rem 0.5rem', fontSize: '0.73rem', fontWeight: '600',
}

const playerPillSmall = {
  marginLeft: '0.3rem', background: '#e8ecf2', color: '#00205b',
  borderRadius: '8px', padding: '0.05rem 0.4rem', fontSize: '0.72rem', fontWeight: '600',
}

export default function MembersPage({ members }) {
  return (
    <div style={page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <h1 style={{ ...heading, marginBottom: 0 }}>Registered Members</h1>
        <span style={{
          background: '#e8ecf2', color: '#00205b', borderRadius: '20px',
          padding: '0.2rem 0.75rem', fontWeight: '700', fontSize: '0.9rem',
        }}>
          {members.length}
        </span>
        <Link to="/register" style={{
          marginLeft: 'auto', background: '#00205b', color: '#fff', borderRadius: '7px',
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
                {['Photo', 'Name', 'Grade', 'DOB', 'Mobile', 'Email', 'Suburb', 'School / Institution', 'Parent'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id} style={{ background: i % 2 === 0 ? '#fff' : '#f7f9fc' }}>
                  <td style={td}>
                    {m.photo
                      ? <img src={m.photo} alt="" style={{ width: '36px', height: '45px', objectFit: 'cover', borderRadius: '4px', display: 'block' }} />
                      : <div style={{ width: '36px', height: '45px', background: '#dde3ec', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#999' }}>—</div>
                    }
                  </td>
                  <td style={{ ...td, fontWeight: '600', whiteSpace: 'nowrap' }}>
                    {m.firstName} {m.lastName}
                    {m.memberType === 'parent-player' && (
                      <span style={parentPlayerBadge}>Parent-Player</span>
                    )}
                  </td>
                  <td style={td}><span style={gradeBadge}>{m.grade || '—'}</span></td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{m.dateOfBirth || '—'}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{m.mobile || '—'}</td>
                  <td style={td}>{m.email}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{m.suburb || '—'}</td>
                  <td style={td}>{m.institution || '—'}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    {m.parentFirstName ? (
                      <span>
                        {m.parentFirstName} {m.parentLastName}
                        {m.parentIsPlayer && <span style={playerPillSmall}>player</span>}
                      </span>
                    ) : <span style={{ color: '#aaa' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
