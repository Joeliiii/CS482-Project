import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UserProfile() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [form, setForm] = useState({
        email: '',
        username: '',
        phone: '',
        newPassword: ''
    })

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                // If running Vite dev on a different port, consider using import.meta.env.VITE_API_URL
                const res = await fetch('/api/auth/me', { credentials: 'include' })
                if (res.status === 401) {
                    // not logged in
                    navigate('/login')
                    return
                }
                const data = await res.json()
                if (!cancelled) {
                    setForm({
                        email: data.email || '',
                        username: data.username || '',
                        phone: data.phone || '',
                        newPassword: ''
                    })
                    setLoading(false)
                }
            } catch (err) {
                if (!cancelled) {
                    setError('Failed to load profile.')
                    setLoading(false)
                }
            }
        }
        load()
        return () => { cancelled = true }
    }, [navigate])

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setMessage('')
        try {
            const res = await fetch('/api/user/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    username: form.username,
                    phone: form.phone,
                    newPassword: form.newPassword
                })
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.message || 'Update failed.')
                return
            }
            setMessage(data.message || 'Saved.')
            // clear password field after success
            setForm(f => ({ ...f, newPassword: '' }))
        } catch (err) {
            setError('Server error.')
        }
    }

    if (loading) {
        return <section className="container-sm py-5" style={{ maxWidth: 600 }}>
            <div className="ybt-card rounded-2xl p-4 text-center">Loading…</div>
        </section>
    }

    return (
        <section className="container-sm py-5" style={{ maxWidth: 600 }}>
            <h2 className="fw-bold text-ybt mb-4 text-center">User Profile</h2>

            <form className="ybt-card rounded-2xl p-4" onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label className="form-label">Email (read-only)</label>
                    <input type="email" className="form-control" name="email" value={form.email} readOnly />
                </div>

                <div className="mb-3">
                    <label className="form-label">Display Name</label>
                    <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                </div>

                <div className="mb-2">
                    <label className="form-label">New Password (optional)</label>
                    <input type="password" className="form-control" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="Leave blank to keep current password" />
                </div>

                {error && <div className="alert alert-danger mt-3">{error}</div>}
                {message && <div className="alert alert-success mt-3">{message}</div>}

                <button className="btn bg-ybt w-100 rounded-pill mt-3 fw-semibold">Save Changes</button>
            </form>
        </section>
    )
}
