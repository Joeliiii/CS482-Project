import React from 'react'

export default function AdminDashboard() {
    return (
        <section>
            <h2 className="h3 fw-bold text-ybt mb-3">Admin Dashboard</h2>
            <div className="row g-3">
                <div className="col-md-4">
                    <div className="ybt-card rounded-2xl p-3">
                        <div className="fw-semibold">Teams Management</div>
                        <button className="btn bg-ybt rounded-pill w-100 mt-2">Add Team</button>
                        <a href="/team" className="btn btn-outline-secondary rounded-pill w-100 mt-2">View Teams</a>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="ybt-card rounded-2xl p-3">
                        <div className="fw-semibold">Players</div>
                        <button className="btn bg-ybt rounded-pill w-100 mt-2">Add Player</button>
                        <button className="btn btn-outline-secondary rounded-pill w-100 mt-2">Manage Roster</button>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="ybt-card rounded-2xl p-3">
                        <div className="fw-semibold">Updates</div>
                        <button className="btn bg-ybt rounded-pill w-100 mt-2">Push Update</button>
                        <button className="btn btn-outline-secondary rounded-pill w-100 mt-2">View All</button>
                    </div>
                </div>
            </div>
        </section>
    )
}
