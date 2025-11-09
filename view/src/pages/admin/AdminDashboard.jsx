import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [events, setEvents] = useState([]);
    const [children, setChildren] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState("");

    const [teamForm, setTeamForm] = useState({ name: "", season: "", coach: "" });
    const [eventForm, setEventForm] = useState({ title: "", start: "", end: "" });

    const getId = (u) => u.id || u._id;

    // ---------- LOADERS ----------

    async function loadUsers() {
        try {
            const res = await fetch("/api/admin/users", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to load users");
            const json = await res.json();
            setUsers(json.items || []);
        } catch (e) {
            console.error(e);
            setError("Failed to load users");
        }
    }

    async function loadTeams() {
        try {
            const res = await fetch("/api/teams", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to load teams");
            const json = await res.json();
            setTeams(Array.isArray(json) ? json : json.items || []);
        } catch (e) {
            console.error(e);
            setError("Failed to load teams");
        }
    }

    async function loadEvents() {
        try {
            const res = await fetch("/api/admin/events", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to load events");
            const json = await res.json();
            // AdminController.listEvents returns { items, total, ... }
            setEvents(Array.isArray(json) ? json : json.items || []);
        } catch (e) {
            console.error(e);
            setError("Failed to load events");
        }
    }

    async function loadChildren(userId) {
        setError("");
        setSelectedUser(userId);
        setChildren([]);
        try {
            const res = await fetch(`/api/admin/children/${userId}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to load children");
            const json = await res.json();
            // listChildren returns an array
            setChildren(Array.isArray(json) ? json : []);
        } catch (e) {
            console.error(e);
            setError("Failed to load children for that user");
        }
    }

    // ---------- USER ROLES ----------

    async function setUserRoles(userId, roles) {
        await fetch(`/api/admin/users/${userId}/roles`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ roles }),
        });
        await loadUsers();
    }

    async function addRole(user, role) {
        const id = getId(user);
        const current = user.roles || [];
        const next = Array.from(new Set([...current, role]));
        await setUserRoles(id, next);
    }

    async function removeRole(user, role) {
        const id = getId(user);
        const current = user.roles || [];
        const next = current.filter((r) => r !== role);
        await setUserRoles(id, next);
    }

    // ---------- USER DELETE ----------

    async function deleteUser(userId) {
        if (!window.confirm("Delete this user and related links?")) return;
        await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (selectedUser === userId) {
            setSelectedUser(null);
            setChildren([]);
        }
        await loadUsers();
    }

    // ---------- CHILD → TEAM ASSIGN ----------
    // NOTE: This assumes you have a backend route:
    // PUT /api/admin/children/:childId/team  -> { teamId }
    async function assignChildToTeam(childId, teamId) {
        if (!teamId) return;
        try {
            const res = await fetch(`/api/admin/children/${childId}/team`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ teamId }),
            });
            if (!res.ok) throw new Error("Failed assigning child to team");
        } catch (e) {
            console.error(e);
            setError("Failed to assign child to team");
        }
    }

    // ---------- TEAMS CRUD ----------

    async function createTeam(e) {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(teamForm),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.message || j.error || "Failed to create team");
            }
            setTeamForm({ name: "", season: "", coach: "" });
            await loadTeams();
        } catch (e) {
            console.error(e);
            setError(e.message);
        }
    }

    // ---------- EVENTS CRUD ----------

    async function createEvent(e) {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("/api/admin/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(eventForm),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.message || "Failed to create event");
            }
            setEventForm({ title: "", start: "", end: "" });
            await loadEvents();
        } catch (e) {
            console.error(e);
            setError(e.message);
        }
    }

    useEffect(() => {
        loadUsers();
        loadTeams();
        loadEvents();
    }, []);

    return (
        <div className="text-light">
            <h2 className="fw-bold text-ybt mb-4">Admin Dashboard</h2>

            {error && (
                <div className="alert alert-danger py-2">
                    {error}
                </div>
            )}

            {/* USERS TABLE */}
            <h4 className="mt-3">Users</h4>
            <table className="table table-dark table-striped align-middle">
                <thead>
                <tr>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Roles</th>
                    <th>Children</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((u) => {
                    const id = getId(u);
                    return (
                        <tr key={id}>
                            <td>{u.email}</td>
                            <td>{u.username || "-"}</td>
                            <td>
                                {(u.roles || []).length
                                    ? u.roles.join(", ")
                                    : "none"}
                                <div className="mt-1 d-flex gap-1 flex-wrap">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-warning"
                                        onClick={() => addRole(u, "admin")}
                                    >
                                        + Admin
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => addRole(u, "user")}
                                    >
                                        + User
                                    </button>
                                    {u.roles?.includes("admin") && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-light"
                                            onClick={() => removeRole(u, "admin")}
                                        >
                                            - Admin
                                        </button>
                                    )}
                                </div>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-info"
                                    onClick={() => loadChildren(id)}
                                >
                                    View Children
                                </button>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => deleteUser(id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {/* CHILDREN + ASSIGN TO TEAM */}
            {selectedUser && (
                <>
                    <h4 className="mt-4">Children for selected user</h4>
                    {children.length === 0 && (
                        <div className="text-muted small">
                            No children found for this user.
                        </div>
                    )}

                    {children.map((child) => {
                        const childId = child._id || child.childId;
                        const label =
                            child.fullName ||
                            child.name ||
                            `${child.firstName || ""} ${child.lastName || ""}`.trim() ||
                            "Child";

                        return (
                            <div key={childId} className="mb-2">
                                <span className="me-2">
                                    {label}
                                    {child.relation && ` (${child.relation})`}
                                </span>
                                <select
                                    className="form-select d-inline-block w-auto"
                                    defaultValue=""
                                    onChange={(e) => {
                                        if (!e.target.value) return;
                                        assignChildToTeam(childId, e.target.value);
                                    }}
                                >
                                    <option value="">Assign to team…</option>
                                    {teams.map((t) => (
                                        <option key={t._id} value={t._id}>
                                            {t.name} ({t.season})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    })}
                </>
            )}

            <hr className="my-4" />

            {/* CREATE TEAM */}
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
                            required={field !== "coach"}
                        />
                    </div>
                ))}
                <div className="col-md-2">
                    <button className="btn bg-ybt w-100">Add Team</button>
                </div>
            </form>

            <hr className="my-4" />

            {/* CREATE EVENT */}
            <h4>Create Event</h4>
            <form onSubmit={createEvent} className="row g-2 mb-4">
                <div className="col-md-3">
                    <input
                        className="form-control"
                        placeholder="title"
                        value={eventForm.title}
                        onChange={(e) =>
                            setEventForm({ ...eventForm, title: e.target.value })
                        }
                        required
                    />
                </div>
                <div className="col-md-3">
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={eventForm.start}
                        onChange={(e) =>
                            setEventForm({ ...eventForm, start: e.target.value })
                        }
                        required
                    />
                </div>
                <div className="col-md-3">
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={eventForm.end}
                        onChange={(e) =>
                            setEventForm({ ...eventForm, end: e.target.value })
                        }
                        required
                    />
                </div>
                <div className="col-md-2">
                    <button className="btn bg-ybt w-100">Add Event</button>
                </div>
            </form>

            {/* LIST EVENTS*/}
            {events.length > 0 && (
                <>
                    <h5>Upcoming Events</h5>
                    <ul className="list-unstyled small">
                        {events.map((ev) => (
                            <li key={ev._id}>
                                <strong>{ev.title}</strong>{" "}
                                {ev.start && `(${new Date(ev.start).toLocaleString()})`}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
