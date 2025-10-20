import React from 'react'

export default function Sponsors() {
    return (
        <section>
            <h2 className="fw-bold text-ybt mb-4">Sponsors</h2>
            <p className="text-secondary mb-3">
                Thanks to our sponsors for supporting youth basketball across the country.
            </p>
            <div className="row g-3">
                {[1, 2, 3].map(n => (
                    <div key={n} className="col-md-4">
                        <div className="ybt-card rounded-2xl text-center p-3">
                            <img src={`/images/sponsor${n}.png`} alt="Sponsor" className="img-fluid mb-2" />
                            <h5>Company {n}</h5>
                            <p className="small text-secondary">Supporting the YBT League since 2024.</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <a href="/contact" className="btn bg-ybt rounded-pill">Become a Sponsor</a>
            </div>
        </section>
    )
}
