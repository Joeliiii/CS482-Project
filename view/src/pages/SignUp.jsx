import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
    const navigate = useNavigate()
    const [msg, setMsg] = useState('')
    const [err, setErr] = useState('')

    const [form, setForm] = useState({
        email: '',
        username: '',
        password: '',
        phone: '',
        accountType: 'user',  // 'user' | 'adult'
        address: '',
        govIdType: 'license', // default selection
        govIdLast4: ''
    })

    const onChange = (e) => {
        const { name, value, type } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'radio' ? e.target.value : value }))
    }

    const validate = () => {
        if (!form.email || !form.username || !form.password) return 'Email, username, and password are required.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.'
        if (form.password.length < 6) return 'Password must be at least 6 characters.'
        if (form.accountType === 'adult') {
            if (!form.address) return 'Address is required for Adult accounts.'
            if (!['passport', 'license', 'realid'].includes(form.govIdType)) return 'ID Type must be Passport, License, or REALID.'
            if (!/^\d{4}$/.test(form.govIdLast4)) return 'ID Last 4 must be exactly 4 digits.'
        }
        return ''
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setMsg(''); setErr('')
        const v = validate()
        if (v) { setErr(v); return }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (!res.ok) { setErr(data.message || 'Signup failed.'); return }
            setMsg(data.message || 'Account created successfully!')
            // Optionally redirect to login or profile after a moment
            setTimeout(() => navigate('/login'), 800)
        } catch {
            setErr('Server error.')
        }
    }

    return (
        <section className="container-sm py-5" style={{ maxWidth: 520 }}>
            <h2 className="fw-bold text-ybt mb-4 text-center">Create Account</h2>
            <form className="ybt-card rounded-2xl p-4" onSubmit={onSubmit} noValidate>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input className="form-control" type="email" name="email" value={form.email} onChange={onChange} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Display Name</label>
                    <input className="form-control" name="username" value={form.username} onChange={onChange} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input className="form-control" type="password" name="password" value={form.password} onChange={onChange} required />
                    <div className="form-text">At least 6 characters.</div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Phone Number (optional)</label>
                    <input className="form-control" name="phone" value={form.phone} onChange={onChange} />
                </div>

                {/* Account type */}
                <div className="mb-3">
                    <label className="form-label d-block">Account Type</label>
                    <div className="d-flex gap-3">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                id="acct-user"
                                name="accountType"
                                value="user"
                                checked={form.accountType === 'user'}
                                onChange={onChange}
                            />
                            <label className="form-check-label" htmlFor="acct-user">User</label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                id="acct-adult"
                                name="accountType"
                                value="adult"
                                checked={form.accountType === 'adult'}
                                onChange={onChange}
                            />
                            <label className="form-check-label" htmlFor="acct-adult">Adult</label>
                        </div>
                    </div>
                </div>

                {/* Adult-only fields */}
                {form.accountType === 'adult' && (
                    <div className="border rounded-3 p-3 mb-3">
                        <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input className="form-control" name="address" value={form.address} onChange={onChange} required />
                        </div>

                        <div className="row g-3">
                            <div className="col-6">
                                <label className="form-label">ID Type</label>
                                <select className="form-select" name="govIdType" value={form.govIdType} onChange={onChange} required>
                                    <option value="passport">Passport</option>
                                    <option value="license">License</option>
                                    <option value="realid">REALID</option>
                                </select>
                            </div>
                            <div className="col-6">
                                <label className="form-label">ID Last 4</label>
                                <input className="form-control" name="govIdLast4" value={form.govIdLast4} onChange={onChange} placeholder="1234" maxLength={4} required />
                            </div>
                        </div>
                    </div>
                )}

                {err && <div className="alert alert-danger">{err}</div>}
                {msg && <div className="alert alert-success">{msg}</div>}

                <button className="btn bg-ybt w-100 rounded-pill fw-semibold mt-2">Sign Up</button>
            </form>
        </section>
    )
}
