import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateGrade, getAgeAsOfJan1 } from '../utils/gradeCalc'
import { searchSuburbs } from '../utils/nzSuburbs'
import { addressFinderEnabled, searchAddresses, getAddressDetail, parseAddressDetail } from '../utils/addressFinder'

const VOLUNTEER_ROLES = ['Committee', 'Manager', 'Coach', 'Other']

const INITIAL_PARENT = {
  familyGroupName: '',
  streetAddress: '', suburb: '', city: '', postcode: '',
  parentFirstName: '', parentLastName: '',
  parentEmail: '', parentMobile: '', parentRelationship: '',
  parentOccupation: '',
  parentVolunteer: false, parentVolunteerRoles: [], parentVolunteerOther: '',
  parentIsPlayer: false,
  parentDOB: '', parentGender: '', parentPhoto: null, parentMedical: '',
  parent2FirstName: '', parent2LastName: '',
  parent2Email: '', parent2Mobile: '', parent2Relationship: '',
  parent2Occupation: '',
  parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '',
  parent2IsPlayer: false,
  parent2DOB: '', parent2Gender: '', parent2Photo: null, parent2Medical: '',
}

const INITIAL_PLAYER = {
  firstName: '', lastName: '', gender: '', dateOfBirth: '',
  mobile: '', email: '', institution: '', medicalNotes: '', photo: null,
}

const INITIAL_INDIVIDUAL = {
  firstName: '', lastName: '', gender: '', dateOfBirth: '',
  mobile: '', homePhone: '', email: '',
  streetAddress: '', suburb: '', city: '', postcode: '',
  institution: '', medicalNotes: '', photo: null,
}

