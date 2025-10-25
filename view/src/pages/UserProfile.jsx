import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UserProfile() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [form, setForm] = useState({ email: '', username: '', phone: '', newPassword: '' })

    const [kids, setKids] = useState([])
    const [kidForm, setKidForm] = useState({
        fullName: '',
        birthdate: '',
        photoUrl: '',
        relation: '',
        isPrimary: false
    })
    const [kidMsg, setKidMsg] = useState('')
    const [kidErr, setKidErr] = useState('')

    // load profile
    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const meRes = await fetch('/api/auth/me', { credentials: 'include' })
                if (meRes.status === 401) { navigate('/login'); return }
                const me = await meRes.json()
                if (cancelled) return
                setForm({
                    email: me.email || '',
                    username: me.username || '',
                    phone: me.phone || '',
                    newPassword: ''
                })

                const kidsRes = await fetch('/api/me/children', { credentials: 'include' })
                const kidsData = await kidsRes.json()
                if (!cancelled) {
                    setKids(kidsData.children || [])
                    setLoading(false)
                }
            } catch (e) {
                if (!cancelled) { setError('Failed to load profile.'); setLoading(false) }
            }
        }
        load()
        return () => { cancelled = true }
    }, [navigate])

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
    const handleSave = async e => {
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
            if (!res.ok) { setError(data.message || 'Update failed.'); return }
            setMessage(data.message || 'Saved.')
            setForm(f => ({ ...f, newPassword: '' }))
        } catch {
            setError('Server error.')
        }
    }

    const handleKidChange = e => {
        const { name, value, type, checked } = e.target
        setKidForm({ ...kidForm, [name]: type === 'checkbox' ? checked : value })
    }
    const addChild = async e => {
        e.preventDefault()
        setKidErr(''); setKidMsg('')
        try {
            const res = await fetch('/api/me/children', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(kidForm)
            })
            const data = await res.json()
            if (!res.ok) { setKidErr(data.message || 'Could not add child.'); return }
            setKids(prev => [...prev, data.child])
            setKidMsg('Child added.')
            setKidForm({ fullName: '', birthdate: '', photoUrl: '', relation: '', isPrimary: false })
        } catch {
            setKidErr('Server error.')
        }
    }
    const unlinkChild = async (childId) => {
        if (!window.confirm('Remove this child from your profile?')) return
        try {
            const res = await fetch(`/api/me/children/${childId}`, { method: 'DELETE', credentials: 'include' })
            const data = await res.json()
            if (!res.ok) { alert(data.message || 'Could not remove'); return }
            setKids(prev => prev.filter(k => String(k.childId) !== String(childId)))
        } catch {
            alert('Server error.')
        }
    }

    if (loading) {
        return <section className="container-sm py-5" style={{ maxWidth: 600 }}>
            <div className="ybt-card rounded-2xl p-4 text-center">Loading…</div>
        </section>
    }

    return (
        <section className="container py-5">
            <h2 className="fw-bold text-ybt mb-4 text-center">User Profile</h2>
            <div className="row g-4">
                {/* Account */}
                <div className="col-md-6">
                    <form className="ybt-card rounded-2xl p-4" onSubmit={handleSave} noValidate>
                        <h5 className="mb-3">Account Details</h5>

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
                </div>

                {/* Children */}
                <div className="col-md-6">
                    <div className="ybt-card rounded-2xl p-4">
                        <h5 className="mb-3">Linked Children</h5>

                        <div className="d-flex flex-column gap-2 mb-3">
                            {kids.length === 0 && <div className="text-secondary">No children linked yet.</div>}
                            {kids.map(k => (
                                <div key={String(k.childId)} className="border rounded-3 p-3 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3">
                                        <img src={k.photoUrl || `https://placehold.co/64x64?text=${encodeURIComponent(k.fullName?.[0] || 'C')}`} alt={k.fullName} className="rounded-circle" width={48} height={48} />
                                        <div>
                                            <div className="fw-semibold">{k.fullName}</div>
                                            <div className="text-secondary small">
                                                Relation: {k.relation || '—'} • {k.birthdate ? new Date(k.birthdate).toLocaleDateString() : 'No DOB'}
                                                {k.isPrimary ? ' • Primary' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline-secondary rounded-pill" onClick={() => unlinkChild(k.childId)}>Remove</button>
                                </div>
                            ))}
                        </div>

                        <hr className="my-3" />
                        <h6 className="mb-2">Add a Child</h6>
                        <form onSubmit={addChild} className="row g-2">
                            <div className="col-12">
                                <label className="form-label">Full Name</label>
                                <input className="form-control" name="fullName" value={kidForm.fullName} onChange={handleKidChange} required />
                            </div>
                            <div className="col-6">
                                <label className="form-label">Birthdate</label>
                                <input type="date" className="form-control" name="birthdate" value={kidForm.birthdate} onChange={handleKidChange} required />
                            </div>
                            <div className="col-6">
                                <label className="form-label">Relation</label>
                                <input className="form-control" name="relation" value={kidForm.relation} onChange={handleKidChange} placeholder="Parent / Guardian / Trusted Adult" required />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Photo URL (optional)</label>
                                <input className="form-control" name="photoUrl" value={kidForm.photoUrl} onChange={handleKidChange} />
                            </div>
                            <div className="col-12 form-check mt-2">
                                <input id="isPrimary" type="checkbox" className="form-check-input" name="isPrimary" checked={kidForm.isPrimary} onChange={handleKidChange} />
                                <label className="form-check-label" htmlFor="isPrimary">Primary</label>
                            </div>

                            {kidErr && <div className="alert alert-danger mt-2">{kidErr}</div>}
                            {kidMsg && <div className="alert alert-success mt-2">{kidMsg}</div>}

                            <div className="col-12">
                                <button className="btn bg-ybt w-100 rounded-pill fw-semibold">Add Child</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
