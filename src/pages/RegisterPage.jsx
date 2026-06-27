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
  // Parent 1 — contact
  parentFirstName: '', parentLastName: '',
  parentEmail: '', parentMobile: '', parentRelationship: '',
  parentOccupation: '',
  parentVolunteer: false, parentVolunteerRoles: [], parentVolunteerOther: '',
  // Parent 1 — player status
  parentIsPlayer: false,
  parentDOB: '', parentGender: '', parentPhoto: null, parentMedical: '',
  // Parent 2 — contact
  parent2FirstName: '', parent2LastName: '',
  parent2Email: '', parent2Mobile: '', parent2Relationship: '',
  parent2Occupation: '',
  parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '',
  // Parent 2 — player status
  parent2IsPlayer: false,
  parent2DOB: '', parent2Gender: '', parent2Photo: null, parent2Medical: '',
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
    parentIsPlayer: form.parentIsPlayer,
    parentDOB: form.parentDOB, parentGender: form.parentGender,
    parentPhoto: form.parentPhoto, parentMedical: form.parentMedical,
  }
  if (includeP2) {
    Object.assign(f, {
      parent2FirstName: form.parent2FirstName, parent2LastName: form.parent2LastName,
      parent2Email: form.parent2Email, parent2Mobile: form.parent2Mobile,
      parent2Relationship: form.parent2Relationship, parent2Occupation: form.parent2Occupation,
      parent2Volunteer: form.parent2Volunteer,
      parent2VolunteerRoles: [...form.parent2VolunteerRoles],
      parent2VolunteerOther: form.parent2VolunteerOther,
      parent2IsPlayer: form.parent2IsPlayer,
      parent2DOB: form.parent2DOB, parent2Gender: form.parent2Gender,
      parent2Photo: form.parent2Photo, parent2Medical: form.parent2Medical,
    })
  }
  return f
}

// ── Styles ─────────────────────────────────────────────────────
const page = { maxWidth: '700px', margin: '2.5rem auto 4rem', padding: '0 1.5rem', fontFamily: 'Calibri, sans-serif' }
const pageHeading = { fontSize: '2rem', color: '#00205b', fontWeight: '800', marginBottom: '2rem' }
const card = {
  background: '#fff', border: '1px solid #dde3ec', borderRadius: '10px',
  padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
}
const cardHighlight = { ...card, border: '2px solid #ffc107' }
const sectionTitle = {
  fontSize: '0.78rem', fontWeight: '700', color: '#00205b', letterSpacing: '0.08em',
  textTransform: 'uppercase', marginBottom: '1.1rem', paddingBottom: '0.5rem',
  borderBottom: '2px solid #dde3ec',
}
const sectionTitleWarn = { ...sectionTitle, color: '#7a5c00', borderColor: '#fde68a' }
const lbl = { display: 'block', marginBottom: '0.22rem', fontWeight: '600', color: '#444', fontSize: '0.87rem' }
const inp = {
  width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px',
  border: '1px solid #c0c8d4', fontSize: '0.94rem', boxSizing: 'border-box',
  marginBottom: '1rem', background: '#fff', outline: 'none',
}
const inpRO = { ...inp, background: '#f0f4f9', color: '#00205b', fontWeight: '600', cursor: 'default' }
const row = { display: 'flex', gap: '1rem' }
const half = { flex: 1, minWidth: 0 }
const submitBtn = {
  background: '#00205b', color: '#fff', border: 'none', borderRadius: '8px',
  padding: '0.9rem', fontSize: '1.05rem', cursor: 'pointer', fontWeight: '700',
  display: 'block', width: '100%', marginTop: '0.5rem',
}
const outlineBtn = {
  background: 'none', color: '#00205b', border: '1px solid #00205b', borderRadius: '8px',
  padding: '0.9rem', fontSize: '1rem', cursor: 'pointer', fontWeight: '600', width: '100%',
}
const warnBanner = {
  background: '#fff8e1', border: '1px solid #ffc107', color: '#7a5c00',
  borderRadius: '6px', padding: '0.7rem 0.9rem', marginBottom: '1rem', fontSize: '0.88rem',
}
const infoBanner = {
  background: '#f0f4f9', border: '1px solid #c0c8d4', color: '#444',
  borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem',
}
const chk = { accentColor: '#00205b', width: '15px', height: '15px', flexShrink: 0, cursor: 'pointer' }
const addParentBtn = {
  background: 'none', color: '#00205b', border: '1px dashed #a0b4cc', borderRadius: '7px',
  padding: '0.55rem 1.1rem', fontSize: '0.88rem', cursor: 'pointer', fontWeight: '600', marginTop: '0.5rem',
}
const removeParentBtn = {
  background: 'none', color: '#c62828', border: 'none', cursor: 'pointer',
  fontSize: '0.85rem', padding: '0.25rem 0', marginTop: '0.5rem', display: 'inline-block',
}
const radioRow = (active) => ({
  display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.7rem 0.9rem',
  borderRadius: '8px', border: `1px solid ${active ? '#00205b' : '#dde3ec'}`,
  cursor: 'pointer', marginBottom: '0.6rem', background: active ? '#f0f4f9' : '#fff',
})
const volunteerBox = {
  background: '#f7f9fc', border: '1px solid #dde3ec', borderRadius: '8px',
  padding: '0.9rem 1rem', marginBottom: '1rem',
}
const rolesGrid = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', marginBottom: '0.5rem' }
const roleLabel = { display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: '#333' }
const playerStatusBox = {
  background: '#f0f7f0', border: '1px solid #c8e6c9', borderRadius: '8px',
  padding: '1rem 1.1rem', marginTop: '0.75rem',
}

