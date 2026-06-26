import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import MembersPage from './pages/MembersPage'
import TeamsPage from './pages/TeamsPage'

function App() {
  const [members, setMembers] = useState([])

  function addMember(member) {
    setMembers(prev => [...prev, { ...member, id: Date.now() }])
  }

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage onRegister={addMember} />} />
        <Route path="/members" element={<MembersPage members={members} />} />
        <Route path="/teams" element={<TeamsPage members={members} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
