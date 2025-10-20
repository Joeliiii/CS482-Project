import React from 'react'

export default function Landing() {
    return (
        <section className="text-center py-5">
            <h1 className="display-4 fw-bold text-ybt mb-3">Welcome to YBT League</h1>
            <p className="lead text-secondary mx-auto" style={{ maxWidth: 700 }}>
                Organizing youth basketball tournaments nationwide.
                Connect with your team, follow live brackets, and relive the best highlights.
            </p>

            <div className="d-flex justify-content-center gap-3 mt-4">
                <a href="/signup" className="btn bg-ybt rounded-pill px-4 py-2 fw-semibold">Sign Up</a>
                <a href="/gallery" className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold">View Gallery</a>
            </div>

            <div className="mt-5">
                <img src="/images/hero-basketball.jpg" alt="Basketball Players" className="img-fluid rounded-2xl border ybt-border" />
            </div>
        </section>
    )
}
