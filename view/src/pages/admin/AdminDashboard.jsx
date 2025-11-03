import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [events, setEvents] = useState([]);
    const [children, setChildren] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const [teamForm, setTeamForm] = useState({ name: "", season: "", coach: "" });
    const [eventForm, setEventForm] = useState({ title: "", start: "", end: "" });

    // ✅ Fetch users
    async function loadUsers() {
        const res = await fetch("/api/admin/users", { credentials: "include" });
        if (res.ok) {
            const json = await res.json();
            setUsers(json.items);
        }
    }

    // ✅ Fetch teams
    async function loadTeams() {
        const res = await fetch("/api/teams", { credentials: "include" });
        if (res.ok) {
            const json = await res.json();
            setTeams(json);
        }
    }

    // ✅ Fetch events
    async function loadEvents() {
        const res = await fetch("/api/admin/events", { credentials: "include" });
        if (res.ok) {
            const json = await res.json();
            setEvents(json);
        }
    }

    // ✅ Fetch children assigned to user
    async function loadChildren(userId) {
        const res = await fetch(`/api/admin/children/${userId}`, {
            credentials: "include",
        });
        if (res.ok) {
            const json = await res.json();
            setChildren(json);
            setSelectedUser(userId);
        }
    }

    // ✅ Change user roles
    async function updateRole(userId, role) {
        await fetch(`/api/admin/users/${userId}/roles`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ role }),
        });
        loadUsers();
    }

    // ✅ Delete user
    async function deleteUser(userId) {
        await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
            credentials: "include",
        });
        loadUsers();
    }

    // ✅ Assign child to team
    async function assignChildToTeam(childId, teamId) {
        await fetch(`/api/admin/children/${childId}/team`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ teamId }),
        });
    }

    // ✅ Create team
    async function createTeam(e) {
        e.preventDefault();
        await fetch("/api/teams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(teamForm),
        });
        setTeamForm({ name: "", season: "", coach: "" });
        loadTeams();
    }

    // ✅ Create event
    async function createEvent(e) {
        e.preventDefault();
        await fetch("/api/admin/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(eventForm),
        });
        setEventForm({ title: "", start: "", end: "" });
        loadEvents();
    }

    useEffect(() => {
        loadUsers();
        loadTeams();
        loadEvents();
    }, []);

    return (
        <div className="text-light">
            <h2 className="fw-bold text-ybt mb-4">Admin Dashboard</h2>

            {/* ✅ USERS */}
            <h4>Users</h4>
            <table className="table table-dark table-striped">
                <thead>
                <tr>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Children</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((u) => (
                    <tr key={u._id}>
                        <td>{u.email}</td>
                        <td>
                            {u.roles?.join(", ") || "none"}
                            <button
                                className="btn btn-sm btn-warning ms-2"
                                onClick={() => updateRole(u._id, "admin")}
                            >
                                + Admin
                            </button>
                            <button
                                className="btn btn-sm btn-secondary ms-1"
                                onClick={() => updateRole(u._id, "user")}
                            >
                                + User
                            </button>
                        </td>
                        <td>
                            <button
                                className="btn btn-sm btn-info"
                                onClick={() => loadChildren(u._id)}
                            >
                                View Children
                            </button>
                        </td>
                        <td>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteUser(u._id)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* ✅ CHILD → TEAM ASSIGN */}
            {selectedUser && (
                <>
                    <h4>Assign Child to Team</h4>
                    {children.map((child) => (
                        <div key={child._id} className="mb-2">
                            {child.name} →
                            <select
                                onChange={(e) => assignChildToTeam(child._id, e.target.value)}
                                className="ms-2"
                            >
                                <option>Select team</option>
                                {teams.map((t) => (
                                    <option value={t._id} key={t._id}>
                                        {t.name} ({t.season})
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </>
            )}

            <hr />

            {/* ✅ CREATE TEAM */}
            <h4>Create Team</h4>
            <form onSubmit={createTeam} className="row g-2 mb-4">
                {["name", "season", "coach"].map((field) => (
                    <div className="col-md-3" key={field}>
                        <input
                            className="form-control"
                            placeholder={field}
                            value={teamForm[field]}
                            onChange={(e) =>
                                setTeamForm({ ...teamForm, [field]: e.target.value })
                            }
                            required
                        />
                    </div>
                ))}
                <div className="col-md-2">
                    <button className="btn bg-ybt w-100">Add Team</button>
                </div>
            </form>

            <hr />

            {/* ✅ CREATE EVENT */}
            <h4>Create Event</h4>
            <form onSubmit={createEvent} className="row g-2 mb-4">
                {["title", "start", "end"].map((field) => (
                    <div className="col-md-3" key={field}>
                        <input
                            className="form-control"
                            placeholder={field}
                            value={eventForm[field]}
                            onChange={(e) =>
                                setEventForm({ ...eventForm, [field]: e.target.value })
                            }
                            required
                        />
                    </div>
                ))}
                <div className="col-md-2">
                    <button className="btn bg-ybt w-100">Add Event</button>
                </div>
            </form>
        </div>
    );
}
