import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateGrade, getAgeAsOfJan1 } from '../utils/gradeCalc'
import { searchSuburbs } from '../utils/nzSuburbs'

const INITIAL = {
  firstName: '', lastName: '', gender: '', dateOfBirth: '',
  mobile: '', homePhone: '', email: '',
  streetAddress: '', suburb: '', city: '', postcode: '',
  institution: '',
  medicalNotes: '',
  photo: null,
  parentFirstName: '', parentLastName: '',
  parentEmail: '', parentMobile: '', parentRelationship: '',
  acceptedTerms: false,
}

// ── Shared styles ──────────────────────────────────────────────
const page = { maxWidth: '700px', margin: '2.5rem auto 4rem', padding: '0 1.5rem', fontFamily: 'Calibri, sans-serif' }
const pageHeading = { fontSize: '2rem', color: '#1a3a5c', fontWeight: '800', marginBottom: '2rem' }
const card = {
  background: '#fff', border: '1px solid #dde3ec', borderRadius: '10px',
  padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
}
const cardHighlight = { ...card, border: '2px solid #ffc107' }
const sectionTitle = {
  fontSize: '0.78rem', fontWeight: '700', color: '#1a3a5c', letterSpacing: '0.08em',
  textTransform: 'uppercase', marginBottom: '1.1rem', paddingBottom: '0.5rem',
  borderBottom: '2px solid #e3eaf4',
}
const sectionTitleWarn = { ...sectionTitle, color: '#7a5c00', borderColor: '#fde68a' }
const lbl = { display: 'block', marginBottom: '0.22rem', fontWeight: '600', color: '#444', fontSize: '0.87rem' }
const inp = {
  width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px',
  border: '1px solid #c0c8d4', fontSize: '0.94rem', boxSizing: 'border-box',
  marginBottom: '1rem', background: '#fff', outline: 'none',
}
const inpRO = { ...inp, background: '#f0f4f9', color: '#1a3a5c', fontWeight: '600', cursor: 'default' }
const row = { display: 'flex', gap: '1rem' }
const half = { flex: 1, minWidth: 0 }
const submitBtn = {
  background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: '8px',
  padding: '0.9rem', fontSize: '1.05rem', cursor: 'pointer', fontWeight: '700',
  display: 'block', width: '100%', marginTop: '0.5rem',
}
const successBanner = {
  background: '#e6f4ea', border: '1px solid #4caf50', color: '#2e7d32',
  borderRadius: '8px', padding: '0.85rem 1.1rem', marginBottom: '1.5rem', fontWeight: '600',
}
const warnBanner = {
  background: '#fff8e1', border: '1px solid #ffc107', color: '#7a5c00',
  borderRadius: '6px', padding: '0.7rem 0.9rem', marginBottom: '1rem', fontSize: '0.88rem',
}

