// App.jsx (frontend)
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Gallery from './pages/Gallery';
import Bracket from './pages/Bracket';
import TeamProfile from './pages/TeamProfile';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import UserProfile from './pages/UserProfile';
import Schedule from './pages/Schedule';
import Livestreams from './pages/Livestreams';
import LivestreamPage from './pages/LivestreamPage.jsx';
import Sponsors from './pages/Sponsors';
import Contact from './pages/Contact';
import Tickets from "./pages/tickets";
import MatchHistory from './pages/MatchHistory';

export default function App() {
    const [user, setUser] = React.useState(null);
    const [loadingMe, setLoadingMe] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    // If /me returns 401 {message:'Not logged in.'}, set user to null
                    setUser(data?.id ? { ...data } : null);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoadingMe(false);
            }
        })();
    }, []);

    if (loadingMe) {
        // optional shimmer / spinner
        return <div className="container-xl py-5 text-secondary">Loading…</div>;
    }

    return (
        <Layout user={user}>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login onAuthed={setUser} />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/bracket" element={<Bracket />} />
                <Route path="/team" element={<TeamProfile />} />
                <Route path="/profile" element={<RequireLogin user={user}><UserProfile /></RequireLogin>} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/livestreams" element={<Livestreams />} />
                <Route path="/livestreams/:slug" element={<LivestreamPage/>}/>
                <Route path="/sponsors" element={<Sponsors />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/history" element={<MatchHistory />} />

                {/* Admin route guarded on client */}
                <Route
                    path="/admin"
                    element={
                        <RequireAdmin user={user}>
                            <AdminDashboard />
                        </RequireAdmin>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

function RequireLogin({ user, children }) {
    if (!user) return <div className="text-warning">Please log in.</div>;
    return children;
}

function RequireAdmin({ user, children }) {
    if (!user) return <div className="text-warning">Please log in.</div>;
    if (!user.isAdmin) return <div className="text-danger">Admins only.</div>;
    return children;
}
