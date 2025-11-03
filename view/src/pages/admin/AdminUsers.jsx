// view/src/pages/admin/AdminUsers.jsx
import { useState } from 'react';
import { adminApi } from '../../lib/adminApi.js';

export default function AdminUsers({ users, teams, onRefresh }) {
    const [expanded, setExpanded] = useState({}); // userId -> boolean
    const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const handleAddRole = async (userId) => {
        const roleName = prompt('Enter role to add (e.g., admin, coach, user):');
        if (!roleName) return;
        await adminApi.addRole(userId, roleName.trim());
        onRefresh();
    };

    const handleRemoveRole = async (userId) => {
        const roleName = prompt('Enter role to remove:');
        if (!roleName) return;
        await adminApi.removeRole(userId, roleName.trim());
        onRefresh();
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Delete this user? This also removes Adult + child links.')) return;
        await adminApi.deleteUser(userId);
        onRefresh();
    };

    const handleAssignTeam = async (childId) => {
        const teamId = prompt(
            `Enter teamId from list:\n${teams.map(t => `${t._id} - ${t.name}`).join('\n')}\nLeave blank to clear.`
        );
        await adminApi.assignChildTeam(childId, teamId || null);
        onRefresh();
    };

    return (
        <div className="space-y-3">
            <h2 className="text-xl font-semibold">Users</h2>
            <table className="w-full text-sm">
                <thead>
                <tr className="text-left border-b">
                    <th>User</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Children</th>
                    <th className="text-right">Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map(u => {
                    const isOpen = !!expanded[u._id];
                    return (
                        <tr key={u._id} className="border-b align-top">
                            <td>
                                <button className="underline" onClick={() => toggle(u._id)}>
                                    {isOpen ? '▾' : '▸'} {u.username || '(no username)'}
                                </button>
                            </td>
                            <td>{u.email}</td>
                            <td>{(u.roles || []).map(r => r.name).join(', ') || '—'}</td>
                            <td>{(u.children || []).length}</td>
                            <td className="text-right space-x-2">
                                <button onClick={() => handleAddRole(u._id)} className="px-2 py-1 border rounded">+ Role</button>
                                <button onClick={() => handleRemoveRole(u._id)} className="px-2 py-1 border rounded">− Role</button>
                                <button onClick={() => handleDeleteUser(u._id)} className="px-2 py-1 border rounded text-red-600">Delete</button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {/* Expanded children sections */}
            {users.map(u => expanded[u._id] && (
                <div key={`${u._id}-expanded`} className="bg-gray-50 p-3 rounded border">
                    <h3 className="font-medium mb-2">Children of {u.username || u.email}</h3>
                    {(u.children || []).length === 0 && <div className="text-sm text-gray-500">No children linked.</div>}
                    <ul className="space-y-2">
                        {(u.children || []).map(c => (
                            <li key={c._id} className="flex items-center justify-between">
                <span>
                  {c.fullName} &nbsp;
                    <span className="text-gray-500">
                    {c.teamId ? `(team: ${c.teamId})` : '(no team)'}
                  </span>
                </span>
                                <div className="space-x-2">
                                    <button className="px-2 py-1 border rounded"
                                            onClick={() => handleAssignTeam(c._id)}>
                                        Assign/Change Team
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
