import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateGrade, getAgeAsOfJan1 } from '../utils/gradeCalc'
import { searchSuburbs } from '../utils/nzSuburbs'

const VOLUNTEER_ROLES = ['Committee', 'Manager', 'Coach', 'Other']

const INITIAL = {
  firstName: '', lastName: '', gender: '', dateOfBirth: '',
  mobile: '', homePhone: '', email: '',
  streetAddress: '', suburb: '', city: '', postcode: '',
  institution: '',
  medicalNotes: '', photo: null,
  registrationMode: 'independent',
  familyGroupName: '',
  // Parent 1
  parentFirstName: '', parentLastName: '',
  parentEmail: '', parentMobile: '', parentRelationship: '',
  parentOccupation: '',
  parentVolunteer: false, parentVolunteerRoles: [], parentVolunteerOther: '',
  // Parent 2
  parent2FirstName: '', parent2LastName: '',
  parent2Email: '', parent2Mobile: '', parent2Relationship: '',
  parent2Occupation: '',
  parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '',
  acceptedTerms: false,
}

function extractParentFields(form, includeP2) {
  const f = {
    parentFirstName: form.parentFirstName, parentLastName: form.parentLastName,
    parentEmail: form.parentEmail, parentMobile: form.parentMobile,
    parentRelationship: form.parentRelationship, parentOccupation: form.parentOccupation,
    parentVolunteer: form.parentVolunteer,
    parentVolunteerRoles: [...form.parentVolunteerRoles],
    parentVolunteerOther: form.parentVolunteerOther,
  }
  if (includeP2) {
    Object.assign(f, {
      parent2FirstName: form.parent2FirstName, parent2LastName: form.parent2LastName,
      parent2Email: form.parent2Email, parent2Mobile: form.parent2Mobile,
      parent2Relationship: form.parent2Relationship, parent2Occupation: form.parent2Occupation,
      parent2Volunteer: form.parent2Volunteer,
      parent2VolunteerRoles: [...form.parent2VolunteerRoles],
      parent2VolunteerOther: form.parent2VolunteerOther,
    })
  }
  return f
}

// ── Styles ─────────────────────────────────────────────────────
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
const outlineBtn = {
  background: 'none', color: '#1a3a5c', border: '1px solid #1a3a5c', borderRadius: '8px',
  padding: '0.9rem', fontSize: '1rem', cursor: 'pointer', fontWeight: '600', width: '100%',
}
const warnBanner = {
  background: '#fff8e1', border: '1px solid #ffc107', color: '#7a5c00',
  borderRadius: '6px', padding: '0.7rem 0.9rem', marginBottom: '1rem', fontSize: '0.88rem',
}
const infoBanner = {
  background: '#e8f4fd', border: '1px solid #90caf9', color: '#1565c0',
  borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem',
}
const chk = { accentColor: '#1a3a5c', width: '15px', height: '15px', flexShrink: 0, cursor: 'pointer' }
const addParentBtn = {
  background: 'none', color: '#1a3a5c', border: '1px dashed #a0b4cc', borderRadius: '7px',
  padding: '0.55rem 1.1rem', fontSize: '0.88rem', cursor: 'pointer', fontWeight: '600', marginTop: '0.5rem',
}
const removeParentBtn = {
  background: 'none', color: '#c62828', border: 'none', cursor: 'pointer',
  fontSize: '0.85rem', padding: '0.25rem 0', marginTop: '0.5rem', display: 'inline-block',
}
const radioRow = (active) => ({
  display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.7rem 0.9rem',
  borderRadius: '8px', border: `1px solid ${active ? '#1a3a5c' : '#dde3ec'}`,
  cursor: 'pointer', marginBottom: '0.6rem', background: active ? '#f0f4f9' : '#fff',
})
const volunteerBox = {
  background: '#f7f9fc', border: '1px solid #dde3ec', borderRadius: '8px',
  padding: '0.9rem 1rem', marginBottom: '1rem',
}
const rolesGrid = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', marginBottom: '0.5rem' }
const roleLabel = { display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: '#333' }