export default function RegisterPage({ onRegister, terms }) {
  const [form, setForm] = useState(INITIAL)
  const [showP2, setShowP2] = useState(false)
  const [suburbQuery, setSuburbQuery] = useState('')
  const [suburbResults, setSuburbResults] = useState([])
  const [photoPreview, setPhotoPreview] = useState(null)
  const [parentPhotoPreview, setParentPhotoPreview] = useState(null)
  const [parent2PhotoPreview, setParent2PhotoPreview] = useState(null)
  const [done, setDone] = useState(false)
  const [submittedAge, setSubmittedAge] = useState(null)
  const [submittedName, setSubmittedName] = useState('')
  const [submittedGrade, setSubmittedGrade] = useState('')
  const [submittedAlso, setSubmittedAlso] = useState([])
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

  function setParentIsPlayer(num, val) {
    if (num === 1) setForm(prev => ({ ...prev, parentIsPlayer: val, ...(val ? {} : { parentDOB: '', parentGender: '', parentPhoto: null, parentMedical: '' }) }))
    else setForm(prev => ({ ...prev, parent2IsPlayer: val, ...(val ? {} : { parent2DOB: '', parent2Gender: '', parent2Photo: null, parent2Medical: '' }) }))
  }

  function removeP2() {
    setShowP2(false)
    setParent2PhotoPreview(null)
    setForm(prev => ({
      ...prev,
      parent2FirstName: '', parent2LastName: '', parent2Email: '', parent2Mobile: '',
      parent2Relationship: '', parent2Occupation: '',
      parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '',
      parent2IsPlayer: false, parent2DOB: '', parent2Gender: '', parent2Photo: null, parent2Medical: '',
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

  function handleParentPhotoUpload(e, fieldName, setPreview) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5 MB.'); e.target.value = ''; return }
    const reader = new FileReader()
    reader.onloadend = () => { setPreview(reader.result); setForm(prev => ({ ...prev, [fieldName]: reader.result })) }
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
    const also = []

    // Register the main player
    onRegister({ ...form, grade, ageOnJan1: capturedAge, memberType: 'player' })

    // Register parent 1 as a player if applicable
    if (showParent && form.parentIsPlayer && form.parentDOB && form.parentGender) {
      const pGrade = calculateGrade(form.parentDOB, form.parentGender)
      const pAge = getAgeAsOfJan1(form.parentDOB)
      onRegister({
        firstName: form.parentFirstName, lastName: form.parentLastName,
        gender: form.parentGender, dateOfBirth: form.parentDOB,
        grade: pGrade, ageOnJan1: pAge,
        mobile: form.parentMobile, homePhone: '', email: form.parentEmail,
        streetAddress: form.streetAddress, suburb: form.suburb,
        city: form.city, postcode: form.postcode,
        institution: '', medicalNotes: form.parentMedical || '',
        photo: form.parentPhoto || null,
        registrationMode: 'family',
        familyGroupName: `${form.lastName} Family`,
        memberType: 'parent-player',
        linkedChildName: `${form.firstName} ${form.lastName}`,
        acceptedTerms: form.acceptedTerms,
        parentFirstName: '', parentLastName: '', parentEmail: '', parentMobile: '',
        parentRelationship: '', parentOccupation: '',
        parentVolunteer: false, parentVolunteerRoles: [], parentVolunteerOther: '',
        parent2FirstName: '', parent2LastName: '', parent2Email: '', parent2Mobile: '',
        parent2Relationship: '', parent2Occupation: '',
        parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '',
      })
      also.push(`${form.parentFirstName} ${form.parentLastName}`)
    }

    // Register parent 2 as a player if applicable
    if (showParent && showP2 && form.parent2IsPlayer && form.parent2DOB && form.parent2Gender) {
      const p2Grade = calculateGrade(form.parent2DOB, form.parent2Gender)
      const p2Age = getAgeAsOfJan1(form.parent2DOB)
      onRegister({
        firstName: form.parent2FirstName, lastName: form.parent2LastName,
        gender: form.parent2Gender, dateOfBirth: form.parent2DOB,
        grade: p2Grade, ageOnJan1: p2Age,
        mobile: form.parent2Mobile, homePhone: '', email: form.parent2Email,
        streetAddress: form.streetAddress, suburb: form.suburb,
        city: form.city, postcode: form.postcode,
        institution: '', medicalNotes: form.parent2Medical || '',
        photo: form.parent2Photo || null,
        registrationMode: 'family',
        familyGroupName: `${form.lastName} Family`,
        memberType: 'parent-player',
        linkedChildName: `${form.firstName} ${form.lastName}`,
        acceptedTerms: form.acceptedTerms,
        parentFirstName: '', parentLastName: '', parentEmail: '', parentMobile: '',
        parentRelationship: '', parentOccupation: '',
        parentVolunteer: false, parentVolunteerRoles: [], parentVolunteerOther: '',
        parent2FirstName: '', parent2LastName: '', parent2Email: '', parent2Mobile: '',
        parent2Relationship: '', parent2Occupation: '',
        parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '',
      })
      also.push(`${form.parent2FirstName} ${form.parent2LastName}`)
    }

    setSubmittedAlso(also)
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
    setParentPhotoPreview(parentFields.parentIsPlayer && parentFields.parentPhoto ? parentFields.parentPhoto : null)
    setParent2PhotoPreview(hadP2 && parentFields.parent2IsPlayer && parentFields.parent2Photo ? parentFields.parent2Photo : null)
    setPrefilled(true)
    setDone(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleRegisterNew() {
    setForm(INITIAL)
    setShowP2(false)
    setSuburbQuery('')
    setPhotoPreview(null)
    setParentPhotoPreview(null)
    setParent2PhotoPreview(null)
    setPrefilled(false)
    setDone(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Volunteer section (render helper) ─────────────────────────
  function renderVolunteer(num) {
    const vF = num === 1 ? 'parentVolunteer' : 'parent2Volunteer'
    const rF = num === 1 ? 'parentVolunteerRoles' : 'parent2VolunteerRoles'
    const oF = num === 1 ? 'parentVolunteerOther' : 'parent2VolunteerOther'
    const isVol = form[vF]
    const roles = form[rF]
    return (
      <>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: isVol ? '0.6rem' : '1rem' }}>
          <input type="checkbox" name={vF} checked={isVol} onChange={handleChange} style={chk} />
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
              <input style={{ ...inp, marginBottom: 0, marginTop: '0.4rem' }} name={oF} value={form[oF]} onChange={handleChange} placeholder="Please specify your role..." />
            )}
          </div>
        )}
      </>
    )
  }

  // ── Parent player fields (render helper) ──────────────────────
  function renderParentPlayerFields(num) {
    const dobF = num === 1 ? 'parentDOB' : 'parent2DOB'
    const genderF = num === 1 ? 'parentGender' : 'parent2Gender'
    const photoF = num === 1 ? 'parentPhoto' : 'parent2Photo'
    const medF = num === 1 ? 'parentMedical' : 'parent2Medical'
    const preview = num === 1 ? parentPhotoPreview : parent2PhotoPreview
    const setPreview = num === 1 ? setParentPhotoPreview : setParent2PhotoPreview
    const pGrade = calculateGrade(form[dobF], form[genderF])
    const pAge = getAgeAsOfJan1(form[dobF])
    return (
      <div style={playerStatusBox}>
        <div style={{ ...sectionTitle, fontSize: '0.72rem', borderColor: '#a5d6a7', color: '#2e7d32', marginBottom: '0.85rem' }}>
          Player Registration Details
        </div>
        <div style={row}>
          <div style={half}>
            <label style={lbl}>Gender *</label>
            <select style={inp} name={genderF} value={form[genderF]} onChange={handleChange} required>
              <option value="">Select...</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div style={half}>
            <label style={lbl}>Date of Birth *</label>
            <input style={inp} type="date" name={dobF} value={form[dobF]} onChange={handleChange} required />
          </div>
        </div>
        {pGrade && (
          <div style={row}>
            <div style={half}>
              <label style={lbl}>Grade (auto-calculated)</label>
              <input style={inpRO} value={pGrade} readOnly />
            </div>
            <div style={{ ...half, display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.82rem', color: '#777', paddingBottom: '1.1rem' }}>
                Age as at 1 Jan {new Date().getFullYear()}: {pAge}
              </span>
            </div>
          </div>
        )}
        <label style={lbl}>Photo (optional)</label>
        <input
          type="file" accept="image/jpeg,image/png,image/webp"
          onChange={e => handleParentPhotoUpload(e, photoF, setPreview)}
          style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.88rem' }}
        />
        {preview && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <img src={preview} alt="" style={{ width: '90px', height: '113px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #00205b' }} />
            <button type="button"
              onClick={() => { setPreview(null); setForm(prev => ({ ...prev, [photoF]: null })) }}
              style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>
              Remove
            </button>
          </div>
        )}
        <label style={lbl}>Medical Notes (optional)</label>
        <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical', marginBottom: 0 }} name={medF} value={form[medF]} onChange={handleChange} />
      </div>
    )
  }

  // ── Player status toggle (render helper) ──────────────────────
  function renderPlayerStatus(num) {
    const isPlayer = num === 1 ? form.parentIsPlayer : form.parent2IsPlayer
    const name = num === 1 ? 'p1PlayerStatus' : 'p2PlayerStatus'
    return (
      <div style={{ borderTop: '1px solid #fde68a', marginTop: '0.75rem', paddingTop: '1rem' }}>
        <label style={{ ...lbl, marginBottom: '0.6rem' }}>Player Status</label>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: isPlayer ? '0.75rem' : 0, flexWrap: 'wrap' }}>
          <label style={roleLabel}>
            <input type="radio" name={name} checked={!isPlayer} onChange={() => setParentIsPlayer(num, false)} style={{ accentColor: '#00205b' }} />
            Non-player (supporter / spectator only)
          </label>
          <label style={roleLabel}>
            <input type="radio" name={name} checked={isPlayer} onChange={() => setParentIsPlayer(num, true)} style={{ accentColor: '#00205b' }} />
            Also a player — complete details below
          </label>
        </div>
        {isPlayer && renderParentPlayerFields(num)}
      </div>
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
            width: '60px', height: '60px', borderRadius: '50%', background: '#e8ecf2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', fontSize: '1.7rem', color: '#00205b', fontWeight: '700',
          }}>✓</div>
          <h2 style={{ color: '#00205b', fontSize: '1.65rem', marginBottom: '0.4rem', fontWeight: '800' }}>
            {submittedName} registered!
          </h2>
          <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
            Grade: <strong style={{ color: '#00205b' }}>{submittedGrade}</strong>
          </p>
          {submittedAlso.length > 0 && (
            <p style={{ color: '#00205b', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
              Also registered as players: <strong>{submittedAlso.join(', ')}</strong>
            </p>
          )}
          <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '2.25rem', marginTop: '0.5rem' }}>
            What would you like to do next?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '300px', margin: '0 auto' }}>
            {submittedAge !== null && submittedAge < 16 && (
              <button onClick={handleRegisterSibling} style={{ ...submitBtn, background: '#00205b', marginTop: 0 }}>
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
              <input type="radio" name="registrationMode" value="independent" checked={form.registrationMode === 'independent'} onChange={handleChange} style={{ accentColor: '#00205b', marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#00205b', fontSize: '0.95rem' }}>Register independently</strong>
                <span style={{ display: 'block', fontSize: '0.83rem', color: '#666', marginTop: '0.15rem' }}>Manage your own registration and profile</span>
              </div>
            </label>
            <label style={radioRow(form.registrationMode === 'family')}>
              <input type="radio" name="registrationMode" value="family" checked={form.registrationMode === 'family'} onChange={handleChange} style={{ accentColor: '#00205b', marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#00205b', fontSize: '0.95rem' }}>Join a family group</strong>
                <span style={{ display: 'block', fontSize: '0.83rem', color: '#666', marginTop: '0.15rem' }}>Link this registration to an existing family account</span>
              </div>
            </label>
            {form.registrationMode === 'family' && (
              <>
                <label style={{ ...lbl, marginTop: '0.5rem' }}>Family group name / reference *</label>
                <input style={inp} name="familyGroupName" value={form.familyGroupName} onChange={handleChange} required={form.registrationMode === 'family'} placeholder="e.g. Smith Family" />
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
                    <div key={i} onMouseDown={() => pickSuburb(s)}
                      style={{ padding: '0.55rem 0.85rem', cursor: 'pointer', fontSize: '0.88rem', borderBottom: i < suburbResults.length - 1 ? '1px solid #eee' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f4f9'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <span style={{ fontWeight: '600', color: '#00205b' }}>{s.suburb}</span>
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
              <img src={photoPreview} alt="Player preview" style={{ width: '110px', height: '138px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #00205b' }} />
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
            {renderPlayerStatus(1)}

            {!showP2 && (
              <button type="button" onClick={() => setShowP2(true)} style={{ ...addParentBtn, marginTop: '1.25rem' }}>
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
                {renderPlayerStatus(2)}
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
