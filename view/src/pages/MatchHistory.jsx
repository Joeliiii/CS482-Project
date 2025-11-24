import React, { useEffect, useState } from "react";

/**
 * Match History
 * - Filters: team, date range
 * - Shows final results (or all, with status badge)
 * - Tries /api/matches?status=final first, falls back to /api/admin/matches
 */
export default function MatchHistory() {
    const [teams, setTeams] = useState([]);
    const [rows, setRows] = useState([]);
    const [team, setTeam] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [error, setError] = useState("");

    async function fetchJSON(url) {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `GET ${url} failed`);
        return res.json();
    }

    async function loadTeams() {
        try {
            const t = await fetchJSON("/api/teams").catch(() => ({ items: [] }));
            const list = Array.isArray(t) ? t : t.items || [];
            setTeams(list);
        } catch (e) {
            console.error(e);
        }
    }

    async function loadHistory() {
        setError("");
        try {
            const q = new URLSearchParams();
            if (team) q.set("team", team);
            if (from) q.set("from", from);
            if (to)   q.set("to", to);

            // Try a public history endpoint if you add one later:
            //   /api/matches/history?team=&from=&to=
            // Otherwise fallback to “all matches (admin)” and filter client-side.
            let data;
            try {
                data = await fetchJSON(`/api/matches/history?${q.toString()}`);
            } catch {
                const raw = await fetchJSON("/api/admin/matches");
                data = Array.isArray(raw) ? raw : raw.items || raw;
            }

            let list = Array.isArray(data) ? data : data.items || data;

            // If public endpoint didn’t filter, apply client filters here.
            if (team) list = list.filter(m => m.teamA === team || m.teamB === team);
            if (from) list = list.filter(m => m.start && new Date(m.start) >= new Date(from));
            if (to)   list = list.filter(m => m.start && new Date(m.start) <= new Date(to));

            // Sort newest first
            list.sort((a, b) => new Date(b.start) - new Date(a.start));
            setRows(list);
        } catch (e) {
            console.error(e);
            setError("Failed to load match history");
        }
    }

    useEffect(() => {
        loadTeams();
        loadHistory();
    }, []);

    return (
        <section className="text-light">
            <h2 className="fw-bold text-ybt mb-4">Match History & Videos</h2>

            <div className="row g-3 align-items-end mb-3">
                <div className="col-md-4">
                    <label className="form-label">Team</label>
                    <select className="form-select" value={team} onChange={(e) => setTeam(e.target.value)}>
                        <option value="">All teams</option>
                        {teams.map(t => (
                            <option key={t._id} value={t.name}>{t.name} ({t.season})</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-3">
                    <label className="form-label">From</label>
                    <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div className="col-md-3">
                    <label className="form-label">To</label>
                    <input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <div className="col-md-2 d-grid">
                    <button className="btn bg-ybt" onClick={loadHistory}>Filter</button>
                </div>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            {!rows.length ? (
                <div className="text-secondary">No matches found.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-dark table-striped align-middle">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Match</th>
                            <th>Status / Score</th>
                            <th>Video</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map(m => {
                            const a = m.teamA, b = m.teamB;
                            const isFinal = m.status === "final";
                            let result = isFinal ? `${m.scoreA} – ${m.scoreB}` : (m.status || "scheduled");
                            let winner = null;
                            if (isFinal) {
                                if ((m.scoreA ?? 0) > (m.scoreB ?? 0)) winner = a;
                                else if ((m.scoreB ?? 0) > (m.scoreA ?? 0)) winner = b;
                            }
                            return (
                                <tr key={m._id}>
                                    <td>{m.start ? new Date(m.start).toLocaleString() : "TBD"}</td>
                                    <td>
                                        <div className="fw-semibold">
                                            <span className={winner === a ? "text-success" : ""}>{a}</span>
                                            <span className="text-secondary"> &nbsp;vs&nbsp; </span>
                                            <span className={winner === b ? "text-success" : ""}>{b}</span>
                                        </div>
                                        {m.court && <div className="small text-secondary">Court: {m.court}</div>}
                                    </td>
                                    <td>{result}</td>
                                    <td>
                                        {/* If/when you store video links on Match (e.g., m.videoUrl) show a link.
                          For now, show placeholder or embed rules */}
                                        {m.videoUrl ? (
                                            <a href={m.videoUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light">
                                                Watch
                                            </a>
                                        ) : (
                                            <span className="text-secondary small">No video</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
