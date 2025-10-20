import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Guard from './components/Guard'

// Import all your pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Gallery from './pages/Gallery'
import Bracket from './pages/Bracket'
import TeamProfile from './pages/TeamProfile'
import AdminDashboard from './pages/AdminDashboard'
import UserProfile from './pages/UserProfile'
import Schedule from './pages/Schedule'
import Livestreams from './pages/Livestreams'
import Sponsors from './pages/Sponsors'
import Contact from './pages/Contact'

// --- App component ---
export default function App() {
    // Temporary mock auth object; replace with your real auth logic later
    const [user, setUser] = React.useState({
        isAdmin: false,  // change to true to show admin dashboard link
        isLoggedIn: false
    })

    return (
        <Layout user={user}>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/bracket" element={<Bracket />} />
                <Route path="/team" element={<TeamProfile />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/livestreams" element={<Livestreams />} />
                <Route path="/sponsors" element={<Sponsors />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<AdminDashboard />} />

                {/* fallback: redirect any unknown path to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    )
}
