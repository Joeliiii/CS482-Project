import { Link } from "react-router-dom";


export default function Livestreams() {
    const livestreams = [
        { id: 1, title: "Match 1: Hawks vs Bulls", slug: "hawksvsbulls", live: true, videoId: "dQw4w9WgXcQ" },
        { id: 2, title: "Match 2: Tigers vs Lions", slug: "tigersvslions", live: false, videoId: "DLzxrzFCyOs" },
        { id: 3, title: "Match 3: Eagles vs Sharks", slug: "eaglesvssharks", live: false, videoId: "oHg5SJYRHA0" },
    ];


    return (
        <section>
            <h2 className="fw-bold text-ybt mb-4">Livestreams & Replays</h2>
            <div className="row g-3">
                {livestreams.map(stream => (
                    <div key={stream.id} className="col-md-4">
                        <Link
                            to={`/livestreams/${stream.slug}`}
                            state={{ stream }} // pass data to the detail page
                            className="text-decoration-none"
                        >
                            <div className="ybt-card rounded-2xl p-3 text-center hover-shadow">
                                <div className="ratio ratio-16x9 mb-2 bg-dark d-flex align-items-center justify-content-center text-white rounded">
                                    <span>Click to Watch</span>
                                </div>
                                <div className="fw-semibold">{stream.title}</div>
                                {stream.live && <span className="badge bg-danger mt-1">LIVE</span>}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}



