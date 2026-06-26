import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AGE_GROUPS = ['U12', 'U14', 'U16', 'U18', 'Senior']

const INITIAL = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  ageGroup: 'U12',
  email: '',
  phone: '',
  parentName: '',
  medicalNotes: '',
}

const page = { maxWidth: '560px', margin: '3rem auto', padding: '0 1.5rem', fontFamily: 'Calibri, sans-serif' }
const heading = { fontSize: '1.9rem', color: '#1a3a5c', marginBottom: '1.5rem', fontWeight: '700' }
const label = { display: 'block', marginBottom: '0.25rem', fontWeight: '600', color: '#333', fontSize: '0.92rem' }
const input = {
  width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px',
  border: '1px solid #bbb', fontSize: '0.95rem', boxSizing: 'border-box',
  marginBottom: '1rem', outline: 'none',
}
const btn = {
  background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: '7px',
  padding: '0.7rem 2rem', fontSize: '1rem', cursor: 'pointer', fontWeight: '600',
  marginTop: '0.5rem',
}
const success = {
  background: '#e6f4ea', border: '1px solid #4caf50', color: '#2e7d32',
  borderRadius: '7px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontWeight: '600',
}

export default function RegisterPage({ onRegister }) {
  const [form, setForm] = useState(INITIAL)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onRegister(form)
    setDone(true)
    setTimeout(() => {
      setDone(false)
      setForm(INITIAL)
      navigate('/members')
    }, 1400)
  }

  return (
    <div style={page}>
      <h1 style={heading}>Player Registration</h1>
      {done && <div style={success}>Registration successful! Redirecting to members...</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={label}>First Name *</label>
            <input style={input} name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Last Name *</label>
            <input style={input} name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
        </div>
        <label style={label}>Date of Birth *</label>
        <input style={input} type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
        <label style={label}>Age Group *</label>
        <select style={input} name="ageGroup" value={form.ageGroup} onChange={handleChange}>
          {AGE_GROUPS.map(g => <option key={g}>{g}</option>)}
        </select>
        <label style={label}>Email *</label>
        <input style={input} type="email" name="email" value={form.email} onChange={handleChange} required />
        <label style={label}>Phone</label>
        <input style={input} type="tel" name="phone" value={form.phone} onChange={handleChange} />
        <label style={label}>Parent / Guardian Name</label>
        <input style={input} name="parentName" value={form.parentName} onChange={handleChange} />
        <label style={label}>Medical Notes</label>
        <textarea
          style={{ ...input, minHeight: '80px', resize: 'vertical' }}
          name="medicalNotes"
          value={form.medicalNotes}
          onChange={handleChange}
        />
        <button type="submit" style={btn}>Register Player</button>
      </form>
    </div>
  )
}