export default function RegisterPage({ onRegister, terms }) {
  const [form, setForm] = useState(INITIAL)
  const [showP2, setShowP2] = useState(false)
  const [suburbQuery, setSuburbQuery] = useState('')
  const [suburbResults, setSuburbResults] = useState([])
  const [photoPreview, setPhotoPreview] = useState(null)
  const [done, setDone] = useState(false)
  const [submittedAge, setSubmittedAge] = useState(null)
  const [submittedName, setSubmittedName] = useState('')
  const [submittedGrade, setSubmittedGrade] = useState('')
  const [savedParent, setSavedParent] = useState(null)
  const [prefilled, setPrefilled] = useState(false)
  const navigate = useNavigate()

  const age = getAgeAsOfJan1(form.dateOfBirth)
  const grade = calculateGrade(form.dateOfBirth, form.gender)
  const showSchool = age !== null && age < 21
  const showParent = age !== null && age < 18
  const showFamilyGroup = age !== null && age >= 16

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function toggleRole(num, role) {
    const field = num === 1 ? 'parentVolunteerRoles' : 'parent2VolunteerRoles'
    setForm(prev => {
      const cur = prev[field]
      return { ...prev, [field]: cur.includes(role) ? cur.filter(r => r !== role) : [...cur, role] }
    })
  }

  function removeP2() {
    setShowP2(false)
    setForm(prev => ({
      ...prev,
      parent2FirstName: '', parent2LastName: '', parent2Email: '', parent2Mobile: '',
      parent2Relationship: '', parent2Occupation: '',
      parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '',
    }))
  }

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5 MB.'); e.target.value = ''; return }
    const reader = new FileReader()
    reader.onloadend = () => { setPhotoPreview(reader.result); setForm(prev => ({ ...prev, photo: reader.result })) }
    reader.readAsDataURL(file)
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
    const capturedAge = age
    onRegister({ ...form, grade, ageOnJan1: capturedAge })
    setSubmittedAge(capturedAge)
    setSubmittedName(`${form.firstName} ${form.lastName}`)
    setSubmittedGrade(grade)
    if (capturedAge !== null && capturedAge < 16) {
      setSavedParent({ ...extractParentFields(form, showP2), hadP2: showP2 })
    }
    setDone(true)
  }

  function handleRegisterSibling() {
    const { hadP2, ...parentFields } = savedParent || {}
    setForm({ ...INITIAL, ...parentFields })
    setShowP2(hadP2 || false)
    setSuburbQuery('')
    setPhotoPreview(null)
    setPrefilled(true)
    setDone(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleRegisterNew() {
    setForm(INITIAL)
    setShowP2(false)
    setSuburbQuery('')
    setPhotoPreview(null)
    setPrefilled(false)
    setDone(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Volunteer sub-section (render helper, not a component) ────
  function renderVolunteer(num) {
    const vField = num === 1 ? 'parentVolunteer' : 'parent2Volunteer'
    const rField = num === 1 ? 'parentVolunteerRoles' : 'parent2VolunteerRoles'
    const oField = num === 1 ? 'parentVolunteerOther' : 'parent2VolunteerOther'
    const isVol = form[vField]
    const roles = form[rField]
    return (
      <>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: isVol ? '0.6rem' : '1rem' }}>
          <input type="checkbox" name={vField} checked={isVol} onChange={handleChange} style={chk} />
          <span style={{ fontWeight: '600', color: '#444', fontSize: '0.9rem' }}>I would like to volunteer with the club</span>
        </label>
        {isVol && (
          <div style={volunteerBox}>
            <div style={{ ...lbl, marginBottom: '0.6rem' }}>Preferred role(s):</div>
            <div style={rolesGrid}>
              {VOLUNTEER_ROLES.map(role => (
                <label key={role} style={roleLabel}>
                  <input type="checkbox" checked={roles.includes(role)} onChange={() => toggleRole(num, role)} style={chk} />
                  {role}
                </label>
              ))}
            </div>
            {roles.includes('Other') && (
              <input style={{ ...inp, marginBottom: 0, marginTop: '0.4rem' }} name={oField} value={form[oField]} onChange={handleChange} placeholder="Please specify your role..." />
            )}
          </div>
        )}
      </>
    )
  }

  // ── Success screen ────────────────────────────────────────────
  if (done) {
    return (
      <div style={page}>
        <div style={{
          background: '#fff', border: '1px solid #dde3ec', borderRadius: '12px',
          padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%', background: '#e6f4ea',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', fontSize: '1.7rem', color: '#2e7d32', fontWeight: '700',
          }}>✓</div>
          <h2 style={{ color: '#1a3a5c', fontSize: '1.65rem', marginBottom: '0.4rem', fontWeight: '800' }}>
            {submittedName} registered!
          </h2>
          <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
            Grade: <strong style={{ color: '#1a3a5c' }}>{submittedGrade}</strong>
          </p>
          <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '2.25rem' }}>What would you like to do next?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '300px', margin: '0 auto' }}>
            {submittedAge !== null && submittedAge < 16 && (
              <button onClick={handleRegisterSibling} style={{ ...submitBtn, background: '#2c6e49', marginTop: 0 }}>
                Register Another Family Member
              </button>
            )}
            <button onClick={handleRegisterNew} style={{ ...submitBtn, marginTop: 0 }}>
              Register a New Player
            </button>
            <button onClick={() => navigate('/members')} style={outlineBtn}>
              View All Members
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Registration form ─────────────────────────────────────────
  return (
    <div style={page}>
      <h1 style={pageHeading}>Player Registration</h1>

      {prefilled && (
        <div style={infoBanner}>
          Parent / guardian details have been carried over from the previous registration.
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ── Personal Details ──────────────────────────────── */}
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
              <label style={lbl}>Grade (auto-calculated)</label>
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

        {/* ── Registration Type (U18 grade and above) ───────── */}
        {showFamilyGroup && (
          <div style={card}>
            <div style={sectionTitle}>Registration Type</div>
            <label style={radioRow(form.registrationMode === 'independent')}>
              <input type="radio" name="registrationMode" value="independent" checked={form.registrationMode === 'independent'} onChange={handleChange} style={{ accentColor: '#1a3a5c', marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#1a3a5c', fontSize: '0.95rem' }}>Register independently</strong>
                <span style={{ display: 'block', fontSize: '0.83rem', color: '#666', marginTop: '0.15rem' }}>
                  Manage your own registration and profile
                </span>
              </div>
            </label>
            <label style={radioRow(form.registrationMode === 'family')}>
              <input type="radio" name="registrationMode" value="family" checked={form.registrationMode === 'family'} onChange={handleChange} style={{ accentColor: '#1a3a5c', marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#1a3a5c', fontSize: '0.95rem' }}>Join a family group</strong>
                <span style={{ display: 'block', fontSize: '0.83rem', color: '#666', marginTop: '0.15rem' }}>
                  Link this registration to an existing family account
                </span>
              </div>
            </label>
            {form.registrationMode === 'family' && (
              <>
                <label style={{ ...lbl, marginTop: '0.5rem' }}>Family group name / reference *</label>
                <input
                  style={inp}
                  name="familyGroupName"
                  value={form.familyGroupName}
                  onChange={handleChange}
                  required={form.registrationMode === 'family'}
                  placeholder="e.g. Smith Family"
                />
              </>
            )}
          </div>
        )}

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
                      style={{ padding: '0.55rem 0.85rem', cursor: 'pointer', fontSize: '0.88rem', borderBottom: i < suburbResults.length - 1 ? '1px solid #eee' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f4f9'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: '600', color: '#1a3a5c' }}>{s.suburb}</span>
                      <span style={{ color: '#888', marginLeft: '0.5rem', fontSize: '0.82rem' }}>{s.city} {s.postcode}</span>
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

        {/* ── Education (under 21) ──────────────────────────── */}
        {showSchool && (
          <div style={card}>
            <div style={sectionTitle}>Education</div>
            <label style={lbl}>School or Tertiary Institution *</label>
            <input style={inp} name="institution" value={form.institution} onChange={handleChange} required placeholder="e.g. Marist College, University of Auckland" />
          </div>
        )}

        {/* ── Player Photo ──────────────────────────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Player Photo</div>
          <label style={lbl}>Upload photo (JPG or PNG, max 5 MB)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} style={{ display: 'block', marginBottom: '1rem', fontSize: '0.9rem' }} />
          {photoPreview && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <img src={photoPreview} alt="Player preview" style={{ width: '110px', height: '138px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #1a3a5c' }} />
              <button type="button" onClick={() => { setPhotoPreview(null); setForm(prev => ({ ...prev, photo: null })) }} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '0.88rem', padding: 0 }}>
                Remove photo
              </button>
            </div>
          )}
        </div>

        {/* ── Medical Notes ─────────────────────────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Medical Notes</div>
          <label style={lbl}>Medical conditions, allergies or notes (optional)</label>
          <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} name="medicalNotes" value={form.medicalNotes} onChange={handleChange} />
        </div>

        {/* ── Parent / Guardian (under 18) ──────────────────── */}
        {showParent && (
          <div style={cardHighlight}>
            <div style={sectionTitleWarn}>Parent / Guardian Details — Required for Players Under 18</div>
            <div style={warnBanner}>
              Players under 18 must have a parent or guardian register alongside them. Please complete all fields below.
            </div>

            {/* ── Parent 1 ── */}
            <div style={row}>
              <div style={half}>
                <label style={lbl}>First Name *</label>
                <input style={inp} name="parentFirstName" value={form.parentFirstName} onChange={handleChange} required />
              </div>
              <div style={half}>
                <label style={lbl}>Last Name *</label>
                <input style={inp} name="parentLastName" value={form.parentLastName} onChange={handleChange} required />
              </div>
            </div>
            <div style={row}>
              <div style={half}>
                <label style={lbl}>Email *</label>
                <input style={inp} type="email" name="parentEmail" value={form.parentEmail} onChange={handleChange} required />
              </div>
              <div style={half}>
                <label style={lbl}>Mobile *</label>
                <input style={inp} type="tel" name="parentMobile" value={form.parentMobile} onChange={handleChange} required />
              </div>
            </div>
            <div style={row}>
              <div style={half}>
                <label style={lbl}>Relationship to Player *</label>
                <select style={inp} name="parentRelationship" value={form.parentRelationship} onChange={handleChange} required>
                  <option value="">Select...</option>
                  <option>Mother</option>
                  <option>Father</option>
                  <option>Legal Guardian</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={half}>
                <label style={lbl}>Occupation</label>
                <input style={inp} name="parentOccupation" value={form.parentOccupation} onChange={handleChange} placeholder="Optional" />
              </div>
            </div>
            {renderVolunteer(1)}

            {!showP2 && (
              <button type="button" onClick={() => setShowP2(true)} style={addParentBtn}>
                + Add Second Parent / Guardian
              </button>
            )}

            {/* ── Parent 2 ── */}
            {showP2 && (
              <div style={{ borderTop: '2px dashed #fde68a', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                <div style={{ ...sectionTitleWarn, marginBottom: '1rem' }}>Second Parent / Guardian</div>
                <div style={row}>
                  <div style={half}>
                    <label style={lbl}>First Name *</label>
                    <input style={inp} name="parent2FirstName" value={form.parent2FirstName} onChange={handleChange} required />
                  </div>
                  <div style={half}>
                    <label style={lbl}>Last Name *</label>
                    <input style={inp} name="parent2LastName" value={form.parent2LastName} onChange={handleChange} required />
                  </div>
                </div>
                <div style={row}>
                  <div style={half}>
                    <label style={lbl}>Email *</label>
                    <input style={inp} type="email" name="parent2Email" value={form.parent2Email} onChange={handleChange} required />
                  </div>
                  <div style={half}>
                    <label style={lbl}>Mobile *</label>
                    <input style={inp} type="tel" name="parent2Mobile" value={form.parent2Mobile} onChange={handleChange} required />
                  </div>
                </div>
                <div style={row}>
                  <div style={half}>
                    <label style={lbl}>Relationship to Player *</label>
                    <select style={inp} name="parent2Relationship" value={form.parent2Relationship} onChange={handleChange} required>
                      <option value="">Select...</option>
                      <option>Mother</option>
                      <option>Father</option>
                      <option>Legal Guardian</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div style={half}>
                    <label style={lbl}>Occupation</label>
                    <input style={inp} name="parent2Occupation" value={form.parent2Occupation} onChange={handleChange} placeholder="Optional" />
                  </div>
                </div>
                {renderVolunteer(2)}
                <button type="button" onClick={removeP2} style={removeParentBtn}>
                  — Remove Second Parent / Guardian
                </button>
              </div>
            )}
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
            {terms || <span style={{ color: '#aaa', fontStyle: 'italic' }}>No terms have been configured. Please contact your administrator.</span>}
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.92rem', color: '#333' }}>
            <input type="checkbox" name="acceptedTerms" checked={form.acceptedTerms} onChange={handleChange} required style={{ ...chk, marginTop: '3px' }} />
            I have read and accept the Terms &amp; Conditions *
          </label>
        </div>

        <button type="submit" style={submitBtn}>Register Player</button>
      </form>
    </div>
  )
}
