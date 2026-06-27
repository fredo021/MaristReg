import { useState } from 'react'

const page = { maxWidth: '720px', margin: '3rem auto', padding: '0 1.5rem', fontFamily: 'Calibri, sans-serif' }
const heading = { fontSize: '1.9rem', color: '#00205b', fontWeight: '700', marginBottom: '0.4rem' }
const sub = { color: '#666', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: '1.5' }

const saveBtn = {
  background: '#00205b', color: '#fff', border: 'none', borderRadius: '8px',
  padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer', fontWeight: '700', marginTop: '1rem',
}

const cancelBtn = {
  background: 'none', color: '#666', border: '1px solid #c0c8d4', borderRadius: '8px',
  padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem', marginLeft: '0.75rem',
}

const successMsg = {
  background: '#e8ecf2', border: '1px solid #b0bdd0', color: '#00205b',
  borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontWeight: '600', fontSize: '0.95rem',
}

export default function AdminPage({ terms, setTerms }) {
  const [draft, setDraft] = useState(terms)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setTerms(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleReset() {
    setDraft(terms)
  }

  return (
    <div style={page}>
      <h1 style={heading}>Admin — Terms &amp; Conditions</h1>
      <p style={sub}>
        Edit the terms and conditions displayed on the player registration form.
        Changes apply immediately to all new registrations.
      </p>

      {saved && <div style={successMsg}>Terms and conditions saved successfully.</div>}

      <div style={{
        background: '#fff', border: '1px solid #dde3ec', borderRadius: '10px',
        padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <label style={{ display: 'block', fontWeight: '700', color: '#00205b', marginBottom: '0.6rem', fontSize: '0.92rem' }}>
          Terms &amp; Conditions Text
        </label>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          style={{
            width: '100%', minHeight: '380px', padding: '0.9rem',
            borderRadius: '8px', border: '1px solid #c0c8d4', fontSize: '0.9rem',
            lineHeight: '1.7', resize: 'vertical', boxSizing: 'border-box',
            fontFamily: 'Calibri, sans-serif', outline: 'none',
          }}
          placeholder="Enter the registration terms and conditions..."
        />
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button style={saveBtn} onClick={handleSave}>Save Terms</button>
          <button style={cancelBtn} onClick={handleReset}>Reset Changes</button>
        </div>
      </div>

      <div style={{
        marginTop: '2rem', background: '#f7f9fc', border: '1px solid #dde3ec',
        borderRadius: '10px', padding: '1.25rem 1.5rem',
      }}>
        <div style={{ fontWeight: '700', color: '#444', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
          Live Preview (as shown to registrants)
        </div>
        <div style={{
          fontSize: '0.85rem', color: '#555', lineHeight: '1.7',
          whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto',
        }}>
          {draft || <span style={{ color: '#aaa', fontStyle: 'italic' }}>No terms set.</span>}
        </div>
      </div>
    </div>
  )
}
