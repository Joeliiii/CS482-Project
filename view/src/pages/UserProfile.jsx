import React from 'react'

export default function UserProfile() {
    return (
        <section className="container-sm py-5" style={{ maxWidth: 600 }}>
            <h2 className="fw-bold text-ybt mb-4 text-center">User Profile</h2>
            <form className="ybt-card rounded-2xl p-4">
                <div className="mb-3">
                    <label className="form-label">Display Name</label>
                    <input type="text" className="form-control" defaultValue="John Doe" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" defaultValue="johndoe@example.com" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" defaultValue="(555) 123-4567" />
                </div>
                <button className="btn bg-ybt w-100 rounded-pill mt-3 fw-semibold">Save Changes</button>
            </form>
        </section>
    )
}
