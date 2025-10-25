import React from 'react'
import { Link, NavLink } from 'react-router-dom'

function Ticker() {
    return (
        <div className="border-top ticker">
            <div className="container-xl py-2 small text-secondary d-flex gap-4 overflow-auto">
                <span><strong className="text-ybt">Tigers</strong> 56 — 48 <strong className="text-ybt">Lions</strong></span>
                <span><strong className="text-ybt">Hawks</strong> 50 — 42 <strong className="text-ybt">Bulls</strong></span>
                <span><strong className="text-ybt">Wolves</strong> 61 — 59 <strong className="text-ybt">Eagles</strong></span>
            </div>
        </div>
    )
}

/**
 * Layout wrapper:
 * - Pass a `user` object (e.g., { isAdmin: true/false }) if you want admin/Profile controls to render.
 * - Place your <Routes> inside <Layout>...</Layout> in App.jsx
 */
export default function Layout({ user, children }) {
    return (
        <div className="min-vh-100 d-flex flex-column bg-dark text-light">
            {/* Header / Navbar */}
            <header className="sticky-top">
                <nav className="navbar navbar-expand-md navbar-dark">
                    <div className="container-xl py-2 navbar-hover-zone">
                        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
                            <span className="d-inline-block rounded bg-ybt" style={{ width: 32, height: 32 }} />
                            <strong>YBT&nbsp;League</strong>
                        </Link>

                        {/* Right-side controls */}
                        <div className="ms-auto d-flex align-items-center gap-2">
                            <div className="d-none d-md-flex align-items-center gap-3 me-3">
                                <NavLink className="nav-link link-light link-hover" to="/schedule">Schedules</NavLink>
                                <NavLink className="nav-link link-light link-hover" to="/team">Teams</NavLink>
                                <NavLink className="nav-link link-light link-hover" to="/bracket">Brackets</NavLink>
                                <NavLink className="nav-link link-light link-hover" to="/livestreams">Videos</NavLink>
                                <NavLink className="nav-link link-light link-hover" to="/gallery">Gallery</NavLink>
                                <NavLink className="nav-link link-light link-hover" to="/sponsors">Sponsors</NavLink>
                                <NavLink className="nav-link link-light link-hover" to="/contact">Contact</NavLink>
                                {user?.isAdmin && (
                                    <NavLink className="nav-link link-light link-hover text-ybt" to="/admin">Admin</NavLink>
                                )}
                            </div>

                            {!user ? (
                                <>
                                    <Link to="/login" className="btn bg-ybt rounded-pill">Log In</Link>
                                    <Link to="/signup" className="btn btn-outline-secondary rounded-pill">Sign Up</Link>
                                </>
                            ) : (
                                <Link to="/profile" className="btn btn-outline-secondary rounded-pill">Profile</Link>
                            )}
                        </div>
                    </div>
                </nav>
                <Ticker />
            </header>

            {/* Main content */}
            <main className="flex-grow-1 py-5">
                <div className="container-xl">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-top ybt-border bg-black">
                <div className="container-xl py-4 small d-flex flex-column flex-md-row justify-content-between">
                    <div>© {new Date().getFullYear()} YBT League</div>
                    <nav className="d-flex gap-3">
                        <NavLink className="link-hover link-light text-decoration-none" to="/contact">Contact</NavLink>
                        <NavLink className="link-hover link-light text-decoration-none" to="/">Home</NavLink>
                        <NavLink className="link-hover link-light text-decoration-none" to="/profile">Profile</NavLink>
                    </nav>
                </div>
            </footer>
        </div>
    )
}
