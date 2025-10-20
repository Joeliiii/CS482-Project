import React, { useState } from 'react'

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
    const handleSubmit = e => {
        e.preventDefault()
        console.log('Logging in:', form)
    }

    return (
        <section className="container-sm py-5" style={{ maxWidth: 500 }}>
            <h2 className="fw-bold text-ybt mb-4 text-center">Log In</h2>
            <form onSubmit={handleSubmit} className="ybt-card rounded-2xl p-4">
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
                </div>
                <button className="btn bg-ybt w-100 rounded-pill mt-3 fw-semibold">Log In</button>
            </form>
        </section>
    )
}
