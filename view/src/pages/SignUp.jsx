import React, { useState } from 'react'

export default function SignUp() {
    const [form, setForm] = useState({
        email: '',
        username: '',
        password: '',
        phone: ''
    })
    const [message, setMessage] = useState('')

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async e => {
        e.preventDefault()
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            setMessage(data.message || 'Account created successfully!')
        } catch (err) {
            setMessage('Error creating account.')
        }
    }

    return (
        <section className="container-sm py-5" style={{ maxWidth: 500 }}>
            <h2 className="fw-bold text-ybt mb-4 text-center">Sign Up</h2>
            <form onSubmit={handleSubmit} className="ybt-card rounded-2xl p-4">
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control" name="username" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" name="password" onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" name="phone" onChange={handleChange} />
                </div>
                <button className="btn bg-ybt w-100 rounded-pill mt-3 fw-semibold">Create Account</button>
            </form>
            {message && <div className="text-center mt-3 text-secondary">{message}</div>}
        </section>
    )
}
