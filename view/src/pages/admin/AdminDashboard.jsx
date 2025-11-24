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

    // ----- Matches state -----
    const [matches, setMatches] = useState([]);
    const [matchFilterEventId, setMatchFilterEventId] = useState("");
    const [matchForm, setMatchForm] = useState({
        eventId: "",
        teamA: "",
        teamB: "",
        start: "",
        court: "",
    });

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
    // Requires backend: PUT /api/admin/children/:childId/team -> { teamId }
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

    // ---------- MATCHES (list/create/edit/delete) ----------
    async function loadMatches() {
        try {
            const q = matchFilterEventId ? `?eventId=${matchFilterEventId}` : "";
            const res = await fetch(`/api/admin/matches${q}`, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to load matches");
            const json = await res.json();
            setMatches(Array.isArray(json) ? json : []);
        } catch (e) {
            console.error(e);
            setError("Failed to load matches");
        }
    }

    function updateMatchLocal(id, patch) {
        setMatches((ms) => ms.map((m) => (m._id === id ? { ...m, ...patch } : m)));
    }

    async function saveMatchRow(m) {
        try {
            const res = await fetch(`/api/admin/matches/${m._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    scoreA: m.scoreA ?? 0,
                    scoreB: m.scoreB ?? 0,
                    status: m.status ?? "scheduled",
                    start: m.start,
                    court: m.court ?? "",
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to save match");
            }
            const saved = await res.json();
            updateMatchLocal(m._id, saved);
        } catch (e) {
            console.error(e);
            setError(e.message);
        }
    }

    async function deleteMatchRow(id) {
        if (!window.confirm("Delete this match?")) return;
        try {
            const res = await fetch(`/api/admin/matches/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Delete failed");
            }
            setMatches((ms) => ms.filter((x) => x._id !== id));
        } catch (e) {
            console.error(e);
            setError(e.message);
        }
    }

    async function createMatch(e) {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("/api/admin/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(matchForm),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to create match");
            }
            setMatchForm({ eventId: "", teamA: "", teamB: "", start: "", court: "" });
            await loadMatches();
        } catch (e) {
            console.error(e);
            setError(e.message);
        }
    }

    // ---------- EFFECTS ----------
    useEffect(() => {
        loadUsers();
        loadTeams();
        loadEvents();
        loadMatches();
    }, []);

    useEffect(() => {
        loadMatches();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchFilterEventId]);

    return (
        <div className="text-light">
            <h2 className="fw-bold text-ybt mb-4">Admin Dashboard</h2>

            {error && <div className="alert alert-danger py-2">{error}</div>}

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
                                {(u.roles || []).length ? u.roles.join(", ") : "none"}
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
                {!users.length && (
                    <tr>
                        <td colSpan="5" className="text-center text-secondary">
                            No users.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* CHILDREN + ASSIGN TO TEAM */}
            {selectedUser && (
                <>
                    <h4 className="mt-4">Children for selected user</h4>
                    {children.length === 0 && (
                        <div className="text-muted small">No children found for this user.</div>
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
                            onChange={(e) => setTeamForm({ ...teamForm, [field]: e.target.value })}
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
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-3">
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={eventForm.start}
                        onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-3">
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={eventForm.end}
                        onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <button className="btn bg-ybt w-100">Add Event</button>
                </div>
            </form>

            {/* LIST EVENTS */}
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

            <hr className="my-4" />

            {/* CREATE MATCH */}
            <h4>Create Match</h4>
            <form onSubmit={createMatch} className="row g-2 mb-4">
                <div className="col-md-3">
                    <label className="form-label">Event</label>
                    <select
                        className="form-select"
                        value={matchForm.eventId}
                        onChange={(e) => setMatchForm({ ...matchForm, eventId: e.target.value })}
                        required
                    >
                        <option value="">Select event</option>
                        {events.map((ev) => (
                            <option key={ev._id} value={ev._id}>
                                {ev.title} — {new Date(ev.start).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-2">
                    <label className="form-label">Team A</label>
                    <select
                        className="form-select"
                        value={matchForm.teamA}
                        onChange={(e) => setMatchForm({ ...matchForm, teamA: e.target.value })}
                        required
                    >
                        <option value="">Select</option>
                        {teams.map((t) => (
                            <option key={t._id} value={t.name}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-2">
                    <label className="form-label">Team B</label>
                    <select
                        className="form-select"
                        value={matchForm.teamB}
                        onChange={(e) => setMatchForm({ ...matchForm, teamB: e.target.value })}
                        required
                    >
                        <option value="">Select</option>
                        {teams.map((t) => (
                            <option key={t._id} value={t.name}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3">
                    <label className="form-label">Start</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={matchForm.start}
                        onChange={(e) => setMatchForm({ ...matchForm, start: e.target.value })}
                        required
                    />
                </div>

                <div className="col-md-2">
                    <label className="form-label">Court</label>
                    <input
                        className="form-control"
                        placeholder="Court"
                        value={matchForm.court}
                        onChange={(e) => setMatchForm({ ...matchForm, court: e.target.value })}
                    />
                </div>

                <div className="col-12 mt-2">
                    <button className="btn bg-ybt">Create Match</button>
                </div>
            </form>

            {/* MATCHES TABLE */}
            <h4>Matches</h4>

            <div className="row g-2 align-items-end mb-3">
                <div className="col-md-4">
                    <label className="form-label">Filter by Event</label>
                    <select
                        className="form-select"
                        value={matchFilterEventId}
                        onChange={(e) => setMatchFilterEventId(e.target.value)}
                    >
                        <option value="">All events</option>
                        {events.map((ev) => (
                            <option key={ev._id} value={ev._id}>
                                {ev.title} — {new Date(ev.start).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-outline-secondary w-100" onClick={loadMatches}>
                        Refresh
                    </button>
                </div>
            </div>

            <table className="table table-dark table-striped align-middle">
                <thead>
                <tr>
                    <th>Event</th>
                    <th>Start</th>
                    <th>Teams</th>
                    <th>Score A</th>
                    <th>Score B</th>
                    <th>Status</th>
                    <th>Court</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {matches.map((m) => {
                    const ev = events.find((e) => (e._id === m.eventId));
                    const eventTitle = ev?.title || "—";
                    return (
                        <tr key={m._id}>
                            <td>{eventTitle}</td>
                            <td>{new Date(m.start).toLocaleString()}</td>
                            <td>{m.teamA} vs {m.teamB}</td>

                            <td style={{ maxWidth: 90 }}>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control form-control-sm"
                                    value={m.scoreA ?? 0}
                                    onChange={(e) => updateMatchLocal(m._id, { scoreA: Number(e.target.value) })}
                                />
                            </td>

                            <td style={{ maxWidth: 90 }}>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control form-control-sm"
                                    value={m.scoreB ?? 0}
                                    onChange={(e) => updateMatchLocal(m._id, { scoreB: Number(e.target.value) })}
                                />
                            </td>

                            <td style={{ maxWidth: 170 }}>
                                <select
                                    className="form-select form-select-sm"
                                    value={m.status || "scheduled"}
                                    onChange={(e) => updateMatchLocal(m._id, { status: e.target.value })}
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="final">Final</option>
                                </select>
                            </td>

                            <td style={{ maxWidth: 140 }}>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={m.court || ""}
                                    onChange={(e) => updateMatchLocal(m._id, { court: e.target.value })}
                                    placeholder="Court"
                                />
                            </td>

                            <td className="d-flex gap-2">
                                <button className="btn btn-sm btn-success" onClick={() => saveMatchRow(m)}>
                                    Save
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => deleteMatchRow(m._id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    );
                })}
                {!matches.length && (
                    <tr>
                        <td colSpan="8" className="text-center text-secondary">
                            No matches yet.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
