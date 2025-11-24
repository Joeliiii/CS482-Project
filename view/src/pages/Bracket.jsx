// view/src/pages/Bracket.jsx
import React, { useEffect, useMemo, useState } from 'react';

function MatchRow({ m }) {
    const winner =
        m.status === 'final'
            ? (m.scoreA === m.scoreB ? 'Draw' : (m.scoreA > m.scoreB ? m.teamA : m.teamB))
            : null;

    return (
        <tr>
            <td>{new Date(m.start).toLocaleString()}</td>
            <td>{m.teamA} vs {m.teamB}</td>
            <td>{m.court || '-'}</td>
            <td>
                {m.status === 'final' ? `${m.scoreA} - ${m.scoreB}` : m.status}
                {winner && <span className="ms-2 badge bg-success">Winner: {winner}</span>}
            </td>
            <td>
                {(m.videos || []).map((v, i) => (
                    <a key={i} href={v} target="_blank" rel="noreferrer" className="d-block link-light">
                        Video {i+1}
                    </a>
                ))}
                {!m.videos?.length && <span className="text-secondary">—</span>}
            </td>
        </tr>
    );
}

export default function Bracket() {
    const [tab, setTab] = useState('upcoming'); // upcoming | results | bracket
    const [upcoming, setUpcoming] = useState([]);
    const [results, setResults] = useState([]);
    const [events, setEvents] = useState([]);
    const [eventId, setEventId] = useState('');
    const [bracket, setBracket] = useState(null);
    const [loading, setLoading] = useState(false);

    // load base lists
    useEffect(() => {
        (async () => {
            const u = await fetch('/api/matches?status=scheduled').then(r=>r.json()).catch(()=>[]);
            const r = await fetch('/api/matches?status=final').then(r=>r.json()).catch(()=>[]);
            setUpcoming(Array.isArray(u) ? u : []);
            setResults(Array.isArray(r) ? r : []);
        })();
    }, []);

    // load event list for bracket tab
    useEffect(() => {
        (async () => {
            const list = await fetch('/api/events').then(r=>r.json()).catch(()=>[]);
            setEvents(Array.isArray(list) ? list : []);
            if (Array.isArray(list) && list.length && !eventId) {
                setEventId(String(list[0]._id));
            }
        })();
    }, []);

    // load bracket when event changes or tab switches to bracket
    useEffect(() => {
        if (tab !== 'bracket' || !eventId) return;
        setLoading(true);
        fetch(`/api/bracket/event/${eventId}`)
            .then(r => r.json())
            .then(json => setBracket(json))
            .catch(() => setBracket(null))
            .finally(() => setLoading(false));
    }, [tab, eventId]);

    const rounds = useMemo(() => bracket?.rounds || [], [bracket]);

    return (
        <section>
            <h2 className="fw-bold text-ybt mb-4">Brackets & Matches</h2>

            <ul className="nav nav-pills gap-2 mb-4">
                {['upcoming','results','bracket'].map(k => (
                    <li className="nav-item" key={k}>
                        <button
                            className={`btn ${tab===k ? 'bg-ybt text-black' : 'btn-outline-secondary'} rounded-pill`}
                            onClick={() => setTab(k)}
                        >
                            {k === 'upcoming' ? 'Upcoming' : k === 'results' ? 'Results' : 'Bracket'}
                        </button>
                    </li>
                ))}
            </ul>

            {tab === 'upcoming' && (
                <div className="ybt-card rounded-2xl p-4">
                    <h5 className="mb-3">Upcoming Matches</h5>
                    <div className="table-responsive">
                        <table className="table table-dark table-striped align-middle">
                            <thead>
                            <tr>
                                <th>Start</th>
                                <th>Match</th>
                                <th>Court</th>
                                <th>Status</th>
                                <th>Videos</th>
                            </tr>
                            </thead>
                            <tbody>
                            {upcoming.map(m => <MatchRow key={m._id} m={m} />)}
                            {!upcoming.length && (
                                <tr><td colSpan="5" className="text-secondary">No upcoming matches.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'results' && (
                <div className="ybt-card rounded-2xl p-4">
                    <h5 className="mb-3">Completed Matches</h5>
                    <div className="table-responsive">
                        <table className="table table-dark table-striped align-middle">
                            <thead>
                            <tr>
                                <th>Start</th>
                                <th>Match</th>
                                <th>Court</th>
                                <th>Final</th>
                                <th>Videos</th>
                            </tr>
                            </thead>
                            <tbody>
                            {results.map(m => <MatchRow key={m._id} m={m} />)}
                            {!results.length && (
                                <tr><td colSpan="5" className="text-secondary">No completed matches.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'bracket' && (
                <div className="ybt-card rounded-2xl p-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <h5 className="mb-0">Bracket</h5>
                        <select
                            className="form-select w-auto"
                            value={eventId}
                            onChange={e => setEventId(e.target.value)}
                        >
                            {events.map(ev => (
                                <option key={ev._id} value={ev._id}>
                                    {ev.title} — {new Date(ev.start).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading && <div className="text-secondary">Loading bracket…</div>}
                    {!loading && (!rounds.length ? (
                        <div className="text-secondary">No matches found for this event.</div>
                    ) : (
                        <div className="row g-4">
                            {rounds.map(r => (
                                <div className="col" key={r.round}>
                                    <div className="p-3 rounded border ybt-border">
                                        <div className="fw-bold mb-2">
                                            Round {r.round}
                                        </div>
                                        <ul className="list-unstyled m-0">
                                            {r.matches.map(m => (
                                                <li key={m._id} className="mb-3">
                                                    <div className="small text-secondary">{new Date(m.start).toLocaleString()}</div>
                                                    <div>{m.teamA} <strong>vs</strong> {m.teamB}</div>
                                                    <div className="small">
                                                        {m.status === 'final'
                                                            ? <span className="badge bg-success">{m.scoreA} - {m.scoreB}</span>
                                                            : <span className="badge bg-secondary">{m.status}</span>}
                                                    </div>
                                                    {!!m.videos?.length && (
                                                        <div className="small mt-1">
                                                            {m.videos.map((v,i)=>(
                                                                <a key={i} href={v} target="_blank" rel="noreferrer" className="me-2 link-light">Video {i+1}</a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
