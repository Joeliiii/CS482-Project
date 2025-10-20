import React from 'react'

export default function Bracket() {
    return (
        <section>
            <h2 className="fw-bold text-ybt mb-4">Tournament Bracket</h2>
            <p className="text-secondary mb-3">Live, continuously updated brackets throughout the season.</p>
            <div className="ybt-card rounded-2xl p-3 text-center">
                <img src="/images/bracket-placeholder.png" alt="Bracket Example" className="img-fluid" />
            </div>
        </section>
    )
}
