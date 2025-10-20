import React from 'react'

export default function TeamProfile() {
    return (
        <section>
            <h2 className="fw-bold text-ybt mb-4">Team Profile</h2>
            <div className="ybt-card rounded-2xl p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                    <img src="/images/team-logo.png" alt="Team Logo" width="80" className="rounded-circle border ybt-border" />
                    <div>
                        <h3 className="mb-0">Baltimore Hawks</h3>
                        <small className="text-secondary">Season 2025</small>
                    </div>
                </div>

                <p className="text-secondary">Coach: Marcus Green</p>
                <p className="text-secondary">Players: 10</p>

                <button className="btn bg-ybt rounded-pill mt-3">Add Player</button>
            </div>
        </section>
    )
}
