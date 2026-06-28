import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import MembersPage from './pages/MembersPage'
import TeamsPage from './pages/TeamsPage'
import AdminPage from './pages/AdminPage'
import { supabase } from './lib/supabase'
import { memberToRow, rowToMember } from './lib/memberMapping'

const DEFAULT_TERMS =
`Welcome to Marist Water Polo Club.

By registering, you agree to the following terms and conditions:

1. CODE OF CONDUCT
All players, parents, and guardians agree to abide by the Marist Water Polo Club Code of Conduct at all times, including during training, games, and club events.

2. FEES
All applicable membership and competition fees must be paid by the due dates set by the club. The club reserves the right to suspend participation for outstanding payments.

3. ACCURACY OF INFORMATION
You confirm that all information provided during registration is accurate and up to date. It is your responsibility to notify the club of any changes.

4. TEAM PLACEMENT
The club reserves the right to place players in teams based on skill, age grade, and availability. Team selections are final.

5. HEALTH AND SAFETY
Participation in water polo involves inherent physical risks. By registering, you acknowledge and accept these risks. Players with known medical conditions must declare them during registration.

6. PHOTOGRAPHY AND MEDIA
Players may be photographed or filmed during club activities. Images may be used in club communications, newsletters, and social media. Please advise the club if you do not consent to photography.

7. PRIVACY
Personal information collected during registration is used solely for club management purposes and will not be shared with third parties without your consent, except as required by law.

8. PARENT / GUARDIAN RESPONSIBILITY
For players under 18 years of age, the parent or guardian registered alongside the player accepts full responsibility for ensuring the player adheres to all club rules and policies.`

function App() {
  const [members, setMembers] = useState([])
  const [terms, setTerms]     = useState(DEFAULT_TERMS)
  const [loading, setLoading] = useState(!!supabase)
  const [dbError, setDbError] = useState(null)

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load members:', error)
          setDbError('Could not connect to the database. Registrations will not be saved.')
        } else {
          setMembers((data || []).map(rowToMember))
        }
        setLoading(false)
      })
  }, [])

  async function addMember(member) {
    if (!supabase) {
      setMembers(prev => [...prev, { ...member, id: Date.now(), regId: null }])
      return
    }
    const { data, error } = await supabase
      .from('members')
      .insert(memberToRow(member))
      .select()
      .single()
    if (error) {
      console.error('Failed to save member:', error)
      alert('Registration could not be saved — please try again.')
      throw error
    }
    setMembers(prev => [...prev, rowToMember(data)])
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Calibri, sans-serif', color: '#00205b', fontSize: '1.1rem' }}>
        Loading…
      </div>
    )
  }

  return (
    <BrowserRouter>
      <NavBar />
      {dbError && (
        <div style={{ background: '#fff3cd', borderBottom: '1px solid #ffc107', color: '#7a5c00', padding: '0.65rem 2rem', fontSize: '0.9rem', fontWeight: '600' }}>
          ⚠ {dbError}
        </div>
      )}
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/register" element={<RegisterPage onRegister={addMember} terms={terms} />} />
        <Route path="/members"  element={<MembersPage members={members} />} />
        <Route path="/teams"    element={<TeamsPage members={members} />} />
        <Route path="/admin"    element={<AdminPage terms={terms} setTerms={setTerms} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