// ── Styles ───────────────────────────────────────────────────────────────────
const page       = { maxWidth: '700px', margin: '2.5rem auto 4rem', padding: '0 1.5rem', fontFamily: 'Calibri, sans-serif' }
const card       = { background: '#fff', border: '1px solid #dde3ec', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
const cardAccent = { ...card, borderLeft: '4px solid #00205b' }
const sectionTitle = { fontSize: '0.78rem', fontWeight: '700', color: '#00205b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #dde3ec' }
const lbl        = { display: 'block', marginBottom: '0.22rem', fontWeight: '600', color: '#444', fontSize: '0.87rem' }
const inp        = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #c0c8d4', fontSize: '0.94rem', boxSizing: 'border-box', marginBottom: '1rem', background: '#fff', outline: 'none' }
const inpRO      = { ...inp, background: '#f0f4f9', color: '#00205b', fontWeight: '600', cursor: 'default' }
const row        = { display: 'flex', gap: '1rem' }
const half       = { flex: 1, minWidth: 0 }
const primaryBtn = { background: '#00205b', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.9rem', fontSize: '1.05rem', cursor: 'pointer', fontWeight: '700', display: 'block', width: '100%', marginTop: '0.5rem' }
const outlineBtn = { background: 'none', color: '#00205b', border: '1px solid #00205b', borderRadius: '8px', padding: '0.9rem', fontSize: '1rem', cursor: 'pointer', fontWeight: '600', width: '100%' }
const ghostBtn   = { background: 'none', color: '#00205b', border: '1px dashed #a0b4cc', borderRadius: '7px', padding: '0.55rem 1.1rem', fontSize: '0.88rem', cursor: 'pointer', fontWeight: '600' }
const removeBtn  = { background: 'none', color: '#c62828', border: 'none', cursor: 'pointer', fontSize: '0.82rem', padding: '0 0.25rem', flexShrink: 0 }
const backLink   = { background: 'none', border: 'none', color: '#00205b', cursor: 'pointer', fontSize: '0.88rem', marginBottom: '1.25rem', padding: 0, textDecoration: 'underline' }
const chk        = { accentColor: '#00205b', width: '15px', height: '15px', flexShrink: 0, cursor: 'pointer' }
const volunteerBox    = { background: '#f7f9fc', border: '1px solid #dde3ec', borderRadius: '8px', padding: '0.9rem 1rem', marginBottom: '1rem' }
const rolesGrid       = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', marginBottom: '0.5rem' }
const roleLabel       = { display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: '#333' }
const playerStatusBox = { background: '#f7f9fc', border: '1px solid #dde3ec', borderRadius: '8px', padding: '1rem 1.1rem', marginTop: '0.75rem' }
const warnBanner      = { background: '#fff8e1', border: '1px solid #ffc107', color: '#7a5c00', borderRadius: '6px', padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: '0.85rem' }
const successBanner   = { background: '#f0f4f9', border: '1px solid #b0bdd0', color: '#00205b', borderRadius: '6px', padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: '600' }

const stepBar = { display: 'flex', marginBottom: '2rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dde3ec' }
function stepStyle(state) {
  if (state === 'active') return { flex: 1, padding: '0.7rem 1rem', textAlign: 'center', fontSize: '0.88rem', fontWeight: '700', background: '#00205b', color: '#fff', borderRight: '1px solid #dde3ec' }
  if (state === 'done')   return { flex: 1, padding: '0.7rem 1rem', textAlign: 'center', fontSize: '0.88rem', fontWeight: '500', background: '#e8ecf2', color: '#00205b', borderRight: '1px solid #dde3ec' }
  return { flex: 1, padding: '0.7rem 1rem', textAlign: 'center', fontSize: '0.88rem', fontWeight: '400', background: '#f7f9fc', color: '#aaa', borderRight: '1px solid #dde3ec' }
}

const panelStyle  = { background: '#f7f9fc', border: '1px solid #dde3ec', borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }
const memberRow   = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0', borderBottom: '1px solid #eee' }
const thumb       = { width: '36px', height: '45px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }
const thumbPH     = { width: '36px', height: '45px', background: '#dde3ec', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', color: '#888', flexShrink: 0, fontWeight: '700' }
const gradeBadge  = { background: '#e8ecf2', color: '#00205b', borderRadius: '12px', padding: '0.15rem 0.55rem', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' }
const parentBadge = { background: '#00205b', color: '#fff', borderRadius: '12px', padding: '0.15rem 0.55rem', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' }
const playerTag   = { marginLeft: '0.3rem', background: '#e8ecf2', color: '#00205b', borderRadius: '8px', padding: '0.05rem 0.45rem', fontSize: '0.72rem', fontWeight: '600' }

const dropdownBase = { position: 'absolute', top: 'calc(100% - 1rem)', left: 0, right: 0, background: '#fff', border: '1px solid #c0c8d4', borderRadius: '6px', zIndex: 200, boxShadow: '0 4px 14px rgba(0,0,0,0.12)', maxHeight: '220px', overflowY: 'auto' }
const dropdownItem = { padding: '0.55rem 0.85rem', cursor: 'pointer', fontSize: '0.88rem' }

// ── Address dropdowns (defined outside component to avoid remount) ────────────
function AddressDropdown({ results, onPick, loading }) {
  if (loading) return (
    <div style={{ ...dropdownBase, padding: '0.6rem 0.85rem', fontSize: '0.85rem', color: '#888' }}>Searching…</div>
  )
  if (!results.length) return null
  return (
    <div style={dropdownBase}>
      {results.map((r, i) => (
        <div key={r.pxid || i} onMouseDown={() => onPick(r)}
          style={{ ...dropdownItem, borderBottom: i < results.length - 1 ? '1px solid #eee' : 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f0f4f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          <span style={{ color: '#00205b' }}>{r.a}</span>
        </div>
      ))}
    </div>
  )
}

function SuburbDropdown({ results, onPick }) {
  if (!results.length) return null
  return (
    <div style={dropdownBase}>
      {results.map((s, i) => (
        <div key={i} onMouseDown={() => onPick(s)}
          style={{ ...dropdownItem, borderBottom: i < results.length - 1 ? '1px solid #eee' : 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f0f4f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          <span style={{ fontWeight: '600', color: '#00205b' }}>{s.suburb}</span>
          <span style={{ color: '#888', marginLeft: '0.5rem', fontSize: '0.82rem' }}>{s.city} {s.postcode}</span>
        </div>
      ))}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RegisterPage({ onRegister, terms }) {
  const [step, setStep] = useState('choice')
  const [mode, setMode] = useState(null)

  // ── Family state ─────────────────────────────────────────────
  const [pf, setPf]                         = useState(INITIAL_PARENT)
  const [showP2, setShowP2]                 = useState(false)
  const [p1PhotoPreview, setP1PhotoPreview] = useState(null)
  const [p2PhotoPreview, setP2PhotoPreview] = useState(null)
  const [afResults, setAfResults]           = useState([])
  const [afLoading, setAfLoading]           = useState(false)
  const [suburbQuery, setSuburbQuery]       = useState('')
  const [suburbResults, setSuburbResults]   = useState([])
  const [players, setPlayers]               = useState([])
  const [pl, setPl]                         = useState(INITIAL_PLAYER)
  const [plPhotoPreview, setPlPhotoPreview] = useState(null)
  const [lastAdded, setLastAdded]           = useState('')
  const [acceptedTerms, setAcceptedTerms]   = useState(false)

  // ── Individual state ──────────────────────────────────────────
  const [ind, setInd]                           = useState(INITIAL_INDIVIDUAL)
  const [indPhotoPreview, setIndPhotoPreview]   = useState(null)
  const [indAfResults, setIndAfResults]         = useState([])
  const [indAfLoading, setIndAfLoading]         = useState(false)
  const [indSuburbQuery, setIndSuburbQuery]     = useState('')
  const [indSuburbResults, setIndSuburbResults] = useState([])
  const [indAcceptedTerms, setIndAcceptedTerms] = useState(false)

  const familyAfTimer = useRef(null)
  const indAfTimer    = useRef(null)

  const navigate = useNavigate()

  const plAge      = getAgeAsOfJan1(pl.dateOfBirth)
  const plGrade    = calculateGrade(pl.dateOfBirth, pl.gender)
  const showSchool = plAge !== null && plAge < 21

  const indAge        = getAgeAsOfJan1(ind.dateOfBirth)
  const indGrade      = calculateGrade(ind.dateOfBirth, ind.gender)
  const indShowSchool = indAge !== null && indAge < 21
  const indUnder18    = indAge !== null && indAge < 18

  const familyName = pf.familyGroupName || (pf.parentLastName ? `${pf.parentLastName} Family` : '')

  // ── Handlers ─────────────────────────────────────────────────
  function handlePfChange(e) {
    const { name, value, type, checked } = e.target
    setPf(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }
  function handlePlChange(e)  { setPl(prev => ({ ...prev, [e.target.name]: e.target.value })) }
  function handleIndChange(e) { setInd(prev => ({ ...prev, [e.target.name]: e.target.value })) }

  function togglePfRole(num, role) {
    const field = num === 1 ? 'parentVolunteerRoles' : 'parent2VolunteerRoles'
    setPf(prev => {
      const cur = prev[field]
      return { ...prev, [field]: cur.includes(role) ? cur.filter(r => r !== role) : [...cur, role] }
    })
  }

  function setParentIsPlayer(num, val) {
    if (num === 1) setPf(prev => ({ ...prev, parentIsPlayer: val, ...(val ? {} : { parentDOB: '', parentGender: '', parentPhoto: null, parentMedical: '' }) }))
    else           setPf(prev => ({ ...prev, parent2IsPlayer: val, ...(val ? {} : { parent2DOB: '', parent2Gender: '', parent2Photo: null, parent2Medical: '' }) }))
  }

  function removeP2() {
    setShowP2(false); setP2PhotoPreview(null)
    setPf(prev => ({
      ...prev,
      parent2FirstName: '', parent2LastName: '', parent2Email: '', parent2Mobile: '',
      parent2Relationship: '', parent2Occupation: '',
      parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '',
      parent2IsPlayer: false, parent2DOB: '', parent2Gender: '', parent2Photo: null, parent2Medical: '',
    }))
  }

  function handleParentPhoto(e, fieldName, setPreview) {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5 MB.'); e.target.value = ''; return }
    const reader = new FileReader()
    reader.onloadend = () => { setPreview(reader.result); setPf(prev => ({ ...prev, [fieldName]: reader.result })) }
    reader.readAsDataURL(file)
  }

  function handlePlayerPhoto(e) {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5 MB.'); e.target.value = ''; return }
    const reader = new FileReader()
    reader.onloadend = () => { setPlPhotoPreview(reader.result); setPl(prev => ({ ...prev, photo: reader.result })) }
    reader.readAsDataURL(file)
  }

  function handleIndPhoto(e) {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5 MB.'); e.target.value = ''; return }
    const reader = new FileReader()
    reader.onloadend = () => { setIndPhotoPreview(reader.result); setInd(prev => ({ ...prev, photo: reader.result })) }
    reader.readAsDataURL(file)
  }

  // ── Address: family ───────────────────────────────────────────
  function handleFamilyStreetInput(e) {
    const val = e.target.value
    setPf(prev => ({ ...prev, streetAddress: val, suburb: '', city: '', postcode: '' }))
    setSuburbQuery('')
    if (!addressFinderEnabled) return
    clearTimeout(familyAfTimer.current)
    if (val.length >= 3) {
      setAfLoading(true)
      familyAfTimer.current = setTimeout(async () => {
        const results = await searchAddresses(val)
        setAfResults(results); setAfLoading(false)
      }, 300)
    } else { setAfResults([]); setAfLoading(false) }
  }

  async function pickFamilyAddress(completion) {
    setAfResults([]); setAfLoading(false)
    const detail = await getAddressDetail(completion.pxid)
    const parsed = parseAddressDetail(detail)
    if (parsed) {
      setPf(prev => ({ ...prev, streetAddress: parsed.streetAddress, suburb: parsed.suburb, city: parsed.city, postcode: parsed.postcode }))
      setSuburbQuery(parsed.suburb)
    } else {
      setPf(prev => ({ ...prev, streetAddress: completion.a }))
    }
  }

  function handleSuburbInput(e) {
    const val = e.target.value
    setSuburbQuery(val)
    setPf(prev => ({ ...prev, suburb: val, city: '', postcode: '' }))
    setSuburbResults(val.length >= 2 ? searchSuburbs(val) : [])
  }
  function pickSuburb(s) {
    setSuburbQuery(s.suburb)
    setPf(prev => ({ ...prev, suburb: s.suburb, city: s.city, postcode: s.postcode }))
    setSuburbResults([])
  }

  // ── Address: individual ───────────────────────────────────────
  function handleIndStreetInput(e) {
    const val = e.target.value
    setInd(prev => ({ ...prev, streetAddress: val, suburb: '', city: '', postcode: '' }))
    setIndSuburbQuery('')
    if (!addressFinderEnabled) return
    clearTimeout(indAfTimer.current)
    if (val.length >= 3) {
      setIndAfLoading(true)
      indAfTimer.current = setTimeout(async () => {
        const results = await searchAddresses(val)
        setIndAfResults(results); setIndAfLoading(false)
      }, 300)
    } else { setIndAfResults([]); setIndAfLoading(false) }
  }

  async function pickIndAddress(completion) {
    setIndAfResults([]); setIndAfLoading(false)
    const detail = await getAddressDetail(completion.pxid)
    const parsed = parseAddressDetail(detail)
    if (parsed) {
      setInd(prev => ({ ...prev, streetAddress: parsed.streetAddress, suburb: parsed.suburb, city: parsed.city, postcode: parsed.postcode }))
      setIndSuburbQuery(parsed.suburb)
    } else {
      setInd(prev => ({ ...prev, streetAddress: completion.a }))
    }
  }

  function handleIndSuburbInput(e) {
    const val = e.target.value
    setIndSuburbQuery(val)
    setInd(prev => ({ ...prev, suburb: val, city: '', postcode: '' }))
    setIndSuburbResults(val.length >= 2 ? searchSuburbs(val) : [])
  }
  function pickIndSuburb(s) {
    setIndSuburbQuery(s.suburb)
    setInd(prev => ({ ...prev, suburb: s.suburb, city: s.city, postcode: s.postcode }))
    setIndSuburbResults([])
  }

  // ── Flow handlers ─────────────────────────────────────────────
  function handleContinue(e) {
    e.preventDefault(); setStep('players')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleAddPlayer(e) {
    e.preventDefault()
    const grade = calculateGrade(pl.dateOfBirth, pl.gender)
    const age   = getAgeAsOfJan1(pl.dateOfBirth)
    const name  = `${pl.firstName} ${pl.lastName}`
    if (!pf.familyGroupName && pl.lastName) setPf(prev => ({ ...prev, familyGroupName: `${pl.lastName} Family` }))
    setPlayers(prev => [...prev, { ...pl, grade, ageOnJan1: age, memberType: 'player' }])
    setLastAdded(name)
    setTimeout(() => setLastAdded(''), 3000)
    setPl(INITIAL_PLAYER); setPlPhotoPreview(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function removePlayer(index) { setPlayers(prev => prev.filter((_, i) => i !== index)) }

  function handleComplete(e) {
    e.preventDefault()
    const groupName  = pf.familyGroupName || (players[0] ? `${players[0].lastName} Family` : 'Family')
    const parentData = {
      parentFirstName: pf.parentFirstName, parentLastName: pf.parentLastName,
      parentEmail: pf.parentEmail, parentMobile: pf.parentMobile,
      parentRelationship: pf.parentRelationship, parentOccupation: pf.parentOccupation,
      parentVolunteer: pf.parentVolunteer, parentVolunteerRoles: [...pf.parentVolunteerRoles],
      parentVolunteerOther: pf.parentVolunteerOther, parentIsPlayer: pf.parentIsPlayer,
      ...(showP2 ? {
        parent2FirstName: pf.parent2FirstName, parent2LastName: pf.parent2LastName,
        parent2Email: pf.parent2Email, parent2Mobile: pf.parent2Mobile,
        parent2Relationship: pf.parent2Relationship, parent2Occupation: pf.parent2Occupation,
        parent2Volunteer: pf.parent2Volunteer, parent2VolunteerRoles: [...pf.parent2VolunteerRoles],
        parent2VolunteerOther: pf.parent2VolunteerOther, parent2IsPlayer: pf.parent2IsPlayer,
      } : {
        parent2FirstName: '', parent2LastName: '', parent2Email: '', parent2Mobile: '',
        parent2Relationship: '', parent2Occupation: '',
        parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '',
        parent2IsPlayer: false,
      }),
    }
    const addressData = { streetAddress: pf.streetAddress, suburb: pf.suburb, city: pf.city, postcode: pf.postcode }

    players.forEach(player => {
      onRegister({ ...player, ...addressData, homePhone: '', registrationMode: 'family', familyGroupName: groupName, ...parentData, acceptedTerms })
    })

    if (pf.parentIsPlayer && pf.parentDOB && pf.parentGender) {
      onRegister({
        firstName: pf.parentFirstName, lastName: pf.parentLastName,
        gender: pf.parentGender, dateOfBirth: pf.parentDOB,
        grade: calculateGrade(pf.parentDOB, pf.parentGender), ageOnJan1: getAgeAsOfJan1(pf.parentDOB),
        memberType: 'parent-player', mobile: pf.parentMobile, homePhone: '', email: pf.parentEmail,
        ...addressData, institution: '', medicalNotes: pf.parentMedical || '', photo: pf.parentPhoto || null,
        registrationMode: 'family', familyGroupName: groupName,
        linkedChildName: players.map(p => `${p.firstName} ${p.lastName}`).join(', '),
        acceptedTerms,
        parentFirstName: '', parentLastName: '', parentEmail: '', parentMobile: '',
        parentRelationship: '', parentOccupation: '',
        parentVolunteer: false, parentVolunteerRoles: [], parentVolunteerOther: '',
        parent2FirstName: '', parent2LastName: '', parent2Email: '', parent2Mobile: '',
        parent2Relationship: '', parent2Occupation: '',
        parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '', parent2IsPlayer: false,
      })
    }

    if (showP2 && pf.parent2IsPlayer && pf.parent2DOB && pf.parent2Gender) {
      onRegister({
        firstName: pf.parent2FirstName, lastName: pf.parent2LastName,
        gender: pf.parent2Gender, dateOfBirth: pf.parent2DOB,
        grade: calculateGrade(pf.parent2DOB, pf.parent2Gender), ageOnJan1: getAgeAsOfJan1(pf.parent2DOB),
        memberType: 'parent-player', mobile: pf.parent2Mobile, homePhone: '', email: pf.parent2Email,
        ...addressData, institution: '', medicalNotes: pf.parent2Medical || '', photo: pf.parent2Photo || null,
        registrationMode: 'family', familyGroupName: groupName,
        linkedChildName: players.map(p => `${p.firstName} ${p.lastName}`).join(', '),
        acceptedTerms,
        parentFirstName: '', parentLastName: '', parentEmail: '', parentMobile: '',
        parentRelationship: '', parentOccupation: '',
        parentVolunteer: false, parentVolunteerRoles: [], parentVolunteerOther: '',
        parent2FirstName: '', parent2LastName: '', parent2Email: '', parent2Mobile: '',
        parent2Relationship: '', parent2Occupation: '',
        parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '', parent2IsPlayer: false,
      })
    }

    setMode('family'); setStep('done')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleIndSubmit(e) {
    e.preventDefault()
    onRegister({
      ...ind, grade: indGrade, ageOnJan1: indAge, memberType: 'player',
      registrationMode: 'independent', familyGroupName: '',
      parentFirstName: '', parentLastName: '', parentEmail: '', parentMobile: '',
      parentRelationship: '', parentOccupation: '',
      parentVolunteer: false, parentVolunteerRoles: [], parentVolunteerOther: '',
      parentIsPlayer: false,
      parent2FirstName: '', parent2LastName: '', parent2Email: '', parent2Mobile: '',
      parent2Relationship: '', parent2Occupation: '',
      parent2Volunteer: false, parent2VolunteerRoles: [], parent2VolunteerOther: '',
      parent2IsPlayer: false,
      acceptedTerms: indAcceptedTerms,
    })
    setMode('individual'); setStep('done')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startOver() {
    setStep('choice'); setMode(null)
    setPf(INITIAL_PARENT); setShowP2(false)
    setP1PhotoPreview(null); setP2PhotoPreview(null)
    setAfResults([]); setAfLoading(false)
    setSuburbQuery(''); setSuburbResults([])
    setPlayers([]); setPl(INITIAL_PLAYER); setPlPhotoPreview(null)
    setInd(INITIAL_INDIVIDUAL); setIndPhotoPreview(null)
    setIndAfResults([]); setIndAfLoading(false)
    setIndSuburbQuery(''); setIndSuburbResults([])
    setAcceptedTerms(false); setIndAcceptedTerms(false); setLastAdded('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Render helpers (plain functions) ─────────────────────────

  function renderVolunteer(num) {
    const vF = num === 1 ? 'parentVolunteer'      : 'parent2Volunteer'
    const rF = num === 1 ? 'parentVolunteerRoles'  : 'parent2VolunteerRoles'
    const oF = num === 1 ? 'parentVolunteerOther'  : 'parent2VolunteerOther'
    const isVol = pf[vF]; const roles = pf[rF]
    return (
      <>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: isVol ? '0.6rem' : '1rem' }}>
          <input type="checkbox" name={vF} checked={isVol} onChange={handlePfChange} style={chk} />
          <span style={{ fontWeight: '600', color: '#444', fontSize: '0.9rem' }}>I would like to volunteer with the club</span>
        </label>
        {isVol && (
          <div style={volunteerBox}>
            <div style={{ ...lbl, marginBottom: '0.6rem' }}>Preferred role(s):</div>
            <div style={rolesGrid}>
              {VOLUNTEER_ROLES.map(role => (
                <label key={role} style={roleLabel}>
                  <input type="checkbox" checked={roles.includes(role)} onChange={() => togglePfRole(num, role)} style={chk} />
                  {role}
                </label>
              ))}
            </div>
            {roles.includes('Other') && (
              <input style={{ ...inp, marginBottom: 0, marginTop: '0.4rem' }} name={oF} value={pf[oF]} onChange={handlePfChange} placeholder="Please specify your role..." />
            )}
          </div>
        )}
      </>
    )
  }

  function renderParentPlayerFields(num) {
    const dobF    = num === 1 ? 'parentDOB'    : 'parent2DOB'
    const genderF = num === 1 ? 'parentGender'  : 'parent2Gender'
    const photoF  = num === 1 ? 'parentPhoto'   : 'parent2Photo'
    const medF    = num === 1 ? 'parentMedical' : 'parent2Medical'
    const preview    = num === 1 ? p1PhotoPreview : p2PhotoPreview
    const setPreview = num === 1 ? setP1PhotoPreview : setP2PhotoPreview
    const pGrade  = calculateGrade(pf[dobF], pf[genderF])
    const pAge    = getAgeAsOfJan1(pf[dobF])
    return (
      <div style={playerStatusBox}>
        <div style={{ ...sectionTitle, fontSize: '0.72rem', marginBottom: '0.85rem' }}>Player Registration Details</div>
        <div style={row}>
          <div style={half}>
            <label style={lbl}>Gender *</label>
            <select style={inp} name={genderF} value={pf[genderF]} onChange={handlePfChange} required>
              <option value="">Select...</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div style={half}>
            <label style={lbl}>Date of Birth *</label>
            <input style={inp} type="date" name={dobF} value={pf[dobF]} onChange={handlePfChange} required />
          </div>
        </div>
        {pGrade && (
          <div style={row}>
            <div style={half}>
              <label style={lbl}>Grade (auto-calculated)</label>
              <input style={inpRO} value={pGrade} readOnly />
            </div>
            <div style={{ ...half, display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.82rem', color: '#777', paddingBottom: '1.1rem' }}>Age as at 1 Jan {new Date().getFullYear()}: {pAge}</span>
            </div>
          </div>
        )}
        <label style={lbl}>Photo (optional)</label>
        <input type="file" accept="image/jpeg,image/png,image/webp"
          onChange={e => handleParentPhoto(e, photoF, setPreview)}
          style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.88rem' }} />
        {preview && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <img src={preview} alt="" style={{ width: '90px', height: '113px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #00205b' }} />
            <button type="button" onClick={() => { setPreview(null); setPf(prev => ({ ...prev, [photoF]: null })) }}
              style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>Remove</button>
          </div>
        )}
        <label style={lbl}>Medical Notes (optional)</label>
        <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical', marginBottom: 0 }} name={medF} value={pf[medF]} onChange={handlePfChange} />
      </div>
    )
  }

  function renderPlayerStatus(num) {
    const isPlayer  = num === 1 ? pf.parentIsPlayer : pf.parent2IsPlayer
    const radioName = num === 1 ? 'p1Status' : 'p2Status'
    return (
      <div style={{ borderTop: '1px solid #fde68a', marginTop: '0.75rem', paddingTop: '1rem' }}>
        <label style={{ ...lbl, marginBottom: '0.6rem' }}>Player Status</label>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: isPlayer ? '0.75rem' : 0 }}>
          <label style={roleLabel}>
            <input type="radio" name={radioName} checked={!isPlayer} onChange={() => setParentIsPlayer(num, false)} style={{ accentColor: '#00205b' }} />
            Non-player
          </label>
          <label style={roleLabel}>
            <input type="radio" name={radioName} checked={isPlayer} onChange={() => setParentIsPlayer(num, true)} style={{ accentColor: '#00205b' }} />
            Also a player
          </label>
        </div>
        {isPlayer && renderParentPlayerFields(num)}
      </div>
    )
  }

  function renderFamilyPanel() {
    const groupLabel = familyName || 'Your Family'
    const p1Init = (pf.parentFirstName[0] || '') + (pf.parentLastName[0] || '')
    const p2Init = (pf.parent2FirstName[0] || '') + (pf.parent2LastName[0] || '')
    return (
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <span style={{ fontWeight: '700', color: '#00205b', fontSize: '1rem' }}>{groupLabel}</span>
          <span style={{ fontSize: '0.82rem', color: '#777' }}>{players.length} player{players.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={memberRow}>
          <div style={thumbPH}>{p1Init || '?'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>{pf.parentFirstName} {pf.parentLastName}</span>
            {pf.parentIsPlayer && <span style={playerTag}>Player</span>}
          </div>
          <span style={parentBadge}>Parent</span>
        </div>
        {showP2 && pf.parent2FirstName && (
          <div style={memberRow}>
            <div style={thumbPH}>{p2Init || '?'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>{pf.parent2FirstName} {pf.parent2LastName}</span>
              {pf.parent2IsPlayer && <span style={playerTag}>Player</span>}
            </div>
            <span style={parentBadge}>Parent</span>
          </div>
        )}
        {players.map((p, i) => (
          <div key={i} style={{ ...memberRow, borderBottom: i === players.length - 1 ? 'none' : '1px solid #eee' }}>
            {p.photo ? <img src={p.photo} alt="" style={thumb} /> : <div style={thumbPH}>{(p.firstName[0] || '')}{(p.lastName[0] || '')}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>{p.firstName} {p.lastName}</span>
            </div>
            <span style={gradeBadge}>{p.grade || '—'}</span>
            <button type="button" onClick={() => removePlayer(i)} style={removeBtn} title="Remove">✕</button>
          </div>
        ))}
        {players.length === 0 && (
          <p style={{ color: '#aaa', fontSize: '0.85rem', margin: '0.6rem 0 0', fontStyle: 'italic' }}>Add players using the form below.</p>
        )}
      </div>
    )
  }

  function renderAddressSection(isIndividual) {
    const streetVal = isIndividual ? ind.streetAddress : pf.streetAddress
    const suburbVal = isIndividual ? ind.suburb        : pf.suburb
    const cityVal   = isIndividual ? ind.city          : pf.city
    const pcVal     = isIndividual ? ind.postcode      : pf.postcode
    const afRes     = isIndividual ? indAfResults      : afResults
    const afLoad    = isIndividual ? indAfLoading      : afLoading
    const sbQuery   = isIndividual ? indSuburbQuery    : suburbQuery
    const sbRes     = isIndividual ? indSuburbResults  : suburbResults

    const onStreet  = isIndividual ? handleIndStreetInput   : handleFamilyStreetInput
    const onPickAf  = isIndividual ? pickIndAddress         : pickFamilyAddress
    const onSuburb  = isIndividual ? handleIndSuburbInput   : handleSuburbInput
    const onPickSub = isIndividual ? pickIndSuburb          : pickSuburb
    const hideAf    = isIndividual
      ? () => setTimeout(() => setIndAfResults([]), 200)
      : () => setTimeout(() => setAfResults([]), 200)
    const hideSub   = isIndividual
      ? () => setTimeout(() => setIndSuburbResults([]), 200)
      : () => setTimeout(() => setSuburbResults([]), 200)
    const setSuburb = isIndividual
      ? v => setInd(prev => ({ ...prev, suburb: v }))
      : v => setPf(prev => ({ ...prev, suburb: v }))
    const setCity = isIndividual
      ? v => setInd(prev => ({ ...prev, city: v }))
      : v => setPf(prev => ({ ...prev, city: v }))
    const setPc = isIndividual
      ? v => setInd(prev => ({ ...prev, postcode: v }))
      : v => setPf(prev => ({ ...prev, postcode: v }))

    return (
      <>
        <div style={{ position: 'relative' }}>
          <label style={lbl}>
            Street Address *
            {addressFinderEnabled && (
              <span style={{ fontWeight: '400', color: '#888', fontSize: '0.8rem', marginLeft: '0.5rem' }}>— start typing to search</span>
            )}
          </label>
          <input
            style={inp}
            value={streetVal}
            onChange={onStreet}
            onBlur={hideAf}
            required
            autoComplete="off"
            placeholder={addressFinderEnabled ? 'e.g. 123 Main Street, Auckland' : 'e.g. 123 Main Street'}
          />
          <AddressDropdown results={afRes} onPick={onPickAf} loading={afLoad} />
        </div>
        <div style={row}>
          <div style={{ flex: 2, minWidth: 0, position: 'relative' }}>
            <label style={lbl}>Suburb *</label>
            {addressFinderEnabled ? (
              <input style={suburbVal ? inpRO : inp} value={suburbVal}
                onChange={e => setSuburb(e.target.value)} placeholder="Auto-filled from address" required />
            ) : (
              <>
                <input style={inp} value={sbQuery} onChange={onSuburb}
                  onBlur={hideSub} placeholder="Start typing suburb..." required autoComplete="off" />
                <SuburbDropdown results={sbRes} onPick={onPickSub} />
              </>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>City</label>
            <input style={cityVal ? inpRO : inp} value={cityVal}
              onChange={e => setCity(e.target.value)} placeholder="Auto-filled" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={lbl}>Postcode</label>
            <input style={pcVal ? inpRO : inp} value={pcVal}
              onChange={e => setPc(e.target.value)} placeholder="Auto-filled" />
          </div>
        </div>
      </>
    )
  }

  function renderTandC(checked, onChange) {
    return (
      <div style={card}>
        <div style={sectionTitle}>Terms &amp; Conditions</div>
        <div style={{ background: '#f7f9fc', border: '1px solid #dde3ec', borderRadius: '6px', padding: '0.9rem 1rem', maxHeight: '160px', overflowY: 'auto', fontSize: '0.85rem', color: '#444', marginBottom: '1rem', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>
          {terms || <span style={{ color: '#aaa', fontStyle: 'italic' }}>No terms configured.</span>}
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.92rem', color: '#333' }}>
          <input type="checkbox" checked={checked} onChange={onChange} required style={{ ...chk, marginTop: '3px' }} />
          I have read and accept the Terms &amp; Conditions *
        </label>
      </div>
    )
  }

  // ── Choice screen ─────────────────────────────────────────────
  if (step === 'choice') {
    return (
      <div style={page}>
        <h1 style={{ fontSize: '2rem', color: '#00205b', fontWeight: '800', marginBottom: '0.4rem' }}>Registration</h1>
        <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>How would you like to register?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button type="button" onClick={() => { setMode('family'); setStep('parent') }}
            style={{ background: '#fff', border: '2px solid #00205b', borderRadius: '10px', padding: '1.5rem', textAlign: 'left', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f4f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            <div style={{ fontWeight: '700', color: '#00205b', fontSize: '1.1rem', marginBottom: '0.3rem' }}>Family Registration</div>
            <div style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.5 }}>A parent or guardian is registering one or more players. Parent details are collected first, then you add each family member.</div>
          </button>
          <button type="button" onClick={() => { setMode('individual'); setStep('form') }}
            style={{ background: '#fff', border: '1px solid #dde3ec', borderRadius: '10px', padding: '1.5rem', textAlign: 'left', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f7f9fc'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            <div style={{ fontWeight: '700', color: '#00205b', fontSize: '1.1rem', marginBottom: '0.3rem' }}>Individual Registration</div>
            <div style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.5 }}>An adult player (18 or over) registering themselves independently, without a parent or guardian.</div>
          </button>
        </div>
      </div>
    )
  }

  // ── Done screen ───────────────────────────────────────────────
  if (step === 'done') {
    if (mode === 'individual') {
      return (
        <div style={page}>
          <div style={{ background: '#fff', border: '1px solid #dde3ec', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e8ecf2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.7rem', color: '#00205b', fontWeight: '700' }}>✓</div>
            <h2 style={{ color: '#00205b', fontSize: '1.65rem', marginBottom: '0.25rem', fontWeight: '800' }}>{ind.firstName} {ind.lastName} registered!</h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>Grade: <strong style={{ color: '#00205b' }}>{indGrade}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '300px', margin: '0 auto' }}>
              <button onClick={startOver} style={{ ...primaryBtn, marginTop: 0 }}>Register Another Player</button>
              <button onClick={() => navigate('/members')} style={outlineBtn}>View All Members</button>
            </div>
          </div>
        </div>
      )
    }
    const groupLabel    = pf.familyGroupName || (players[0] ? `${players[0].lastName} Family` : 'Family')
    const parentPlayers = [
      pf.parentIsPlayer && pf.parentDOB ? `${pf.parentFirstName} ${pf.parentLastName}` : null,
      showP2 && pf.parent2IsPlayer && pf.parent2DOB ? `${pf.parent2FirstName} ${pf.parent2LastName}` : null,
    ].filter(Boolean)
    return (
      <div style={page}>
        <div style={{ background: '#fff', border: '1px solid #dde3ec', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e8ecf2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.7rem', color: '#00205b', fontWeight: '700' }}>✓</div>
          <h2 style={{ color: '#00205b', fontSize: '1.65rem', marginBottom: '0.25rem', fontWeight: '800' }}>{groupLabel} registered!</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {players.length} player{players.length !== 1 ? 's' : ''} registered
            {parentPlayers.length > 0 ? ` + ${parentPlayers.join(', ')} (parent-player${parentPlayers.length > 1 ? 's' : ''})` : ''}
          </p>
          <div style={{ textAlign: 'left', maxWidth: '340px', margin: '0 auto 2rem' }}>
            {players.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.45rem 0', borderBottom: i < players.length - 1 ? '1px solid #eee' : 'none' }}>
                {p.photo ? <img src={p.photo} alt="" style={thumb} /> : <div style={thumbPH}>{p.firstName[0]}{p.lastName[0]}</div>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.firstName} {p.lastName}</div>
                  <span style={gradeBadge}>{p.grade}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '300px', margin: '0 auto' }}>
            <button onClick={startOver} style={{ ...primaryBtn, marginTop: 0 }}>Register Another Family</button>
            <button onClick={() => navigate('/members')} style={outlineBtn}>View All Members</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Individual form ───────────────────────────────────────────
  if (step === 'form') {
    return (
      <div style={page}>
        <h1 style={{ fontSize: '2rem', color: '#00205b', fontWeight: '800', marginBottom: '0.25rem' }}>Individual Registration</h1>
        <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>Registering as an adult player.</p>
        <button type="button" onClick={() => setStep('choice')} style={backLink}>← Back</button>
        <form onSubmit={handleIndSubmit}>
          <div style={card}>
            <div style={sectionTitle}>Personal Details</div>
            <div style={row}>
              <div style={half}>
                <label style={lbl}>First Name *</label>
                <input style={inp} name="firstName" value={ind.firstName} onChange={handleIndChange} required />
              </div>
              <div style={half}>
                <label style={lbl}>Last Name *</label>
                <input style={inp} name="lastName" value={ind.lastName} onChange={handleIndChange} required />
              </div>
            </div>
            <div style={row}>
              <div style={half}>
                <label style={lbl}>Gender *</label>
                <select style={inp} name="gender" value={ind.gender} onChange={handleIndChange} required>
                  <option value="">Select...</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div style={half}>
                <label style={lbl}>Date of Birth *</label>
                <input style={inp} type="date" name="dateOfBirth" value={ind.dateOfBirth} onChange={handleIndChange} required />
              </div>
            </div>
            {indGrade && (
              <div style={row}>
                <div style={half}>
                  <label style={lbl}>Grade (auto-calculated)</label>
                  <input style={inpRO} value={indGrade} readOnly />
                </div>
                <div style={{ ...half, display: 'flex', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.82rem', color: '#777', paddingBottom: '1.1rem' }}>Age as at 1 Jan {new Date().getFullYear()}: {indAge}</span>
                </div>
              </div>
            )}
            {indUnder18 && (
              <div style={warnBanner}>
                Players under 18 should use <strong>Family Registration</strong> so that parent or guardian details can be collected.{' '}
                <button type="button" onClick={() => setStep('choice')} style={{ background: 'none', border: 'none', color: '#7a5c00', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline', padding: 0 }}>Switch to Family Registration</button>
              </div>
            )}
            <div style={row}>
              <div style={half}>
                <label style={lbl}>Mobile *</label>
                <input style={inp} type="tel" name="mobile" value={ind.mobile} onChange={handleIndChange} required placeholder="e.g. 021 123 4567" />
              </div>
              <div style={half}>
                <label style={lbl}>Home Phone</label>
                <input style={inp} type="tel" name="homePhone" value={ind.homePhone} onChange={handleIndChange} placeholder="Optional" />
              </div>
            </div>
            <label style={lbl}>Email *</label>
            <input style={inp} type="email" name="email" value={ind.email} onChange={handleIndChange} required />
          </div>

          <div style={card}>
            <div style={sectionTitle}>Home Address</div>
            {renderAddressSection(true)}
          </div>

          {indShowSchool && (
            <div style={card}>
              <div style={sectionTitle}>Education</div>
              <label style={lbl}>School or Tertiary Institution *</label>
              <input style={inp} name="institution" value={ind.institution} onChange={handleIndChange} required placeholder="e.g. University of Auckland" />
            </div>
          )}

          <div style={card}>
            <div style={sectionTitle}>Player Photo</div>
            <label style={lbl}>Upload photo (JPG or PNG, max 5 MB)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleIndPhoto} style={{ display: 'block', marginBottom: '1rem', fontSize: '0.9rem' }} />
            {indPhotoPreview && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <img src={indPhotoPreview} alt="" style={{ width: '110px', height: '138px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #00205b' }} />
                <button type="button" onClick={() => { setIndPhotoPreview(null); setInd(prev => ({ ...prev, photo: null })) }}
                  style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '0.88rem', padding: 0 }}>Remove photo</button>
              </div>
            )}
          </div>

          <div style={card}>
            <div style={sectionTitle}>Medical Notes</div>
            <label style={lbl}>Medical conditions, allergies or notes (optional)</label>
            <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} name="medicalNotes" value={ind.medicalNotes} onChange={handleIndChange} />
          </div>

          {renderTandC(indAcceptedTerms, e => setIndAcceptedTerms(e.target.checked))}
          <button type="submit" style={primaryBtn}>Complete Registration</button>
        </form>
      </div>
    )
  }

  // ── Step 1: Parent / Guardian ─────────────────────────────────
  if (step === 'parent') {
    return (
      <div style={page}>
        <h1 style={{ fontSize: '2rem', color: '#00205b', fontWeight: '800', marginBottom: '0.25rem' }}>Family Registration</h1>
        <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>Start with your details, then add each family member.</p>
        <div style={stepBar}>
          <div style={stepStyle('active')}>1 — Parent / Guardian</div>
          <div style={{ ...stepStyle(''), borderRight: 'none' }}>2 — Add Players</div>
        </div>
        <button type="button" onClick={() => setStep('choice')} style={backLink}>← Back</button>

        <form onSubmit={handleContinue}>
          <div style={card}>
            <div style={sectionTitle}>Your Details</div>
            <div style={row}>
              <div style={half}>
                <label style={lbl}>First Name *</label>
                <input style={inp} name="parentFirstName" value={pf.parentFirstName} onChange={handlePfChange} required />
              </div>
              <div style={half}>
                <label style={lbl}>Last Name *</label>
                <input style={inp} name="parentLastName" value={pf.parentLastName} onChange={handlePfChange} required />
              </div>
            </div>
            <div style={row}>
              <div style={half}>
                <label style={lbl}>Email *</label>
                <input style={inp} type="email" name="parentEmail" value={pf.parentEmail} onChange={handlePfChange} required />
              </div>
              <div style={half}>
                <label style={lbl}>Mobile *</label>
                <input style={inp} type="tel" name="parentMobile" value={pf.parentMobile} onChange={handlePfChange} required placeholder="e.g. 021 123 4567" />
              </div>
            </div>
            <div style={row}>
              <div style={half}>
                <label style={lbl}>Relationship to Players *</label>
                <select style={inp} name="parentRelationship" value={pf.parentRelationship} onChange={handlePfChange} required>
                  <option value="">Select...</option>
                  <option>Mother</option><option>Father</option>
                  <option>Legal Guardian</option><option>Other</option>
                </select>
              </div>
              <div style={half}>
                <label style={lbl}>Occupation</label>
                <input style={inp} name="parentOccupation" value={pf.parentOccupation} onChange={handlePfChange} placeholder="Optional" />
              </div>
            </div>
            {renderVolunteer(1)}
            {renderPlayerStatus(1)}
            {!showP2 && (
              <button type="button" onClick={() => setShowP2(true)} style={{ ...ghostBtn, marginTop: '1.25rem' }}>
                + Add Second Parent / Guardian
              </button>
            )}
          </div>

          {showP2 && (
            <div style={card}>
              <div style={sectionTitle}>Second Parent / Guardian</div>
              <div style={row}>
                <div style={half}>
                  <label style={lbl}>First Name *</label>
                  <input style={inp} name="parent2FirstName" value={pf.parent2FirstName} onChange={handlePfChange} required />
                </div>
                <div style={half}>
                  <label style={lbl}>Last Name *</label>
                  <input style={inp} name="parent2LastName" value={pf.parent2LastName} onChange={handlePfChange} required />
                </div>
              </div>
              <div style={row}>
                <div style={half}>
                  <label style={lbl}>Email *</label>
                  <input style={inp} type="email" name="parent2Email" value={pf.parent2Email} onChange={handlePfChange} required />
                </div>
                <div style={half}>
                  <label style={lbl}>Mobile *</label>
                  <input style={inp} type="tel" name="parent2Mobile" value={pf.parent2Mobile} onChange={handlePfChange} required />
                </div>
              </div>
              <div style={row}>
                <div style={half}>
                  <label style={lbl}>Relationship to Players *</label>
                  <select style={inp} name="parent2Relationship" value={pf.parent2Relationship} onChange={handlePfChange} required>
                    <option value="">Select...</option>
                    <option>Mother</option><option>Father</option>
                    <option>Legal Guardian</option><option>Other</option>
                  </select>
                </div>
                <div style={half}>
                  <label style={lbl}>Occupation</label>
                  <input style={inp} name="parent2Occupation" value={pf.parent2Occupation} onChange={handlePfChange} placeholder="Optional" />
                </div>
              </div>
              {renderVolunteer(2)}
              {renderPlayerStatus(2)}
              <button type="button" onClick={removeP2} style={{ ...removeBtn, marginTop: '0.75rem', fontSize: '0.85rem' }}>
                — Remove Second Parent / Guardian
              </button>
            </div>
          )}

          <div style={card}>
            <div style={sectionTitle}>Family Address</div>
            {renderAddressSection(false)}
            <label style={lbl}>Family Group Name</label>
            <input style={inp} name="familyGroupName" value={pf.familyGroupName} onChange={handlePfChange}
              placeholder={pf.parentLastName ? `e.g. ${pf.parentLastName} Family` : 'e.g. Smith Family (optional)'} />
          </div>

          <button type="submit" style={primaryBtn}>Continue — Add Family Members →</button>
        </form>
      </div>
    )
  }

  // ── Step 2: Add Players ───────────────────────────────────────
  return (
    <div style={page}>
      <h1 style={{ fontSize: '2rem', color: '#00205b', fontWeight: '800', marginBottom: '0.25rem' }}>Family Registration</h1>
      <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>Add each family member below.</p>
      <div style={stepBar}>
        <div style={stepStyle('done')}>1 — Parent / Guardian ✓</div>
        <div style={{ ...stepStyle('active'), borderRight: 'none' }}>2 — Add Players</div>
      </div>
      <button type="button" onClick={() => setStep('parent')} style={backLink}>← Edit parent details</button>

      {renderFamilyPanel()}
      {lastAdded && <div style={successBanner}>{lastAdded} added to the family.</div>}

      <form onSubmit={handleAddPlayer}>
        <div style={cardAccent}>
          <div style={sectionTitle}>Add a Family Member</div>
          <div style={row}>
            <div style={half}>
              <label style={lbl}>First Name *</label>
              <input style={inp} name="firstName" value={pl.firstName} onChange={handlePlChange} required />
            </div>
            <div style={half}>
              <label style={lbl}>Last Name *</label>
              <input style={inp} name="lastName" value={pl.lastName} onChange={handlePlChange} required />
            </div>
          </div>
          <div style={row}>
            <div style={half}>
              <label style={lbl}>Gender *</label>
              <select style={inp} name="gender" value={pl.gender} onChange={handlePlChange} required>
                <option value="">Select...</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div style={half}>
              <label style={lbl}>Date of Birth *</label>
              <input style={inp} type="date" name="dateOfBirth" value={pl.dateOfBirth} onChange={handlePlChange} required />
            </div>
          </div>
          {plGrade && (
            <div style={row}>
              <div style={half}>
                <label style={lbl}>Grade (auto-calculated)</label>
                <input style={inpRO} value={plGrade} readOnly />
              </div>
              <div style={{ ...half, display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.82rem', color: '#777', paddingBottom: '1.1rem' }}>Age as at 1 Jan {new Date().getFullYear()}: {plAge}</span>
              </div>
            </div>
          )}
          {showSchool && (
            <>
              <label style={lbl}>School or Tertiary Institution *</label>
              <input style={inp} name="institution" value={pl.institution} onChange={handlePlChange} required placeholder="e.g. Marist College" />
            </>
          )}
          <div style={row}>
            <div style={half}>
              <label style={lbl}>Mobile</label>
              <input style={inp} type="tel" name="mobile" value={pl.mobile} onChange={handlePlChange} placeholder="Optional" />
            </div>
            <div style={half}>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" name="email" value={pl.email} onChange={handlePlChange} placeholder="Optional" />
            </div>
          </div>
          <label style={lbl}>Photo (optional)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePlayerPhoto} style={{ display: 'block', marginBottom: '1rem', fontSize: '0.9rem' }} />
          {plPhotoPreview && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <img src={plPhotoPreview} alt="" style={{ width: '90px', height: '113px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #00205b' }} />
              <button type="button" onClick={() => { setPlPhotoPreview(null); setPl(prev => ({ ...prev, photo: null })) }}
                style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>Remove</button>
            </div>
          )}
          <label style={lbl}>Medical Notes (optional)</label>
          <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} name="medicalNotes" value={pl.medicalNotes} onChange={handlePlChange} />
          <button type="submit" style={primaryBtn}>+ Add to Family</button>
        </div>
      </form>

      <form onSubmit={handleComplete}>
        {players.length === 0 && <div style={warnBanner}>Add at least one family member before completing registration.</div>}
        {renderTandC(acceptedTerms, e => setAcceptedTerms(e.target.checked))}
        <button type="submit" style={{ ...primaryBtn, opacity: players.length === 0 ? 0.5 : 1 }} disabled={players.length === 0}>
          Complete Family Registration ({players.length} player{players.length !== 1 ? 's' : ''})
        </button>
      </form>
    </div>
  )
}
