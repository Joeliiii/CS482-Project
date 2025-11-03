// view/src/pages/admin/AdminEvents.jsx
import { useState } from 'react';
import { adminApi } from '../../lib/adminApi.js';

const empty = { title: '', type: 'match', startAt: '', endAt: '', location: '', teamAId: '', teamBId: '', notes: '' };

export default function AdminEvents({ events, onRefresh }) {
    const [form, setForm] = useState(empty);
    const [editing, setEditing] = useState(null);

    const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const create = async (e) => {
        e.preventDefault();
        await adminApi.createEvent(form);
        setForm(empty);
        onRefresh();
    };

    const startEdit = (ev) => {
        setEditing(ev._id);
        setForm({
            title: ev.title || '',
            type: ev.type || 'match',
            startAt: ev.startAt ? ev.startAt.slice(0,16) : '',
            endAt: ev.endAt ? ev.endAt.slice(0,16) : '',
            location: ev.location || '',
            teamAId: ev.teamAId || '',
            teamBId: ev.teamBId || '',
            notes: ev.notes || ''
        });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        await adminApi.updateEvent(editing, form);
        setEditing(null);
        setForm(empty);
        onRefresh();
    };

    const del = async (id) => {
        if (!confirm('Delete this event?')) return;
        await adminApi.deleteEvent(id);
        onRefresh();
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Events</h2>

            <form onSubmit={editing ? saveEdit : create} className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded border">
                <input name="title" value={form.title} onChange={onChange} placeholder="Title" className="border p-2 rounded" required />
                <select name="type" value={form.type} onChange={onChange} className="border p-2 rounded">
                    <option value="match">Match</option>
                    <option value="practice">Practice</option>
                    <option value="tournament">Tournament</option>
                    <option value="other">Other</option>
                </select>
                <input type="datetime-local" name="startAt" value={form.startAt} onChange={onChange} className="border p-2 rounded" required />
                <input type="datetime-local" name="endAt" value={form.endAt} onChange={onChange} className="border p-2 rounded" />
                <input name="location" value={form.location} onChange={onChange} placeholder="Location" className="border p-2 rounded" />
                <input name="teamAId" value={form.teamAId} onChange={onChange} placeholder="Team A ID (optional)" className="border p-2 rounded" />
                <input name="teamBId" value={form.teamBId} onChange={onChange} placeholder="Team B ID (optional)" className="border p-2 rounded" />
                <input name="notes" value={form.notes} onChange={onChange} placeholder="Notes" className="border p-2 rounded col-span-2" />
                <div className="col-span-2 flex gap-2">
                    <button className="px-3 py-2 border rounded bg-white">
                        {editing ? 'Save Changes' : 'Create Event'}
                    </button>
                    {editing && (
                        <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="px-3 py-2 border rounded">
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <table className="w-full text-sm">
                <thead>
                <tr className="text-left border-b">
                    <th>Title</th>
                    <th>Type</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Location</th>
                    <th>Teams</th>
                    <th className="text-right">Actions</th>
                </tr>
                </thead>
                <tbody>
                {events.map(ev => (
                    <tr key={ev._id} className="border-b">
                        <td>{ev.title}</td>
                        <td>{ev.type}</td>
                        <td>{ev.startAt ? new Date(ev.startAt).toLocaleString() : '—'}</td>
                        <td>{ev.endAt ? new Date(ev.endAt).toLocaleString() : '—'}</td>
                        <td>{ev.location || '—'}</td>
                        <td>{[ev.teamAId, ev.teamBId].filter(Boolean).join(' vs ') || '—'}</td>
                        <td className="text-right space-x-2">
                            <button className="px-2 py-1 border rounded" onClick={() => startEdit(ev)}>Edit</button>
                            <button className="px-2 py-1 border rounded text-red-600" onClick={() => del(ev._id)}>Delete</button>
                        </td>
                    </tr>
                ))}
                {events.length === 0 && (
                    <tr><td colSpan="7" className="text-center text-gray-500 p-3">No events</td></tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
