import React, { useEffect, useState } from "react";

export default function TeamProfile() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load teams with players
    async function loadTeams() {
        try {
            setLoading(true);
            setError("");
            const res = await fetch("/api/teams/with-players", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to load teams");
            const data = await res.json();
            setTeams(data);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load teams");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTeams();
    }, []);

    if (loading) return <div className="text-secondary">Loading teams...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    if (!teams.length)
        return <div className="text-secondary">No teams found.</div>;

    return (
        <section>
            <h2 className="fw-bold text-ybt mb-4">Teams</h2>
            <div className="row g-4">
                {teams.map((team) => (
                    <div className="col-md-6 col-lg-4" key={team._id}>
                        <div className="ybt-card rounded-2xl p-3 h-100">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <img
                                    src="/images/team-logo.png"
                                    alt="Team Logo"
                                    width="72"
                                    height="72"
                                    className="rounded-circle border ybt-border object-fit-cover"
                                />
                                <div>
                                    <h5 className="mb-0">{team.name}</h5>
                                    <small className="text-secondary">
                                        Season {team.season}
                                    </small>
                                    {team.coach && (
                                        <div className="small text-secondary">
                                            Coach: {team.coach}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="small text-secondary mb-2">
                                Players: {team.players?.length || 0}
                            </div>

                            {team.players?.length > 0 && (
                                <ul className="list-unstyled mb-0 small">
                                    {team.players.map((p) => (
                                        <li key={p._id}>
                                            {p.fullName}
                                            {p.birthdate && (
                                                <span className="text-muted">
                                                    {" "}
                                                    (
                                                    {new Date(
                                                        p.birthdate
                                                    ).getFullYear()}
                                                    )
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
