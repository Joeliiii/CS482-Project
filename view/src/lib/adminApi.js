// view/src/lib/adminApi.js

const opts = {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
};

async function request(url, options = {}) {
    const res = await fetch(url, { ...options, ...opts });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.status !== 204 ? res.json() : {};
}

// USERS / ROLES
export const adminApi = {
    getUsers: () => request("/api/admin/users"),
    addRole: (userId, roleName) =>
        request("/api/admin/user/role/add", {
            method: "POST",
            body: JSON.stringify({ userId, roleName })
        }),
    removeRole: (userId, roleName) =>
        request("/api/admin/user/role/remove", {
            method: "POST",
            body: JSON.stringify({ userId, roleName })
        }),
    deleteUser: (userId) =>
        request(`/api/admin/user/${userId}`, { method: "DELETE" }),

    // TEAMS
    listTeams: () => request("/api/admin/teams"),

    assignChildTeam: (childId, teamId) =>
        request(`/api/admin/child/${childId}/team`, {
            method: "PUT",
            body: JSON.stringify({ teamId })
        }),

    // EVENTS
    listEvents: () => request("/api/admin/events"),
    createEvent: (payload) =>
        request("/api/admin/events", {
            method: "POST",
            body: JSON.stringify(payload)
        }),
    updateEvent: (id, payload) =>
        request(`/api/admin/events/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        }),
    deleteEvent: (id) =>
        request(`/api/admin/events/${id}`, { method: "DELETE" }),
};
