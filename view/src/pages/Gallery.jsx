import React from 'react'

export default function Gallery() {
    return (
        <section>
            <h2 className="fw-bold text-ybt mb-4">Tournament Gallery</h2>
            <p className="text-secondary mb-4">Photos and videos from recent games. Registered users can upload their own!</p>

            <div className="row g-3">
                {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} className="col-6 col-md-4 col-lg-3">
                        <div className="ybt-card rounded-2xl overflow-hidden">
                            <img src={`/images/gallery${n}.jpg`} alt={`Gallery ${n}`} className="img-fluid" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <button className="btn bg-ybt rounded-pill me-2">Add Photo</button>
                <button className="btn btn-outline-secondary rounded-pill">Add Video</button>
            </div>
        </section>
    )
}