export default function RegisterPage({ onRegister, terms }) {
  const [form, setForm] = useState(INITIAL)
  const [suburbQuery, setSuburbQuery] = useState('')
  const [suburbResults, setSuburbResults] = useState([])
  const [photoPreview, setPhotoPreview] = useState(null)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const age = getAgeAsOfJan1(form.dateOfBirth)
  const grade = calculateGrade(form.dateOfBirth, form.gender)
  const showSchool = age !== null && age < 21
  const showParent = age !== null && age < 18

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5 MB.')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
      setForm(prev => ({ ...prev, photo: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setPhotoPreview(null)
    setForm(prev => ({ ...prev, photo: null }))
  }

  function handleSuburbInput(e) {
    const val = e.target.value
    setSuburbQuery(val)
    setForm(prev => ({ ...prev, suburb: val, city: '', postcode: '' }))
    setSuburbResults(val.length >= 2 ? searchSuburbs(val) : [])
  }

  function pickSuburb(s) {
    setSuburbQuery(s.suburb)
    setForm(prev => ({ ...prev, suburb: s.suburb, city: s.city, postcode: s.postcode }))
    setSuburbResults([])
  }

  function handleSubmit(e) {
    e.preventDefault()
    onRegister({ ...form, grade, ageOnJan1: age })
    setDone(true)
    setTimeout(() => {
      setDone(false)
      setForm(INITIAL)
      setPhotoPreview(null)
      setSuburbQuery('')
      navigate('/members')
    }, 1500)
  }

  return (
    <div style={page}>
      <h1 style={pageHeading}>Player Registration</h1>
      {done && <div style={successBanner}>Registration successful! Redirecting to members list...</div>}

      <form onSubmit={handleSubmit}>

        {/* ── Personal Details ─────────────────────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Personal Details</div>

          <div style={row}>
            <div style={half}>
              <label style={lbl}>First Name *</label>
              <input style={inp} name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>
            <div style={half}>
              <label style={lbl}>Last Name *</label>
              <input style={inp} name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div style={row}>
            <div style={half}>
              <label style={lbl}>Gender *</label>
              <select style={inp} name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Select...</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div style={half}>
              <label style={lbl}>Date of Birth *</label>
              <input style={inp} type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
            </div>
          </div>

          <div style={row}>
            <div style={half}>
              <label style={lbl}>Grade (auto-calculated from DOB)</label>
              <input style={inpRO} value={grade || (form.dateOfBirth && form.gender ? 'Calculating...' : '—')} readOnly />
            </div>
            <div style={{ ...half, display: 'flex', alignItems: 'flex-end' }}>
              {grade && (
                <span style={{ fontSize: '0.82rem', color: '#777', paddingBottom: '1.1rem' }}>
                  Age as at 1 Jan {new Date().getFullYear()}: {age}
                </span>
              )}
            </div>
          </div>

          <div style={row}>
            <div style={half}>
              <label style={lbl}>Mobile Number *</label>
              <input style={inp} type="tel" name="mobile" value={form.mobile} onChange={handleChange} required placeholder="e.g. 021 123 4567" />
            </div>
            <div style={half}>
              <label style={lbl}>Home Phone</label>
              <input style={inp} type="tel" name="homePhone" value={form.homePhone} onChange={handleChange} placeholder="Optional" />
            </div>
          </div>

          <label style={lbl}>Email Address *</label>
          <input style={inp} type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>

        {/* ── Home Address ──────────────────────────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Home Address</div>

          <label style={lbl}>Street Address *</label>
          <input style={inp} name="streetAddress" value={form.streetAddress} onChange={handleChange} required placeholder="e.g. 123 Main Street" />

          <div style={row}>
            <div style={{ flex: 2, minWidth: 0, position: 'relative' }}>
              <label style={lbl}>Suburb *</label>
              <input
                style={inp}
                value={suburbQuery}
                onChange={handleSuburbInput}
                onBlur={() => setTimeout(() => setSuburbResults([]), 200)}
                placeholder="Start typing suburb..."
                required
                autoComplete="off"
              />
              {suburbResults.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% - 1rem)', left: 0, right: 0,
                  background: '#fff', border: '1px solid #c0c8d4', borderRadius: '6px',
                  zIndex: 200, boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  maxHeight: '220px', overflowY: 'auto',
                }}>
                  {suburbResults.map((s, i) => (
                    <div
                      key={i}
                      onMouseDown={() => pickSuburb(s)}
                      style={{
                        padding: '0.55rem 0.85rem', cursor: 'pointer', fontSize: '0.88rem',
                        borderBottom: i < suburbResults.length - 1 ? '1px solid #eee' : 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f4f9'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: '600', color: '#1a3a5c' }}>{s.suburb}</span>
                      <span style={{ color: '#888', marginLeft: '0.5rem', fontSize: '0.82rem' }}>
                        {s.city} {s.postcode}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={lbl}>City</label>
              <input style={inpRO} value={form.city} readOnly placeholder="Auto-filled" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={lbl}>Postcode</label>
              <input style={inpRO} value={form.postcode} readOnly placeholder="Auto-filled" />
            </div>
          </div>
        </div>

        {/* ── School / Institution (under 21) ───────────────── */}
        {showSchool && (
          <div style={card}>
            <div style={sectionTitle}>Education</div>
            <label style={lbl}>School or Tertiary Institution *</label>
            <input
              style={inp}
              name="institution"
              value={form.institution}
              onChange={handleChange}
              required
              placeholder="e.g. Marist College, University of Auckland"
            />
          </div>
        )}

        {/* ── Player Photo ─────────────────────────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Player Photo</div>
          <label style={lbl}>Upload photo (JPG or PNG, max 5 MB)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto}
            style={{ display: 'block', marginBottom: '1rem', fontSize: '0.9rem' }} />
          {photoPreview && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <img
                src={photoPreview}
                alt="Player preview"
                style={{ width: '110px', height: '138px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #1a3a5c' }}
              />
              <button
                type="button"
                onClick={removePhoto}
                style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '0.88rem', padding: 0 }}
              >
                Remove photo
              </button>
            </div>
          )}
        </div>

        {/* ── Medical Notes ─────────────────────────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Medical Notes</div>
          <label style={lbl}>Medical conditions, allergies or notes (optional)</label>
          <textarea
            style={{ ...inp, minHeight: '80px', resize: 'vertical' }}
            name="medicalNotes"
            value={form.medicalNotes}
            onChange={handleChange}
          />
        </div>

        {/* ── Parent / Guardian (under 18) ──────────────────── */}
        {showParent && (
          <div style={cardHighlight}>
            <div style={sectionTitleWarn}>Parent / Guardian Details — Required for Players Under 18</div>
            <div style={warnBanner}>
              Players under 18 must have a parent or guardian register alongside them.
              Please complete all fields below.
            </div>

            <div style={row}>
              <div style={half}>
                <label style={lbl}>Parent First Name *</label>
                <input style={inp} name="parentFirstName" value={form.parentFirstName} onChange={handleChange} required />
              </div>
              <div style={half}>
                <label style={lbl}>Parent Last Name *</label>
                <input style={inp} name="parentLastName" value={form.parentLastName} onChange={handleChange} required />
              </div>
            </div>

            <div style={row}>
              <div style={half}>
                <label style={lbl}>Parent Email *</label>
                <input style={inp} type="email" name="parentEmail" value={form.parentEmail} onChange={handleChange} required />
              </div>
              <div style={half}>
                <label style={lbl}>Parent Mobile *</label>
                <input style={inp} type="tel" name="parentMobile" value={form.parentMobile} onChange={handleChange} required />
              </div>
            </div>

            <label style={lbl}>Relationship to Player *</label>
            <select style={inp} name="parentRelationship" value={form.parentRelationship} onChange={handleChange} required>
              <option value="">Select...</option>
              <option>Mother</option>
              <option>Father</option>
              <option>Legal Guardian</option>
              <option>Other</option>
            </select>
          </div>
        )}

        {/* ── Terms & Conditions ────────────────────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Terms &amp; Conditions</div>
          <div style={{
            background: '#f7f9fc', border: '1px solid #dde3ec', borderRadius: '6px',
            padding: '0.9rem 1rem', maxHeight: '160px', overflowY: 'auto',
            fontSize: '0.85rem', color: '#444', marginBottom: '1rem',
            lineHeight: '1.65', whiteSpace: 'pre-wrap',
          }}>
            {terms || (
              <span style={{ color: '#aaa', fontStyle: 'italic' }}>
                No terms have been configured. Please contact your administrator.
              </span>
            )}
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.92rem', color: '#333' }}>
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={form.acceptedTerms}
              onChange={handleChange}
              required
              style={{ marginTop: '3px', accentColor: '#1a3a5c', width: '15px', height: '15px', flexShrink: 0 }}
            />
            I have read and accept the Terms &amp; Conditions *
          </label>
        </div>

        <button type="submit" style={submitBtn}>Register Player</button>
      </form>
    </div>
  )
}
