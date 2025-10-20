import React from 'react'

export default function Livestreams() {
    return (
        <section>
            <h2 className="fw-bold text-ybt mb-4">Livestreams & Replays</h2>
            <div className="row g-3">
                {[1, 2, 3].map(n => (
                    <div key={n} className="col-md-4">
                        <div className="ybt-card rounded-2xl p-2 text-center">
                            <div className="ratio ratio-16x9 mb-2">
                                <iframe
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                                    title={`Match ${n}`}
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div>Match {n}: Hawks vs Bulls</div>
                            <span className="badge bg-danger mt-1">LIVE</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
