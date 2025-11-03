import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login({ onAuthed }) {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',       // keep this so the session cookie is stored
                body: JSON.stringify(form),
            })

            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data.message || 'Invalid credentials.')
                setSubmitting(false)
                return
            }

            // data shape from your LoginController: { user, roles, isAdmin }
            if (onAuthed && data?.user) {
                onAuthed({ ...data.user, roles: data.roles || [], isAdmin: !!data.isAdmin })
            }

            // Navigate wherever makes sense; send admins to /admin
            navigate(data?.isAdmin ? '/admin' : '/profile')
        } catch (err) {
            setError('Network error. Please try again.')
            setSubmitting(false)
        }
    }

    return (
        <section className="container-sm py-5" style={{ maxWidth: 500 }}>
            <h2 className="fw-bold text-ybt mb-4 text-center">Log In</h2>

            <form onSubmit={handleSubmit} className="ybt-card rounded-2xl p-4" noValidate>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="mb-1">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                    />
                </div>

                {error && <div className="alert alert-danger mt-3">{error}</div>}

                <button
                    className="btn bg-ybt w-100 rounded-pill mt-3 fw-semibold"
                    disabled={submitting}
                >
                    {submitting ? 'Signing in…' : 'Log In'}
                </button>
            </form>
        </section>
    )
}
