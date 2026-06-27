import { useState } from 'react'
import { Link } from 'react-router-dom'

const TEAMS = ['Unassigned', 'U12 Marlins', 'U14 Sharks', 'U16 Barracudas', 'U18 Titans', 'Senior A', 'Senior B']

const page = { maxWidth: '960px', margin: '3rem auto', padding: '0 1.5rem', fontFamily: 'Calibri, sans-serif' }
const heading = { fontSize: '1.9rem', color: '#00205b', marginBottom: '1.5rem', fontWeight: '700' }

const teamColors = {
  'Unassigned': '#999',
  'U12 Marlins': '#1565c0',
  'U14 Sharks': '#2e7d32',
  'U16 Barracudas': '#6a1a1a',
  'U18 Titans': '#4a148c',
  'Senior A': '#e65100',
  'Senior B': '#00695c',
}

export default function TeamsPage({ members }) {
  const [assignments, setAssignments] = useState({})

  function assign(memberId, team) {
    setAssignments(prev => ({ ...prev, [memberId]: team }))
  }

  const grouped = TEAMS.slice(1).reduce((acc, team) => {
    acc[team] = members.filter(m => assignments[m.id] === team)
    return acc
  }, {})

  const unassigned = members.filter(m => !assignments[m.id] || assignments[m.id] === 'Unassigned')

  if (members.length === 0) {
    return (
      <div style={page}>
        <h1 style={heading}>Team Assignments</h1>
        <p style={{ color: '#777' }}>No players registered yet. <Link to="/register">Register a player first.</Link></p>
      </div>
    )
  }

  return (
    <div style={page}>
      <h1 style={heading}>Team Assignments</h1>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Player roster */}
        <div style={{ flex: '1 1 320px' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#444', marginBottom: '1rem', fontWeight: '600' }}>
            All Players — assign to a team
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {members.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#fff', border: '1px solid #dde3ec', borderRadius: '8px',
                padding: '0.6rem 0.9rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#00205b' }}>{m.firstName} {m.lastName}</span>
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#777' }}>{m.grade}</span>
                </div>
                <select
                  value={assignments[m.id] || 'Unassigned'}
                  onChange={e => assign(m.id, e.target.value)}
                  style={{
                    border: '1px solid #bbb', borderRadius: '6px', padding: '0.3rem 0.5rem',
                    fontSize: '0.85rem', cursor: 'pointer', outline: 'none',
                  }}
                >
                  {TEAMS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Team summary */}
        <div style={{ flex: '1 1 280px' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#444', marginBottom: '1rem', fontWeight: '600' }}>
            Team Summary
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {TEAMS.slice(1).map(team => (
              <div key={team} style={{
                background: '#fff', border: '1px solid #dde3ec', borderRadius: '8px',
                padding: '0.75rem 1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span style={{
                    display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
                    background: teamColors[team],
                  }} />
                  <span style={{ fontWeight: '700', color: '#00205b', fontSize: '0.92rem' }}>{team}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#777' }}>
                    {grouped[team].length} player{grouped[team].length !== 1 ? 's' : ''}
                  </span>
                </div>
                {grouped[team].length > 0 && (
                  <ul style={{ margin: '0.25rem 0 0 1.2rem', padding: 0, fontSize: '0.85rem', color: '#555' }}>
                    {grouped[team].map(m => (
                      <li key={m.id}>{m.firstName} {m.lastName}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {unassigned.length > 0 && (
              <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.25rem' }}>
                {unassigned.length} player{unassigned.length !== 1 ? 's' : ''} not yet assigned
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
