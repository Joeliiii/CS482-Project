import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Livestreams() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
           // Fetch matches from your API
           fetch('/api/matches')
               .then(res => res.json())
               .then(data => {
                   setMatches(data);
                   setLoading(false);
               })
               .catch(err => {
                   console.error('Error fetching matches:', err);
                   setLoading(false);
               });
       }, []);

       if (loading) {
           return <div className="text-secondary">Loading livestreams...</div>;
       }

       // Filter only matches that have a videoId or streamUrl
       const livestreams = matches.filter(match => match.videoId || match.streamUrl);

    return (
        <section>
            <h2 className="fw-bold text-ybt mb-4">Livestreams & Replays</h2>
            {livestreams.length === 0 ? (
                <p className="text-secondary">No livestreams available at the moment.</p>
            ) : (
            <div className="row g-3">
                {livestreams.map(match => {
                    const slug = `${match.teamA?.name || 'team1'}vs${match.teamB?.name || 'team2'}`
                            .toLowerCase()
                            .replace(/\s+/g, '');
                        
                        return (
                            <div key={match._id} className="col-md-4">
                                <Link
                                    to={`/livestreams/${slug}`}
                                    state={{ match }}
                                    className="text-decoration-none"
                                >
                                    <div className="ybt-card rounded-2xl p-3 text-center hover-shadow">
                                        <div className="ratio ratio-16x9 mb-2 bg-dark d-flex align-items-center justify-content-center text-white rounded">
                                            <span>Click to Watch</span>
                                        </div>
                                        <div className="fw-semibold">
                                            {match.teamA?.name || 'Team A'} vs {match.teamB?.name || 'Team B'}
                                        </div>
                                        {match.isLive && <span className="badge bg-danger mt-1">LIVE</span>}
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
            </div>
                )}
        </section>
        );
        }




