import React from 'react'

export default function Contact() {
    return (
        <section className="container-sm py-5" style={{ maxWidth: 600 }}>
            <h2 className="fw-bold text-ybt mb-4 text-center">Contact Us</h2>
            <form className="ybt-card rounded-2xl p-4">
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea className="form-control" rows="4" required></textarea>
                </div>
                <button className="btn bg-ybt w-100 rounded-pill mt-3 fw-semibold">Send Message</button>
            </form>
        </section>
    )
}
